import React, { useEffect } from 'react';
import { useOrder } from './context/OrderContext';

const itemsPerMenu = {
  '망개떡세트 S': { 흰피: 50, 쑥피: 50, 흰망개: 5, 쑥망개: 5 },
  '망개떡세트 M': { 흰피: 100, 쑥피: 100, 흰망개: 10, 쑥망개: 10 },
  '망개떡세트 L': { 흰피: 150, 쑥피: 150, 흰망개: 15, 쑥망개: 15 },
  '굴레세트 S': { 흰피: 50, 쑥피: 50, 흰굴레: 5, 쑥굴레: 5 },
  '굴레세트 M': { 흰피: 100, 쑥피: 100, 흰굴레: 10, 쑥굴레: 10 },
  '굴레세트 L': { 흰피: 150, 쑥피: 150, 흰굴레: 15, 쑥굴레: 15 },
  '망굴세트 S': { 흰피: 50, 쑥피: 50, 흰망개: 3, 쑥망개: 2, 흰굴레: 2, 쑥굴레: 3 },
  '망굴세트 M': { 흰피: 100, 쑥피: 100, 흰망개: 5, 쑥망개: 5, 흰굴레: 5, 쑥굴레: 5 },
  '망굴세트 L': { 흰피: 150, 쑥피: 150, 흰망개: 10, 쑥망개: 5, 흰굴레: 5, 쑥굴레: 10 },
  '종합세트 M': { 흰피: 120, 쑥피: 65, 흰망개: 4, 쑥망개: 4, 흰굴레: 2, 쑥굴레: 1, 쑥찰떡: 1, 흑임자: 1, 사과말이: 1, 흰수제: 1, 오메기: 1 },
  '종합세트 L': { 흰피: 170, 쑥피: 95, 흰망개: 5, 쑥망개: 5, 흰굴레: 2, 쑥굴레: 1, 쑥찰떡: 2, 흑임자: 1, 사과말이: 2, 흰수제: 2, 쑥수제: 1, 오메기: 1 },
  '함지선물세트 S': { 흰피: 230, 쑥피: 145, 흰망개: 6, 쑥망개: 6, 흰굴레: 5, 쑥굴레: 5, 쑥찰떡: 2, 흑임자: 2, 사과말이: 2, 흰수제: 2, 쑥수제: 1, 오메기: 1 },
  '함지선물세트 M': { 흰피: 300, 쑥피: 195, 흰망개: 7, 쑥망개: 7, 흰굴레: 7, 쑥굴레: 7, 쑥찰떡: 3, 흑임자: 3, 사과말이: 3, 흰수제: 2, 쑥수제: 2, 오메기: 1 },
  '함지선물세트 L': { 흰피: 360, 쑥피: 255, 흰망개: 7, 쑥망개: 7, 흰굴레: 7, 쑥굴레: 7, 쑥찰떡: 4, 흑임자: 4, 사과말이: 4, 흰수제: 3, 쑥수제: 2, 오메기: 5 },
  '떡 케이크 S': { 흰피: 160, 쑥피: 140, 흰망개: 13, 쑥망개: 7, 흰굴레: 3, 쑥굴레: 7 },
  '떡 케이크 M': { 흰피: 230, 쑥피: 205, 흰망개: 19, 쑥망개: 10, 흰굴레: 4, 쑥굴레: 9, 오메기: 1 },
  '떡 케이크 L': { 흰피: 300, 쑥피: 285, 흰망개: 22, 쑥망개: 12, 흰굴레: 4, 쑥굴레: 11, 흰수제: 2, 쑥수제: 2, 오메기: 1 },
  '이바지 떡': { 흰피: 610, 쑥피: 560, 흰망개: 28, 쑥망개: 28, 흰굴레: 7, 쑥굴레: 7, 쑥찰떡: 7, 흑임자: 7, 흰수제: 6, 쑥수제: 6, 오메기: 6 },
};

