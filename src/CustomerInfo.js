import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from './firebase';
import { Table, Input, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import './styles/CustomerInfo.css';
import SearchBar from './components/SearchBar';

const CustomerInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('고객 정보 가져오기 시작');
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        const customersList = customersSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('고객 ID:', doc.id);
          
          const orders = data.orders || [];
          console.log(`고객 ${doc.id}의 실제 orders 데이터:`, orders);

          const classification = classifyCustomer(data);

          return { 
            ...data, 
            id: doc.id,
            orders: orders,
            classification: classification
          };
        });

        console.log('최종 데이터 확인:', customersList.map(c => ({
          name: c.name,
          ordersCount: c.orders?.length,
          orders: c.orders,
          classification: c.classification
        })));

        setCustomers(customersList);
        setLoading(false);
      } catch (error) {
        console.error("고객 정보 가져오기 실패:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const classifyCustomer = (customer) => {
    const today = new Date();
    const lastOrderDate = new Date(customer.lastOrderDate);
    const monthsSinceLastOrder = (today.getFullYear() - lastOrderDate.getFullYear()) * 12 + (today.getMonth() - lastOrderDate.getMonth());

    if (customer.orderCount === 1) {
      return '첫방문';
    } else if (customer.orderCount >= 2 && customer.orderCount <= 4) {
      return '예비 단골';
    } else if (customer.orderCount >= 5) {
      return '단골';
    } else if (monthsSinceLastOrder >= 6) {
      return '뜸한 고객';
    } else {
      return '기타';
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchText.toLowerCase()) || customer.phone?.includes(searchText);
    const matchesFilter = filter === '전체' || customer.classification === filter;
    return matchesSearch && matchesFilter;
  });

  const calculateMonthlyVisits = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      console.log('orders 데이터 없음:', orders);
      return 0;
    }

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    console.log('주문 데이터:', orders);
    console.log('날짜 범위:', { 
      today: today.toISOString().split('T')[0], 
      oneMonthAgo: oneMonthAgo.toISOString().split('T')[0] 
    });

    const count = orders.filter(order => {
      const orderDate = new Date(order.date);
      const isWithinMonth = orderDate >= oneMonthAgo && orderDate <= today;
      console.log('주문 날짜 체크:', {
        orderDate: order.date,
        isWithinMonth,
        orderDateObj: orderDate
      });
      return isWithinMonth;
    }).length;

    console.log('최종 계산된 한달 내 주문 수:', count);
    return count;
  };

  const columns = [
    {
      title: '고객',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/customer/${record.id}`} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F2F4F6' }} /> {/* 프로필 이미지 플레이스홀더 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              color: '#2D2E30',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '142.9%',
            }}>
              {record.name}
            </div>
            <div style={{
              color: '#4E5968',
              fontFamily: 'Pretendard',
              fontSize: '14px',
              fontWeight: '400',
              lineHeight: '142.9%',
            }}>
              {record.phone}
            </div>
            <div style={{
              color: '#B7BAC0',
              fontFamily: 'Pretendard',
              fontSize: '12px',
              fontWeight: '400',
              lineHeight: '142.9%',
            }}>
              customer_info_{String(record.id).padStart(3, '0')}
            </div>
          </div>
        </Link>
      ),
    },
    {
      title: '방문 횟수',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (text, record) => {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        console.log('날짜 범위 확인:', {
          today: today.toISOString().split('T')[0],
          oneMonthAgo: oneMonthAgo.toISOString().split('T')[0]
        });

        const monthlyVisits = record.orders?.filter(order => {
          const orderDate = new Date(order.date);
          console.log('주문 날짜 확인:', {
            orderDate: order.date,
            isWithinMonth: orderDate >= oneMonthAgo && orderDate <= today
          });
          return orderDate >= oneMonthAgo && orderDate <= today;
        }).length || 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              color: '#4E5968',
              fontFamily: 'Pretendard',
              fontSize: '14px',
              fontWeight: '400',
            }}>
              총 {text}회
            </div>
            <div style={{
              color: '#2D2E30',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontWeight: '500',
            }}>
              한달간 {monthlyVisits}번
            </div>
          </div>
        );
      },
    },
    {
      title: '최근 주문일',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      render: (text) => (
        <div style={{
          color: '#4E5968',
          fontFamily: 'Pretendard',
          fontSize: '16px',
          fontWeight: '400',
        }}>
          {text}
        </div>
      ),
    }
];

  const buttonStyle = {
    display: 'flex',
    padding: '12px 24px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '24px',
    background: 'rgba(78, 89, 104, 0.12)',
    marginRight: '8px',
    color: '#4E5968',
    fontFamily: 'Pretendard',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '142.9%',
    letterSpacing: '-0.4px',
    minHeight: '48px'
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="customer-info-container">
      <h2 className="customer-info-title">고객 정보</h2>
      <div className="search-filter-container" style={{ padding: '0px 0px' }}>
        <div style={{ marginBottom: '32px' }}>
          <SearchBar
            searchQuery={searchText}
            onSearchChange={handleSearch}
          />
        </div>
        <div style={{ marginBottom: '32px', display: 'flex' }}>
          <Button style={buttonStyle} onClick={() => handleFilterChange('전체')}>전체</Button>
          <Button style={buttonStyle} onClick={() => handleFilterChange('첫방문')}>첫방문</Button>
          <Button style={buttonStyle} onClick={() => handleFilterChange('예비 단골')}>예비 단골</Button>
          <Button style={buttonStyle} onClick={() => handleFilterChange('단골')}>단골</Button>
          <Button style={buttonStyle} onClick={() => handleFilterChange('뜸한 고객')}>뜸한 고객</Button>
        </div>
        <div style={{
          marginBottom: '32px',
          color: '#2D2E30',
          fontFamily: 'Pretendard',
          fontSize: '24px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '142.9%',
          letterSpacing: '-0.48px'
        }}>
          총 인원수: {filteredCustomers.length}명
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredCustomers} 
        rowKey="id"
        style={{
          fontFamily: 'Pretendard',
        }}
        className="customer-table"
      />
    </div>
  );
};

export default CustomerInfo;