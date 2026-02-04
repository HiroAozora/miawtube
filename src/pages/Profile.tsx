import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Video } from "../types";

const Profile = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [myVideos, setMyVideos] = useState<Video[]>([]);

  // PIN States
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);

  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!user) return;
      try {
        // Fetch videos added by this user (or all if admin checks, but let's stick to 'addedBy')
        // Note: Currently 'addedBy' checks display name, which is fragile.
        // Ideally we should store userId in video doc. For now, we list all or filter client side if needed.
        // Let's fetch all for demo purpose of "My List" or "History" roughly

        // Simpler: Just fetch all videos to show "Library"
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const videos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];

        setMyVideos(videos);
      } catch (error) {
        console.error("Error fetching profile videos:", error);
      }
    };

    fetchMyVideos();
  }, [user]);

  const handleAdminAccess = () => {
    if (userData?.adminPin) {
      setIsSettingNewPin(false);
      setShowPinDialog(true);
    } else {
      setIsSettingNewPin(true);
      setShowPinDialog(true);
    }
  };

  const handlePinSubmit = async () => {
    if (isSettingNewPin) {
      if (pinInput.length < 4) return;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { adminPin: pinInput });
        setShowPinDialog(false);
        // Save verification to session so AdminDashboard doesn't ask again
        sessionStorage.setItem("adminPinVerified", "true");
        navigate("/admin");
      }
    } else {
      if (userData?.adminPin === pinInput) {
        setShowPinDialog(false);
        // Save verification to session so AdminDashboard doesn't ask again
        sessionStorage.setItem("adminPinVerified", "true");
        navigate("/admin");
      } else {
        alert("Incorrect PIN");
        setPinInput("");
      }
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
      {/* Header */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate("/")}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, ml: 1, fontWeight: "bold" }}
          >
            Profile
          </Typography>
          <IconButton onClick={logout} color="error">
            <Typography variant="button" sx={{ fontWeight: "bold" }}>
              Logout
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 6,
          }}
        >
          <Avatar
            src={user.photoURL || undefined}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: "4px solid",
              borderColor: "primary.main",
            }}
          />
          <Typography variant="h5" fontWeight="bold">
            {user.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2, borderRadius: 20 }}
            onClick={logout}
          >
            Keluar
          </Button>

          {/* Settings Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SettingsIcon />}
            sx={{ mt: 2, borderRadius: 20 }}
            onClick={() => navigate("/settings")}
          >
            Pengaturan
          </Button>

          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            sx={{ mt: 3, borderRadius: 20, px: 4 }}
            onClick={handleAdminAccess}
          >
            Admin Dashboard
          </Button>
        </Box>

        {/* Video Library Section */}
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ px: 1 }}>
          Library ({myVideos.length})
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            pb: 4,
          }}
        >
          {myVideos.map((video) => (
            <Card
              key={video.id}
              sx={{
                borderRadius: 2,
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() =>
                navigate("/", { state: { playVideoId: video.id } })
              }
            >
              <CardMedia
                component="img"
                height="120"
                image={video.thumbnail}
                alt={video.title}
                sx={{ objectFit: "cover", width: "100%", aspectRatio: "16/9" }}
              />
              <CardContent
                sx={{ p: 1, "&:last-child": { pb: 1 }, flexGrow: 1 }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {video.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onClose={() => setShowPinDialog(false)}>
        <DialogTitle align="center">
          {isSettingNewPin ? "Set Admin PIN" : "Enter Admin PIN"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", justifyContent: "center" }}>
            <TextField
              autoFocus
              type="password"
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: 8,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setShowPinDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePinSubmit}
            disabled={!pinInput}
          >
            {isSettingNewPin ? "Set" : "Enter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
