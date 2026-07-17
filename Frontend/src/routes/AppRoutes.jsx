import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import ScrollToTop from "../components/layout/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";

// Eager Loading component penting
import Home from "../pages/Home/Home";
import { NotFound, ServerError } from "../pages/Error/ErrorPages";

// Lazy loading the rest of the routes (Code Splitting)
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const Laptop = lazy(() => import("../pages/Laptop/Laptop"));
const Brand = lazy(() => import("../pages/Brand/Brand"));
const TentangKami = lazy(() => import("../pages/TentangKami/TentangKami"));
const LaptopDetail = lazy(() => import("../pages/Laptop/DetailLaptop"));
const Technicians = lazy(() => import("../pages/Inspection/Technicians"));
const TechnicianDetail = lazy(() => import("../pages/Inspection/TechnicianDetail"));

const ProfileEdit = lazy(() => import("../pages/Profile/ProfileEdit"));

const SellerDashboard = lazy(() => import("../pages/Seller/Dashboard"));
const MyProducts = lazy(() => import("../pages/Seller/MyProducts"));
const AddProduct = lazy(() => import("../pages/Seller/AddProduct"));
const EditProduct = lazy(() => import("../pages/Seller/EditProduct"));
const SellerOrders = lazy(() => import("../pages/Seller/Orders"));
const SellerWallet = lazy(() => import("../pages/Seller/Wallet"));
const SellerNotifications = lazy(() => import("../pages/Seller/Notifications"));
const SellerReturns = lazy(() => import("../pages/Seller/Returns"));

const TechnicianDashboard = lazy(() => import("../pages/Technician/Dashboard"));
const InspectionJobs = lazy(() => import("../pages/Technician/InspectionJobs"));
const SubmitReport = lazy(() => import("../pages/Technician/SubmitReport"));
const TechnicianWallet = lazy(() => import("../pages/Technician/Wallet"));
const TechnicianNotifications = lazy(() => import("../pages/Technician/Notifications"));

const InspectionHistory = lazy(() => import("../pages/Inspection/InspectionHistory"));
const InspectionDetail = lazy(() => import("../pages/Inspection/InspectionDetail"));
const InspectionOrderDetail = lazy(() => import("../pages/Inspection/InspectionOrderDetail"));

const OrderHistory = lazy(() => import("../pages/Buyer/OrderHistory"));
const OrderDetail = lazy(() => import("../pages/Buyer/OrderDetail"));
const Checkout = lazy(() => import("../pages/Buyer/Checkout"));
const BuyerWallet = lazy(() => import("../pages/Buyer/Wallet"));
const BuyerNotifications = lazy(() => import("../pages/Buyer/Notifications"));
const ReturnRequest = lazy(() => import("../pages/Buyer/ReturnRequest"));
const ReturnList = lazy(() => import("../pages/Buyer/ReturnList"));
const ReturnDetail = lazy(() => import("../pages/Buyer/ReturnDetail"));
const WithdrawalForm = lazy(() => import("../pages/Wallet/WithdrawalForm"));

const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const TechnicianVerification = lazy(() => import("../pages/Admin/TechnicianVerification"));
const AdminUserManagement = lazy(() => import("../pages/Admin/AdminUserManagement"));
const OwnerDashboard = lazy(() => import("../pages/Owner/Dashboard"));

const Chat = lazy(() => import("../pages/Chat/Chat"));
const ChatRoom = lazy(() => import("../pages/Chat/ChatRoom"));

// Skeleton loader minimalis saat bundle page didownload
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0B1A]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/laptop" element={<PublicLayout><Laptop /></PublicLayout>} />
          <Route path="/laptop/:slug" element={<PublicLayout><LaptopDetail /></PublicLayout>} />
          <Route path="/brand" element={<PublicLayout><Brand /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><TentangKami /></PublicLayout>} />
          <Route path="/technicians" element={<PublicLayout><Technicians /></PublicLayout>} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* PROFILE */}
          <Route path="/profile" element={<ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}><ProfileEdit /></ProtectedRoute>} />

          {/* SELLER ROUTES */}
          <Route path="/seller/dashboard" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><MyProducts /></ProtectedRoute>} />
          <Route path="/seller/add-product" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><AddProduct /></ProtectedRoute>} />
          <Route path="/seller/edit-product/:id" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><EditProduct /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><SellerOrders /></ProtectedRoute>} />
          <Route path="/seller/wallet" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><SellerWallet /></ProtectedRoute>} />
          <Route path="/seller/notifications" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><SellerNotifications /></ProtectedRoute>} />
          <Route path="/seller/returns" element={<ProtectedRoute requiredRoles={["seller", "admin"]}><SellerReturns /></ProtectedRoute>} />

          {/* TECHNICIAN ROUTES */}
          <Route path="/technician/dashboard" element={<ProtectedRoute requiredRoles={["technician", "admin"]}><TechnicianDashboard /></ProtectedRoute>} />
          <Route path="/technician/jobs" element={<ProtectedRoute requiredRoles={["technician", "admin"]}><InspectionJobs /></ProtectedRoute>} />
          <Route path="/technician/jobs/:jobId/report" element={<ProtectedRoute requiredRoles={["technician", "admin"]}><SubmitReport /></ProtectedRoute>} />
          <Route path="/technician/wallet" element={<ProtectedRoute requiredRoles={["technician", "admin"]}><TechnicianWallet /></ProtectedRoute>} />
          <Route path="/technician/notifications" element={<ProtectedRoute requiredRoles={["technician", "admin"]}><TechnicianNotifications /></ProtectedRoute>} />

          {/* INSPECTION ROUTES */}
          <Route path="/technicians/:id" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><TechnicianDetail /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><InspectionHistory /></ProtectedRoute>} />
          <Route path="/inspections/:id" element={<ProtectedRoute requiredRoles={["buyer", "technician", "admin"]}><InspectionDetail /></ProtectedRoute>} />
          <Route path="/inspection-orders/:id" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><InspectionOrderDetail /></ProtectedRoute>} />

          {/* BUYER ROUTES */}
          <Route path="/orders" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><OrderHistory /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute requiredRoles={["buyer", "seller", "admin"]}><OrderDetail /></ProtectedRoute>} />
          <Route path="/checkout/:id" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><Checkout /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><BuyerWallet /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute requiredRoles={["buyer", "technician", "admin", "owner"]}><BuyerNotifications /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><ReturnList /></ProtectedRoute>} />
          <Route path="/returns/request/:orderId" element={<ProtectedRoute requiredRoles={["buyer", "admin"]}><ReturnRequest /></ProtectedRoute>} />
          <Route path="/returns/:id" element={<ProtectedRoute requiredRoles={["buyer", "seller", "admin"]}><ReturnDetail /></ProtectedRoute>} />

          {/* WITHDRAWAL */}
          <Route path="/withdrawal" element={<ProtectedRoute requiredRoles={["seller", "technician", "buyer", "admin"]}><WithdrawalForm /></ProtectedRoute>} />

          {/* ADMIN & OWNER ROUTES */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/technicians" element={<ProtectedRoute requiredRoles={["admin"]}><TechnicianVerification /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRoles={["admin"]}><AdminUserManagement /></ProtectedRoute>} />
          <Route path="/owner/dashboard" element={<ProtectedRoute requiredRoles={["owner", "admin"]}><OwnerDashboard /></ProtectedRoute>} />

          {/* CHAT */}
          <Route path="/chat" element={<ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}><Chat /></ProtectedRoute>} />
          <Route path="/chat/:roomId" element={<ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}><ChatRoom /></ProtectedRoute>} />

          {/* ERROR ROUTES */}
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}