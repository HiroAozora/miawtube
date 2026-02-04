import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shorts from "./pages/Shorts";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Settings from "./pages/Settings";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./lib/theme";
import { useAppStore } from "./store/useAppStore";
import { useAuth } from "./hooks/useAuth"; // Initialize auth listener
import { useEffect } from "react";

function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = getTheme(isDarkMode ? "dark" : "light");

  // Sync Auth with Store
  const { userData } = useAuth();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(null);
    }
  }, [userData, setCurrentUser]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
