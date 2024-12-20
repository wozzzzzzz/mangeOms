import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import OrderManagement from './OrderManagement'; // 주문 관리 컴포넌트
import Calculator from './Calculator'; // 피 계산기 컴포넌트
import CustomerInfo from './CustomerInfo'; // 고객 정보 컴포넌트
import CustomerDetail from './CustomerDetail'; // CustomerDetail 컴포넌트 임포트
import { OrderProvider } from './context/OrderContext';
import './styles/styles.css'; // 전체 스타일 파일

function App() {
  return (
    <OrderProvider>
      <Router>
        <div className="app">
          {/* 사이드바 */}
          <Sidebar />

          {/* 메인 컨텐츠 */}
          <div className="main-content">
            <Routes>
              <Route path="/" element={<OrderManagement />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/customer-info" element={<CustomerInfo />} />
              <Route path="/customer/:id" element={<CustomerDetail />} /> // 고객 상세 페이지 경로 추가
            </Routes>
          </div>
        </div>
      </Router>
    </OrderProvider>
  );
}

export default App;
