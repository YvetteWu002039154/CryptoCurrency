import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Alert,
} from "@mui/material";
import { blockchainApi } from "../services/api";
import { Block } from "../types/blockchain";

const Mining: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [minerAddress, setMinerAddress] = useState("");
  const [lastBlock, setLastBlock] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLastBlock();
    const interval = setInterval(fetchLastBlock, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLastBlock = async () => {
    try {
      const chain = await blockchainApi.getChain();
      if (chain.length > 0) {
        setLastBlock(chain[chain.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching last block:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMineBlock = async () => {
    if (!minerAddress) {
      setError("Please enter a miner address");
      return;
    }

    setMining(true);
    setError(null);

    try {
      const newBlock = await blockchainApi.mineBlock(minerAddress);
      setLastBlock(newBlock);
    } catch (error) {
      console.error("Error mining block:", error);
      setError("Failed to mine block. Please try again.");
    } finally {
      setMining(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mining
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mine New Block
            </Typography>
            <TextField
              fullWidth
              label="Miner Address"
              value={minerAddress}
              onChange={(e) => setMinerAddress(e.target.value)}
              margin="normal"
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleMineBlock}
              disabled={mining}
              sx={{ mt: 2 }}
            >
              {mining ? "Mining..." : "Start Mining"}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Last Mined Block
            </Typography>
            {lastBlock ? (
              <Box>
                <Typography variant="body1">
                  <strong>Block Height:</strong> {lastBlock.index}
                </Typography>
                <Typography variant="body1">
                  <strong>Timestamp:</strong>{" "}
                  {new Date(lastBlock.timestamp * 1000).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Proof:</strong> {lastBlock.proof}
                </Typography>
                <Typography variant="body1">
                  <strong>Previous Hash:</strong>{" "}
                  {lastBlock.previous_hash.slice(0, 16)}...
                </Typography>
                <Typography variant="body1">
                  <strong>Transactions:</strong>{" "}
                  {lastBlock.transactions?.length || 0}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1">No blocks mined yet</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mining Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Mining Reward
                  </Typography>
                  <Typography variant="h6">
                    {lastBlock ? "50" : "0"} coins
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Blocks
                  </Typography>
                  <Typography variant="h6">
                    {lastBlock ? lastBlock.index : 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Network Difficulty
                  </Typography>
                  <Typography variant="h6">1</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Mining;
