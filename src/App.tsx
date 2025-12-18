import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Overview from "./pages/Overview";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import LivestockBatches from "./pages/farmer/LivestockBatches";
import BatchDetail from "./pages/farmer/BatchDetail";
import SalesCalendar from "./pages/farmer/SalesCalendar";
import MarketOverview from "./pages/mpk/MarketOverview";
import Watchlist from "./pages/mpk/Watchlist";
import PurchasePoolRequests from "./pages/mpk/PurchasePoolRequests";
import MpkProfile from "./pages/mpk/MpkProfile";
import FarmersManagement from "./pages/admin/FarmersManagement";
import MpkManagement from "./pages/admin/MpkManagement";
import GradingStatus from "./pages/admin/GradingStatus";
import PoolMatching from "./pages/admin/PoolMatching";
import OfftakeRegistry from "./pages/admin/OfftakeRegistry";
import ActivityLog from "./pages/admin/ActivityLog";
import PremiumManagement from "./pages/admin/PremiumManagement";
import PriceGrid from "./pages/PriceGrid";
import NotFound from "./pages/NotFound";

// Auth pages
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import FarmerRegistration from "./pages/auth/FarmerRegistration";
import MpkRegistration from "./pages/auth/MpkRegistration";
import PendingActivation from "./pages/auth/PendingActivation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RoleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes - Public */}
              <Route path="/auth" element={<RoleSelection />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register/farmer" element={<FarmerRegistration />} />
              <Route path="/auth/register/mpk" element={<MpkRegistration />} />
              <Route path="/pending" element={<PendingActivation />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              } />
              
              {/* Farmer Routes */}
              <Route path="/farmer/profile" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <FarmerProfile />
                </ProtectedRoute>
              } />
              <Route path="/farmer/batches" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <LivestockBatches />
                </ProtectedRoute>
              } />
              <Route path="/farmer/batch/:batchId" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <BatchDetail />
                </ProtectedRoute>
              } />
              <Route path="/farmer/calendar" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <SalesCalendar />
                </ProtectedRoute>
              } />
              
              {/* MPK Routes */}
              <Route path="/mpk/profile" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <MpkProfile />
                </ProtectedRoute>
              } />
              <Route path="/mpk/market" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <MarketOverview />
                </ProtectedRoute>
              } />
              <Route path="/mpk/watchlist" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <Watchlist />
                </ProtectedRoute>
              } />
              <Route path="/mpk/requests" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <PurchasePoolRequests />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/farmers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FarmersManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/mpks" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MpkManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/grading" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <GradingStatus />
                </ProtectedRoute>
              } />
              <Route path="/admin/matching" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PoolMatching />
                </ProtectedRoute>
              } />
              <Route path="/admin/offtake" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OfftakeRegistry />
                </ProtectedRoute>
              } />
              <Route path="/admin/premiums" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PremiumManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/activity" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLog />
                </ProtectedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/price-grid" element={
                <ProtectedRoute>
                  <PriceGrid />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
