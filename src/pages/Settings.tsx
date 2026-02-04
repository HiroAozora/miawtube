import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate("/profile")}
            aria-label="kembali"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
            Pengaturan
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        <List>
          {/* Theme Toggle */}
          <ListItem>
            <ListItemIcon>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText
              primary="Mode Tampilan"
              secondary={isDarkMode ? "Mode Gelap" : "Mode Terang"}
            />
            <Switch
              edge="end"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              inputProps={{ "aria-label": "toggle theme" }}
            />
          </ListItem>

          <Divider />

          {/* App Info */}
          <ListItem>
            <ListItemText
              primary="Tentang Aplikasi"
              secondary="MiawTube v1.0.0 - Platform video bergaya YouTube Shorts"
            />
          </ListItem>
        </List>

        {/* Additional Info */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Dibuat dengan ❤️ untuk tontonan video aman dan ter-kurasi
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;
