export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  adminPin: string | null;
  createdAt?: any; // Firestore Timestamp
}

export interface Video {
  id?: string;
  youtubeUrl: string;
  youtubeId?: string; // For backwards compatibility
  title: string;
  thumbnail: string;
  createdAt: any;
  ownerId: string; // User ID who owns this video
  addedBy?: string; // Admin who added the video
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  views?: number;
}

export interface Comment {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any; // Firestore Timestamp
}
