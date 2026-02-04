import { Box, Typography, keyframes } from "@mui/material";

// Pulse animation for logo
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

// Fade in animation for text
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        zIndex: 9999,
      }}
    >
      {/* Animated Logo */}
      <Box
        sx={{
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      >
        <img
          src="/miawtube.svg"
          alt="Miawtube"
          style={{
            width: 100,
            height: 100,
            filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        variant="h5"
        sx={{
          color: "white",
          fontWeight: "bold",
          fontFamily: "Oswald",
          animation: `${fadeIn} 0.8s ease-out`,
        }}
      >
        MIAWTUBE
      </Typography>

      {/* Loading Dots */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "white",
              animation: `${pulse} 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingScreen;
