import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Landing from "./pages/Landing";
import Overview from "./pages/Overview";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import LivestockBatches from "./pages/farmer/LivestockBatches";
import BatchDetail from "./pages/farmer/BatchDetail";
import SalesCalendar from "./pages/farmer/SalesCalendar";
import MarketIntent from "./pages/farmer/MarketIntent";
import MarketSignals from "./pages/farmer/MarketSignals";
import MarketWorkflow from "./pages/farmer/MarketWorkflow";
import FarmerExecutions from "./pages/farmer/FarmerExecutions";
import MarketOverview from "./pages/mpk/MarketOverview";
import Watchlist from "./pages/mpk/Watchlist";
import PurchasePoolRequests from "./pages/mpk/PurchasePoolRequests";
import MpkProfile from "./pages/mpk/MpkProfile";
import MpkExecutions from "./pages/mpk/MpkExecutions";
import RegionalOutlook from "./pages/mpk/RegionalOutlook";
import FarmersManagement from "./pages/admin/FarmersManagement";
import MpkManagement from "./pages/admin/MpkManagement";
import GradingStatus from "./pages/admin/GradingStatus";
import PoolMatching from "./pages/admin/PoolMatching";
import OfftakeRegistry from "./pages/admin/OfftakeRegistry";
import PriceGridManagement from "./pages/admin/PriceGridManagement";
import ActivityLog from "./pages/admin/ActivityLog";
import PremiumManagement from "./pages/admin/PremiumManagement";
import ExecutionManagement from "./pages/admin/ExecutionManagement";
import MatchingWindowsManagement from "./pages/admin/MatchingWindowsManagement";
import NationalHerdStructure from "./pages/admin/NationalHerdStructure";
import MarketIntentOverview from "./pages/admin/MarketIntentOverview";
import PriceGrid from "./pages/PriceGrid";
import NotFound from "./pages/NotFound";
import AccessRestricted from "./pages/AccessRestricted";

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
              {/* Redirect root to welcome */}
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              
              {/* Public Landing Page */}
              <Route path="/welcome" element={<Landing />} />
              
              {/* Auth Routes - Public */}
              <Route path="/auth" element={<RoleSelection />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register/farmer" element={<FarmerRegistration />} />
              <Route path="/auth/register/mpk" element={<MpkRegistration />} />
              <Route path="/pending" element={<PendingActivation />} />
              <Route path="/access-restricted" element={<AccessRestricted />} />
              
              {/* Protected Routes */}
              <Route path="/overview" element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              } />
              
              
              {/* Farmer Routes - requireActive blocks observer/suspended */}
              <Route path="/farmer/profile" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <FarmerProfile />
                </ProtectedRoute>
              } />
              <Route path="/farmer/batches" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <LivestockBatches />
                </ProtectedRoute>
              } />
              <Route path="/farmer/batch/:batchId" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <BatchDetail />
                </ProtectedRoute>
              } />
              <Route path="/farmer/calendar" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <SalesCalendar />
                </ProtectedRoute>
              } />
              <Route path="/farmer/executions" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <FarmerExecutions />
                </ProtectedRoute>
              } />
              <Route path="/farmer/intent" element={
                <ProtectedRoute allowedRoles={['farmer', 'admin']} requireActive>
                  <MarketIntent />
                </ProtectedRoute>
              } />
              
              {/* MPK Routes - requireActive blocks observer/suspended */}
              <Route path="/mpk/profile" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']} requireActive>
                  <MpkProfile />
                </ProtectedRoute>
              } />
              <Route path="/mpk/market" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <MarketOverview />
                </ProtectedRoute>
              } />
              <Route path="/mpk/watchlist" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']} requireActive>
                  <Watchlist />
                </ProtectedRoute>
              } />
              <Route path="/mpk/requests" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']} requireActive>
                  <PurchasePoolRequests />
                </ProtectedRoute>
              } />
              <Route path="/mpk/executions" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']} requireActive>
                  <MpkExecutions />
                </ProtectedRoute>
              } />
              <Route path="/mpk/outlook" element={
                <ProtectedRoute allowedRoles={['mpk', 'admin']}>
                  <RegionalOutlook />
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
              <Route path="/admin/price-grid" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PriceGridManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/activity" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLog />
                </ProtectedRoute>
              } />
              <Route path="/admin/executions" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ExecutionManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/windows" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MatchingWindowsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/herd-structure" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <NationalHerdStructure />
                </ProtectedRoute>
              } />
              {/* Public Herd Overview - read-only for observers */}
              <Route path="/herd-overview" element={
                <ProtectedRoute>
                  <NationalHerdStructure />
                </ProtectedRoute>
              } />
              <Route path="/admin/market-intent" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MarketIntentOverview />
                </ProtectedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/price-grid" element={
                <ProtectedRoute>
                  <PriceGrid />
                </ProtectedRoute>
              } />
              
              {/* Market Signals - read-only for observers */}
              <Route path="/market-signals" element={
                <ProtectedRoute>
              <MarketSignals />
                </ProtectedRoute>
              } />
              
              {/* Market Workflow Education - read-only for observers */}
              <Route path="/market-workflow" element={
                <ProtectedRoute>
                  <MarketWorkflow />
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
