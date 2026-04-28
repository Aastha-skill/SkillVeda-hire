import { Switch, Route, useLocation } from "wouter";
import { Router } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import HireSettings from "./pages/hire-settings";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import Home from "@/pages/home";
import Jobs from "@/pages/jobs";
import Programs from "@/pages/programs";
import About from "@/pages/about";
import AdminComplete from "@/pages/admin-complete";
import AdminLoginNew from "@/pages/admin-login-new";
import BecomePartner from "@/pages/become-partner";
import PartnershipLinks from "@/pages/partnership-links";
import CompanyPartnership from "@/pages/company-partnership";
import TestPortal from "@/pages/test-portal";
import Community from "@/pages/community";
import CustomerSuccessProgram from "@/pages/customer-success-program";
import CustomerSuccessEnrol from "@/pages/customer-success-enrol";
import PGDMCustomerSuccess from "@/pages/pgdm-customer-success";
import TestThankYou from "@/pages/test-thank-you";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import BlogAdmin from "@/pages/blog-admin";
import SourcingCopilot from "@/SourcingCopilot";
import HireLogin from "@/pages/hire-login";
import HireForgotPassword from "@/pages/hire-forgot-password";
import HireAdmin from "@/pages/hire-admin";
import HireEmailSetup from "@/pages/hire-email-setup";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const [location] = useLocation();

  const isAdminPage =
    location === "/admin" ||
    location === "/admin-dashboard" ||
    location === "/blog-admin" ||
    location === "/hire" ||
    location.startsWith("/hire/");

  return (
    <div className="min-h-screen bg-background">
      {!isAdminPage && <Navbar />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/programs" component={Programs} />
        <Route path="/about" component={About} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={Jobs} />
        <Route path="/become-partner" component={BecomePartner} />
        <Route path="/partnership-links" component={PartnershipLinks} />
        <Route path="/company-partnership" component={CompanyPartnership} />
        <Route path="/secret-admin-portal" component={AdminLoginNew} />
        <Route path="/admin" component={AdminComplete} />
        <Route path="/admin-dashboard" component={AdminComplete} />
        <Route path="/test/:token" component={TestPortal} />
        <Route path="/community" component={Community} />
        <Route path="/customer-success-program" component={CustomerSuccessProgram} />
        <Route path="/customer-success-enrol" component={CustomerSuccessEnrol} />
        <Route path="/pgdm-customer-success" component={PGDMCustomerSuccess} />
        <Route path="/test-thank-you" component={TestThankYou} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/blog-admin" component={BlogAdmin} />
        {/* Hiring routes */}
        <Route path="/hire" component={HireLogin} />
        <Route path="/hire/login" component={HireLogin} />
        <Route path="/hire/forgot-password" component={HireForgotPassword} />
        <Route path="/hire/dashboard" component={SourcingCopilot} />
        <Route path="/hire/email-setup" component={HireEmailSetup} />
        <Route path="/hire/admin" component={HireAdmin} />
        <Route path="/hire/settings" component={HireSettings} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router hook={useBrowserLocation}>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
