import React from 'react';

const Header = ({ 
  selectedDate, 
  onDateChange, 
  onAddOrder, 
  onToggleCompleted, 
  isCompletedVisible 
}) => (
  <div className="header">
    <h1>주문 관리</h1>
    <div className="controls">
      <input 
        type="date" 
        value={selectedDate.toISOString().split('T')[0]} 
        onChange={onDateChange} 
        className="date-picker" 
      />
      <button className="btn btn-primary" onClick={onAddOrder}>
        주문 추가
      </button>
      <button className="btn btn-secondary" onClick={onToggleCompleted}>
        {isCompletedVisible ? '진행중인 주문 보기' : '완료된 주문 보기'}
      </button>
    </div>
  </div>
);

export default React.memo(Header); 