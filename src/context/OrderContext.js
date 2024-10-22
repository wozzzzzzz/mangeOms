import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const OrderContext = createContext();

const initialState = {
  selectedDate: new Date(),
  orders: [],
  completedOrders: [],
  peeNeeded: { white: 0, ssuk: 0 },
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_COMPLETED_ORDERS':
      return { ...state, completedOrders: action.payload };
    case 'SET_PEE_NEEDED':
      return { ...state, peeNeeded: action.payload };
    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    const savedDate = localStorage.getItem('selectedDate');
    if (savedDate) {
      dispatch({ type: 'SET_SELECTED_DATE', payload: new Date(savedDate) });
    }
  }, []);

  useEffect(() => {
    const fetchOrders = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      return onSnapshot(collection(db, 'orders', dateStr, 'orderList'), (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        dispatch({ type: 'SET_ORDERS', payload: orders });
      }, console.error);
    };

    const unsubscribe = fetchOrders(state.selectedDate);
    return () => unsubscribe();
  }, [state.selectedDate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'completedOrders'), (snapshot) => {
      const completedOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: 'SET_COMPLETED_ORDERS', payload: completedOrders });
    }, console.error);

    return () => unsubscribe();
  }, []);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
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
