import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './styles/CustomerDetail.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 기본값: 최신순

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customerRef = doc(db, 'customers', id);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
          const customerData = customerSnap.data();
          const frequentMenu = calculateFrequentMenu(customerData.orders);
          const visitCount = customerData.orders ? customerData.orders.length : 0;
          setCustomer({ ...customerData, frequentMenu, visitCount });
        } else {
          console.log("고객 정보를 찾을 수 없습니다.");
        }

        setLoading(false);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const calculateFrequentMenu = (orders) => {
    if (!orders || orders.length === 0) return "없음";

    const menuCount = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        menuCount[item.menu] = (menuCount[item.menu] || 0) + item.quantity;
      });
    });

    const maxCount = Math.max(...Object.values(menuCount));
    const frequentMenus = Object.keys(menuCount).filter(menu => menuCount[menu] === maxCount);

    return frequentMenus.length > 0 ? frequentMenus[0] : "없음";
  };

  const sortedOrders = () => {
    if (!customer || !customer.orders) return [];
    return [...customer.orders].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!customer) {
    return <div>고객 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="customer-detail">
      <button onClick={() => navigate(-1)} className="back-button">뒤로가기</button>
      <div className="customer-header">
        <div className="customer-info">
          <h2>{customer.name} {customer.phone}</h2>
          <p>총 {customer.visitCount}회 방문, 노쇼 {customer.noShowCount}회</p>
        </div>
        <button className="edit-button">정보 수정</button>
      </div>
      <input placeholder="고객 메모 입력" className="memo-input" />
      <div className="order-summary">
        <div className="order-menu">
          <p>주문 메뉴</p>
          <p>{customer.orderCount}개</p>
        </div>
        <div className="frequent-menu">
          <p>자주 주문하는 메뉴</p>
          <p>{customer.frequentMenu}</p>
        </div>
      </div>
      <h3>주문 내역 모아보기</h3>
      <button onClick={toggleSortOrder} className="toggle-button">
        {sortOrder === 'desc' ? '최신순' : '오래된순'}
      </button>
      <table className="order-table">
        <thead>
          <tr>
            <th>주문 내역</th>
            <th>주문 일자</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders().map((order, index) => (
            <tr key={index}>
              <td>{order.items.map(item => `${item.menu} (${item.quantity})`).join(', ')}</td>
              <td>{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDetail;