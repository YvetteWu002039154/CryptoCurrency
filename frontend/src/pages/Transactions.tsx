import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { blockchainApi } from "../services/api";
import { Transaction, KeyPair } from "../types/blockchain";

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [wallet, setWallet] = useState<KeyPair | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    recipient: "",
    amount: "",
    fee: "0.001",
  });

  useEffect(() => {
    // Load wallet from localStorage
    const savedWallet = localStorage.getItem("wallet");
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await blockchainApi.getMempool();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!wallet) {
      setError("No wallet found. Please create a wallet first.");
      return;
    }

    try {
      // First prepare the transaction
      const preparedTx = await blockchainApi.prepareTransaction(
        wallet.address,
        newTransaction.recipient,
        parseFloat(newTransaction.amount),
        parseFloat(newTransaction.fee),
        wallet.private_key
      );

      // Then add the transaction with the wallet's private key
      const transaction = {
        ...preparedTx,
        signature: preparedTx.signature,
        public_key: wallet.public_key,
        inputs: preparedTx.inputs,
        outputs: preparedTx.outputs,
      };

      await blockchainApi.addTransaction(transaction);
      setSuccess("Transaction created successfully!");
      setError(null);
      setOpenDialog(false);
      fetchTransactions();
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      setError(error.message || "Failed to create transaction");
      setSuccess(null);
    }
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
        Transactions
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
            Please create a wallet first to make transactions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => (window.location.href = "/wallet")}
          >
            Create Wallet
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Wallet Address: {wallet.address}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              New Transaction
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.tx_id}>
                    <TableCell>{tx.tx_id}</TableCell>
                    <TableCell>
                      {tx.inputs[0]?.owner_address || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {tx.outputs[0]?.owner_address || "Unknown"}
                    </TableCell>
                    <TableCell>{tx.outputs[0]?.amount || 0}</TableCell>
                    <TableCell>{tx.fee}</TableCell>
                    <TableCell>Pending</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Transaction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Address"
            type="text"
            fullWidth
            value={newTransaction.recipient}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                recipient: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Fee"
            type="number"
            fullWidth
            value={newTransaction.fee}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, fee: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTransaction} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Transactions;
