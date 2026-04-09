import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const JoinTrip = lazy(() => import("./pages/JoinTrip"));
const TripLayout = lazy(() => import("./components/TripLayout"));
const TripDashboard = lazy(() => import("./pages/TripDashboard"));
const Transport = lazy(() => import("./pages/trips/Transport"));
const Accommodation = lazy(() => import("./pages/trips/Accommodation"));
const Expenses = lazy(() => import("./pages/trips/Expenses"));
const Photos = lazy(() => import("./pages/trips/Photos"));
const Chat = lazy(() => import("./pages/trips/Chat"));
const Weather = lazy(() => import("./pages/trips/Weather"));
const Schedule = lazy(() => import("./pages/trips/Schedule"));
const EmergencyPhones = lazy(() => import("./pages/trips/EmergencyPhones"));
const LegalNotice = lazy(() => import("./pages/legal/LegalNotice"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/legal/CookiesPolicy"));
const ContactPage = lazy(() => import("./pages/legal/Contact"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

const queryClient = new QueryClient();

const RouteSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Suspense fallback={<RouteSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/join/:inviteCode" element={<ProtectedRoute><JoinTrip /></ProtectedRoute>} />
                <Route path="/trip/:tripId" element={<ProtectedRoute><TripLayout /></ProtectedRoute>}>
                  <Route index element={<TripDashboard />} />
                  <Route path="transport" element={<Transport />} />
                  <Route path="accommodation" element={<Accommodation />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="photos" element={<Photos />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="weather" element={<Weather />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="phones" element={<EmergencyPhones />} />
                </Route>

                {/* Legal routes */}
                <Route path="/aviso-legal" element={<LegalNotice />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
