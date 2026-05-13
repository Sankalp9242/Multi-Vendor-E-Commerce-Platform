import React from 'react'
import './App.css'
import Products from './components/products/Products'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/home/Home'
import Navbar from './components/shared/Navbar'
import About from './components/About'
import Contact from './components/Contact'
import { Toaster } from 'react-hot-toast'
import Cart from './components/cart/Cart'
import LogIn from './components/auth/LogIn'
import PrivateRoute from './components/PrivateRoute'
import Register from './components/auth/Register'
import Checkout from './components/checkout/Checkout'
import PaymentConfirmation from './components/checkout/PaymentConfirmation'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/dashboard/Dashboard'
import AdminProducts from './components/admin/products/AdminProducts'
import Sellers from './components/admin/sellers/Sellers'
import Category from './components/admin/categories/Category'
import Orders from './components/admin/orders/Orders'
import UserOrders from "./components/profile/UserOrders";
import UserProfile from "./components/user/UserProfile";
import SellerDashboard from './components/seller/dashboard/SellerDashboard';
import SellerOrders from './components/seller/orders/SellerOrders';
import SellerProducts from './components/seller/products/SellerProducts';
import SellerProfile from './components/seller/profile/SellerProfile';
import UserReports from './components/reports/UserReports';
import SellerReports from './components/reports/SellerReports';
import AdminReports from './components/reports/AdminReports';
import Wishlist from './components/wishlist/Wishlist';
import Coupons from './components/admin/coupons/Coupons';


function App() {
  return (
    <React.Fragment>
      <Router>
        <Navbar />
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
    </Route>
  </Route>

    <Route element={<PrivateRoute sellerOnly />}>
        <Route path="/seller" element={<AdminLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="reports" element={<SellerReports />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>
    </Route>


</Routes>

      </Router>
      <Toaster position='bottom-center'/>
    </React.Fragment>
  )
}

export default App
