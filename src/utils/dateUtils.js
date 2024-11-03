export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateString) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date;
}; 