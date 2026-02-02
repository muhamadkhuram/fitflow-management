import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GymProfile from "./pages/GymProfile";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Requests from "./pages/Requests";
import Payments from "./pages/Payments";
import Equipment from "./pages/Equipment";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/gym"
              element={
                <ProtectedRoute>
                  <GymProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/members/:memberId"
              element={
                <ProtectedRoute>
                  <MemberDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/equipment"
              element={
                <ProtectedRoute>
                  <Equipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
