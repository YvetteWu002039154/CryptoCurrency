import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { blockchainApi } from "../services/api";
import { Block, Transaction } from "../types/blockchain";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chain, setChain] = useState<Block[]>([]);
  const [mempool, setMempool] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalBlocks: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    averageBlockTime: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chainData, mempoolData] = await Promise.all([
          blockchainApi.getChain(),
          blockchainApi.getMempool(),
        ]);

        setChain(chainData);
        setMempool(mempoolData);

        // Calculate statistics
        const totalTransactions = chainData.reduce(
          (acc, block) => acc + block.transactions.length,
          0
        );

        const blockTimes = chainData.slice(1).map((block, index) => ({
          blockNumber: block.index,
          time: block.timestamp - chainData[index].timestamp,
        }));

        const averageBlockTime =
          blockTimes.reduce((acc, curr) => acc + curr.time, 0) /
          blockTimes.length;

        setStats({
          totalBlocks: chainData.length,
          totalTransactions,
          pendingTransactions: mempoolData.length,
          averageBlockTime,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

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
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Blocks
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalBlocks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Total Transactions
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalTransactions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Pending Transactions
            </Typography>
            <Typography component="p" variant="h4">
              {stats.pendingTransactions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Avg. Block Time
            </Typography>
            <Typography component="p" variant="h4">
              {stats.averageBlockTime.toFixed(2)}s
            </Typography>
          </Paper>
        </Grid>

        {/* Block Time Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Block Time History
            </Typography>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chain.slice(1).map((block, index) => ({
                    blockNumber: block.index,
                    time: block.timestamp - chain[index].timestamp,
                  }))}
                  margin={{
                    top: 16,
                    right: 16,
                    bottom: 0,
                    left: 24,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="blockNumber" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#8884d8"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
