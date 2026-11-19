
function formatCurrency(amount) {
  const number = Number(amount)

  if (!Number.isFinite(number)) {
    return ''
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(number)
}

export default formatCurrency
