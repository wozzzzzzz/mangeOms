import React, { useState, useEffect } from 'react';
import { Table, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Link } from 'react-router-dom';

const CustomerInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        const customersList = customersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        setCustomers(customersList);
        setLoading(false);
      } catch (error) {
        console.error("고객 정보 가져오기 실패:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // 검색 기능
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.phone?.includes(searchText)
  );

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

  return (
    <div style={{ padding: '20px' }}>
      <h2>고객 정보 관리</h2>
      
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="고객명 또는 연락처 검색"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="phone"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CustomerInfo;