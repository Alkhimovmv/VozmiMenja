import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import FloatingActions from './components/FloatingActions'
import HomePage from './pages/HomePage'


// Lazy loading для неосновных страниц
const EquipmentDetailsPage = lazy(() => import('./pages/EquipmentDetailsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))

// RentAdmin pages
const RentAdminLoginPage = lazy(() => import('./pages/admin/LoginPage'))
const RentAdminSchedulePage = lazy(() => import('./pages/admin/SchedulePage'))
const RentAdminRentalsPage = lazy(() => import('./pages/admin/RentalsPage'))
const RentAdminCustomersPage = lazy(() => import('./pages/admin/CustomersPage'))
const RentAdminFinancesPage = lazy(() => import('./pages/admin/FinancesPage'))
const RentAdminEquipmentPage = lazy(() => import('./pages/admin/EquipmentPage'))
const AdminLayout = lazy(() => import('./components/admin/Layout'))
const UnifiedAdminLayout = lazy(() => import('./components/admin/UnifiedAdminLayout'))

// Посадочные страницы категорий
const CategoryPylesosyPage = lazy(() => import('./pages/CategoryPylesosyPage'))
const CategoryCamerasPage = lazy(() => import('./pages/CategoryCamerasPage'))
const CategoryAudioPage = lazy(() => import('./pages/CategoryAudioPage'))

// Блог
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'))
const AdminArticlesPage = lazy(() => import('./pages/admin/ArticlesPage'))

// Компонент загрузки
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ScrollToTop />
      {!isAdminRoute && <FloatingActions />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes without layout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* RentAdmin routes */}
          <Route path="/admin/rent/login" element={<RentAdminLoginPage />} />
          <Route path="/admin/schedule" element={<AdminLayout><RentAdminSchedulePage /></AdminLayout>} />
          <Route path="/admin/rentals" element={<AdminLayout><RentAdminRentalsPage /></AdminLayout>} />
          <Route path="/admin/customers" element={<AdminLayout><RentAdminCustomersPage /></AdminLayout>} />
          <Route path="/admin/equipment" element={<AdminLayout><RentAdminEquipmentPage /></AdminLayout>} />
          <Route path="/admin/finances" element={<AdminLayout><RentAdminFinancesPage /></AdminLayout>} />
          <Route path="/admin/articles" element={<UnifiedAdminLayout><AdminArticlesPage /></UnifiedAdminLayout>} />

          {/* Public routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />

                {/* Посадочные страницы категорий */}
                <Route path="/arenda-pylesosov-moskva" element={<CategoryPylesosyPage />} />
                <Route path="/arenda-gopro-moskva" element={<CategoryCamerasPage />} />
                <Route path="/arenda-audiooborudovaniya-moskva" element={<CategoryAudioPage />} />

                {/* Блог */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogArticlePage />} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/faq" element={<FAQPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
