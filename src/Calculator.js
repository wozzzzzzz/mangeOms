import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; // Firebase 설정 파일
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 메뉴별 피 필요량 정의
const peePerMenu = {
  '망개떡세트 S': { white: 5, ssuk: 5 },
  '망개떡세트 M': { white: 10, ssuk: 10 },
  '망개떡세트 L': { white: 15, ssuk: 15 },

  '굴레세트 S': { white: 5, ssuk: 5 },
  '굴레세트 M': { white: 10, ssuk: 10 },
  '굴레세트 L': { white: 15, ssuk: 15 },

  '망굴세트 S': { white: 5, ssuk: 5 },
  '망굴세트 M': { white: 10, ssuk: 10 },
  '망굴세트 L': { white: 15, ssuk: 15 },

  '종합세트 M': { white: 12, ssuk: 6.5 },
  '종합세트 L': { white: 17, ssuk: 9.5 },

  '함지선물세트 S': { white: 23, ssuk: 14.5 },
  '함지선물세트 M': { white: 30, ssuk: 19.5 },
  '함지선물세트 L': { white: 36, ssuk: 25.5 },

  '떡 케이크 S': { white: 16, ssuk: 14 },
  '떡 케이크 M': { white: 23, ssuk: 20.5 },
  '떡 케이크 L': { white: 30, ssuk: 28.5 },

  '이바지 떡': { white: 61, ssuk: 56 },
};

// 떡피 계산기 컴포넌트
const Calculator = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [peeNeeded, setPeeNeeded] = useState({ white: 0, ssuk: 0 });

  // 피 소모량을 계산하는 함수
  const calculatePeeNeeded = (orders) => {
    return orders.reduce(
      (totalPee, order) => {
        order.items.forEach((item) => {
          const menu = peePerMenu[item.menu];
          if (menu) {
            totalPee.white += menu.white * item.quantity;
            totalPee.ssuk += menu.ssuk * item.quantity;
          }
        });
        return totalPee;
      },
      { white: 0, ssuk: 0 } // 초기 값
    );
  };

  // Firebase에서 주문 데이터를 가져오고 피 소모량을 계산하는 부분
  useEffect(() => {
    const fetchOrders = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      return onSnapshot(collection(db, 'orders', dateStr, 'orderList'), (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const calculatedPee = calculatePeeNeeded(orders);
        setPeeNeeded(calculatedPee); // 피 소모량을 상태에 저장
      }, console.error);
    };

    const unsubscribe = fetchOrders(selectedDate);
    return () => unsubscribe();
  }, [selectedDate]);

  useEffect(() => {
    const savedDate = localStorage.getItem('selectedDate');
    if (savedDate) {
      setSelectedDate(new Date(savedDate));
    }
  }, []);

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="calculator">
      <h1>떡피 계산</h1>

      <div className="date-picker">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          className="input-date"
        />
      </div>

      <div className="pee-result">
        <h2>선택된 날짜: {selectedDate.toLocaleDateString()}</h2>
        <p>필요한 흰피: {peeNeeded.white}g</p>
        <p>필요한 쑥피: {peeNeeded.ssuk}g</p>
      </div>
    </div>
  );
};

export default Calculator;