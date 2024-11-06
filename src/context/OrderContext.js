import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDoc, getDocs, query, orderBy, limit, increment, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { itemsPerMenu } from '../constants/menuItems';


const OrderContext = createContext();

const getSavedDate = () => {
  const savedDate = localStorage.getItem('selectedDate');
  return savedDate ? new Date(savedDate) : new Date();
};

const initialState = {
  selectedDate: getSavedDate(),
  orders: [],
  completedOrders: [],
  peeNeeded: { white: 0, ssuk: 0 },
  totalItemsNeeded: {},
  individualItemCounts: {},
  actualPeeCount: {
    흰피: 0,
    쑥피: 0
  },
  remainingPee: {
    흰피: 0,
    쑥피: 0
  }
};

const SET_INDIVIDUAL_ITEM_COUNTS = 'SET_INDIVIDUAL_ITEM_COUNTS';

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      localStorage.setItem('selectedDate', action.payload.toISOString());
      return {
        ...state,
        selectedDate: action.payload
      };
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload.filter(order => !order.completed),
        completedOrders: action.payload.filter(order => order.completed)
      };
    case 'SET_COMPLETED_ORDERS':
      return { ...state, completedOrders: action.payload };
    case 'SET_PEE_NEEDED':
      return { ...state, peeNeeded: action.payload };
    case 'SET_TOTAL_ITEMS_NEEDED':
      return { ...state, totalItemsNeeded: action.payload };
    case SET_INDIVIDUAL_ITEM_COUNTS:
      return {
        ...state,
        individualItemCounts: action.payload,
      };
    case 'COMPLETE_ORDER': {
      const updatedOrder = action.payload;
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== updatedOrder.id),
        completedOrders: [
          ...state.completedOrders.filter(order => order.id !== updatedOrder.id),
          updatedOrder
        ]
      };
    }
    case 'UNCOMPLETE_ORDER': {
      const updatedOrder = action.payload;
      return {
        ...state,
        completedOrders: state.completedOrders.filter(order => order.id !== updatedOrder.id),
        orders: [
          ...state.orders.filter(order => order.id !== updatedOrder.id),
          updatedOrder
        ]
      };
    }
    case 'SET_ACTUAL_PEE_COUNT':
      return {
        ...state,
        actualPeeCount: action.payload
      };
      
    case 'SET_REMAINING_PEE':
      return {
        ...state,
        remainingPee: action.payload
      };
      
    default:
      return state;
  }
}

// 개별 주문의 떡피 사용량 계산 함수
const calculatePeeForOrder = (order) => {
  const menu = itemsPerMenu[order.menu];
  return {
    흰피: (menu?.흰피 || 0) * order.quantity,
    쑥피: (menu?.쑥피 || 0) * order.quantity
  };
};

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    const dateStr = state.selectedDate.toISOString().split('T')[0];
    
    const ordersRef = collection(db, 'orders', dateStr, 'orderList');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      dispatch({ type: 'SET_ORDERS', payload: ordersData });
    });

    return () => unsubscribe();
  }, [state.selectedDate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'completedOrders'), (snapshot) => {
      const completedOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: 'SET_COMPLETED_ORDERS', payload: completedOrders });
    }, console.error);

    return () => unsubscribe();
  }, []);

  const setIndividualItemCounts = useCallback((counts) => {
    dispatch({ type: SET_INDIVIDUAL_ITEM_COUNTS, payload: counts });
  }, []);

  const addOrder = useCallback(async (orderData) => {
    try {
      const dateStr = state.selectedDate.toISOString().split('T')[0];
      const orderRef = collection(db, 'orders', dateStr, 'orderList');
      
      // Firebase에 주문 데이터 저장
      const docRef = await addDoc(orderRef, {
        ...orderData,
        createdAt: new Date(),
        status: '준비중'
      });
      
      console.log('주문이 성공으로 저장되었습니다:', docRef.id);
      
      // 상태 업데이트
      dispatch({ 
        type: 'SET_ORDERS', 
        payload: [...state.orders, { ...orderData, id: docRef.id }] 
      });

    } catch (error) {
      console.error('주문 저장 중 오류 발생:', error);
      throw error;
    }
  }, [state.selectedDate, state.orders, dispatch]);

  const handleDeleteOrder = useCallback(async (order) => {
    try {
      // 주문 삭제
      const orderRef = doc(db, 'orders', order.date, 'orderList', order.id);
      await deleteDoc(orderRef);

      // 고객의 주문 횟수 감소 및 필요시 고객 정보 삭제
      if (order.phone) {
        const customerRef = doc(db, 'customers', order.phone);
        const customerDoc = await getDoc(customerRef);
        
        if (customerDoc.exists()) {
          const currentCount = customerDoc.data().orderCount || 0;
          
          if (currentCount <= 1) {
            // 주문 횟수가 1 이하면 고객 정보 삭제
            await deleteDoc(customerRef);
          } else {
            // 주문 횟수가 2 이상이면 카운트만 감소
            await updateDoc(customerRef, {
              orderCount: increment(-1)
            });
          }
        }
      }

      dispatch({ type: 'DELETE_ORDER', payload: order });
    } catch (error) {
      console.error('주문 삭제 중 오류 발생:', error);
      throw error;
    }
  }, [dispatch]);

  const handleOrderChange = useCallback(async (orderData, isEdit = false) => {
    try {
      const dateStr = orderData.date;
      const orderRef = doc(db, 'orders', dateStr, 'orderList', orderData.id);
      await setDoc(orderRef, orderData);

      // 고객 정보 업데이트 (새로운 주문일 때만)
      if (!isEdit && orderData.phone) {
        const customerRef = doc(db, 'customers', orderData.phone);
        const customerDoc = await getDoc(customerRef);
        
        if (customerDoc.exists()) {
          // 기존 고객 정보 업데이트 (orderCount는 증가시키고 나머지 정보만 업데이트)
          await updateDoc(customerRef, {
            orderCount: increment(1),
            lastOrderDate: dateStr,
            name: orderData.name
          });
        } else {
          // 새로운 고객 정보 생성
          await setDoc(customerRef, {
            name: orderData.name,
            phone: orderData.phone,
            orderCount: 1,
            lastOrderDate: dateStr
          });
        }
      }

      dispatch({ type: isEdit ? 'UPDATE_ORDER' : 'ADD_ORDER', payload: orderData });
    } catch (error) {
      console.error('주문 처리 중 오류 발생:', error);
      throw error;
    }
  }, [dispatch]);

  // 주문 완료/미완료 상태 변경 함수
  const handleOrderStatusChange = useCallback(async (order, isCompleted) => {
    try {
      const dateStr = order.date || state.selectedDate.toISOString().split('T')[0];
      const updatedOrder = { ...order, completed: isCompleted };
      
      // Firebase 문서 경로 수정
      const orderRef = doc(db, 'orders', dateStr, 'orderList', order.id);
      
      // Firebase 업데이트
      await updateDoc(orderRef, {
        completed: isCompleted,
        updatedAt: new Date()
      });

      // 로컬 상태 업데이트
      dispatch({ 
        type: isCompleted ? 'COMPLETE_ORDER' : 'UNCOMPLETE_ORDER', 
        payload: updatedOrder 
      });
    } catch (error) {
      console.error('주문 상태 변경 중 오류 발생:', error);
      throw error;
    }
  }, [dispatch, state.selectedDate]);

  const value = {
    state,
    dispatch,
    handleOrderChange,
    handleDeleteOrder,
    handleOrderStatusChange,
    setIndividualItemCounts
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}