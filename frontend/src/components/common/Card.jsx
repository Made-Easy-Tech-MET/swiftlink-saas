export default function Card({ 
  children, 
  className = '',
  padding = 'default',
  hover = false,
  ...props 
}) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  }

  return (
    <div 
      className={`
        bg-light-surface dark:bg-dark-surface 
        rounded-xl 
        border border-light-border dark:border-dark-border 
        shadow-sm 
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} 
        ${paddingClasses[padding]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-light-border dark:border-dark-border ${className}`}>
      {children}
    </div>
  )
}
