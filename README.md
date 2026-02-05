# MiawTube

Platform berbagi video bergaya YouTube yang dibangun dengan React, TypeScript, dan Firebase.

## 🎯 Fitur

- **Video Shorts** - Tampilan video pendek bergaya YouTube Shorts
- **Upload & Manajemen Video** - Upload video melalui YouTube URL
- **Admin Dashboard** - Panel admin untuk mengelola konten
- **Komentar** - Sistem komentar real-time dengan Firebase
- **PWA Support** - Progressive Web App untuk instalasi di perangkat
- **Search & Filter** - Cari video berdasarkan kategori
- **Responsive Design** - Tampilan optimal di semua perangkat

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) + Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v7
- **Video Player**: React Player

## 📋 Prasyarat

- Node.js (versi 18 atau lebih baru)
- npm atau yarn
- Akun Firebase
- YouTube Data API Key

## 🚀 Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd miawtube
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Environment Variables**

   Copy file `.env.example` menjadi `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Lalu isi dengan kredensial Firebase dan YouTube API Key:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Setup Firebase**
   - Buat project di [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Storage
   - Enable Authentication (jika diperlukan)
   - Deploy Firestore rules dari file `firestore.rules`

5. **Run Development Server**

   ```bash
   npm run dev
   ```

   Aplikasi akan berjalan di `http://localhost:5173`

## 📦 Build

Untuk build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 🗂️ Struktur Project

```
miawtube/
├── src/
│   ├── components/     # Komponen reusable
│   ├── pages/          # Halaman aplikasi
│   ├── firebase/       # Konfigurasi Firebase
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript types
│   ├── lib/            # Utilities & helpers
│   └── assets/         # Gambar, icon, dll
├── public/             # Static files
├── firestore.rules     # Firestore security rules
└── vercel.json         # Vercel deployment config
```

## 🔐 Firestore Security

File `firestore.rules` sudah dikonfigurasi dengan security rules. Pastikan untuk deploy rules ini ke Firebase Console:

```bash
firebase deploy --only firestore:rules
```

## 🌐 Deployment

Project ini sudah dikonfigurasi untuk deployment di Vercel (lihat `vercel.json`).

### Deploy ke Vercel:

1. Push code ke GitHub repository
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy!

## 📝 Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build
- `npm run lint` - Jalankan ESLint

## 🙏 Credits

Dibuat dengan ❤️ menggunakan React, TypeScript, dan Firebase.

## 📄 License

Private project - All rights reserved.
