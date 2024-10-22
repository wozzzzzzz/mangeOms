import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/styles.css';

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false); // 사이드바 확장 여부 상태
  const location = useLocation(); // 현재 경로 확인

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded); // 클릭 시 넓이 토글
  };



  const sidebarStyle = {
    width: isExpanded ? '220px' : '72px',
    height: '100vh', // 사이드바 높이를 100%로 설정
    backgroundColor: '#333',
    padding: isExpanded ? '36px 18px' : '36px 18px 729px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: isExpanded ? 'flex-start' : 'center', // 확장 여부에 따라 정렬 변경
    gap: '98px',
    flexShrink: 0,
    boxSizing: 'border-box',
    transition: '0.4s ease',
  };

  const navlistStyle = {
    display: 'flex',
    width: '26px',
    flexDirection: 'column',
    alignItems: isExpanded ? 'flex-start' : 'center', // 아이템 정렬 변경
    listStyle: 'none',
    gap: '51.714px',
    paddingLeft: '0',
    margin: '0',
    fontFamily: '"Pretendard JP"', // 폰트 패밀리 추가
    fontSize: '19.393px', // 폰트 사이즈 추가
  };


  const toggleIconColor = isExpanded ? 'white' : '#FFFFFFCC' ;

  // 현재 경로에 따라 아이콘과 텍스트 색상 결정
  const iconColor = (path) =>
    location.pathname === path ? '#77E3AB' : 'rgba(255, 255, 255, 0.50)';

  const textColor = (path) =>
    location.pathname === path ? '#77E3AB' : 'rgba(255, 255, 255, 0.50)'; // 텍스트는 선택된 경로일 때만 초록색


  return (
    <div style={sidebarStyle}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default', justifyContent: 'space-between', width: '100%' }}>
        {/* 첫 번째 SVG: 사이드바가 확장되었을 때만 보임 */}
        {isExpanded && (
          <div style={{ cursor: 'default' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" >
              <path fillRule="evenodd" clipRule="evenodd" d="M27 18.75L23.7 19.8C21.9 20.4 20.55 21.75 19.95 23.55L18.75 27C18.45 27.75 17.55 27.75 17.4 27L16.35 23.7C15.75 21.9 14.4 20.55 12.6 19.95L9 18.75C8.25 18.45 8.25 17.55 9 17.4L12.3 16.35C14.1 15.75 15.45 14.4 16.05 12.6L17.25 9C17.55 8.25 18.45 8.25 18.6 9L19.65 12.3C20.25 14.1 21.6 15.45 23.4 16.05L26.7 17.1C27.75 17.55 27.75 18.45 27 18.75ZM18 1.5C8.85 1.5 1.5 8.85 1.5 18C1.5 27.15 8.85 34.5 18 34.5C27.15 34.5 34.5 27.15 34.5 18C34.5 8.85 27.15 1.5 18 1.5Z" fill="#77E3AB"/>
            </svg>
          </div>
        )}

        {/* 두 번째 SVG: 항상 보임 */}
        <div onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.8501 28.05V8.55C5.8501 7.05 7.0501 6 8.4001 6H27.9001C29.4001 6 30.4501 7.2 30.4501 8.55V28.05C30.4501 29.55 29.2501 30.6 27.9001 30.6H8.4001C6.9001 30.6 5.8501 29.55 5.8501 28.05"
              stroke={toggleIconColor}
              strokeOpacity="0.8"
              strokeWidth="1.5"
              strokeLinejoin="bevel"
            />
            <path
              d="M13.5002 6.30078V30.3008"
              stroke={toggleIconColor}
              strokeOpacity="0.8"
              strokeWidth="1.5"
              strokeLinejoin="bevel"
            />
          </svg>
        </div>
      </div>

      <ul style={navlistStyle}>
        <li>
        <Link 
      to="/" 
      style={{ 
        color: '#fff', 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        width: isExpanded ? '104.237px' : '28px', // 사이드바가 축소되었을 때 너비 조정
        // overflow: 'hidden', // 아이콘이 화면 밖으로 나가지 않도록 설정
        whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록 설정
      }}
    > 
              <svg style={{ flexShrink: 0 }} width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.0088 2.1543H4.84813C4.56239 2.1543 4.28836 2.26781 4.08631 2.46985C3.88426 2.6719 3.77075 2.94594 3.77075 3.23168V22.6245C3.77075 22.9103 3.88426 23.1843 4.08631 23.3864C4.28836 23.5884 4.56239 23.7019 4.84813 23.7019H14.0059V18.315C14.0059 16.8304 15.2147 15.6216 16.6993 15.6216H22.0862V3.23168C22.0862 2.94594 21.9727 2.6719 21.7707 2.46985C21.5686 2.26781 21.2946 2.1543 21.0088 2.1543Z"
                  fill={iconColor('/')} // 아이콘 색상 변경
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.6221 18.3157V23.7026L22.0864 17.2383H16.6995C16.4137 17.2383 16.1397 17.3518 15.9376 17.5538C15.7356 17.7559 15.6221 18.0299 15.6221 18.3157Z"
                  fill={iconColor('/')} // 아이콘 색상 변경
                />
              </svg>
              {isExpanded && <span style={{ color: textColor('/') }}>주문 관리</span>}
            </Link>
          </li>

          <li>
          <Link 
      to="/calculator"
      style={{ 
        color: '#fff', 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        width: isExpanded ? '104.237px' : '28px', // 사이드바가 축소되었을 때 너비 조정
        // overflow: 'hidden', // 아이콘이 화면 밖으로 나가지 않도록 설정
        whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록 설정
      }}
    >
              <svg style={{ flexShrink: 0 }} width="26" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0779 14.7873C14.9698 14.7834 14.862 14.8014 14.761 14.8401C14.66 14.8788 14.5678 14.9375 14.49 15.0126C14.4122 15.0877 14.3503 15.1778 14.3081 15.2773C14.2658 15.3769 14.2441 15.484 14.2442 15.5922C14.2442 15.7003 14.2661 15.8074 14.3085 15.9069C14.3508 16.0064 14.4128 16.0964 14.4908 16.1714C14.5687 16.2464 14.6609 16.3049 14.762 16.3435C14.863 16.3821 14.9708 16.3999 15.0789 16.3959C15.2871 16.3881 15.4842 16.2999 15.6287 16.1498C15.7732 15.9997 15.8539 15.7994 15.8538 15.5911C15.8536 15.3827 15.7727 15.1825 15.628 15.0326C15.4833 14.8827 15.2861 14.7948 15.0779 14.7873ZM9.58321 9.29269C9.58709 9.18459 9.56915 9.07682 9.53044 8.97581C9.49174 8.87481 9.43307 8.78264 9.35795 8.70482C9.28282 8.627 9.19278 8.56512 9.0932 8.52288C8.99362 8.48064 8.88655 8.45891 8.77839 8.45898C8.67022 8.45906 8.56318 8.48093 8.46366 8.52331C8.36413 8.56568 8.27418 8.62768 8.19916 8.7056C8.12413 8.78352 8.06559 8.87577 8.02702 8.97682C7.98845 9.07788 7.97065 9.18567 7.97468 9.29376C7.9823 9.50197 8.07037 9.69911 8.22037 9.84372C8.37036 9.98832 8.57059 10.0691 8.77894 10.0691C8.98729 10.0691 9.18752 9.9889.33752 9.84372C9.48752 9.69911 9.57559 9.50197 9.58321 9.29376"
                  fill={iconColor('/calculator')} // 아이콘 색상 변경
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0778 18.1171C14.4076 18.1165 13.765 17.85 13.2912 17.3762C12.8173 16.9023 12.5508 16.2597 12.5502 15.5896C12.5511 14.9196 12.8177 14.2773 13.2915 13.8036C13.7654 13.33 14.4078 13.0637 15.0778 13.0631C15.7477 13.064 16.3899 13.3304 16.8637 13.804C17.3375 14.2775 17.6042 14.9197 17.6053 15.5896C17.6044 16.2596 17.3379 16.902 16.8641 17.3759C16.3902 17.8497 15.7479 18.1162 15.0778 18.1171ZM8.68998 16.8986C8.6099 16.9786 8.51484 17.042 8.41024 17.0853C8.30564 17.1286 8.19354 17.1508 8.08034 17.1508C7.96714 17.1507 7.85506 17.1284 7.75049 17.085C7.64593 17.0417 7.55093 16.9781 7.47092 16.898C7.39091 16.818 7.32746 16.7229 7.28418 16.6183C7.24091 16.5137 7.21866 16.4016 7.21871 16.2884C7.21876 16.1752 7.24111 16.0631 7.28448 15.9586C7.32784 15.854 7.39138 15.759 7.47146 15.679L15.1672 7.98325C15.332 7.83777 15.5461 7.76059 15.7659 7.76743C15.9856 7.77428 16.1945 7.86463 16.3499 8.02009C16.5054 8.17555 16.5958 8.38443 16.6026 8.60417C16.6094 8.82392 16.5323 9.03801 16.3868 9.20284L8.68998 16.8986ZM6.25294 9.29226C6.2538 8.62237 6.52022 7.98014 6.9938 7.50635C7.46739 7.03256 8.1095 6.76587 8.7794 6.76473C9.44958 6.76558 10.0921 7.03212 10.5661 7.50591C11.0401 7.9797 11.3069 8.62208 11.308 9.29226C11.3072 9.96253 11.0404 10.6051 10.5664 11.0789C10.0923 11.5528 9.44967 11.8192 8.7794 11.8198C8.10942 11.8189 7.46714 11.5523 6.99349 11.0785C6.51984 10.6046 6.25351 9.96225 6.25294 9.29226ZM11.9286 0.648438C5.38349 0.648438 0.0773926 5.95346 0.0773926 12.4996C0.0773926 19.0447 5.38349 24.3508 11.9286 24.3508C18.4737 24.3508 23.7798 19.0447 23.7798 12.4996C23.7798 5.95346 18.4737 0.648438 11.9286 0.648438Z"
                  fill={iconColor('/calculator')} // 아이콘 색상 변경
                />
              </svg>
              {isExpanded && <span style={{ color: textColor('/calculator') }}>피 계산기</span>}
            </Link>
          </li>

          <li>
          <Link 
      to="/customer-info" 
      style={{ 
        color: '#fff', 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        width: isExpanded ? '104.237px' : '28px', // 사이드바가 축소되었을 때 너비 조정
        // overflow: 'hidden', // 아이콘이 화면 밖으로 나가지 않도록 설정
        whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록 설정
      }}
    >
              <svg style={{ flexShrink: 0 }} width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_866_3036)">
                  <path
                    d="M22.7446 4.7313L13.338 0.86889C13.0762 0.761151 12.7821 0.761151 12.5192 0.86889L3.11256 4.7313C2.70854 4.89722 2.44458 5.29046 2.44458 5.72788V14.7078C2.44458 18.7987 7.61924 22.7774 12.4459 25.2382C12.7497 25.3933 13.1074 25.3933 13.4102 25.2382C18.2368 22.7774 23.4115 18.7987 23.4115 14.7078V5.72788C23.4126 5.29154 23.1486 4.89722 22.7446 4.7313ZM12.9286 7.14248C14.2397 7.14248 15.302 8.20478 15.302 9.51595C15.302 10.8271 14.2397 11.8883 12.9286 11.8883C11.6174 11.8883 10.5551 10.826 10.5551 9.51487C10.5551 8.2037 11.6174 7.14248 12.9286 7.14248ZM12.9286 17.9228C10.7986 17.9228 7.65479 17.6232 7.65479 16.4995C7.65479 15.3758 9.13188 12.9593 12.9286 12.9593C16.7253 12.9593 18.2024 15.3758 18.2024 16.4995C18.2024 17.6232 15.0586 17.9228 12.9286 17.9228Z"
                    fill={iconColor('/customer-info')} // 아이콘 색상 변경
                  />
                </g>
                <defs>
                  <clipPath id="clip0_866_3036">
                    <rect width="25.8571" height="25.8571" fill="white" transform="translate(0 0.142578)" />
                  </clipPath>
                </defs>
              </svg>
              {isExpanded && <span style={{ color: textColor('/customer-info') }}>고객 정보</span>}
            </Link>
          </li>
        </ul>
      </div>
  );
}

export default Sidebar;