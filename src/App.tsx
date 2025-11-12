import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Workflows from "@/pages/Workflows";
import Executions from "@/pages/Executions";
import Credentials from "@/pages/Credentials";
import Databases from "@/pages/Databases";
import Variables from "@/pages/Variables";
import Files from "@/pages/Files";
import ApiKeys from "@/pages/ApiKeys";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/workflows" replace />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/databases" element={<Databases />} />
            <Route path="/variables" element={<Variables />} />
            <Route path="/files" element={<Files />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
