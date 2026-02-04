import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  MobileStepper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Person from "@mui/icons-material/Person";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ open, onClose }: OnboardingModalProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const slides = [
    {
      icon: (
        <PlayCircleOutlineIcon sx={{ fontSize: 80, color: "primary.main" }} />
      ),
      title: "Selamat Datang di Miawtube!",
      description:
        "Temukan dan nikmati video pendek dengan gaya TikTok. Geser atas/bawah untuk menjelajahi konten tanpa batas.",
    },
    {
      icon: <img src="/miawtube.svg" alt="Fitur" style={{ width: 80 }} />,
      title: "Berinteraksi dengan Video",
      description:
        "Suka, komentar, dan bagikan video favoritmu. Ketuk video untuk menyalakan suara!",
      features: [
        {
          icon: <FavoriteBorderIcon sx={{ fontSize: 40 }} />,
          text: "Suka video",
        },
        { icon: <CommentIcon sx={{ fontSize: 40 }} />, text: "Tulis komentar" },
        { icon: <ShareIcon sx={{ fontSize: 40 }} />, text: "Bagikan" },
      ],
    },
    {
      icon: <Person sx={{ fontSize: 80, color: "primary.main" }} />,
      title: "Profil Kamu",
      description:
        "Masuk dengan Google untuk mengakses profil, melihat perpustakaan, dan mengelola panel admin.",
    },
  ];

  const handleNext = () => {
    if (activeStep < slides.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("miawtube_onboarding_completed", "true");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "text.secondary",
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        {/* Slides Container */}
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              transition: "transform 0.3s ease-in-out",
              transform: `translateX(-${activeStep * 100}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 4,
                  minHeight: 400,
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                {/* Icon */}
                <Box sx={{ mb: 3 }}>{slide.icon}</Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ fontFamily: "Oswald" }}
                >
                  {slide.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400 }}
                >
                  {slide.description}
                </Typography>

                {/* Features (if any) */}
                {slide.features && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    {slide.features.map((feature, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
                        <Typography variant="caption" color="text.secondary">
                          {feature.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom Controls */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <MobileStepper
            variant="dots"
            steps={slides.length}
            position="static"
            activeStep={activeStep}
            sx={{ flexGrow: 1, bgcolor: "transparent" }}
            nextButton={
              activeStep === slides.length - 1 ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleComplete}
                >
                  Mulai
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={handleNext}
                  endIcon={<KeyboardArrowRight />}
                >
                  Lanjut
                </Button>
              )
            }
            backButton={
              <Button
                size="small"
                onClick={() => setActiveStep((prev) => prev - 1)}
                disabled={activeStep === 0}
                startIcon={<KeyboardArrowLeft />}
              >
                Kembali
              </Button>
            }
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
