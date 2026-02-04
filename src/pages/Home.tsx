import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import VideoItem from "../components/VideoItem";
import CommentDrawer from "../components/CommentDrawer";
import LoadingScreen from "../components/LoadingScreen";
import OnboardingModal from "../components/OnboardingModal";
import type { Video } from "../types";
import { useNavigate, useLocation } from "react-router-dom";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(
      "miawtube_onboarding_completed",
    );
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Profile & Admin Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, setAdminMode } = useAppStore();
  const { login, logout } = useAuth();
  // Sync currentUser if needed, though useAuth handles it via App.tsx usually.
  // We use currentUser from store for consistency.

  const { state } = useLocation();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(
          collection(db, "videos"),
          orderBy("createdAt", "desc"),
          limit(20),
        );
        const querySnapshot = await getDocs(q);
        const fetchedVideos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];

        setVideos(fetchedVideos);

        // Check for specific video to play
        if (state?.playVideoId) {
          const index = fetchedVideos.findIndex(
            (v) => v.id === state.playVideoId,
          );
          if (index !== -1) {
            setActiveVideoIndex(index);
            // Scroll to that video immediately
            setTimeout(() => {
              if (containerRef.current) {
                const clientHeight = containerRef.current.clientHeight;
                containerRef.current.scrollTo({
                  top: index * clientHeight,
                  behavior: "smooth", // or "auto"
                });
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [state]); // Re-run if state changes, though mostly on mount

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      setActiveVideoIndex(index);
    }
  };

  const openComments = (videoId: string | undefined) => {
    if (videoId) {
      setActiveVideoId(videoId);
      setDrawerOpen(true);
    }
  };

  // Menu Handlers
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleManageClick = () => {
    handleMenuClose();
    if (!currentUser) {
      login();
    } else {
      if (currentUser.adminPin) {
        setIsPinDialogOpen(true);
      } else {
        // No PIN set, go to admin to set it
        navigate("/admin");
      }
    }
  };

  const handlePinSubmit = () => {
    if (currentUser?.adminPin === pinInput) {
      setAdminMode(true);
      setIsPinDialogOpen(false);
      navigate("/admin");
    } else {
      alert("Incorrect PIN");
    }
    setPinInput("");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // LOGIN LANDING PAGE (If not logged in)
  if (!currentUser) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
          p: 3,
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <img
            src="/miawtube.svg"
            alt="Miawtube"
            style={{ width: 100, height: 100 }}
          />
        </Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ fontFamily: "Oswald" }}
        >
          Miawtube
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 300 }}
        >
          Platform video aman dan ter-kurasi untuk anak-anak. Masuk untuk mulai
          mengelola konten.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={login}
          sx={{
            borderRadius: 8,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            textTransform: "none",
          }}
        >
          Masuk dengan Google
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "black",
        height: "100vh",
        overflow: "hidden",
        maxWidth: 480,
        margin: "0 auto",
        boxShadow: "0 0 50px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top Bar (Transparent) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="/miawtube.svg"
            alt="Miawtube"
            style={{ height: 32, width: 32 }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontFamily: "Oswald",
              letterSpacing: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            MIAWTUBE
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            sx={{ color: "white" }}
            onClick={() => navigate("/about")}
            title="Help"
          >
            <HelpOutlineIcon />
          </IconButton>
          <IconButton
            sx={{ color: "white" }}
            onClick={() => navigate("/profile")}
          >
            {currentUser?.photoURL ? (
              <Avatar
                src={currentUser.photoURL}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <MoreVertIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 220, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {currentUser.displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentUser.email}
          </Typography>
        </Box>
        <MenuItem onClick={handleManageClick}>Manage Videos (Parent)</MenuItem>
        <MenuItem
          onClick={() => {
            logout();
            handleMenuClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>

      {/* PIN Dialog */}
      <Dialog open={isPinDialogOpen} onClose={() => setIsPinDialogOpen(false)}>
        <DialogTitle>Enter Admin PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="PIN"
            type="password"
            fullWidth
            variant="standard"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPinDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePinSubmit}>Enter</Button>
        </DialogActions>
      </Dialog>

      {/* Video Feed */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari/Edge
          "-ms-overflow-style": "none", // IE/Edge legacy
        }}
      >
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <VideoItem
              key={video.id}
              video={video}
              isActive={index === activeVideoIndex}
              onCommentClick={() => openComments(video.id)}
            />
          ))
        ) : (
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "start",
              bgcolor: "#121212",
            }}
          >
            <Container
              maxWidth="xs"
              sx={{ textAlign: "center", color: "white" }}
            >
              <Box sx={{ mb: 3, fontSize: 60 }}>📺</Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                No Videos Yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "gray" }}>
                Your feed is empty. Go to "Manage Videos" to curate content for
                your kids.
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleManageClick}
              >
                Manage Videos
              </Button>
            </Container>
          </Box>
        )}
      </Box>

      <CommentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        videoId={activeVideoId}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </Box>
  );
};

export default Home;
