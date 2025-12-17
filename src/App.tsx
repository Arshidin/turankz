import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";

import Overview from "./pages/Overview";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import LivestockBatches from "./pages/farmer/LivestockBatches";
import BatchDetail from "./pages/farmer/BatchDetail";
import SalesCalendar from "./pages/farmer/SalesCalendar";
import MarketOverview from "./pages/mpk/MarketOverview";
import Watchlist from "./pages/mpk/Watchlist";
import PurchasePoolRequests from "./pages/mpk/PurchasePoolRequests";
import FarmersManagement from "./pages/admin/FarmersManagement";
import GradingStatus from "./pages/admin/GradingStatus";
import PoolMatching from "./pages/admin/PoolMatching";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Overview />} />
            
            {/* Farmer Routes */}
            <Route path="/farmer/profile" element={<FarmerProfile />} />
            <Route path="/farmer/batches" element={<LivestockBatches />} />
            <Route path="/farmer/batch/:batchId" element={<BatchDetail />} />
            <Route path="/farmer/calendar" element={<SalesCalendar />} />
            
            {/* MPK Routes */}
            <Route path="/mpk/market" element={<MarketOverview />} />
            <Route path="/mpk/watchlist" element={<Watchlist />} />
            <Route path="/mpk/requests" element={<PurchasePoolRequests />} />
            
            {/* Admin Routes */}
            <Route path="/admin/farmers" element={<FarmersManagement />} />
            <Route path="/admin/grading" element={<GradingStatus />} />
            <Route path="/admin/matching" element={<PoolMatching />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
