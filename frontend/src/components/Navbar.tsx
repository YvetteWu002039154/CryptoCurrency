import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MemoryIcon from "@mui/icons-material/Memory";
import HubIcon from "@mui/icons-material/Hub";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Blockchain Explorer
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/transactions"
            startIcon={<SwapHorizIcon />}
          >
            Transactions
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/mining"
            startIcon={<MemoryIcon />}
          >
            Mining
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/network"
            startIcon={<HubIcon />}
          >
            Network
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/wallet"
            startIcon={<AccountBalanceWalletIcon />}
          >
            Wallet
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
