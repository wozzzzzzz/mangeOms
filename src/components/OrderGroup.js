import React from 'react';
import { TimeIcon } from '../assets/svgs/IconComponents';
import OrderCard from './OrderCard';

const OrderGroup = ({ hour, orders, onEdit, onCheckedChange }) => {
  return (
    <div className="hour-group">
      <div className="hour-title-container">
        <TimeIcon />
        <h2 className="hour-title">{hour}시 주문</h2>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onEdit={onEdit}
            onCheckedChange={onCheckedChange}
            checked={false}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(OrderGroup); 