import { useState, useEffect, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import VideoItem from "../components/VideoItem";
import CommentDrawer from "../components/CommentDrawer";
import LoadingScreen from "../components/LoadingScreen";
import BottomNav from "../components/BottomNav";
import type { Video } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

const Shorts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "videos"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const fetchedVideos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];
        setVideos(fetchedVideos);

        // If navigated from Home with specific video, find its index
        if (location.state?.videoId) {
          const index = fetchedVideos.findIndex(
            (v) => v.id === location.state.videoId,
          );
          if (index !== -1) {
            setActiveVideoIndex(index);
            // Scroll to that video after render
            setTimeout(() => {
              if (containerRef.current) {
                const scrollTop = index * containerRef.current.clientHeight;
                containerRef.current.scrollTop = scrollTop;
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
  }, [location.state, user]);

  // DEBUG: Log videos state
  console.log("🎬 Shorts Debug:", {
    loading,
    videosCount: videos.length,
    hasUser: !!user,
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      youtubeId: v.youtubeId,
    })),
  });

  if (loading) {
    return <LoadingScreen />;
  }

  // Show message if no videos
  if (videos.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#000",
          color: "white",
        }}
      >
        <Typography variant="h6">Belum Ada Video</Typography>
        <Typography variant="body2" color="text.secondary">
          Tambahkan video melalui Admin Dashboard
        </Typography>
      </Box>
    );
  }

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Close Button */}
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.7)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Vertical Scroll Container */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {videos.map((video, index) => (
          <Box
            key={video.id}
            sx={{
              height: "100vh",
              scrollSnapAlign: "start",
              position: "relative",
            }}
          >
            <VideoItem
              video={video}
              isActive={index === activeVideoIndex}
              onCommentClick={() => openComments(video.id)}
            />
          </Box>
        ))}
      </Box>

      {/* Comment Drawer */}
      <CommentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        videoId={activeVideoId}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default Shorts;
