import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { blockchainApi } from "../services/api";
import { KeyPair } from "../types/blockchain";

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<KeyPair | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load wallet from localStorage if it exists
    const savedWallet = localStorage.getItem("wallet");
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (wallet) {
      fetchBalance();
    }
  }, [wallet]);

  const fetchBalance = async () => {
    if (!wallet) return;
    try {
      const response = await blockchainApi.getBalance(wallet.address);
      setBalance(response.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch wallet balance");
    }
  };

  const handleCreateWallet = async () => {
    try {
      console.log("Attempting to create wallet...");
      const keyPair = await blockchainApi.createWallet();
      console.log("Wallet created successfully:", keyPair);
      setWallet(keyPair);
      localStorage.setItem("wallet", JSON.stringify(keyPair));
      setSuccess("New wallet created successfully!");
      setError(null);
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      setError(`Failed to create wallet: ${error.message || "Unknown error"}`);
      setSuccess(null);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {!wallet ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No Wallet Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create a new wallet to start making transactions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateWallet}
            size="large"
          >
            Create New Wallet
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Wallet Address
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                    }}
                  >
                    {wallet.address}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(wallet.address)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Balance
                </Typography>
                <Typography variant="h4" color="primary">
                  {balance} coins
                </Typography>
                <Button
                  variant="outlined"
                  onClick={fetchBalance}
                  sx={{ mt: 2 }}
                >
                  Refresh Balance
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Private Key (Keep this secret!)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                    }}
                  >
                    {wallet.private_key}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(wallet.private_key)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Warning: Never share your private key with anyone!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Public Key
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                    }}
                  >
                    {wallet.public_key}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(wallet.public_key)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Wallet;
