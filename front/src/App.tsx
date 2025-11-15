import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ConsentBanner from "./components/ConsentBanner";
import LoadingAnimation from "./components/LoadingAnimation";
import MatomoTracker from "./components/MatomoTracker";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Index from "./pages/Index";

const JourneyDetails = lazy(() => import("./pages/JourneyDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MatomoTracker />
        <Suspense fallback={<LoadingAnimation />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/journey/:departureStationWithId/:arrivalStationWithId/"
              element={<JourneyDetails />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ConsentBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
