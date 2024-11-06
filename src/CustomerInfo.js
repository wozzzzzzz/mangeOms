import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Table, Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const CustomerInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        const customersList = customersSnapshot.docs.map(doc => {
          const data = doc.data();
          const classification = classifyCustomer(data);
          return { ...data, classification, id: doc.id };
        });

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

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchText.toLowerCase()) || customer.phone?.includes(searchText);
    const matchesFilter = filter === '전체' || customer.classification === filter;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      title: '고객명',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Link to={`/customer/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '주문횟수',
      dataIndex: 'orderCount',
      key: 'orderCount',
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: '최근 주문일',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      sorter: (a, b) => a.lastOrderDate.localeCompare(b.lastOrderDate),
    }
  ];

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h2>고객 목록</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="검색"
          value={searchText}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
        />
      </Space>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => handleFilterChange('전체')}>전체</Button>
        <Button onClick={() => handleFilterChange('첫방문')}>첫방문</Button>
        <Button onClick={() => handleFilterChange('예비 단골')}>예비 단골</Button>
        <Button onClick={() => handleFilterChange('단골')}>단골</Button>
        <Button onClick={() => handleFilterChange('뜸한 고객')}>뜸한 고객</Button>
      </Space>
      <Table columns={columns} dataSource={filteredCustomers} rowKey="id" />
    </div>
  );
};

export default CustomerInfo;