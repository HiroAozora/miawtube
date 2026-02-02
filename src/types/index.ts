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
  youtubeId: string;
  title: string;
  thumbnail?: string;
  addedBy: string;
  likeCount: number;
}

export interface Comment {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any; // Firestore Timestamp
}
