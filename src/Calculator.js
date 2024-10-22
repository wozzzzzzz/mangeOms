import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // Firebase 설정 파일

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
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
  });
  const [peeNeeded, setPeeNeeded] = useState({ white: 0, ssuk: 0 });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    setIsLoading(true);
    const dateStr = selectedDate; // selectedDate는 이미 'YYYY-MM-DD' 형식
    const ordersRef = collection(db, 'orders', dateStr, 'orderList');
    const q = query(ordersRef, orderBy('time'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('가져온 주문:', fetchedOrders);
      setOrders(fetchedOrders);
      const calculatedPee = calculatePeeNeeded(fetchedOrders);
      setPeeNeeded(calculatedPee);
      setIsLoading(false);
    }, (error) => {
      console.error("주문을 가져오는 중 오류 발생:", error);
      setOrders([]);
      setPeeNeeded({ white: 0, ssuk: 0 });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // 'YYYY-MM-DD' 형식으로 직접 저장
  };

  // 날짜를 한국어 형식으로 표시하는 함수
  const formatDateToKorean = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    if (Number.isInteger(num)) {
      return num.toString();
    } else if (Math.abs(num % 1) === 0.5) {
      return num.toFixed(1);
    } else {
      return Math.round(num).toString();
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="calculator">
      <h1>떡피 계산</h1>

      <input 
        type="date" 
        value={selectedDate} 
        onChange={handleDateChange}
      />

      <div className="pee-result">
        <h2>선택된 날짜: {formatDateToKorean(selectedDate)}</h2>
        <p>필요한 흰피: {formatNumber(peeNeeded.white)}개</p>
        <p>필요한 쑥피: {formatNumber(peeNeeded.ssuk)}개</p>
      </div>

      <div className="orders-summary">
        <h3>주문 요약</h3>
        {orders.length === 0 ? (
          <p>이 날짜에 주문이 없습니다.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-item">
              <p>{order.name} - {order.time}</p>
              <ul>
                {order.items && order.items.map((item, index) => (
                  <li key={index}>
                    {item.menu}: {item.quantity}개
                    {peePerMenu[item.menu] && (
                      <span>
                        (흰피: {formatNumber(peePerMenu[item.menu].white * item.quantity)}개, 
                        쑥피: {formatNumber(peePerMenu[item.menu].ssuk * item.quantity)}개)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calculator;
