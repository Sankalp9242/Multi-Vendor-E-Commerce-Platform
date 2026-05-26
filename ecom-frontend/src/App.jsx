import React, { Suspense, lazy } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/PrivateRoute'

const Products = lazy(() => import('./components/products/Products'));
const Home = lazy(() => import('./components/home/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Cart = lazy(() => import('./components/cart/Cart'));
const LogIn = lazy(() => import('./components/auth/LogIn'));
const Register = lazy(() => import('./components/auth/Register'));
const Checkout = lazy(() => import('./components/checkout/Checkout'));
const PaymentConfirmation = lazy(() => import('./components/checkout/PaymentConfirmation'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./components/admin/dashboard/Dashboard'));
const AdminProducts = lazy(() => import('./components/admin/products/AdminProducts'));
const Sellers = lazy(() => import('./components/admin/sellers/Sellers'));
const Category = lazy(() => import('./components/admin/categories/Category'));
const Orders = lazy(() => import('./components/admin/orders/Orders'));
const UserOrders = lazy(() => import("./components/profile/UserOrders"));
const UserProfile = lazy(() => import("./components/user/UserProfile"));
const SellerDashboard = lazy(() => import('./components/seller/dashboard/SellerDashboard'));
const SellerOrders = lazy(() => import('./components/seller/orders/SellerOrders'));
const SellerProducts = lazy(() => import('./components/seller/products/SellerProducts'));
const SellerProfile = lazy(() => import('./components/seller/profile/SellerProfile'));
const UserReports = lazy(() => import('./components/reports/UserReports'));
const SellerReports = lazy(() => import('./components/reports/SellerReports'));
const AdminReports = lazy(() => import('./components/reports/AdminReports'));
const Wishlist = lazy(() => import('./components/wishlist/Wishlist'));
const Coupons = lazy(() => import('./components/admin/coupons/Coupons'));
const UserReturns = lazy(() => import('./components/returns/UserReturns'));
const SellerReturns = lazy(() => import('./components/returns/SellerReturns'));
const AdminReturns = lazy(() => import('./components/returns/AdminReturns'));


function App() {
  return (
    <React.Fragment>
      <Router>
        <Navbar />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>

  {/* PUBLIC */}
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />

  {/* AUTH PAGES */}
  <Route element={<PrivateRoute publicPage />}>
    <Route path="/login" element={<LogIn />} />
    <Route path="/register" element={<Register />} />
  </Route>

  {/* USER */}
  <Route element={<PrivateRoute />}>
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/order-confirm" element={<PaymentConfirmation />} />
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/profile/orders" element={<UserOrders />} />
    <Route path="/profile/returns" element={<UserReturns />} />
    <Route path="/profile/reports" element={<UserReports />} />
    <Route path="/wishlist" element={<Wishlist />} />
  </Route>

  {/* ADMIN */}
  <Route element={<PrivateRoute adminOnly />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="sellers" element={<Sellers />} />
      <Route path="orders" element={<Orders />} />
      <Route path="categories" element={<Category />} />
      <Route path="coupons" element={<Coupons />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="returns" element={<AdminReturns />} />
    </Route>
  </Route>

    <Route element={<PrivateRoute sellerOnly />}>
        <Route path="/seller" element={<AdminLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="returns" element={<SellerReturns />} />
          <Route path="reports" element={<SellerReports />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>
    </Route>


          </Routes>
        </Suspense>

      </Router>
      <Toaster position='bottom-center'/>
    </React.Fragment>
  )
}

export default App
