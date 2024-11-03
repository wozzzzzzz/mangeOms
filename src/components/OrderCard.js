import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/OrderCard.css';
import OrderOptionsDropdown from './OrderOptionsDropdown'; 
import { useOrder } from '../context/OrderContext';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function OrderCard({ order, onEdit, onCheckedChange, checked }) { 
  const { handleOrderStatusChange, handleDeleteOrder } = useOrder();
  const [isChecked, setIsChecked] = useState(checked);
  const [showOptions, setShowOptions] = useState(false); // 옵션 버튼을 클릭했을 때 드롭다운 표시

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleCheckboxChange = async (event) => {
    const checked = event.target.checked;
    if (isChecked === checked) return;
    
    try {
      setIsChecked(checked);
      await handleOrderStatusChange(order, checked);
      
      if (onCheckedChange) {
        onCheckedChange(order, checked);
      }
    } catch (error) {
      console.error('주문 상태 변경 중 오류 발생:', error);
      setIsChecked(!checked);
      alert('주문 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleOptionsClick = () => {
    setShowOptions(prev => !prev); 
  };

  const handleEditClick = useCallback(() => {
    onEdit(order); 
  }, [order, onEdit]);

  const handleDelete = async () => {
    if (window.confirm('주문을 삭제하시겠습니까?')) {
      try {
        await handleDeleteOrder(order);
        setShowOptions(false);
      } catch (error) {
        console.error('주문 삭제 중 오류 발생:', error);
        alert('주문 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 날짜와 시간 정보를 한 번만 계산
  const orderDateTime = useMemo(() => {
    if (order.date && order.time) {
      const [year, month, day] = order.date.split('-');
      const [hours, minutes] = order.time.split(':');
      return new Date(year, month - 1, day, hours, minutes);
    }
    return null;
  }, [order.date, order.time]);

  // 컴포넌트가 마운트될 때 한 번만 로그 출력
  useEffect(() => {
    console.log('수정 중인 주문:', order);
    if (orderDateTime) {
      console.log('주문 날짜 및 시간:', orderDateTime);
    }
  }, [order, orderDateTime]);

  return (
    <div className="orderItemContainer">
      <div className="orderTitleSection">
        <span className="orderTitle">{order.time}</span>
        <span className="orderOptionsButton" onClick={handleOptionsClick}>
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.60377 17.1191C6.29395 17.119 5.98718 17.0579 5.70097 16.9393C5.41477 16.8207 5.15473 16.6468 4.93571 16.4277C4.71669 16.2086 4.54297 15.9484 4.42448 15.6622C4.30599 15.3759 4.24504 15.0691 4.24512 14.7593C4.24519 14.4495 4.3063 14.1427 4.42493 13.8565C4.54356 13.5703 4.71741 13.3102 4.93654 13.0912C5.15567 12.8722 5.4158 12.6985 5.70206 12.58C5.98833 12.4615 6.29513 12.4006 6.60495 12.4006C7.23066 12.4008 7.83068 12.6495 8.27302 13.0921C8.71535 13.5346 8.96376 14.1348 8.96361 14.7605C8.96345 15.3862 8.71474 15.9862 8.27218 16.4285C7.82963 16.8709 7.22948 17.1193 6.60377 17.1191M14.589 17.1191C13.9634 17.1191 13.3635 16.8706 12.9212 16.4283C12.4788 15.986 12.2303 15.386 12.2303 14.7605C12.2303 14.1349 12.4788 13.535 12.9212 13.0926C13.3635 12.6503 13.9634 12.4018 14.589 12.4018C15.2146 12.4018 15.8145 12.6503 16.2568 13.0926C16.6992 13.535 16.9477 14.1349 16.9477 14.7605C16.9477 15.386 16.6992 15.986 16.2568 16.4283C15.8145 16.8706 15.2146 17.1191 14.589 17.1191ZM22.573 17.1191C22.2632 17.119 21.9565 17.0579 21.6702 16.9393C21.384 16.8207 21.124 16.6468 20.905 16.4277C20.686 16.2086 20.5122 15.9484 20.3938 15.6622C20.2753 15.3759 20.2143 15.0691 20.2144 14.7593C20.2145 14.4495 20.2756 14.1427 20.3942 13.8565C20.5128 13.5703 20.6867 13.3102 20.9058 13.0912C21.1249 12.8722 21.3851 12.6985 21.6713 12.58C21.9576 12.4615 22.2644 12.4006 22.5742 12.4006C23.1999 12.4008 23.8 12.6495 24.2423 13.0921C24.6846 13.5346 24.933 14.1348 24.9329 14.7605C24.9327 15.3862 24.684 15.9862 24.2415 16.4285C23.7989 16.8709 23.1988 17.1193 22.573 17.1191" fill="#2D2E30"/>
          </svg>
        </span>

        {showOptions && (
          <OrderOptionsDropdown 
            handleEditClick={handleEditClick} 
            handleDeleteClick={handleDelete} 
          />
        )}
      </div>

      <div className="orderStatusButtonsContainer">
        <span className="orderStatusButton">{order.paymentStatus}</span>
        <span className="orderStatusButton" style={{
          backgroundColor: order.serviceType === '퀵 서비스' ? '#313336' : '#4e596829',
          color: order.serviceType === '퀵 서비스' ? '#fff' : '#4E5968'
        }}>
          {order.serviceType}
        </span>
      </div>

      <div className="orderDetailsSection">
        {order.items.map((item, index) => (
          <div key={index} className="order-item">
            <span>{item.menu}</span>
            <span className="quantity">{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.note && (
        <div className="orderNotesSection">
          <p className="orderNotesText">{order.note}</p>
        </div>
      )}

      <div className="SectionDivider"></div>

      <div className="orderBottomSection">
        <span className="customerInfoSection">
          <div className="customerName">{order.name}</div>
          <div className="customerPhoneNumber">{order.phone}</div>
        </span>

        <span>
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
          </label>
        </span>
      </div>
    </div>
  );
}

export default React.memo(OrderCard);
