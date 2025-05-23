export interface Transaction {
  tx_id: string;
  sender: string;
  recipient: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature?: string;
  inputs: {
    owner_address: string;
    amount: number;
  }[];
  outputs: {
    owner_address: string;
    amount: number;
  }[];
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previous_hash: string;
}

export interface KeyPair {
  address: string;
  private_key: string;
  public_key: string;
}

export interface Wallet {
  address: string;
  privateKey: string;
  balance: number;
}

export interface Node {
  url: string;
  lastSeen: number;
  isActive: boolean;
}

export interface MiningStats {
  totalBlocks: number;
  totalTransactions: number;
  averageBlockTime: number;
  currentDifficulty: number;
  miningReward: number;
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  lastSync: number;
  chainLength: number;
  mempoolSize: number;
}
