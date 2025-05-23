import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
} from "@mui/material";
import { blockchainApi } from "../services/api";

const Settings: React.FC = () => {
  const [miningEnabled, setMiningEnabled] = useState(false);
  const [miningInterval, setMiningInterval] = useState("10");
  const [difficulty, setDifficulty] = useState("4");
  const [reward, setReward] = useState("50");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, we would have an endpoint to update settings
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mining Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={miningEnabled}
                    onChange={(e) => setMiningEnabled(e.target.checked)}
                  />
                }
                label="Enable Automatic Mining"
              />
            </Box>
            <TextField
              fullWidth
              label="Mining Interval (seconds)"
              type="number"
              value={miningInterval}
              onChange={(e) => setMiningInterval(e.target.value)}
              margin="normal"
              disabled={!miningEnabled}
            />
            <TextField
              fullWidth
              label="Mining Difficulty"
              type="number"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              margin="normal"
              helperText="Higher difficulty means more computational work required"
            />
            <TextField
              fullWidth
              label="Mining Reward (coins)"
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              margin="normal"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Network Settings
            </Typography>
            <TextField
              fullWidth
              label="API Port"
              value="5000"
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="P2P Port"
              value="5001"
              margin="normal"
              disabled
            />
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Node Discovery
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Node Discovery"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Real-time Updates"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show Transaction Details"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Notifications"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              sx={{ minWidth: 120 }}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
