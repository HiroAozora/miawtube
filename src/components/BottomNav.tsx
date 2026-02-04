import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PersonIcon from "@mui/icons-material/Person";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === "/") return 0;
    if (location.pathname === "/shorts") return 1;
    if (location.pathname === "/about") return 2;
    if (location.pathname === "/profile") return 3;
    return 0;
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation
        value={getActiveTab()}
        onChange={(_event, newValue) => {
          if (newValue === 0) navigate("/");
          if (newValue === 1) navigate("/shorts");
          if (newValue === 2) navigate("/about");
          if (newValue === 3) navigate("/profile");
        }}
        showLabels
      >
        <BottomNavigationAction label="Beranda" icon={<HomeIcon />} />
        <BottomNavigationAction label="Shorts" icon={<PlayCircleIcon />} />
        <BottomNavigationAction label="Bantuan" icon={<HelpOutlineIcon />} />
        <BottomNavigationAction label="Profil" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
