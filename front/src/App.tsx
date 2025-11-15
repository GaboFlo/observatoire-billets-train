import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ConsentBanner from "./components/ConsentBanner";
import MatomoTracker from "./components/MatomoTracker";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Index from "./pages/Index";
import JourneyDetails from "./pages/JourneyDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MatomoTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/journey/:departureStationWithId/:arrivalStationWithId/"
            element={<JourneyDetails />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ConsentBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
