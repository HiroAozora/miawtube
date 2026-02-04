import { Box, Typography, Button, Container, Card } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await login();
      // User will be redirected by useEffect after login
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
          opacity: 0.08,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "10%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
          opacity: 0.05,
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            animation: "fadeIn 0.8s ease-in-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <img
              src="/miawtube.svg"
              alt="MiawTube"
              style={{
                width: 120,
                height: 120,
                filter: "drop-shadow(0 4px 20px rgba(255,0,0,0.2))",
              }}
            />
          </Box>

          {/* Hero Text */}
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Oswald",
              fontWeight: "bold",
              color: "#1f2937",
              mb: 2,
            }}
          >
            MiawTube
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#6b7280",
              mb: 5,
              fontWeight: 300,
            }}
          >
            Platform Video Aman untuk Anak-Anak
          </Typography>

          {/* Login Button with Google Logo */}
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="white"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="white"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="white"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="white"
                />
              </svg>
            }
            sx={{
              bgcolor: "#ff0000",
              color: "white",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(255,0,0,0.3)",
              "&:hover": {
                bgcolor: "#cc0000",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 25px rgba(255,0,0,0.4)",
              },
              transition: "all 0.3s ease",
              mb: 6,
            }}
          >
            Login dengan Google
          </Button>

          {/* Feature Cards */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {[
              {
                icon: "✓",
                title: "Video Ter-kurasi",
                desc: "Hanya konten aman dan edukatif",
              },
              {
                icon: "✓",
                title: "Kontrol Penuh",
                desc: "Orang tua mengelola semua video",
              },
              {
                icon: "✓",
                title: "Bergaya YouTube Shorts",
                desc: "Interface modern dan familiar",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                sx={{
                  p: 2.5,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  animation: `slideIn 0.6s ease-in-out ${index * 0.1}s backwards`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(255,0,0,0.1)",
                    transform: "translateX(4px)",
                  },
                  "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateX(-20px)" },
                    to: { opacity: 1, transform: "translateX(0)" },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.5rem",
                      color: "#ff0000",
                      fontWeight: "bold",
                    }}
                  >
                    {feature.icon}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#1f2937",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                    }}
                  >
                    {feature.desc}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;
