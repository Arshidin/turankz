/**
 * App.tsx
 *
 * Sprint 11-12: Added code splitting with React.lazy for role-specific pages.
 * This reduces initial bundle size and improves load time.
 *
 * Code Splitting Strategy:
 * - Core/auth pages: Loaded immediately (Landing, Login, etc.)
 * - Role-specific pages: Lazy loaded (Farmer, MPK, Admin pages)
 * - Shared pages: Lazy loaded (PriceGrid, MarketSignals, etc.)
 */

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  );
}

// ============================================================================
// CORE PAGES - LOADED IMMEDIATELY (Critical Path)
// ============================================================================

import Landing from "./pages/Landing";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import AccessRestricted from "./pages/AccessRestricted";

// Auth pages - needed for initial load
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import FarmerRegistration from "./pages/auth/FarmerRegistration";
import MpkRegistration from "./pages/auth/MpkRegistration";
import PendingActivation from "./pages/auth/PendingActivation";

// ============================================================================
// LAZY LOADED PAGES - FARMER (Code Split)
// ============================================================================

const FarmerProfile = lazy(() => import("./pages/farmer/FarmerProfile"));
const LivestockBatches = lazy(() => import("./pages/farmer/LivestockBatches"));
const BatchDetail = lazy(() => import("./pages/farmer/BatchDetail"));
const SalesCalendar = lazy(() => import("./pages/farmer/SalesCalendar"));
const MarketIntent = lazy(() => import("./pages/farmer/MarketIntent"));
const MarketSignals = lazy(() => import("./pages/farmer/MarketSignals"));
const MarketWorkflow = lazy(() => import("./pages/farmer/MarketWorkflow"));
const FarmerExecutions = lazy(() => import("./pages/farmer/FarmerExecutions"));

// ============================================================================
// LAZY LOADED PAGES - MPK (Code Split)
// ============================================================================

const MarketOverview = lazy(() => import("./pages/mpk/MarketOverview"));
const Watchlist = lazy(() => import("./pages/mpk/Watchlist"));
const PurchasePoolRequests = lazy(() => import("./pages/mpk/PurchasePoolRequests"));
const MpkProfile = lazy(() => import("./pages/mpk/MpkProfile"));
const MpkExecutions = lazy(() => import("./pages/mpk/MpkExecutions"));
const RegionalOutlook = lazy(() => import("./pages/mpk/RegionalOutlook"));

// ============================================================================
// LAZY LOADED PAGES - ADMIN (Code Split)
// ============================================================================

const FarmersManagement = lazy(() => import("./pages/admin/FarmersManagement"));
const MpkManagement = lazy(() => import("./pages/admin/MpkManagement"));
const GradingStatus = lazy(() => import("./pages/admin/GradingStatus"));
const PoolMatching = lazy(() => import("./pages/admin/PoolMatching"));
const OfftakeRegistry = lazy(() => import("./pages/admin/OfftakeRegistry"));
const PriceGridManagement = lazy(() => import("./pages/admin/PriceGridManagement"));
const ActivityLog = lazy(() => import("./pages/admin/ActivityLog"));
const PremiumManagement = lazy(() => import("./pages/admin/PremiumManagement"));
const ExecutionManagement = lazy(() => import("./pages/admin/ExecutionManagement"));
const MatchingWindowsManagement = lazy(() => import("./pages/admin/MatchingWindowsManagement"));
const NationalHerdStructure = lazy(() => import("./pages/admin/NationalHerdStructure"));
const MarketIntentOverview = lazy(() => import("./pages/admin/MarketIntentOverview"));

// ============================================================================
// LAZY LOADED PAGES - SHARED (Code Split)
// ============================================================================

const PriceGrid = lazy(() => import("./pages/PriceGrid"));
const Docs = lazy(() => import("./pages/Docs"));
const DocPage = lazy(() => import("./pages/DocPage"));

// ============================================================================
// LAZY LOADED PAGES - MEMBERSHIP (Code Split)
// ============================================================================

const MembershipLanding = lazy(() => import("./pages/membership/MembershipLanding"));
const MembershipSuccess = lazy(() => import("./pages/membership/MembershipSuccess"));

// ============================================================================
// QUERY CLIENT
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ============================================================================
// APP COMPONENT
// ============================================================================

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <AuthProvider>
              <RoleProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Redirect root to welcome */}
                    <Route path="/" element={<Navigate to="/welcome" replace />} />

                    {/* Public Landing Page */}
                    <Route path="/welcome" element={<Landing />} />

                    {/* Auth Routes - Public (Not lazy loaded for fast auth) */}
                    <Route path="/auth" element={<RoleSelection />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register/farmer" element={<FarmerRegistration />} />
                    <Route path="/auth/register/mpk" element={<MpkRegistration />} />
                    <Route path="/pending" element={<PendingActivation />} />
                    <Route path="/access-restricted" element={<AccessRestricted />} />

                    {/* Join/Membership Routes - Public */}
                    <Route path="/join" element={<MembershipLanding />} />
                    <Route path="/join/success" element={<MembershipSuccess />} />

                    {/* Protected Routes */}
                    <Route path="/overview" element={
                      <ProtectedRoute>
                        <Overview />
                      </ProtectedRoute>
                    } />

                    {/* ======================================================== */}
                    {/* FARMER ROUTES - Lazy loaded */}
                    {/* ======================================================== */}

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

                    {/* ======================================================== */}
                    {/* MPK ROUTES - Lazy loaded */}
                    {/* ======================================================== */}

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

                    {/* ======================================================== */}
                    {/* ADMIN ROUTES - Lazy loaded */}
                    {/* ======================================================== */}

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

                    {/* ======================================================== */}
                    {/* SHARED ROUTES - Lazy loaded */}
                    {/* ======================================================== */}

                    {/* Documentation - Public */}
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/docs/:slug" element={<DocPage />} />

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

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </RoleProvider>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
