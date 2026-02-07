import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { UserProvider } from "@/context/UserContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GoogleOAuthProviderWrapper } from "@/components/providers/GoogleOAuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useKeyboardShortcuts } from "@/utils/keyboardShortcuts";
import WorkspaceSelection from "@/pages/WorkspaceSelection";
import WorkspaceSettings from "@/pages/WorkspaceSettings";
import Dashboard from "@/pages/Dashboard";
import Workflows from "@/pages/Workflows";
import ZapierWorkflowEditor from "@/pages/ZapierWorkflowEditor";
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
import AgentsWorkflow from "@/pages/AgentsWorkflow";
import MCPServer from "@/pages/MCPServer";
import NotFound from "@/pages/NotFound";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { VerifyEmail } from "@/pages/VerifyEmail";
import Welcome from "@/pages/Welcome";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useKeyboardShortcuts();

  return (
    <Routes>
      {/* Welcome/Landing Page */}
      <Route path="/" element={<Welcome />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route path="/workspaces" element={<WorkspaceSelection />} />
      
      {/* Protected Routes - Require Workspace Context */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workspace/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/workflows/new" element={<ProtectedRoute><ZapierWorkflowEditor /></ProtectedRoute>} />
      <Route path="/workflows/:id/edit" element={<ProtectedRoute><ZapierWorkflowEditor /></ProtectedRoute>} />
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
      <Route path="/agents-workflow" element={<ProtectedRoute><AgentsWorkflow /></ProtectedRoute>} />
      <Route path="/mcp-server" element={<ProtectedRoute><MCPServer /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <GoogleOAuthProviderWrapper>
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
          </GoogleOAuthProviderWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
