# Cryptocurrency Blockchain Implementation

This project is a Python-based implementation of a cryptocurrency blockchain system that demonstrates core blockchain concepts and features. It provides a practical example of how blockchain technology works, including transaction processing, mining, and network synchronization.

## Core Features

### 1. Transaction System

- **UTXO (Unspent Transaction Output) Model**: Implements Bitcoin-style UTXO model for transaction handling
- **Transaction Verification**: Validates transactions using cryptographic signatures
- **Fee System**: Supports transaction fees for miners
- **Mempool Management**: Handles pending transactions before they are included in blocks
- **Double-Spend Prevention**: Checks for duplicate transactions in mempool using signatures

### 2. Mining System

- **Proof of Work**: Implements a mining mechanism with adjustable difficulty
- **Block Creation**: Creates new blocks with verified transactions
- **Mining Rewards**: Implements a halving mechanism similar to Bitcoin (halving every 210,000 blocks)
- **Block Size Limit**: Enforces a maximum block size of 1500 units
- **Fee Collection**: Miners receive transaction fees along with block rewards

### 3. Network Features

- **Node Communication**: Supports peer-to-peer node communication
- **Chain Synchronization**: Implements blockchain synchronization between nodes
- **Consensus Mechanism**: Ensures all nodes maintain the same valid blockchain
- **UTXO Set Synchronization**: Maintains consistent UTXO state across nodes

### 4. Security Features

- **Cryptographic Addresses**: Generates secure addresses using SHA256 and RIPEMD160
- **Digital Signatures**: Uses ECDSA for transaction signing
- **Chain Validation**: Verifies the integrity of the blockchain
- **Transaction Input Verification**: Ensures UTXOs exist and aren't spent

## Technical Implementation

### Key Components

- `Blockchain.py`: Core blockchain implementation
- `Block.py`: Block structure and validation
- `Transaction.py`: Transaction handling and verification
- `UTXO.py`: Unspent Transaction Output management
- `app.py`: REST API for blockchain interaction

### API Endpoints

- `/wallet/generate`: Generate new key pairs
- `/transaction/prepare`: Create and sign transactions
- `/transaction/add`: Add transactions to the mempool
- `/transaction/get_mempool`: View pending transactions
- `/block/mine`: Mine a new block
- `/chain/get`: View the current blockchain
- `/chain/validate`: Verify blockchain integrity
- `/node/connect`: Add new nodes to the network
- `/node/sync`: Synchronize with the longest valid chain
- `/wallet/balance/<address>`: Get wallet balance

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher

### Backend Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the backend server:

```bash
python src/app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NODE_ENV=development
```

4. Start the development server:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app.py              # Main application and API endpoints
├── models/
│   ├── Blockchain.py   # Core blockchain implementation
│   ├── Block.py        # Block structure
│   ├── Transaction.py  # Transaction handling
│   └── UTXO.py         # UTXO management
├── nodes/              # Node implementations
├── tools/              # Utility functions
└── datas/              # Data storage

frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and other services
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Application entry point
└── package.json       # Frontend dependencies
```

## Features Implemented

### ✅ Implemented

- UTXO-based transaction model
- Proof of Work consensus
- Cryptographic address generation
- Transaction signing and verification
- Block mining and validation
- Network synchronization
- Mining rewards with halving
- Transaction fees
- Mempool management
- Double-spend prevention
- Fee collection for miners
- UTXO set synchronization

### ❌ Not Implemented

- Smart Contracts
- Privacy features (like zero-knowledge proofs)
- Alternative consensus mechanisms (PoS, DPoS)
- Lightning Network
- Cross-chain interoperability
- Token standards (like ERC-20)

## Security Considerations

- This is an educational implementation and should not be used in production without proper security audits
- The implementation focuses on demonstrating concepts rather than production-grade security
- Real-world cryptocurrencies require additional security measures and optimizations

## Contributing

Feel free to submit issues and enhancement requests!
