// OrderManagement.js
import React, { useState, useCallback, useMemo } from 'react';
import { useOrder } from './context/OrderContext';
import OrderCard from './components/OrderCard';
import CompletedOrders from './components/CompletedOrders';
import OrderModal from './components/OrderModal';
import Header from './components/Header';
import OrderGroup from './components/OrderGroup';
import './styles/OrderManagement.css';

const OrderManagement = () => {
  const { state, dispatch, handleOrderChange } = useOrder();
  const [isCompletedOrdersVisible, setIsCompletedOrdersVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const toggleCompletedOrders = useCallback(() => {
    setIsCompletedOrdersVisible(prev => !prev);
  }, []);

  const handleDateChange = useCallback((e) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: new Date(e.target.value) });
  }, [dispatch]);

  const openOrderModal = useCallback((order = null) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingOrder(null);
  }, []);

  // 현재 표시할 주문 목록 결정
  const displayOrders = useMemo(() => {
    return isCompletedOrdersVisible ? state.completedOrders : state.orders;
  }, [isCompletedOrdersVisible, state.orders, state.completedOrders]);

  // 시간대별 주문 그룹화
  const groupOrdersByHour = useMemo(() => {
    const getHourFromTime = (time) => {
      if (!time) return '00';
      return time.split(':')[0].padStart(2, '0');
    };

    // 현재 표시 모드에 따라 적절한 주문 목록 사용
    const ordersToGroup = displayOrders;

    const groups = ordersToGroup.reduce((acc, order) => {
      const hour = getHourFromTime(order.time);
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(order);
      return acc;
    }, {});

    // 시간대별 정렬
    Object.keys(groups).forEach(hour => {
      groups[hour].sort((a, b) => {
        const [hourA, minuteA] = (a.time || '00:00').split(':').map(Number);
        const [hourB, minuteB] = (b.time || '00:00').split(':').map(Number);
        return hourA === hourB ? minuteA - minuteB : hourA - hourB;
      });
    });

    return Object.keys(groups)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .reduce((acc, hour) => {
        acc[String(parseInt(hour))] = groups[hour];
        return acc;
      }, {});
  }, [displayOrders]);

  const handleOrderCheckedChange = useCallback((order, checked) => {
    if (checked) {
      dispatch({ type: 'COMPLETE_ORDER', payload: order });
    } else {
      dispatch({ type: 'UNCOMPLETE_ORDER', payload: order });
    }
  }, [dispatch]);

  return (
    <div className="order-management">
      <Header 
        selectedDate={state.selectedDate}
        onDateChange={handleDateChange}
        onAddOrder={() => openOrderModal()}
        onToggleCompleted={toggleCompletedOrders}
        isCompletedVisible={isCompletedOrdersVisible}
      />
      
      <div className="orders-container">
        {isCompletedOrdersVisible ? (
          // 완료된 주문 목록
          <CompletedOrders
            orders={state.completedOrders}
            onCheckedChange={handleOrderCheckedChange}
          />
        ) : (
          // 진행 중인 주문 목록
          Object.entries(groupOrdersByHour).map(([hour, orders]) => (
            <OrderGroup
              key={hour}
              hour={hour}
              orders={orders}
              onEdit={openOrderModal}
              onCheckedChange={handleOrderCheckedChange}
              checked={false}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <OrderModal
          show={isModalOpen}
          onClose={closeModal}
          selectedDate={state.selectedDate}
          order={editingOrder}
          isEdit={!!editingOrder}
          dispatch={dispatch}
        />
      )}
    </div>
  );
};

export default React.memo(OrderManagement);