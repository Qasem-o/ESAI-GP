import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Community } from "./components/Community";
import { Stocks } from "./components/Stocks";
import { Portfolio } from "./components/Portfolio";
import { Simulator } from "./components/Simulator";
import { Profile } from "./components/ProfileDynamic"; // Using dynamic profile with real user data
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { StockDetail } from "./components/StockDetail";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DisclaimerModal } from "./components/DisclaimerModal";

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
    currentPage: currentPage === "stock" ? "explore" : currentPage, // Initial behavior showed specialized explore highlighting
    onGoToHome: () => navigate("/"),
    onGoToExplore: () => navigate("/explore"),
    onGoToPortfolio: () => navigate("/portfolio"),
    onGoToSimulator: () => navigate("/simulator"),
    onGoToProfile: () => navigate("/profile"),
    onGoToSignup: () => navigate("/signup"),
    onGoToLogin: () => navigate("/login"),
    onGoToStockDetails: (symbol: string) => navigate(`/stock/${symbol}`),
    onGoToStocks: () => navigate("/explore"),
    onGoToCommunity: () => navigate("/"),
    onGoToNews: () => { },
    onGoToLearn: () => { },
    onGoToDashboard: () => navigate("/"), // Handle Login/Signup redirect
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <DisclaimerModal />
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
                  onGoToNews={navigationProps.onGoToNews}
                  onGoToLearn={navigationProps.onGoToLearn}
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
                  onGoToNews={navigationProps.onGoToNews}
                  onGoToLearn={navigationProps.onGoToLearn}
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
              />
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}