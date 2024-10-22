import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import OrderModal from './components/OrderModal';
import OrderCard from './components/OrderCard'; 
import DatePicker from 'react-datepicker';
import CompletedOrders from './components/CompletedOrders';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/OrderManagement.css';
import './styles/CustomDatePicker.css';

const CustomDatePicker = ({ selectedDate, setSelectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) =>
    date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
    localStorage.setItem('selectedDate', date.toISOString());
  };

  return (
    <div className="custom-date-picker">
      <button className="date-picker-button" onClick={() => setIsOpen(!isOpen)}>
        <div className="date-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 22 21" fill="none">
            <g clip-path="url(#clip0_0_333)">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M15.1745 9.11638L10.3001 13.9908C10.1364 14.1544 9.91439 14.2464 9.68292 14.2464C9.45145 14.2464 9.22946 14.1544 9.06576 13.9908L6.08385 11.008C6.00281 10.927 5.93852 10.8307 5.89466 10.7248C5.8508 10.619 5.82822 10.5055 5.82822 10.3908C5.82822 10.2762 5.8508 10.1627 5.89466 10.0568C5.93852 9.95095 6.00281 9.85473 6.08385 9.77369C6.1649 9.69264 6.26112 9.62835 6.36701 9.58449C6.4729 9.54063 6.58639 9.51805 6.70101 9.51805C6.81563 9.51805 6.92912 9.54063 7.03502 9.58449C7.14091 9.62835 7.23712 9.69264 7.31817 9.77369L9.68292 12.1384L13.9402 7.88206C14.0212 7.80101 14.1174 7.73672 14.2233 7.69286C14.3292 7.649 14.4427 7.62643 14.5573 7.62643C14.6719 7.62643 14.7854 7.649 14.8913 7.69286C14.9972 7.73672 15.0934 7.80101 15.1745 7.88206C15.2555 7.96311 15.3198 8.05932 15.3637 8.16522C15.4076 8.27111 15.4301 8.3846 15.4301 8.49922C15.4301 8.61383 15.4076 8.72733 15.3637 8.83322C15.3198 8.93911 15.2555 9.03533 15.1745 9.11638ZM17.3507 2.46905H15.9278V1.59613C15.9278 1.36462 15.8359 1.14258 15.6722 0.978879C15.5084 0.815174 15.2864 0.723206 15.0549 0.723206C14.8234 0.723206 14.6014 0.815174 14.4376 0.978879C14.2739 1.14258 14.182 1.36462 14.182 1.59613V2.46905H7.07637V1.59613C7.07637 1.36462 6.9844 1.14258 6.8207 0.978879C6.65699 0.815174 6.43496 0.723206 6.20344 0.723206C5.97193 0.723206 5.7499 0.815174 5.58619 0.978879C5.42249 1.14258 5.33052 1.36462 5.33052 1.59613V2.46905H3.90765C3.44463 2.46905 3.00056 2.65299 2.67315 2.9804C2.34574 3.30781 2.1618 3.75188 2.1618 4.2149V17.6579C2.1618 18.121 2.34574 18.565 2.67315 18.8924C3.00056 19.2199 3.44463 19.4038 3.90765 19.4038H17.3507C17.8137 19.4038 18.2578 19.2199 18.5852 18.8924C18.9126 18.565 19.0965 18.121 19.0965 17.6579V4.2149C19.0965 3.75188 18.9126 3.30781 18.5852 2.9804C18.2578 2.65299 17.8137 2.46905 17.3507 2.46905Z" fill="#77E3AB"/>
            </g>
            <defs>
              <clipPath id="clip0_0_333">
                <rect width="20.9502" height="20.9502" fill="white" transform="translate(0.154114 0.0249023)"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <span>{formatDate(selectedDate)}</span>
        <span className="arrow-down">▼</span>
      </button>

      {isOpen && (
        <DatePicker selected={selectedDate} onChange={handleDateChange} inline />
      )}
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date(localStorage.getItem('selectedDate') || Date.now()));
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isCompletedOrdersVisible, setIsCompletedOrdersVisible] = useState(false);


