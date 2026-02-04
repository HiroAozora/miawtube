import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  AppBar,
  Toolbar,
  Avatar,
} from "@mui/material";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import LoadingScreen from "../components/LoadingScreen";
import OnboardingModal from "../components/OnboardingModal";
import BottomNav from "../components/BottomNav";
import type { Video } from "../types";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(
      "miawtube_onboarding_completed",
    );
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedVideos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const openVideo = (video: Video) => {
    navigate("/shorts", { state: { videoId: video.id } });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Split videos: half for shorts, half for regular
  const shortsVideos = videos.slice(0, Math.ceil(videos.length / 2));
  const regularVideos = videos.slice(Math.ceil(videos.length / 2));

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Top Bar */}
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src="/miawtube.svg" alt="MiawTube" style={{ height: 28 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "Oswald" }}
            >
              MiawTube
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SHORTS SECTION */}
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ px: 2, mb: 1.5 }}>
          Shorts
        </Typography>

        {/* Horizontal Scrollable Shorts */}
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            px: 2,
            pb: 2,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 4,
            },
          }}
        >
          {shortsVideos.map((video) => (
            <Card
              key={video.id}
              sx={{
                minWidth: 160,
                maxWidth: 160,
                borderRadius: 2,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <CardActionArea onClick={() => openVideo(video)}>
                <CardMedia
                  component="img"
                  image={video.thumbnail}
                  alt={video.title}
                  sx={{
                    height: 280,
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.likeCount || 0} suka
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {/* REGULAR VIDEOS SECTION */}
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ px: 2, mb: 1.5 }}>
          Video
        </Typography>

        {/* Vertical List of Regular Videos */}
        <Box sx={{ px: 2 }}>
          {regularVideos.map((video) => (
            <Card
              key={video.id}
              sx={{
                display: "flex",
                mb: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <CardActionArea
                onClick={() => openVideo(video)}
                sx={{ display: "flex", alignItems: "flex-start", p: 0 }}
              >
                {/* Thumbnail - Landscape 16:9 */}
                <CardMedia
                  component="img"
                  image={video.thumbnail}
                  alt={video.title}
                  sx={{
                    width: 168,
                    height: 94,
                    objectFit: "cover",
                    borderRadius: "8px 0 0 8px",
                  }}
                />

                {/* Video Info */}
                <Box sx={{ flex: 1, p: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 0.5,
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Avatar
                      sx={{ width: 24, height: 24 }}
                      src="/miawtube.svg"
                    />
                    <Typography variant="caption" color="text.secondary">
                      MiawTube
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {video.likeCount || 0} suka · {video.views || 0} views
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {videos.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 8, px: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Belum ada video
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin dapat menambahkan video melalui Panel Admin
          </Typography>
        </Box>
      )}

      <BottomNav />
    </Box>
  );
};

export default Home;
