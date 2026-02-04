import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Shorts from "./pages/Shorts";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./lib/theme";
import { useAppStore } from "./store/useAppStore";
import { useAuth } from "./hooks/useAuth"; // Initialize auth listener
import { useEffect } from "react";

function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = getTheme(isDarkMode ? "dark" : "light");

  // Sync Auth with Store
  const { user, userData, loading } = useAuth();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(null);
    }
  }, [userData, setCurrentUser]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Root - redirect based on auth */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/landing" replace />
              )
            }
          />

          {/* Public route */}
          <Route path="/landing" element={<Landing />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shorts"
            element={
              <ProtectedRoute>
                <Shorts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
