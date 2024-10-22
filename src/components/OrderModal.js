import React, { useState, useEffect } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/OrderModal.css';

const menuOptions = [
  "망개떡세트 S", "망개떡세트 M", "망개떡세트 L",
  "망굴세트 S", "망굴세트 M", "망굴세트 L",
  "종합세트 M", "종합세트 L",
  "함지선물세트 S", "함지선물세트 M", "함지선물세트 L",
  "떡 케이크 S", "떡 케이크 M", "떡 케이크 L","이바지 떡",
  "연잎밥", "전통식혜 500ml", "전통식혜 1L",
  "단호박식혜 500ml", "단호박식혜 1L"
];

function OrderModal({ show, onClose, selectedDate, order, isEdit }) {
  const [name, setName] = useState(order ? order.name : '');
  const [phone, setPhone] = useState(order ? order.phone : '');
  const [items, setItems] = useState(order ? order.items : []);
  const [newMenu, setNewMenu] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [serviceType, setServiceType] = useState(order ? order.serviceType : '픽업');
  const [paymentStatus, setPaymentStatus] = useState(order ? order.paymentStatus : '미결제');
  const [status, setStatus] = useState(order ? order.status : '준비중');
  const [note, setNote] = useState(order ? order.note : '');
  const [selectedDatetime, setSelectedDatetime] = useState(new Date());

  // 주문 수정일 경우 기존 저장된 날짜와 시간 설정
  useEffect(() => {
    if (isEdit && order) {
      const orderDate = new Date(`${order.date}T${order.time}`);
      setSelectedDatetime(orderDate);
    } else {
      setSelectedDatetime(new Date(selectedDate));  // 새로운 주문일 경우 선택된 날짜로 설정
    }
  }, [isEdit, order, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    if (name === 'phone') setPhone(value);
    if (name === 'serviceType') setServiceType(value);
    if (name === 'note') setNote(value);
  };

  const handleSaveOrder = async () => {
    const formattedItems = items.map(item => ({
      menu: item.menu,
      quantity: item.quantity
    }));

    const formattedTime = `${selectedDatetime.getHours().toString().padStart(2, '0')}:${selectedDatetime.getMinutes().toString().padStart(2, '0')}`;
    const selectedDateString = selectedDatetime.toISOString().split('T')[0];

    try {
      if (isEdit) {
        const orderRef = doc(db, 'orders', selectedDateString, 'orderList', order.id);
        await updateDoc(orderRef, {
          name, phone, items: formattedItems, serviceType, paymentStatus, time: formattedTime, status, note, date: selectedDateString
        });
        console.log("주문 수정 완료!");
      } else {
        await addDoc(collection(db, 'orders', selectedDateString, 'orderList'), {
          name, phone, items: formattedItems, serviceType, paymentStatus, time: formattedTime, status, note, date: selectedDateString
        });
        console.log("주문 추가 완료!");
      }
      onClose();
    } catch (error) {
      console.error("주문 저장 중 오류 발생: ", error);
    }
  };

  const addNewItem = (e) => {
    e.preventDefault();
    if (newMenu.trim() && newQuantity > 0) {
      setItems([...items, { menu: newMenu, quantity: newQuantity }]);
      setNewMenu('');
      setNewQuantity(1);
    } else {
      alert('메뉴와 수량을 올바르게 입력하세요.');
    }
  };

  const removeItem = (index, e) => {
    e.preventDefault();
    setItems(items.filter((_, i) => i !== index));
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 모달 상단 */}
        <div className="modal-header">
          <div>{isEdit ? "주문 수정하기" : "새 주문 추가하기"}</div>
          <button onClick={onClose} className="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="22.684" height="22.684" viewBox="0 0 24 24" fill="none">
            <path d="M14.5331 11.8759L14.3004 12.1085L14.5331 12.3412L22.858 20.6661L22.8581 20.6662C22.9919 20.7998 23.098 20.9585 23.1704 21.1332C23.2428 21.3078 23.2801 21.4951 23.2801 21.6842C23.2801 21.8732 23.2428 22.0605 23.1704 22.2351C23.098 22.4098 22.9919 22.5685 22.8581 22.7021L22.8576 22.7026C22.7242 22.8365 22.5657 22.9426 22.3912 23.0151C22.2167 23.0875 22.0296 23.1248 21.8406 23.1248C21.6516 23.1248 21.4645 23.0875 21.29 23.0151C21.1155 22.9426 20.957 22.8365 20.8236 22.7026L20.8233 22.7023L12.4984 14.3759L12.2657 14.1432L12.0331 14.3759L3.70672 22.7022C3.42639 22.9826 3.05913 23.1228 2.69058 23.123C2.40645 23.1219 2.12895 23.037 1.89294 22.8787C1.65677 22.7204 1.47269 22.4958 1.36385 22.2331C1.25501 21.9704 1.22627 21.6814 1.28124 21.4025C1.33619 21.1237 1.4723 20.8673 1.67247 20.6656C1.67258 20.6655 1.6727 20.6654 1.67281 20.6653L9.99836 12.3412L10.2311 12.1085L9.99836 11.8759L1.6761 3.5551C1.42323 3.2827 1.2854 2.92303 1.29157 2.55127C1.29778 2.17776 1.44886 1.82128 1.71293 1.55705C1.977 1.29283 2.33339 1.14154 2.7069 1.13511C3.07863 1.12872 3.43836 1.26632 3.71089 1.519L12.0331 9.84119L12.2657 10.0738L12.4984 9.84117L20.8232 1.51489C20.9569 1.38129 21.1156 1.27532 21.2902 1.20304C21.4648 1.13076 21.652 1.09358 21.841 1.09364C22.03 1.0937 22.2172 1.13098 22.3918 1.20336C22.5664 1.27574 22.725 1.3818 22.8586 1.51549C22.9922 1.64918 23.0982 1.80788 23.1705 1.98252C23.2428 2.15716 23.2799 2.34433 23.2799 2.53334C23.2798 2.72235 23.2425 2.9095 23.1702 3.0841C23.0978 3.25869 22.9917 3.41733 22.858 3.55094L22.858 3.55101L14.5331 11.8759Z" fill="#B4B6BB" stroke="white" stroke-width="0.657982"/>
            </svg>
          </button>
        </div>
        <div className='modal-subText'>주문자 이름과 전화번호는 꼭 남겨주세요!</div>
        <div className="modal-body">
          <form>
          {/* 주문자 정보 필드 */}
          <div class="input-container">
            <input
              type="text"
              name="name"
              placeholder="주문자 이름을 입력해주세요"
              value={name}
              onChange={handleInputChange}
              className="input-field"
            />
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1732 6.23607C14.1732 6.76477 14.0691 7.28831 13.8668 7.7768C13.6646 8.26528 13.3681 8.70913 12.9942 9.08302C12.6204 9.45691 12.1766 9.75351 11.6882 9.95589C11.1998 10.1583 10.6762 10.2625 10.1475 10.2625C9.07976 10.2626 8.05568 9.83855 7.30058 9.0836C6.54547 8.32865 6.1212 7.30466 6.12109 6.23689C6.12104 5.70819 6.22512 5.18465 6.4274 4.69616C6.62967 4.20768 6.92618 3.76383 7.3 3.38994C8.05495 2.63483 9.07894 2.21056 10.1467 2.21045C11.2145 2.21034 12.2386 2.63441 12.9937 3.38936C13.7488 4.14431 14.173 5.1683 14.1732 6.23607ZM10.1471 11.4942C4.34947 11.4942 2.09424 15.1838 2.09424 16.9003C2.09424 18.616 6.89504 19.0733 10.1471 19.0733C13.3992 19.0733 18.2 18.616 18.2 16.9003C18.2 15.1838 15.9448 11.4942 10.1471 11.4942Z" fill="#77E3AB"/>
            </svg>
          </div>

          <div class="input-container">
            <input
              type="text"
              name="phone"
              placeholder="휴대폰번호를 입력해주세요"
              value={phone}
              onChange={handleInputChange}
              className="input-field"
            />
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.9836 14.6846L15.7109 12.1514C15.5529 12.0294 15.3558 11.9692 15.1565 11.9821C14.9573 11.9949 14.7696 12.08 14.6285 12.2213L12.8915 13.9592C12.7621 14.0899 12.5924 14.1731 12.4098 14.1953C12.2273 14.2176 12.0426 14.1775 11.8856 14.0817C11.3263 13.7388 10.3903 13.0742 9.2191 11.9022C8.04789 10.7318 7.38333 9.79497 7.04036 9.23651C6.94443 9.07966 6.90441 8.89495 6.92681 8.71246C6.94921 8.52997 7.03271 8.36043 7.16373 8.23144L8.9008 6.49354C9.04229 6.35257 9.1274 6.16475 9.14013 5.96542C9.15285 5.76609 9.09231 5.56898 8.96989 5.41116L6.43748 2.1377C5.86175 1.395 4.77608 1.27739 4.06875 1.89836C3.13688 2.7159 2.01749 3.94057 1.69178 5.31493C1.10207 7.79059 2.03394 10.8971 6.12988 14.993C10.2258 19.0882 13.3323 20.0208 15.8072 19.4319C17.1815 19.1046 18.407 17.9844 19.2245 17.0533C19.8447 16.346 19.7271 15.2603 18.9836 14.6846Z" fill="#77E3AB"/>
            </svg>
          </div> 

            {/* 서비스 타입 및 시간 선택 */}
            <div className="service-type-datetime">
              <select
                name="serviceType"
                value={serviceType}
                onChange={handleInputChange}
                className="input-field service-select"
              >
                <option value="매장픽업">매장픽업</option>
                <option value="퀵 서비스">퀵 서비스</option>
              </select>
              
              <DatePicker
                selected={selectedDatetime}
                onChange={(date) => setSelectedDatetime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={10}
                dateFormat="MM월 dd일 HH:mm"
                locale="ko"
                className="input-field datetime-picker"
                popperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 10], // 팝업 위치 조정
                      },
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'viewport',
                      },
                    },
                  ],
                }}
                popperPlacement="bottom-start" // 팝업 위치 설정
              />
            </div>

            <div className='divider_21'></div>

            {/* 메뉴 선택 및 수량 입력 */}
            <div className="menu-select-container">
              <select
                value={newMenu}
                onChange={(e) => setNewMenu(e.target.value)}
                className="menu-select"
              >
                <option value="">메뉴 선택하기</option>
                {menuOptions.map((menu, idx) => (
                  <option key={idx} value={menu}>
                    {menu}
                  </option>
                ))}
              </select>

              <div className="quantity-input-container">
                  <input
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        min="1"
                        className="quantity-input"/>

                  <div className="quantity-buttons">
                    <button type="button" onClick={() => setNewQuantity(newQuantity + 1)} className="quantity-btn">
                      ▲
                    </button>
                    <button type="button" onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))} className="quantity-btn">
                      ▼
                    </button>
                </div>

                <button onClick={addNewItem} className="add-btn">
                  추가
                </button>

               </div> 
              </div>

            {/* 추가된 메뉴 리스트 */}
            {items.map((item, index) => (
              <div key={index} className="added-item">
                <span className="item_menu">{item.menu}</span>
                <span className="item_quan">{item.quantity}</span>
                <button onClick={(e) => removeItem(index, e)} className="remove-btn">
                  삭제
                </button>
              </div>
            ))}

            {/* 기타 사항 필드 */}
            <textarea
              name="note" 
              rows={1}
              placeholder="기타 사항을 입력하세요"
              value={note}
              onChange={handleInputChange}
              className="input-field-note"
            />
          </form>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button onClick={handleSaveOrder} className="modal-btn save-btn">
            {isEdit ? "주문 수정하기" : "주문 추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;