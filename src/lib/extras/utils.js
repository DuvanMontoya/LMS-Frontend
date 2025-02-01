export function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
