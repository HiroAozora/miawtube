import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Avatar,
  Container,
  Tab,
  Tabs,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/LockOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import YoutubeSearchedForIcon from "@mui/icons-material/YoutubeSearchedFor";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { Video } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

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
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [existingVideos, setExistingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return; // Wait for auth

    // Check if PIN was already verified in this session (e.g., from Profile)
    const alreadyVerified =
      sessionStorage.getItem("adminPinVerified") === "true";

    if (alreadyVerified) {
      setIsPinVerified(true);
      return; // Skip PIN prompt
    }

    // Otherwise, show PIN dialog as usual
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

  useEffect(() => {
    if (isPinVerified) {
      fetchExistingVideos();
    }
  }, [isPinVerified]);

  const fetchExistingVideos = async () => {
    try {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const videos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[];
      setExistingVideos(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

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
        sessionStorage.setItem("adminPinVerified", "true");
      }
    } else {
      // Verify PIN
      if (inputPin === pin) {
        setIsPinVerified(true);
        setShowPinDialog(false);
        sessionStorage.setItem("adminPinVerified", "true");
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
    setMessage(null);

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

  const addVideoByUrl = async () => {
    if (!urlInput.trim()) return;

    // Extract ID (Regular/Shorts/Share links)
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = urlInput.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : null;

    if (!videoId) {
      setMessage({ type: "error", text: "Invalid YouTube URL" });
      return;
    }

    // Check if exists locally first to save API call
    const isDuplicate = existingVideos.some((v) => v.youtubeId === videoId);
    if (isDuplicate) {
      setMessage({ type: "error", text: "Video already exists in library" });
      return;
    }

    setLoading(true);
    try {
      // Fetch Metadata (Cost: 1 Unit)
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet",
            id: videoId,
            key: apiKey,
          },
        },
      );

      if (response.data.items.length === 0) {
        setMessage({ type: "error", text: "Video not found on YouTube" });
        return;
      }

      const videoData = response.data.items[0];
      await addDoc(collection(db, "videos"), {
        youtubeId: videoId,
        title: videoData.snippet.title,
        thumbnail:
          videoData.snippet.thumbnails.high?.url ||
          videoData.snippet.thumbnails.default.url,
        addedBy: user?.displayName || "Admin",
        likeCount: 0,
        createdAt: serverTimestamp(),
      });

      setMessage({ type: "success", text: "Video added successfully!" });
      setUrlInput("");
      fetchExistingVideos(); // Refresh list
    } catch (error) {
      console.error("Error adding video by URL:", error);
      setMessage({ type: "error", text: "Failed to add video details." });
    } finally {
      setLoading(false);
    }
  };

  const addVideoFromSearch = async (videoItem: any) => {
    // Check duplicate
    if (existingVideos.some((v) => v.youtubeId === videoItem.id.videoId)) {
      setMessage({ type: "error", text: "Video already exists" });
      return;
    }

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

      // Update state
      setSearchResults((prev) =>
        prev.filter((item) => item.id.videoId !== videoItem.id.videoId),
      );
      fetchExistingVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      setMessage({ type: "error", text: "Failed to add video." });
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "videos", id));
        setMessage({ type: "success", text: "Video deleted" });
        fetchExistingVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
        setMessage({ type: "error", text: "Failed to delete video" });
      }
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
          bgcolor: "#f9f9f9",
          px: 3,
        }}
      >
        <Box
          sx={{
            mb: 3,
            width: 80,
            height: 80,
            bgcolor: "white",
            borderRadius: "50%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            fontSize: 40,
          }}
        >
          <LockIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          sx={{ fontFamily: "Oswald" }}
        >
          Admin Access Required
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center", maxWidth: 300 }}
        >
          To manage Miawtube videos and settings, please verify your identity.
        </Typography>
        <Button
          variant="contained"
          onClick={login}
          size="large"
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 10,
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    );
  }

  if (!isPinVerified) {
    return (
      <Dialog
        open={Boolean(showPinDialog)}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          {isSettingNewPin ? "Set New Admin PIN" : "Enter Admin PIN"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" align="center" color="text.secondary">
              {isSettingNewPin
                ? "This PIN will be used to protect the 'Manage Videos' section."
                : "Please enter your PIN to continue."}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              type="password"
              inputProps={{
                maxLength: 6,
                pattern: "[0-9]*",
                style: {
                  textAlign: "center",
                  letterSpacing: 8,
                  fontSize: "1.5rem",
                },
              }}
              placeholder="••••"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => navigate("/")} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePinSubmit}
            variant="contained"
            disabled={!inputPin}
            sx={{ minWidth: 100 }}
          >
            {isSettingNewPin ? "Set PIN" : "Unlock"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        paddingBottom: 5,
      }}
    >
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
            Admin Dashboard
          </Typography>
          <Avatar
            src={user.photoURL || undefined}
            sx={{ width: 32, height: 32 }}
          />
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<LinkIcon />} label="Add by Link" />
          <Tab icon={<YoutubeSearchedForIcon />} label="Search" />
          <Tab
            icon={<DeleteIcon />}
            label={`Manage (${existingVideos.length})`}
          />
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 2 }}>
        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Tab 0: Add by Link */}
        <CustomTabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Paste YouTube Link
            </Typography>
            <Box sx={{ display: "flex", width: "100%", gap: 1, maxWidth: 600 }}>
              <TextField
                fullWidth
                label="https://youtu.be/..."
                variant="outlined"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="contained"
                size="large"
                onClick={addVideoByUrl}
                disabled={loading || !urlInput}
              >
                {loading ? <CircularProgress size={24} /> : "Add"}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Uses 1 API Quota Unit (Much cheaper than Search)
            </Typography>
          </Box>
        </CustomTabPanel>

        {/* Tab 1: Search */}
        <CustomTabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
            <TextField
              fullWidth
              label="Search Keywords"
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
              {loading ? <CircularProgress size={24} /> : "Search"}
            </Button>
          </Box>

          <Grid container spacing={2}>
            {searchResults.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id.videoId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.snippet.thumbnails.high.url}
                    alt={item.snippet.title}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ lineHeight: 1.2, mb: 0.5 }}
                    >
                      {item.snippet.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.snippet.channelTitle}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => addVideoFromSearch(item)}
                    >
                      Add
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CustomTabPanel>

        {/* Tab 2: Manage List */}
        <CustomTabPanel value={tabValue} index={2}>
          <List>
            {existingVideos.map((video) => (
              <ListItem key={video.id} divider>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={video.thumbnail}
                    sx={{ width: 60, height: 45, mr: 1 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={video.title}
                  secondary={`Added by ${video.addedBy} • ${video.likeCount} Likes`}
                  primaryTypographyProps={{
                    variant: "subtitle2",
                    noWrap: true,
                    sx: { maxWidth: "70%" },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      video.id && handleDeleteVideo(video.id, video.title)
                    }
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {existingVideos.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No videos yet. Add some!
              </Typography>
            )}
          </List>
        </CustomTabPanel>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
