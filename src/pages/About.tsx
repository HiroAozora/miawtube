import {
  Box,
  Typography,
  Container,
  IconButton,
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwipeVerticalIcon from "@mui/icons-material/SwipeVertical";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LockIcon from "@mui/icons-material/Lock";
import YouTubeIcon from "@mui/icons-material/YouTube";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Bagaimana cara menonton video?",
      answer:
        "Cukup geser ke atas atau bawah untuk menjelajahi video, seperti TikTok! Video akan otomatis diputar saat muncul di layar.",
    },
    {
      question: "Bagaimana cara menyalakan suara video?",
      answer:
        "Ketuk di mana saja pada video saat melihat pesan '🔇 Ketuk untuk menyalakan suara'. Setelah suara dinyalakan, semua video berikutnya akan otomatis terdengar!",
    },
    {
      question: "Bisakah saya menyukai dan berkomentar di video?",
      answer:
        "Ya! Ketuk ikon hati untuk menyukai video, ikon komentar untuk melihat dan menambahkan komentar, dan ikon bagikan untuk membagikan video ke orang lain.",
    },
    {
      question: "Bagaimana cara menambahkan video sebagai admin?",
      answer:
        "Buka Profil kamu, lalu klik 'Panel Admin'. Kamu perlu mengatur PIN terlebih dahulu untuk keamanan. Dari sana, kamu dapat menambahkan video melalui URL YouTube atau mencari video untuk ditambahkan.",
    },
    {
      question: "Untuk apa PIN itu?",
      answer:
        "PIN melindungi Panel Admin sehingga hanya orang tua/wali yang dapat mengelola konten video. Atur sekali di Profil atau Panel Admin kamu.",
    },
    {
      question: "Bisakah saya menginstal ini sebagai aplikasi?",
      answer:
        "Ya! MiawTube adalah PWA (Progressive Web App). Di browser seluler, ketuk menu browser dan pilih 'Tambahkan ke Layar Utama' atau 'Instal Aplikasi'.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate("/")}
            aria-label="kembali"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <img src="/miawtube.svg" alt="MiawTube" style={{ height: 28 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontFamily: "Oswald" }}
            >
              Tentang MiawTube
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box sx={{ mb: 3 }}>
            <img
              src="/miawtube.svg"
              alt="MiawTube"
              style={{ width: 100, height: 100 }}
            />
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "Oswald" }}
          >
            Selamat Datang di MiawTube
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Platform video bergaya YouTube Shorts yang dirancang untuk konten
            aman dan ter-kurasi. Jelajahi grid video, klik untuk menonton
            fullscreen, suka, komentar, dan bagikan!
          </Typography>
        </Box>

        {/* Features Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Fitur Utama
        </Typography>

        <Box sx={{ display: "grid", gap: 3, mb: 6 }}>
          {[
            {
              icon: (
                <SwipeVerticalIcon
                  sx={{ fontSize: 40, color: "primary.main" }}
                />
              ),
              title: "Grid Bergaya YouTube Shorts",
              description:
                "Jelajahi banyak video dalam tampilan grid. Tap thumbnail untuk menonton fullscreen",
            },
            {
              icon: (
                <FavoriteBorderIcon
                  sx={{ fontSize: 40, color: "primary.main" }}
                />
              ),
              title: "Berinteraksi dengan Konten",
              description: "Suka, komentar, dan bagikan video favoritmu",
            },
            {
              icon: <LockIcon sx={{ fontSize: 40, color: "primary.main" }} />,
              title: "Kontrol Orang Tua",
              description:
                "Panel admin dilindungi PIN untuk pengelolaan konten",
            },
            {
              icon: (
                <YouTubeIcon sx={{ fontSize: 40, color: "primary.main" }} />
              ),
              title: "Integrasi YouTube",
              description:
                "Tambahkan video YouTube yang dapat disematkan melalui URL atau pencarian",
            },
            {
              icon: (
                <VolumeUpIcon sx={{ fontSize: 40, color: "primary.main" }} />
              ),
              title: "Suara Sekali Nyala",
              description:
                "Nyalakan suara sekali, dan semua video akan terdengar",
            },
            {
              icon: (
                <InstallMobileIcon
                  sx={{ fontSize: 40, color: "primary.main" }}
                />
              ),
              title: "Dukungan PWA",
              description:
                "Instal sebagai aplikasi di perangkatmu untuk akses offline",
            },
          ].map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Box>{feature.icon}</Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FAQ Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Pertanyaan yang Sering Diajukan
        </Typography>

        <Box sx={{ mb: 6 }}>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            MiawTube © {new Date().getFullYear()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Dibuat dengan ❤️ untuk tontonan video yang aman dan ter-kurasi
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
