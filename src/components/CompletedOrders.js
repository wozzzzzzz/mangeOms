import React from 'react';
import OrderCard from './OrderCard';  // OrderCard 컴포넌트 임포트

function CompletedOrders({ orders, onCheckedChange }) {
    return (
      <div className="completed-orders-list">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCheckedChange={onCheckedChange}
            checked={true} // 완료된 주문이므로 항상 체크 상태로 전달
          />
        ))}
      </div>
    );
  }
export default CompletedOrders;