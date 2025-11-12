import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { UserProvider } from "@/context/UserContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useKeyboardShortcuts } from "@/utils/keyboardShortcuts";
import { seedDemoData } from "@/utils/seedData";
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
import GlobalNodes from "@/pages/GlobalNodes";
import CustomNodes from "@/pages/CustomNodes";
import ApiKeys from "@/pages/ApiKeys";
import UserManagement from "@/pages/UserManagement";
import Billing from "@/pages/Billing";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useKeyboardShortcuts();

  return (
    <Routes>
      <Route path="/" element={<WorkspaceSelection />} />
      <Route path="/workspaces" element={<WorkspaceSelection />} />
      
      {/* Protected Routes - Require Workspace Context */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/workflows/new" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
      <Route path="/workflows/:id/edit" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
      <Route path="/executions" element={<ProtectedRoute><Executions /></ProtectedRoute>} />
      <Route path="/executions/:id" element={<ProtectedRoute><ExecutionDetails /></ProtectedRoute>} />
      <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
      <Route path="/databases" element={<ProtectedRoute><Databases /></ProtectedRoute>} />
      <Route path="/variables" element={<ProtectedRoute><Variables /></ProtectedRoute>} />
      <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
      <Route path="/global-nodes" element={<ProtectedRoute><GlobalNodes /></ProtectedRoute>} />
      <Route path="/custom-nodes" element={<ProtectedRoute><CustomNodes /></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <WorkspaceProvider>
            <UserProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </UserProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
