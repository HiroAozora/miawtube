import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import VideoItem from "../components/VideoItem";
import CommentDrawer from "../components/CommentDrawer";
import type { Video } from "../types";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(
          collection(db, "videos"),
          orderBy("likeCount", "desc"),
          limit(20),
        );
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
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "black",
          color: "white",
        }}
      >
        <Typography>Loading Miawtube...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", bgcolor: "black" }}>
      {/* Header / Admin Link */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 20,
          display: "flex",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "bold", letterSpacing: 1 }}
        >
          Miawtube
        </Typography>
      </Box>

      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
        <Button
          component={Link}
          to="/admin"
          variant="text"
          sx={{ color: "white", minWidth: "auto" }}
        >
          <LockIcon />
        </Button>
      </Box>

      {/* Video Feed */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none" /* IE and Edge */,
          scrollbarWidth: "none" /* Firefox */,
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
            }}
          >
            <Container
              maxWidth="sm"
              sx={{ textAlign: "center", color: "white" }}
            >
              <Typography variant="h5" gutterBottom>
                No Videos Yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ask your parent to add some videos in the Admin Dashboard!
              </Typography>
              <Button
                component={Link}
                to="/admin"
                variant="contained"
                color="primary"
              >
                Go to Admin
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
    </Box>
  );
};

export default Home;
