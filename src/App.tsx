import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Categories from './pages/Categories'
import VendorDetail from './pages/VendorDetail'
import Pricing from './pages/Pricing'
import ListYourBusiness from './pages/ListYourBusiness'
import SignIn from './pages/SignIn'
import Admin from './pages/Admin'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import ListingEditor from './pages/dashboard/ListingEditor'
import Enquiries from './pages/dashboard/Enquiries'
import Billing from './pages/dashboard/Billing'
import { About, Contact, Faq, NotFound, PlanningGuide, Terms } from './pages/Static'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="categories" element={<Categories />} />
        <Route path="supplier/:slug" element={<VendorDetail />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="list-your-business" element={<ListYourBusiness />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="planning-guide" element={<PlanningGuide />} />
        <Route path="faq" element={<Faq />} />
        <Route path="terms" element={<Terms />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="listing" element={<ListingEditor />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
