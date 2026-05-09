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
import { About } from "./components/About";
import { Terms } from "./components/Terms";
import { Privacy } from "./components/Privacy";
import { Help } from "./components/Help";
import { Toaster } from "./components/ui/sonner";


type Page = "home" | "explore" | "portfolio" | "simulator" | "profile" | "login" | "signup" | "stock";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page for navigation highlighting
  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/explore") return "explore";
    if (path === "/portfolio") return "portfolio";
    if (path === "/simulator") return "simulator";
    if (path === "/profile") return "profile";
    if (path === "/login") return "login";
    if (path === "/signup") return "signup";
    // If it's none of the above, and likely a stock symbol, we treat it as stock/explore context
    return "stock";
  };

  const currentPage = getCurrentPage();

  const navigationProps = {
    currentPage: currentPage === "stock" ? "explore" : currentPage,
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
  };

  return (
    <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <DisclaimerModal />
        <Toaster />
        <Routes>
          <Route path="/" element={<Community {...navigationProps} />} />
          <Route path="/explore" element={<Stocks {...navigationProps} />} />

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
                  onGoBack={() => navigate("/explore")}
                />
              }
            />

            {/* Legacy/Short Stock Detail Route (Redirect or Handle) */}
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

          {/* Public Legal/Info Pages */}
          <Route path="/about" element={<About {...navigationProps} />} />
          <Route path="/terms" element={<Terms {...navigationProps} />} />
          <Route path="/privacy" element={<Privacy {...navigationProps} />} />
          <Route path="/help" element={<Help {...navigationProps} />} />

          {/* Admin Routes - require admin role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="users"     element={<UserManagement />} />
              <Route path="stocks"    element={<StockManagement />} />
              <Route path="models"    element={<ModelManagement />} />
              <Route path="community" element={<CommunityManagement />} />
            </Route>
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
              />
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}