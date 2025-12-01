const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export const formatCurrency = (value = 0) => {
  const amount = Number(value) || 0;
  return currencyFormatter.format(amount);
};

export default formatCurrency;


