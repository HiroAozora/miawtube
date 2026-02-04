import { useState, useEffect } from "react";
// Override ReactPlayer props to allow muted
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Video } from "../types";

interface VideoItemProps {
  video: Video;
  isActive: boolean;
  onCommentClick: () => void;
}

const VideoItem = ({ video, isActive, onCommentClick }: VideoItemProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [likesCount, setLikesCount] = useState(video.likeCount || 0);

  // Extract youtubeId if missing (fallback from youtubeUrl)
  const getYoutubeId = () => {
    if (video.youtubeId) return video.youtubeId;

    // Try to extract from youtubeUrl if available
    if (video.youtubeUrl) {
      const match = video.youtubeUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
      );
      return match ? match[1] : null;
    }

    return null;
  };

  const youtubeId = getYoutubeId();

  // Don't render if no valid youtubeId
  if (!youtubeId) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
        }}
      >
        <Typography color="white">Video ID tidak valid</Typography>
      </Box>
    );
  }

  useEffect(() => {
    // Add delay to prevent play/pause race condition
    let playTimer: number;

    if (isActive && isReady) {
      // Delay play slightly to ensure player is fully ready
      playTimer = setTimeout(() => {
        console.log("🎬 Attempting to play:", youtubeId);
        setPlaying(true);
      }, 100);
    } else {
      setPlaying(false);
    }

    // Safety: If stuck in loading for 5s, force ready so user can manually play
    const readyTimer = setTimeout(() => {
      if (!isReady && isActive) {
        console.log("Force ready due to timeout");
        setIsReady(true);
      }
    }, 5000);

    return () => {
      clearTimeout(playTimer);
      clearTimeout(readyTimer);
    };
  }, [isActive, isReady, youtubeId]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !video.id) return;
      const likeId = `${user.uid}_${video.id}`;
      const likeRef = doc(db, "user_likes", likeId);
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        setLiked(true);
      }
    };
    checkLikeStatus();
  }, [user, video.id]);

  const handleLike = async () => {
    if (!user || !video.id || liked) return;

    setLiked(true);
    setLikesCount((prev) => prev + 1);

    try {
      const likeId = `${user.uid}_${video.id}`;
      await setDoc(doc(db, "user_likes", likeId), {
        likedAt: serverTimestamp(),
      });

      const videoRef = doc(db, "videos", video.id);
      await updateDoc(videoRef, {
        likeCount: increment(1),
      });
    } catch (error) {
      console.error("Error liking video:", error);
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this video on MiawTube!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Share feature not supported on this device/browser.");
    }
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        scrollSnapAlign: "start",
        bgcolor: "black",
      }}
    >
      {/* Video Player */}
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        {!isReady && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "black",
            }}
          >
            <Typography color="white">Loading...</Typography>
          </Box>
        )}
        {!playing && isReady && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          >
            {/* Play Button Icon */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  ml: 0.5,
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: "18px solid white",
                }}
              />
            </Box>
          </Box>
        )}
        {/* YouTube iframe - Hidden controls for clean UI */}
        <iframe
          key={youtubeId}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isActive ? 1 : 0}&mute=0&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&disablekb=1`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            border: 0,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Prevent YouTube UI interaction
          }}
          onLoad={() => {
            console.log("✅ Iframe Loaded:", youtubeId);
            setIsReady(true);
          }}
        />
      </Box>

      {/* Side Actions */}
      <Box
        sx={{
          position: "absolute",
          right: 16,
          bottom: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src="/static/images/avatar/1.jpg"
            sx={{ width: 48, height: 48, border: "2px solid white", mb: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={handleLike}
            sx={{ color: liked ? "red" : "white" }}
          >
            {liked ? (
              <FavoriteIcon fontSize="large" />
            ) : (
              <FavoriteBorderIcon fontSize="large" />
            )}
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            {likesCount}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton onClick={onCommentClick} sx={{ color: "white" }}>
            <CommentIcon fontSize="large" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            Comment
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton onClick={handleShare} sx={{ color: "white" }}>
            <ShareIcon fontSize="large" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            Share
          </Typography>
        </Box>
      </Box>

      {/* Bottom Info */}
      <Box
        sx={{
          position: "absolute",
          left: 16,
          bottom: { xs: 80, sm: 60 }, // Higher on mobile, moderate on desktop
          zIndex: 10,
          width: "75%",
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
            mb: 0.5,
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {decodeHtml(video.title)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.8)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          Added by {video.addedBy || "Admin"}
        </Typography>
      </Box>
    </Box>
  );
};

export default VideoItem;
