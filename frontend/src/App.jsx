import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'


// Layout Components
import Navbar from './components/common/Navbar/Navbar'
import PublicNavbar from './components/common/PublicNavbar/PublicNavbar'
import Footer from './components/common/Footer/Footer'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import { ComplaintProvider } from './context/ComplaintContext'

// Route Protection
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import ManageUsers from './pages/admin/ManageUsers/ManageUsers'

// Pages
import Home from './pages/Home/Home'
import Register from './pages/auth/Register/Register'
import SignIn from './pages/auth/SignIn/SignIn'
import Dashboard from './pages/user/Dashboard/Dashboard'
import LodgeComplaint from './pages/user/LodgeComplaint/LodgeComplaint'
import TrackStatus from './pages/user/TrackStatus/TrackStatus'
import CommunityFeed from './pages/user/CommunityFeed/CommunityFeed'
import Feedback from './pages/user/Feedback/Feedback'
import Profile from './pages/Profile/Profile'
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard'
import ManageComplaints from './pages/admin/ManageComplaints/ManageComplaints'
import Reports from './pages/admin/Reports/Reports'
import About from './pages/static/About/About'
import Contact from './pages/static/Contact/Contact'
import FAQ from './pages/static/FAQ/FAQ'
import NotFound from './pages/static/NotFound/NotFound'

const Layout = ({ children }) => {
  const location = useLocation()
  
  const pagesWithoutNavbar = ['/', '/signin', '/register']
  const publicPages = ['/about', '/contact', '/faq']
  
  const showPublicNavbar = publicPages.includes(location.pathname)
  const showAuthenticatedNavbar = !pagesWithoutNavbar.includes(location.pathname) && !publicPages.includes(location.pathname)
  
  const pagesWithoutFooter = ['/', '/signin', '/register']
  const showFooter = !pagesWithoutFooter.includes(location.pathname)
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showPublicNavbar && <PublicNavbar />}
      {showAuthenticatedNavbar && <Navbar />}
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ComplaintProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/signin" element={<SignIn />} />
                
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/lodge-complaint" element={
                  <ProtectedRoute><LodgeComplaint /></ProtectedRoute>
                } />
                <Route path="/track-status" element={
                  <ProtectedRoute><TrackStatus /></ProtectedRoute>
                } />
                <Route path="/community-feed" element={
                  <ProtectedRoute><CommunityFeed /></ProtectedRoute>
                } />
                <Route path="/feedback" element={
                  <ProtectedRoute><Feedback /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute><AdminDashboard /></AdminRoute>
                } />
                <Route path="/admin/complaints" element={
                  <AdminRoute><ManageComplaints /></AdminRoute>
                } />
                <Route path="/admin/reports" element={
                  <AdminRoute><Reports /></AdminRoute>
                } />
                <Route path="/admin/users" element={
                     <AdminRoute><ManageUsers /></AdminRoute>
               } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </ComplaintProvider>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
