import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Community } from "./components/Community";
import { Stocks } from "./components/Stocks";
import { Portfolio } from "./components/Portfolio";
import { Simulator } from "./components/Simulator";
import { Profile } from "./components/ProfileDynamic";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { StockDetail } from "./components/StockDetail";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { DisclaimerModal } from "./components/DisclaimerModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminOverview } from "./components/admin/AdminOverview";
import { UserManagement } from "./components/admin/UserManagement";
import { StockManagement } from "./components/admin/StockManagement";
import { ModelManagement } from "./components/admin/ModelManagement";
import { CommunityManagement } from "./components/admin/CommunityManagement";
import { AboutPage } from "./components/AboutPage";
import { TermsPage } from "./components/TermsPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { HelpPage as Help } from "./components/HelpPage";
import { HelpCategoryPage } from "./components/HelpCategoryPage";
import { HelpArticlePage } from "./components/HelpArticlePage";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";


type Page = "home" | "explore" | "portfolio" | "simulator" | "profile" | "login" | "signup" | "stock";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page for navigation highlighting
  const getCurrentPage = (): Page | "other" => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/explore") return "explore";
    if (path === "/portfolio") return "portfolio";
    if (path === "/simulator") return "simulator";
    if (path === "/profile") return "profile";
    if (path === "/login") return "login";
    if (path === "/signup") return "signup";
    
    // Explicitly check for other known static routes to avoid falling into "stock" (explore)
    const otherRoutes = ["/terms", "/privacy", "/our-story", "/help"];
    if (otherRoutes.some(route => path.startsWith(route))) return "other";
    
    // If it's a dynamic stock path or unknown
    if (path.startsWith("/stock/") || path.split("/").length === 2 && path !== "/") return "stock";
    
    return "other";
  };

  const currentPage = getCurrentPage();

  const navigationProps = {
    currentPage: currentPage === "stock" ? "explore" : (currentPage === "other" ? "" : currentPage),
    onGoToHome: () => navigate("/"),
    onGoToExplore: () => navigate("/explore"),
    onGoToPortfolio: () => navigate("/portfolio"),
    onGoToSimulator: () => navigate("/simulator"),
    onGoToProfile: () => navigate("/profile"),
    onGoToSignup: () => navigate("/signup"),
    onGoToLogin: () => navigate("/login"),
    onGoToAdmin: () => navigate("/admin"),
    onGoToStockDetails: (symbol: string) => navigate(`/stock/${symbol}`),
    onGoToStocks: () => navigate("/explore"),
    onGoToCommunity: () => navigate("/"),
    onGoToDashboard: () => navigate("/"),
    onGoToTerms: () => navigate("/terms"),
    onGoToPrivacy: () => navigate("/privacy"),
  };

  return (
    <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <DisclaimerModal />
        <Toaster />
        <Routes>
          {/* RADICAL FIX: Move info page to the absolute top with a unique path to avoid stock routing conflict */}
          <Route path="/our-story" element={<AboutPage {...navigationProps} currentPage="about" />} />
          <Route path="/terms" element={<TermsPage {...navigationProps} />} />
          <Route path="/privacy" element={<PrivacyPage {...navigationProps} />} />

          <Route path="/" element={<Community {...navigationProps} />} />
          <Route path="/explore" element={<Stocks {...navigationProps} />} />


          <Route path="/help" element={<Help {...navigationProps} />} />
          <Route path="/help/category/:id" element={<HelpCategoryPage {...navigationProps} />} />
          <Route path="/help/article/:id" element={<HelpArticlePage {...navigationProps} />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="stocks" element={<StockManagement />} />
              <Route path="community" element={<CommunityManagement />} />
              <Route path="models" element={<ModelManagement />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/portfolio" element={<Portfolio {...navigationProps} />} />
            <Route path="/simulator" element={<Simulator {...navigationProps} />} />
            <Route path="/profile" element={<Profile {...navigationProps} />} />
            <Route path="/profile/:userId" element={<Profile {...navigationProps} />} />

            {/* Dynamic Stock Detail Route - Standard Path */}
            <Route
              path="/stock/:symbol"
              element={
                <StockDetail
                  currentPage="explore"
                  onGoToHome={navigationProps.onGoToHome}
                  onGoToStocks={navigationProps.onGoToExplore}
                  onGoToPortfolio={navigationProps.onGoToPortfolio}
                  onGoToCommunity={navigationProps.onGoToCommunity}
                  onGoToSimulator={navigationProps.onGoToSimulator}
                  onGoToProfile={navigationProps.onGoToProfile}
                  onGoToSignup={navigationProps.onGoToSignup}
                onGoToLogin={navigationProps.onGoToLogin}
                onGoToAdmin={navigationProps.onGoToAdmin}
                onGoBack={() => navigate("/explore")}
              />
              }
            />

            {/* Legacy/Short Stock Detail Route (Catch-all - MUST BE LAST) */}
            <Route
              path="/:symbol"
              element={
                <StockDetail
                  currentPage="explore"
                  onGoToHome={navigationProps.onGoToHome}
                  onGoToStocks={navigationProps.onGoToExplore}
                  onGoToPortfolio={navigationProps.onGoToPortfolio}
                  onGoToCommunity={navigationProps.onGoToCommunity}
                  onGoToSimulator={navigationProps.onGoToSimulator}
                  onGoToProfile={navigationProps.onGoToProfile}
                  onGoToSignup={navigationProps.onGoToSignup}
                  onGoToLogin={navigationProps.onGoToLogin}
                  onGoBack={() => navigate("/explore")}
                />
              }
            />
          </Route>

          <Route
            path="/login"
            element={
              <Login
                onGoToHome={navigationProps.onGoToHome}
                onGoToSignup={navigationProps.onGoToSignup}
                onGoToDashboard={navigationProps.onGoToDashboard}
              />
            }
          />

          <Route
            path="/signup"
            element={
              <Signup
                onGoToHome={navigationProps.onGoToHome}
                onGoToLogin={navigationProps.onGoToLogin}
                onGoToDashboard={navigationProps.onGoToDashboard}
                onGoToTerms={navigationProps.onGoToTerms}
                onGoToPrivacy={navigationProps.onGoToPrivacy}
              />
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}