import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import WorkspaceSelection from "@/pages/WorkspaceSelection";
import Dashboard from "@/pages/Dashboard";
import Workflows from "@/pages/Workflows";
import WorkflowEditor from "@/pages/WorkflowEditor";
import Executions from "@/pages/Executions";
import ExecutionDetails from "@/pages/ExecutionDetails";
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
            <Route path="/" element={<WorkspaceSelection />} />
            <Route path="/workspaces" element={<WorkspaceSelection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/new" element={<WorkflowEditor />} />
            <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/executions/:id" element={<ExecutionDetails />} />
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
