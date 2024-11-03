import React from 'react';
import OrderCard from './OrderCard';  // OrderCard 컴포넌트 임포트

function CompletedOrders({ orders, onCheckedChange }) {
  // 중복 제거를 위해 Set 사용
  const uniqueOrders = [...new Set(orders.map(order => order.id))].map(id =>
    orders.find(order => order.id === id)
  );

  return (
    <div className="completed-orders-list">
      {uniqueOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onCheckedChange={(order, checked) => {
            if (onCheckedChange) {
              onCheckedChange(order, checked);
            }
          }}
          checked={true}
        />
      ))}
    </div>
  );
}

export default React.memo(CompletedOrders);