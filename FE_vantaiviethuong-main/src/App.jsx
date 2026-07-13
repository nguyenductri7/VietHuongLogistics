import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useRef, useLayoutEffect } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Admin/ProtectedRoute'
import AdminLogin from './components/Admin/AdminLogin'
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminBlogs from './components/Admin/AdminBlogs'
import AdminAbout from './components/Admin/AdminAbout'
import AdminServices from './components/Admin/Adminservices';
import AdminHome from './components/Admin/AdminHome'

import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Services from './components/Services/Services'
import Partners from './components/Partners/Partners'
import Blog from './components/Blog/Blog'
import Footer from './components/Footer/FooterCms'
import AboutDetailPage from './components/About/Aboutdetailpage'
import ServicesDetailPage from './components/Services/ServicesDetailPage'
import ServiceDetailPage from './components/Services/ServiceDetailPage'
import { ContactSection } from './components/Services/ServicesDetailPage'
import BlogPage from './components/Blog/BlogPage'
import BlogDetailPage from './components/Blog/BlogDetailPage'
import ContactDetail from './components/Contact/ContactDetail'
import FaqPage from './components/FAG/Faqpage'
import AdminFaq from './components/Admin/AdminFaq'
import AdminFaqContent from './components/Admin/AdminFaqContent'
import AdminContacts from './components/Admin/AdminContacts'
import AdminBranches from './components/Admin/AdminBranches'
import AdminProfile from './components/Admin/AdminProfile'
gsap.registerPlugin(ScrollTrigger)

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
          <About />
          <Services />
          <Partners />
          <Blog />
          <ContactSection />
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
