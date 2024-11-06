// OrderManagement.js
import React, { useState, useCallback, useMemo } from 'react';
import { useOrder } from './context/OrderContext';
import CompletedOrders from './components/CompletedOrders';
import OrderModal from './components/OrderModal';
import Header from './components/Header';
import OrderGroup from './components/OrderGroup';
import SearchBar from './components/SearchBar';
import './styles/OrderManagement.css';

const OrderManagement = () => {
  const { state, dispatch, handleOrderStatusChange } = useOrder();
  const [isCompletedOrdersVisible, setIsCompletedOrdersVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // 중복 제거를 위한 유틸리티 함수
  const removeDuplicates = useCallback((orders) => {
    const seen = new Set();
    return orders.filter(order => {
      if (seen.has(order.id)) {
        return false;
      }
      seen.add(order.id);
      return true;
    });
  }, []);

  // 검색 필터링 함수
  const filterOrders = useCallback((orders) => {
    if (!searchQuery.trim() || !orders) return orders;
    
    const query = searchQuery.toLowerCase().trim();
    const filteredOrders = orders.filter(order => {
      if (!order) return false;
      
      // 이름으로 검색
      const nameMatch = order.name ? 
        order.name.toLowerCase().includes(query) : false;
      
      // 전화번호로 검색
      const phoneMatch = order.phone ? 
        order.phone.includes(query) : false;
      
      // 메뉴로 검색
      const menuMatch = order.items && Array.isArray(order.items) ? 
        order.items.some(item => 
          item && item.menu && item.menu.toLowerCase().includes(query)
        ) : false;
      
      return nameMatch || phoneMatch || menuMatch;
    });

    return removeDuplicates(filteredOrders);
  }, [searchQuery, removeDuplicates]);

  // 시간대별 주문 그룹화
  const groupOrdersByHour = useMemo(() => {
    const ordersToGroup = isCompletedOrdersVisible ? 
      removeDuplicates(state.completedOrders || []) : 
      removeDuplicates(state.orders || []);

    const filteredOrders = filterOrders(ordersToGroup);

    const getHourFromTime = (time) => {
      if (!time) return '00';
      return time.split(':')[0].padStart(2, '0');
    };

    const groups = filteredOrders.reduce((acc, order) => {
      const hour = getHourFromTime(order.time);
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(order);
      return acc;
    }, {});

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
  }, [isCompletedOrdersVisible, state.orders, state.completedOrders, filterOrders, removeDuplicates]);

  const handleOrderCheckedChange = useCallback(async (order, checked) => {
    try {
      await handleOrderStatusChange(order, checked);
    } catch (error) {
      console.error('주문 상태 변경 중 오류 발생:', error);
    }
  }, [handleOrderStatusChange]);

  return (
    <div className="order-management">
      <Header 
        selectedDate={state.selectedDate}
        onDateChange={handleDateChange}
        onAddOrder={() => openOrderModal()}
        onToggleCompleted={toggleCompletedOrders}
        isCompletedVisible={isCompletedOrdersVisible}
      />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="orders-container">
        {isCompletedOrdersVisible ? (
          <CompletedOrders
            orders={removeDuplicates(filterOrders(state.completedOrders || []))}
            onCheckedChange={handleOrderCheckedChange}
          />
        ) : (
          Object.entries(groupOrdersByHour).map(([hour, orders]) => (
            <OrderGroup
              key={hour}
              hour={hour}
              orders={orders}
              onEdit={openOrderModal}
              onCheckedChange={handleOrderCheckedChange}
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