// 유틸리티 함수들을 별도 파일로 분리
export const calculateTotalItemsNeeded = (orders, itemsPerMenu) => {
  return orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const menu = itemsPerMenu[item.menu];
      if (menu) {
        Object.entries(menu).forEach(([type, quantity]) => {
          acc[type] = (acc[type] || 0) + quantity * item.quantity;
        });
      }
    });
    return acc;
  }, {});
};

export const calculateIndividualItemCounts = (orders, itemsPerMenu) => {
  const counts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const menu = itemsPerMenu[item.menu];
      if (menu) {
        if (!counts[item.menu]) counts[item.menu] = {};
        Object.entries(menu).forEach(([type, quantity]) => {
          counts[item.menu][type] = (counts[item.menu][type] || 0) + quantity * item.quantity;
        });
      }
    });
  });
  return counts;
};

export const formatNumber = (num, isPee = false) => {
  if (typeof num !== 'number') return '0';
  if (isPee) {
    // 소수점 첫째자리까지 표시하되, 정수인 경우 소수점 생략
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  }
  return num.toString();
}; 