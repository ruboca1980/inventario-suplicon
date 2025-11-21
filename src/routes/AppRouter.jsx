import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Layouts
import AuthLayout from '../layouts/AuthLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
// Pages
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import SuppliersPage from '../pages/SuppliersPage.jsx';
import CustomersPage from '../pages/CustomersPage.jsx';
import StaffPage from '../pages/StaffPage.jsx';
import EntryPage from '../Pages/EntryPage.jsx';
import ExitPage from '../Pages/ExitPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import StockReportPage from '../Pages/StockReportPage.jsx';
import KardexReportPage from '../Pages/KardexReportPage.jsx';
import DeliveryNotePage from '../Pages/DeliveryNotePage.jsx';
import DocumentArchivePage from '../Pages/DocumentArchivePage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';


// --- ¡NUEVA IMPORTACIÓN! ---
import InstallationsPage from '../pages/InstallationsPage.jsx';
// --------------------------

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/" element={<AuthLayout><LoginPage /></AuthLayout>} />

        {/* Rutas Protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><MainLayout><ProductsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><MainLayout><SuppliersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><MainLayout><CustomersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><MainLayout><StaffPage /></MainLayout></ProtectedRoute>} />
        <Route path="/inventory/entry" element={<ProtectedRoute><MainLayout><EntryPage /></MainLayout></ProtectedRoute>} />
        <Route path="/inventory/exit" element={<ProtectedRoute><MainLayout><ExitPage /></MainLayout></ProtectedRoute>} />
        <Route path="/reports/stock" element={<ProtectedRoute><MainLayout><StockReportPage /></MainLayout></ProtectedRoute>} />
        <Route path="/reports/kardex" element={<ProtectedRoute><MainLayout><KardexReportPage /></MainLayout></ProtectedRoute>} />
        <Route path="/delivery-note" element={<ProtectedRoute><MainLayout><DeliveryNotePage /></MainLayout></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><MainLayout><DocumentArchivePage /></MainLayout></ProtectedRoute>} />
        <Route path="/installations" element={<ProtectedRoute><MainLayout><InstallationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><MainLayout><UsersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
};

export default AppRouter;