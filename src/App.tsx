import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TripLayout from "./components/TripLayout";
import TripDashboard from "./pages/TripDashboard";
import Transport from "./pages/trips/Transport";
import Accommodation from "./pages/trips/Accommodation";
import Expenses from "./pages/trips/Expenses";
import Photos from "./pages/trips/Photos";
import Chat from "./pages/trips/Chat";
import Weather from "./pages/trips/Weather";
import Schedule from "./pages/trips/Schedule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trip/:tripId" element={<TripLayout />}>
            <Route index element={<TripDashboard />} />
            <Route path="transport" element={<Transport />} />
            <Route path="accommodation" element={<Accommodation />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="photos" element={<Photos />} />
            <Route path="chat" element={<Chat />} />
            <Route path="weather" element={<Weather />} />
            <Route path="schedule" element={<Schedule />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
