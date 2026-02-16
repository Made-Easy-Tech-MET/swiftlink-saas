import { forwardRef } from 'react'

const Input = forwardRef(function Input({ 
  label,
  error,
  className = '',
  ...props 
}, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-dark-surface 
          border rounded-lg 
          text-gray-900 dark:text-white 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-colors duration-200
          ${error 
            ? 'border-danger focus:ring-danger' 
            : 'border-light-border dark:border-dark-border'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

export default Input

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-dark-surface 
          border rounded-lg 
          text-gray-900 dark:text-white 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-colors duration-200
          ${error 
            ? 'border-danger focus:ring-danger' 
            : 'border-light-border dark:border-dark-border'
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-dark-surface 
          border rounded-lg 
          text-gray-900 dark:text-white 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-colors duration-200
          resize-none
          ${error 
            ? 'border-danger focus:ring-danger' 
            : 'border-light-border dark:border-dark-border'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}
