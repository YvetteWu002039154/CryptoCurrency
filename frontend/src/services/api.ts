import axios from "axios";
import { Block, Transaction, KeyPair } from "../types/blockchain";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const blockchainApi = {
  // Chain operations
  getChain: async (): Promise<Block[]> => {
    const response = await api.get("/chain/get");
    return response.data.chain;
  },

  getBlock: async (index: number): Promise<Block> => {
    const response = await api.get(`/block/${index}`);
    return response.data;
  },

  // Transaction operations
  getMempool: async (): Promise<Transaction[]> => {
    const response = await api.get("/transaction/get_mempool");
    return response.data.transactions;
  },

  addTransaction: async (transaction: Transaction): Promise<Transaction> => {
    const response = await api.post("/transaction/add", transaction);
    return response.data;
  },

  prepareTransaction: async (
    sender: string,
    recipient: string,
    amount: number,
    fee: number,
    private_key: string
  ): Promise<Transaction> => {
    const response = await api.post("/transaction/prepare", {
      sender_address: sender,
      sender_private_key: private_key,
      outputs: [
        {
          address: recipient,
          amount: amount,
        },
      ],
    });
    return response.data;
  },

  // Mining operations
  mineBlock: async (minerAddress: string): Promise<Block> => {
    const response = await api.post("/block/mine", {
      miner_address: minerAddress,
    });
    return response.data;
  },

  // Network operations
  connectNode: async (nodeUrl: string): Promise<{ total_nodes: number }> => {
    const response = await api.post("/node/connect", { node_url: nodeUrl });
    return response.data;
  },

  replaceChain: async (): Promise<{ chain: Block[] }> => {
    const response = await api.get("/node/sync");
    return response.data;
  },

  // Wallet operations
  createWallet: async (): Promise<KeyPair> => {
    try {
      console.log("Making request to /wallet/generate");
      const response = await api.get("/wallet/generate");
      console.log("Response from /wallet/generate:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error in createWallet:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getBalance: async (address: string): Promise<{ balance: number }> => {
    const response = await api.get(`/wallet/balance/${address}`);
    return response.data;
  },
};

export default blockchainApi;
