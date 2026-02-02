import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
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
  const [likesCount, setLikesCount] = useState(video.likeCount || 0);

  useEffect(() => {
    if (isActive) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !video.id) return;
      // Unique ID for like: userId_videoId
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

    // Optimistic UI update
    setLiked(true);
    setLikesCount((prev) => prev + 1);

    try {
      const likeId = `${user.uid}_${video.id}`;
      await setDoc(doc(db, "user_likes", likeId), {
        likedAt: serverTimestamp(),
      });

      // Update video counters
      const videoRef = doc(db, "videos", video.id);
      await updateDoc(videoRef, {
        likeCount: increment(1),
      });
    } catch (error) {
      console.error("Error liking video:", error);
      // Revert if failed
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this video on Miawtube!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Share feature not supported on this device/browser.");
    }
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
      <Box sx={{ width: "100%", height: "100%", pointerEvents: "none" }}>
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          width="100%"
          height="100%"
          playing={playing}
          loop
          controls={false}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
                fs: 0,
                disablekb: 1,
              },
            },
          }}
        />
        {/* Transparent overlay to prevent interaction with YouTube iframe */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
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
          bottom: 24,
          zIndex: 10,
          width: "75%",
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
          {video.title}
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
