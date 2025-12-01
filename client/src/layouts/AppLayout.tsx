import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import Drawer from "@mui/joy/Drawer";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import Divider from "@mui/joy/Divider";
import { Menu, LogOut } from "lucide-react";

const navItems = [
  { label: "Plan", to: "/app/planning" },
  { label: "Profile", to: "/app/profile" },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string) => location.pathname.startsWith(to);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to landing page after logout
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* top bar */}
      <Sheet
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography level="h4" sx={{ fontWeight: "lg" }}>
          TimeCharge
        </Typography>

        {/* desktop nav buttons */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              variant={isActive(item.to) ? "solid" : "outlined"}
              color={isActive(item.to) ? "primary" : "neutral"}
              sx={{ textTransform: "none" }}
            >
              {item.label}
            </Button>
          ))}
          <IconButton variant="outlined" color="neutral" onClick={handleLogout}>
            <LogOut size={20} />
          </IconButton>
        </Box>

        {/* mobile menu button */}
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton
            variant="outlined"
            color="neutral"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </IconButton>
        </Box>
      </Sheet>

      {/* drawer for mobile nav */}
      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        <Box
          role="presentation"
          sx={{ minWidth: 220 }}
          onClick={() => setOpen(false)}
          onKeyDown={() => setOpen(false)}
        >
          <Typography sx={{ p: 2 }}>Menu</Typography>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.to}>
                <ListItemButton
                  component={NavLink}
                  to={item.to}
                  selected={isActive(item.to)}
                >
                  {item.label}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="neutral"
              startDecorator={<LogOut size={18} />}
              onClick={(e) => {
                e.stopPropagation(); // so drawer's onClick doesn't fire first
                handleLogout();
              }}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* routed content */}
      <Box component="main" sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
