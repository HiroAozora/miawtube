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
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  views?: number;
  addedBy?: string; // Admin who added the video
}

export interface Comment {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any; // Firestore Timestamp
}
