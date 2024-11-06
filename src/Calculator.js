import React, { useEffect } from 'react';
import { useOrder } from './context/OrderContext';
import { OrderSummary } from './components/OrderSummary';
import { 
  calculateTotalItemsNeeded, 
  calculateIndividualItemCounts, 
  formatNumber 
} from './utils/calculatorUtils';
import { itemsPerMenu } from './constants/menuItems';

const Calculator = () => {
  const { state, dispatch, setIndividualItemCounts } = useOrder();

  useEffect(() => {
    const totalItems = calculateTotalItemsNeeded(state.orders, itemsPerMenu);
    
    dispatch({ type: 'SET_TOTAL_ITEMS_NEEDED', payload: totalItems });
    dispatch({ 
      type: 'SET_PEE_NEEDED', 
      payload: { 
        흰피: totalItems.흰피 || 0, 
        쑥피: totalItems.쑥피 || 0 
      } 
    });

    const individualCounts = calculateIndividualItemCounts(state.orders, itemsPerMenu);
    setIndividualItemCounts(individualCounts);
  }, [state.orders, dispatch, setIndividualItemCounts]);

  const handleDateChange = (e) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: new Date(e.target.value) });
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

      <OrderSummary 
        orders={state.orders} 
        itemsPerMenu={itemsPerMenu}
        formatNumber={formatNumber}
      />
    </div>
  );
};

export default Calculator;
