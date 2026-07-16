import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef, useLayoutEffect, useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Admin/ProtectedRoute'

import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/FooterCms'
gsap.registerPlugin(ScrollTrigger)

const Hero = lazy(() => import('./components/Hero/Hero'))
const About = lazy(() => import('./components/About/About'))
const Services = lazy(() => import('./components/Services/Services'))
const Partners = lazy(() => import('./components/Partners/Partners'))
const Blog = lazy(() => import('./components/Blog/Blog'))
const ContactSection = lazy(() =>
  import('./components/Services/ServicesDetailPage').then(module => ({ default: module.ContactSection })),
)

const AboutDetailPage = lazy(() => import('./components/About/Aboutdetailpage'))
const ServicesDetailPage = lazy(() => import('./components/Services/ServicesDetailPage'))
const ServiceDetailPage = lazy(() => import('./components/Services/ServiceDetailPage'))
const BlogPage = lazy(() => import('./components/Blog/BlogPage'))
const BlogDetailPage = lazy(() => import('./components/Blog/BlogDetailPage'))
const ContactDetail = lazy(() => import('./components/Contact/ContactDetail'))
const FaqPage = lazy(() => import('./components/FAG/Faqpage'))

const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'))
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'))
const AdminBlogs = lazy(() => import('./components/Admin/AdminBlogs'))
const AdminAbout = lazy(() => import('./components/Admin/AdminAbout'))
const AdminServices = lazy(() => import('./components/Admin/Adminservices'))
const AdminHome = lazy(() => import('./components/Admin/AdminHome'))
const AdminFaq = lazy(() => import('./components/Admin/AdminFaq'))
const AdminFaqContent = lazy(() => import('./components/Admin/AdminFaqContent'))
const AdminContacts = lazy(() => import('./components/Admin/AdminContacts'))
const AdminBranches = lazy(() => import('./components/Admin/AdminBranches'))
const AdminProfile = lazy(() => import('./components/Admin/AdminProfile'))

// ─── Helpers ─────────────────────────────────────────────────
function usePrevPath() {
  const location = useLocation()
  const prevPath = useRef(null)
  const prev = useRef(null)
  useLayoutEffect(() => {
    prev.current = prevPath.current
    prevPath.current = location.pathname
  }, [location.pathname])
  return prev.current
}

function FadePage({ children }) {
  const el = useRef(null)
  useLayoutEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill())
    window.scrollTo({ top: 0, behavior: 'instant' })
    const tween = gsap.fromTo(el.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' }
    )
    return () => tween.kill()
  }, [])
  return <div ref={el}>{children}</div>
}

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '45vh',
        display: 'grid',
        placeItems: 'center',
        color: '#DC2626',
        fontWeight: 700,
      }}
    >
      Đang tải...
    </div>
  )
}

function LazySection({ children, minHeight = 320, rootMargin = '500px' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const node = ref.current
    if (!node) return

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, visible])

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  )
}

// ─── Public pages ────────────────────────────────────────────
function HomePage() {
  const prevPath = usePrevPath()
  const skipVideo = prevPath !== null && prevPath !== '/'
  useLayoutEffect(() => {
    sessionStorage.setItem('skipHeroVideo', skipVideo ? '1' : '0')
  }, [skipVideo])
  return (
    <FadePage>
      <Helmet>
        <title>Vận Tải Việt Hương | Logistics & Vận Chuyển Hàng Hóa Toàn Quốc</title>
        <meta name="description" content="Việt Hương - Đơn vị vận tải hàng đầu Việt Nam." />
      </Helmet>
      <div id="page-wrap">
        <div id="hero-sticky-shell" style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '100vh',
          clipPath: 'inset(0 0 0 0)',
          isolation: 'isolate',
        }}>
          <Hero />
        </div>
        <div>
          <LazySection minHeight={720}><About /></LazySection>
          <LazySection minHeight={680}><Services /></LazySection>
          <LazySection minHeight={560}><Partners /></LazySection>
          <LazySection minHeight={520}><Blog /></LazySection>
          <LazySection minHeight={520}><ContactSection /></LazySection>
        </div>
      </div>
    </FadePage>
  )
}

function AboutPage()            { return <FadePage><AboutDetailPage /></FadePage> }
function ServicesPage()         { return <FadePage><ServicesDetailPage /></FadePage> }
function ServiceDetailWrapper() { return <FadePage><ServiceDetailPage /></FadePage> }
function BlogListPage()         { return <FadePage><BlogPage /></FadePage> }
function BlogDetailWrapper()    { return <FadePage><BlogDetailPage /></FadePage> }
function ContactDetailWrapper() { return <FadePage><ContactDetail /></FadePage> }
function FaqWrapper() { return <FadePage><FaqPage /></FadePage> }

// ─── Layout: public (có Navbar + Footer) ─────────────────────
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/ve-chung-toi" element={<AboutPage />} />
          <Route path="/dich-vu"      element={<ServicesPage />} />
          <Route path="/dich-vu/:id"  element={<ServiceDetailWrapper />} />
          <Route path="/tin-tuc"      element={<BlogListPage />} />
          <Route path="/tin-tuc/:id"  element={<BlogDetailWrapper />} />
          <Route path="/chi-nhanh"    element={<ContactDetailWrapper />} />
          <Route path="/lien-he"      element={<Navigate to="/chi-nhanh" replace />} />
          <Route path="/giai-dap" element={<FaqWrapper />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

// ─── App inner (tách routes admin vs public) ─────────────────
function AppInner() {
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin') || location.pathname === '/login'
  const adminPage = (element) => (
    <ProtectedRoute>
      <AdminLayout>{element}</AdminLayout>
    </ProtectedRoute>
  )

  if (isAdminArea) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={adminPage(<AdminDashboard />)} />
          <Route path="/admin/home" element={adminPage(<AdminHome />)} />
          <Route path="/admin/about" element={adminPage(<AdminAbout />)} />
          <Route path="/admin/services" element={adminPage(<AdminServices />)} />
          <Route path="/admin/faq" element={adminPage(<AdminFaq />)} />
          <Route path="/admin/faq-content" element={adminPage(<AdminFaqContent />)} />
          <Route path="/admin/blogs" element={adminPage(<AdminBlogs />)} />
          <Route path="/admin/contacts" element={adminPage(<AdminContacts />)} />
          <Route path="/admin/branches" element={adminPage(<AdminBranches />)} />
          <Route path="/admin/profile" element={adminPage(<AdminProfile />)} />
          <Route path="/admin/settings" element={<Navigate to="/admin/home" replace />} />
          <Route path="/admin/*" element={adminPage(<AdminDashboard />)} />
        </Routes>
      </Suspense>
    )
  }

  return <PublicLayout />
}

// ─── Root ────────────────────────────────────────────────────
export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}
