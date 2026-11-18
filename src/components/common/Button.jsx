
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button
