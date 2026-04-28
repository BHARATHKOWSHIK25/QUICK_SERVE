import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import OrderTracking from './pages/OrderTracking';
import SportsHome from './pages/SportsHome';
import TurfDetails from './pages/TurfDetails';
import SportsDashboard from './pages/SportsDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import Login from './pages/Login';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const userPhone = localStorage.getItem('userPhone');
  if (!userPhone) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                  element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/restaurant/:id"    element={<ProtectedRoute><Menu /></ProtectedRoute>} />
          <Route path="/cart"              element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/payment/:orderId"  element={<Payment />} />
          <Route path="/order/:orderId"    element={<OrderTracking />} />
          <Route path="/sports"            element={<SportsHome />} />
          <Route path="/sports/:id"        element={<TurfDetails />} />
          <Route path="/sports-dashboard"  element={<SportsDashboard />} />
          <Route path="/kitchen"           element={<KitchenDashboard />} />
          <Route path="/login"             element={<Login />} />
          <Route path="*" element={
            <div className="page-wrapper empty-state" style={{minHeight:'80vh'}}>
              <span className="empty-icon">🔍</span>
              <h3>404 — Page Not Found</h3>
              <a href="/" className="btn btn-outline mt-4">Go Home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