// 날짜 변경 시 해당 날짜의 주문 목록 가져오기
useEffect(() => {
  const fetchOrders = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return onSnapshot(collection(db, 'orders', dateStr, 'orderList'), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, console.error);
  };

  const unsubscribe = fetchOrders(selectedDate);
  return () => unsubscribe();
}, [selectedDate]);



  // 완료된 주문 목록 가져오기
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'completedOrders'), (snapshot) => {
      setCompletedOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    return () => unsubscribe();
  }, []);

  const toggleCompletedOrders = () => setIsCompletedOrdersVisible((prev) => !prev);

  const handleOrderChange = async (order, isChecked) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const orderRef = doc(db, 'orders', dateStr, 'orderList', order.id);
    const completedOrderRef = doc(db, 'completedOrders', order.id);

    try {
      if (isChecked) {
        const snap = await getDoc(completedOrderRef);
        if (!snap.exists()) {
          await setDoc(completedOrderRef, { ...order, completedAt: new Date() });
          await deleteDoc(orderRef);
        }
      } else {
        await setDoc(orderRef, { ...order });
        await deleteDoc(completedOrderRef);
      }
    } catch (error) {
      console.error('주문 업데이트 중 에러 발생: ', error);
    }
  };

  


  const handleDeleteOrder = async (orderId) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      await deleteDoc(doc(db, 'orders', dateStr, 'orderList', orderId));
    } catch (error) {
      console.error('주문 삭제 중 에러 발생: ', error);
    }
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const [hour, minute] = order.time.split(':');
    const hourLabel = `${hour}시`; // "10시"와 같은 시간대로 그룹화
    acc[hourLabel] = acc[hourLabel] || [];
    acc[hourLabel].push({ ...order, minute }); // 분 정보도 추가하여 나중에 정렬에 사용
    return acc;
  }, {});


  // 시간대별로 정렬 후, 같은 시간대 내에서는 분 단위로 정렬
  const sortedTimes = Object.keys(groupedOrders).sort((a, b) => {
    return parseInt(a) - parseInt(b); // "10시", "11시" 등 시간대를 숫자로 변환하여 비교
  });

  return (
    <div className="order-management">
      <header className="div_sticky_104">
        <div className="Frame72">
          <h1 className="div_sticky_h1">주문 관리</h1>
          <CustomDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
        <div className="div_flexGap_16">
          <button className="btn-complete-order" onClick={toggleCompletedOrders}>완료 주문 확인</button>
          <button className="btn-add-order" onClick={() => { setIsEdit(false); setSelectedOrder(null); setIsOrderModalVisible(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9194 7.71831H9.35883V3.15778C9.35883 2.95043 9.27646 2.75158 9.12984 2.60496C8.98323 2.45835 8.78437 2.37598 8.57702 2.37598C8.36968 2.37598 8.17082 2.45835 8.0242 2.60496C7.87759 2.75158 7.79522 2.95043 7.79522 3.15778V7.71831H3.23469C3.02734 7.71831 2.82848 7.80068 2.68187 7.9473C2.53525 8.09392 2.45288 8.29277 2.45288 8.50012C2.45288 8.70747 2.53525 8.90632 2.68187 9.05294C2.82848 9.19956 3.02734 9.28192 3.23469 9.28192H7.79522V13.8425C7.79522 14.0498 7.87759 14.2487 8.0242 14.3953C8.17082 14.5419 8.36968 14.6243 8.57702 14.6243C8.78437 14.6243 8.98323 14.5419 9.12984 14.3953C9.27646 14.2487 9.35883 14.0498 9.35883 13.8425V9.28192H13.9194C14.1267 9.28192 14.3256 9.19956 14.4722 9.05294C14.6188 8.90632 14.7012 8.70747 14.7012 8.50012C14.7012 8.29277 14.6188 8.09392 14.4722 7.9473C14.3256 7.80068 14.1267 7.71831 13.9194 7.71831Z" fill="#77E3AB"/>
              </svg>
              주문 추가
          </button>
        </div>
      </header>

<section className="orders-container">
      {sortedTimes.length === 0 ? (
        <p>주문이 없습니다.</p>
      ) : (
        sortedTimes.map((time) => (
          <div key={time} className="time-group">
            <div className="titleSection">
              <span className="time-group-title">{time} 주문</span>
            </div>
            <div className="orders-list">
              {/* 같은 시간대 안에서 분 순서대로 정렬 */}
              {groupedOrders[time]
                .sort((a, b) => parseInt(a.minute) - parseInt(b.minute)) // 분 순서대로 정렬
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onEdit={() => { setSelectedOrder(order); setIsEdit(true); setIsOrderModalVisible(true); }}
                    onDelete={() => handleDeleteOrder(order.id)}
                    onCheckedChange={(isChecked) => handleOrderChange(order, isChecked)}
                  />
                ))}
            </div>
          </div>
        ))
      )}
    </section>

      {isOrderModalVisible && (
        <OrderModal
          show={isOrderModalVisible}
          onClose={() => setIsOrderModalVisible(false)}
          selectedDate={selectedDate}
          order={selectedOrder}
          isEdit={isEdit}
        />
      )}

      {isCompletedOrdersVisible && (
        <CompletedOrders
          orders={completedOrders}
          onCheckedChange={handleOrderChange}
        />
      )}
    </div>
  );
};

export default OrderManagement;