// 떡피 계산기 컴포넌트
const Calculator = () => {
  const { state, dispatch, setIndividualItemCounts } = useOrder();

  console.log('Current state:', state); // 현재 상태 로깅

  const calculateTotalItemsNeeded = (orders) => {
    console.log('Calculating for orders:', orders); // 주문 데이터 로깅
    const totals = orders.reduce(
      (acc, order) => {
        order.items.forEach((item) => {
          const menu = itemsPerMenu[item.menu];
          if (menu) {
            Object.entries(menu).forEach(([type, quantity]) => {
              acc[type] = (acc[type] || 0) + quantity * item.quantity;
            });
          }
        });
        return acc;
      },
      {}
    );
    console.log('Calculated totals:', totals); // 계산 결과 로깅
    return totals;
  };

  const calculateIndividualItemCounts = (orders) => {
    const counts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const menu = itemsPerMenu[item.menu];
        if (menu) {
          Object.entries(menu).forEach(([type, quantity]) => {
            if (!counts[item.menu]) counts[item.menu] = {};
            counts[item.menu][type] = (counts[item.menu][type] || 0) + quantity * item.quantity;
          });
        }
      });
    });
    return counts;
  };

  useEffect(() => {
    console.log('useEffect triggered'); // useEffect 실행 확인
    const totalItems = calculateTotalItemsNeeded(state.orders);
    console.log('Total items calculated:', totalItems); // 계산된 총 항목 로깅
    dispatch({ type: 'SET_TOTAL_ITEMS_NEEDED', payload: totalItems });
    dispatch({ 
      type: 'SET_PEE_NEEDED', 
      payload: { 
        흰피: totalItems.흰피 || 0, 
        쑥피: totalItems.쑥피 || 0 
      } 
    });

    // 개별 상품별 떡 개수 계산 및 상태 업데이트
    const individualCounts = calculateIndividualItemCounts(state.orders);
    setIndividualItemCounts(individualCounts);
  }, [state.orders, dispatch, setIndividualItemCounts]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const formatNumber = (num, isPee = false) => {
    if (typeof num !== 'number') return '0';
    if (isPee) {
      return (num / 10).toFixed(1);
    }
    return num.toString();
  };

  return (
    <div className="calculator">
      <h1>떡피 계산</h1>

      <input 
        type="date" 
        value={state.selectedDate.toISOString().split('T')[0]}
        onChange={handleDateChange}
      />

      <div className="pee-result">
        <h2>선택된 날짜: {state.selectedDate.toLocaleDateString()}</h2>
        <p>필요한 흰피: {formatNumber(state.peeNeeded.흰피, true)}개</p>
        <p>필요한 쑥피: {formatNumber(state.peeNeeded.쑥피, true)}개</p>
      </div>

      <div className="total-items-summary">
        <h3>전체 떡 수량 요약</h3>
        {!state.totalItemsNeeded || Object.keys(state.totalItemsNeeded).length === 0 ? (
          <p>전체 수량 데이터가 없습니다.</p>
        ) : (
          <ul>
            {Object.entries(state.totalItemsNeeded).map(([type, quantity]) => (
              <li key={type}>
                {type}: {formatNumber(quantity, type === '흰피' || type === '쑥피')}개
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="orders-summary">
        <h3>주문 요약</h3>
        {state.orders.length === 0 ? (
          <p>이 날짜에 주문이 없습니다.</p>
        ) : (
          state.orders.map((order) => (
            <div key={order.id} className="order-item">
              <p>{order.name} - {order.time}</p>
              <ul>
                {order.items && order.items.map((item, index) => (
                  <li key={index}>
                    {item.menu}: {item.quantity}개
                    {itemsPerMenu[item.menu] && (
                      <span>
                        (흰피: {formatNumber(itemsPerMenu[item.menu].흰피 * item.quantity, true)}개, 
                        쑥피: {formatNumber(itemsPerMenu[item.menu].쑥피 * item.quantity, true)}개)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="individual-item-counts">
        <h3>상품별 개별 떡 개수</h3>
        {Object.entries(state.individualItemCounts).map(([menu, counts]) => (
          <div key={menu}>
            <h4>{menu}</h4>
            <ul>
              {Object.entries(counts).map(([type, count]) => (
                <li key={type}>{type}: {count}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
