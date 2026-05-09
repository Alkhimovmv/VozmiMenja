import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-[#2563EB] mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
        <p className="text-gray-500 text-sm mb-8">
          Такой страницы не существует. Возможно, она была перемещена или вы перешли по неверной ссылке.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
