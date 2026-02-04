import { createTheme } from "@mui/material/styles";

const youtubeRed = "#FF0000";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: youtubeRed,
      },
      background: {
        default: mode === "dark" ? "#0f0f0f" : "#ffffff",
        paper: mode === "dark" ? "#0f0f0f" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f1f1f1" : "#0f0f0f",
        secondary: mode === "dark" ? "#aaaaaa" : "#606060",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none", // YouTube buttons rarely use uppercase
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 18, // Rounded pill shape
          },
          contained: {
            backgroundColor: mode === "dark" ? "#272727" : "#0f0f0f", // Standard standard button bg
            color: mode === "dark" ? "#f1f1f1" : "#ffffff",
            "&:hover": {
              backgroundColor: mode === "dark" ? "#3f3f3f" : "#272727",
            },
          },
          containedPrimary: {
            backgroundColor: youtubeRed,
            color: "#fff",
            "&:hover": {
              backgroundColor: "#d00000",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#0f0f0f" : "#ffffff",
            color: mode === "dark" ? "#f1f1f1" : "#0f0f0f",
            boxShadow: "none",
            borderBottom: `1px solid ${mode === "dark" ? "#3f3f3f" : "#e5e5e5"}`,
          },
        },
      },
    },
  });
