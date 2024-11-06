// 주문 요약 컴포넌트
export const OrderSummary = ({ orders, itemsPerMenu, formatNumber }) => (
  <div className="orders-summary">
    <h3>주문 요약</h3>
    {orders.length === 0 ? (
      <p>이 날짜에 주문이 없습니다.</p>
    ) : (
      orders.map((order) => (
        <div key={order.id} className="order-item">
          <p>{order.name} - {order.time}</p>
          <ul>
            {order.items?.map((item, index) => (
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
); 