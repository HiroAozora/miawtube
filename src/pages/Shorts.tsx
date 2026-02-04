import { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import VideoItem from "../components/VideoItem";
import CommentDrawer from "../components/CommentDrawer";
import LoadingScreen from "../components/LoadingScreen";
import BottomNav from "../components/BottomNav";
import type { Video } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

const Shorts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch videos
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
  }, [location.state]);

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
