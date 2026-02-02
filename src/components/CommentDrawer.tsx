import { useState, useEffect } from "react";
import {
  SwipeableDrawer,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Comment } from "../types";

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  videoId: string | null;
}

const CommentDrawer = ({ open, onClose, videoId }: CommentDrawerProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!videoId || !open) return;

    const q = query(
      collection(db, "videos", videoId, "comments"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [videoId, open]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user || !videoId) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "videos", videoId, "comments"), {
        text: newComment,
        userId: user.uid,
        userName: user.displayName || "User",
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      PaperProps={{
        sx: {
          height: "70vh",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Comments</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {comments.map((comment) => (
          <ListItem key={comment.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                alt={comment.userName}
                src="/static/images/avatar/1.jpg"
              />
            </ListItemAvatar>
            <ListItemText primary={comment.userName} secondary={comment.text} />
          </ListItem>
        ))}
        {comments.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            No comments yet. Be the first!
          </Typography>
        )}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid #eee", display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
        />
        <IconButton
          color="primary"
          onClick={handleSubmit}
          disabled={!newComment.trim() || !user || loading}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </SwipeableDrawer>
  );
};

export default CommentDrawer;
