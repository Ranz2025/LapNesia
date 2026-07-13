import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import ScrollToTop from "../components/layout/ScrollToTop";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Laptop from "../pages/Laptop/Laptop";
import Brand from "../pages/Brand/Brand";
import TentangKami from "../pages/TentangKami/TentangKami";
import LaptopDetail from "../pages/Laptop/DetailLaptop";
import { NotFound, ServerError } from "../pages/Error/ErrorPages";

import ProtectedRoute from "./ProtectedRoute";
import SellerDashboard from "../pages/Seller/Dashboard";
import MyProducts from "../pages/Seller/MyProducts";
import AddProduct from "../pages/Seller/AddProduct";
import EditProduct from "../pages/Seller/EditProduct";
import SellerOrders from "../pages/Seller/Orders";
import SellerWallet from "../pages/Seller/Wallet";
import SellerNotifications from "../pages/Seller/Notifications";
import SellerReturns from "../pages/Seller/Returns";

import OrderHistory from "../pages/Buyer/OrderHistory";
import OrderDetail from "../pages/Buyer/OrderDetail";
import Checkout from "../pages/Buyer/Checkout";
import BuyerWallet from "../pages/Buyer/Wallet";
import BuyerNotifications from "../pages/Buyer/Notifications";
import ReturnRequest from "../pages/Buyer/ReturnRequest";
import ReturnList from "../pages/Buyer/ReturnList";
import ReturnDetail from "../pages/Buyer/ReturnDetail";

import WithdrawalForm from "../pages/Wallet/WithdrawalForm";
import TechnicianDashboard from "../pages/Technician/Dashboard";
import InspectionJobs from "../pages/Technician/InspectionJobs";
import SubmitReport from "../pages/Technician/SubmitReport";
import TechnicianWallet from "../pages/Technician/Wallet";
import TechnicianNotifications from "../pages/Technician/Notifications";
import AdminDashboard from "../pages/Admin/Dashboard";
import TechnicianVerification from "../pages/Admin/TechnicianVerification";
import AdminUserManagement from "../pages/Admin/AdminUserManagement";
import OwnerDashboard from "../pages/Owner/Dashboard";

import Technicians from "../pages/Inspection/Technicians";
import TechnicianDetail from "../pages/Inspection/TechnicianDetail";
import InspectionHistory from "../pages/Inspection/InspectionHistory";
import InspectionDetail from "../pages/Inspection/InspectionDetail";
import InspectionOrderDetail from "../pages/Inspection/InspectionOrderDetail";
import ProfileEdit from "../pages/Profile/ProfileEdit";
import Chat from "../pages/Chat/Chat";
import ChatRoom from "../pages/Chat/ChatRoom";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ────────────────────────────────────────────────────────────────
            PUBLIC ROUTES (dengan Navbar + Footer via PublicLayout)
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/laptop"
          element={
            <PublicLayout>
              <Laptop />
            </PublicLayout>
          }
        />

        <Route
          path="/laptop/:slug"
          element={
            <PublicLayout>
              <LaptopDetail />
            </PublicLayout>
          }
        />

        <Route
          path="/brand"
          element={
            <PublicLayout>
              <Brand />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <TentangKami />
            </PublicLayout>
          }
        />

        <Route
          path="/technicians"
          element={
            <PublicLayout>
              <Technicians />
            </PublicLayout>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            AUTH ROUTES (tanpa Footer, full-screen auth layout)
            ─────────────────────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ────────────────────────────────────────────────────────────────
            PROFILE (authenticated user)
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            SELLER ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <MyProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/add-product"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/edit-product/:id"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/wallet"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <SellerWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/notifications"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <SellerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/returns"
          element={
            <ProtectedRoute requiredRoles={["seller", "admin"]}>
              <SellerReturns />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            TECHNICIAN ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute requiredRoles={["technician", "admin"]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/jobs"
          element={
            <ProtectedRoute requiredRoles={["technician", "admin"]}>
              <InspectionJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/jobs/:jobId/report"
          element={
            <ProtectedRoute requiredRoles={["technician", "admin"]}>
              <SubmitReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/wallet"
          element={
            <ProtectedRoute requiredRoles={["technician", "admin"]}>
              <TechnicianWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/notifications"
          element={
            <ProtectedRoute requiredRoles={["technician", "admin"]}>
              <TechnicianNotifications />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            INSPECTION ROUTES (Buyer)
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/technicians/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <TechnicianDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspections"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <InspectionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspections/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "technician", "admin"]}>
              <InspectionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-orders/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <InspectionOrderDetail />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            BUYER ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "seller", "admin"]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <BuyerWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredRoles={["buyer", "technician", "admin", "owner"]}>
              <BuyerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <ReturnList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns/request/:orderId"
          element={
            <ProtectedRoute requiredRoles={["buyer", "admin"]}>
              <ReturnRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns/:id"
          element={
            <ProtectedRoute requiredRoles={["buyer", "seller", "admin"]}>
              <ReturnDetail />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            WITHDRAWAL (Seller/Technician/Buyer)
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/withdrawal"
          element={
            <ProtectedRoute requiredRoles={["seller", "technician", "buyer", "admin"]}>
              <WithdrawalForm />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            ADMIN ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/technicians"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <TechnicianVerification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            OWNER ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute requiredRoles={["owner", "admin"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            CHAT ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute requiredRoles={["buyer", "seller", "technician", "admin", "owner"]}>
              <ChatRoom />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────────────────────────────
            ERROR ROUTES
            ─────────────────────────────────────────────────────────────── */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
