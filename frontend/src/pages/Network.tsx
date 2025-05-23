import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import { blockchainApi } from "../services/api";

const Network: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<string[]>([]);
  const [newNodeUrl, setNewNodeUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const chain = await blockchainApi.getChain();
      // In a real implementation, we would have an endpoint to get nodes
      // For now, we'll just use a mock list
      setNodes(["http://localhost:5000"]);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async () => {
    if (!newNodeUrl) {
      setError("Please enter a node URL");
      return;
    }

    try {
      const response = await blockchainApi.connectNode(newNodeUrl);
      setNodes((prev) => [...prev, newNodeUrl]);
      setNewNodeUrl("");
      setSuccess(
        `Node added successfully. Total nodes: ${response.total_nodes}`
      );
      setError(null);
    } catch (error) {
      console.error("Error adding node:", error);
      setError("Failed to add node. Please check the URL and try again.");
      setSuccess(null);
    }
  };

  const handleSyncChain = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await blockchainApi.replaceChain();
      setSuccess("Chain synchronized successfully");
    } catch (error) {
      console.error("Error syncing chain:", error);
      setError("Failed to synchronize chain. Please try again.");
    } finally {
      setSyncing(false);
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
        Network
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Node
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Node URL"
                value={newNodeUrl}
                onChange={(e) => setNewNodeUrl(e.target.value)}
                error={!!error}
                helperText={error}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNode}
                sx={{ minWidth: 120 }}
              >
                Add Node
              </Button>
            </Box>
            {success && <Alert severity="success">{success}</Alert>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Network Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Connected Nodes: {nodes.length}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSyncChain}
                disabled={syncing}
                sx={{ mt: 2 }}
              >
                {syncing ? "Syncing..." : "Sync Chain"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connected Nodes
            </Typography>
            <List>
              {nodes.map((node, index) => (
                <React.Fragment key={node}>
                  <ListItem>
                    <ListItemText
                      primary={node}
                      secondary={`Node ${index + 1}`}
                    />
                  </ListItem>
                  {index < nodes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Network;
