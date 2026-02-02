import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, userData, login } = useAuth();
  const navigate = useNavigate();

  // Auth & PIN states
  const [pin, setPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);

  // Dashboard states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return; // Wait for auth

    if (userData) {
      if (userData.adminPin) {
        setPin(userData.adminPin);
        setShowPinDialog(true);
        setIsSettingNewPin(false);
      } else {
        setShowPinDialog(true);
        setIsSettingNewPin(true);
      }
    }
  }, [user, userData]);

  const handlePinSubmit = async () => {
    if (isSettingNewPin) {
      if (inputPin.length < 4) return;
      // Save new PIN
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          adminPin: inputPin,
        });
        setPin(inputPin);
        setIsPinVerified(true);
        setShowPinDialog(false);
      }
    } else {
      // Verify PIN
      if (inputPin === pin) {
        setIsPinVerified(true);
        setShowPinDialog(false);
      } else {
        alert("Incorrect PIN");
        setInputPin("");
      }
    }
  };

  const searchYoutube = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResults([]);

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: searchQuery,
            type: "video",
            maxResults: 12,
            key: apiKey,
            safeSearch: "strict", // Kids safe search
          },
        },
      );
      setSearchResults(response.data.items);
    } catch (error) {
      console.error("Youtube API Error:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch from YouTube. Check API Key.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addVideo = async (videoItem: any) => {
    try {
      await addDoc(collection(db, "videos"), {
        youtubeId: videoItem.id.videoId,
        title: videoItem.snippet.title,
        thumbnail: videoItem.snippet.thumbnails.high.url,
        addedBy: user?.displayName || "Admin",
        likeCount: 0,
        createdAt: serverTimestamp(),
      });
      setMessage({
        type: "success",
        text: `Added "${videoItem.snippet.title}"`,
      });

      // Remove from search results to prevent double add
      setSearchResults((prev) =>
        prev.filter((item) => item.id.videoId !== videoItem.id.videoId),
      );
    } catch (error) {
      console.error("Error adding video:", error);
      setMessage({ type: "error", text: "Failed to add video." });
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Admin Access Required
        </Typography>
        <Button variant="contained" onClick={login}>
          Login with Google
        </Button>
      </Box>
    );
  }

  if (!isPinVerified) {
    return (
      <Dialog open={showPinDialog} disableEscapeKeyDown>
        <DialogTitle>
          {isSettingNewPin ? "Set Admin PIN" : "Enter Admin PIN"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              type="password"
              label="PIN"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
          <Button
            onClick={handlePinSubmit}
            variant="contained"
            disabled={!inputPin}
          >
            {isSettingNewPin ? "Set PIN" : "Unlock"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2">{user.displayName}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
          <TextField
            fullWidth
            label="Search YouTube Videos"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchYoutube()}
          />
          <Button
            variant="contained"
            size="large"
            onClick={searchYoutube}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </Box>

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {searchResults.map((item) => (
            <Box
              key={item.id.videoId}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 24px)",
                  md: "calc(33.333% - 24px)",
                },
              }}
            >
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={item.snippet.thumbnails.high.url}
                  alt={item.snippet.title}
                />
                <CardContent sx={{ height: 100, overflow: "hidden" }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ fontSize: "1rem", lineHeight: 1.2 }}
                  >
                    {item.snippet.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.snippet.channelTitle}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    onClick={() => addVideo(item)}
                  >
                    Add to Miawtube
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        {searchResults.length === 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
            Search for videos to add them to the app.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
