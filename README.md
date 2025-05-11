# Cryptocurrency Blockchain Implementation

This project is a Python-based implementation of a cryptocurrency blockchain system that demonstrates core blockchain concepts and features. It provides a practical example of how blockchain technology works, including transaction processing, mining, and network synchronization.

## Core Features

### 1. Transaction System

- **UTXO (Unspent Transaction Output) Model**: Implements Bitcoin-style UTXO model for transaction handling
- **Transaction Verification**: Validates transactions using cryptographic signatures
- **Fee System**: Supports transaction fees for miners
- **Mempool Management**: Handles pending transactions before they are included in blocks

### 2. Mining System

- **Proof of Work**: Implements a mining mechanism with adjustable difficulty
- **Block Creation**: Creates new blocks with verified transactions
- **Mining Rewards**: Implements a halving mechanism similar to Bitcoin (halving every 210,000 blocks)
- **Block Size Limit**: Enforces a maximum block size of 1500 units

### 3. Network Features

- **Node Communication**: Supports peer-to-peer node communication
- **Chain Synchronization**: Implements blockchain synchronization between nodes
- **Consensus Mechanism**: Ensures all nodes maintain the same valid blockchain

### 4. Security Features

- **Cryptographic Addresses**: Generates secure addresses using SHA256 and RIPEMD160
- **Digital Signatures**: Uses ECDSA for transaction signing
- **Chain Validation**: Verifies the integrity of the blockchain

## Technical Implementation

### Key Components

- `Blockchain.py`: Core blockchain implementation
- `Block.py`: Block structure and validation
- `Transaction.py`: Transaction handling and verification
- `UTXO.py`: Unspent Transaction Output management
- `app.py`: REST API for blockchain interaction

### API Endpoints

- `/generate_keys`: Generate new key pairs
- `/prepare_transaction`: Create and sign transactions
- `/add_transaction`: Add transactions to the mempool
- `/get_mempool`: View pending transactions
- `/mine_block`: Mine a new block
- `/get_chain`: View the current blockchain
- `/validate_chain`: Verify blockchain integrity
- `/connect_node`: Add new nodes to the network
- `/replace_chain`: Synchronize with the longest valid chain

## Concepts Implemented

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

### ❌ Not Implemented

- Smart Contracts
- Privacy features (like zero-knowledge proofs)
- Alternative consensus mechanisms (PoS, DPoS)
- Lightning Network
- Cross-chain interoperability
- Token standards (like ERC-20)

## Getting Started

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the application:

```bash
python src/app.py
```

3. The API will be available at `http://localhost:5000`

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
```

## Security Considerations

- This is an educational implementation and should not be used in production without proper security audits
- The implementation focuses on demonstrating concepts rather than production-grade security
- Real-world cryptocurrencies require additional security measures and optimizations

## Contributing

Feel free to submit issues and enhancement requests!
