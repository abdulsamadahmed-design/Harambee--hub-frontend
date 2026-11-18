
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailPattern.test(String(email).trim())
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8
}

export function validateRequired(value) {
  return value !== null &&
    value !== undefined &&
    String(value).trim().length > 0
}

export function validatePhoneNumber(phone) {
  const phonePattern = /^(?:\+254|0)?[17]\d{8}$/

  return phonePattern.test(String(phone).replace(/\s+/g, ''))
}
