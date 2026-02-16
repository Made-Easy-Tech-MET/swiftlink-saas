import { Link } from 'react-router-dom'

export default function InfoPage({ title, description }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/swiftlink_logos_png/logo-icon.png" alt="SwiftLink" className="w-10 h-10 rounded-lg" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{description}</p>
        <Link to="/" className="text-primary hover:underline font-medium">Back to landing</Link>
      </div>
    </div>
  )
}
