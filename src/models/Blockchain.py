# Importing Modules
from models.Transaction import Transaction
from models.Block import Block
from models.UTXO import UTXO

# Importing Cryptography Modules
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

# 02 Importing Hashlib and Base58 Modules
import hashlib
import base58

# 03 Importing Networking Modules
import json
from urllib.parse import urlparse
import requests

# 04 Importing Data and Type Modules
import datetime
from typing import List, Dict, Optional

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('blockchain.log'),
        logging.StreamHandler()  # This will also print to console
    ]
)

# Create logger
logger = logging.getLogger(__name__)

class BlockChain:
    BLOCK_SIZE_LIMIT = 1500
    INITIAL_MINING_REWARD = 50  
    HALVING_INTERVAL = 210000 

    def __init__(self):
        self.chain = []
        self.mempool: List[Transaction] = []  # Pending transactions
        self.utxo_set: Dict[str, UTXO] = {}  # Map of UTXO ID to UTXO
        self.nodes = set()

        genesis_utxo = UTXO(
            tx_id="genesis",
            output_index=0,
            amount=1000000,  # Initial supply
            owner_address="genesis_address"
        )
        self.add_utxo(genesis_utxo)

        # Create initial transaction using genesis UTXO
        initial_tx = Transaction()
        initial_tx.tx_id = "genesis"
        initial_tx.add_input(genesis_utxo)  # Use the genesis UTXO as input
        initial_tx.add_output(UTXO(
            amount=1000000,
            owner_address="genesis_address"
        ))
        initial_tx.update_fee()
        initial_tx.update_size()

        self.add_transaction(initial_tx)

        self.create_block(proof=1, previous_hash='0')

    # The Part - 00 UTXOs and Transactions

    # UTXOs

    def get_utxo_id(self, tx_id: str, output_index: int) -> str:
        """Generate a unique ID for a UTXO"""
        return f"{tx_id}:{output_index}"

    def add_utxo(self, utxo: UTXO) -> None:
        """Add a UTXO to the UTXO set"""
        utxo_id = self.get_utxo_id(utxo.tx_id, utxo.output_index)
        self.utxo_set[utxo_id] = utxo

    def spend_utxo(self, tx_id: str, output_index: int) -> bool:
        """Mark a UTXO as spent"""
        utxo_id = self.get_utxo_id(tx_id, output_index)
        if utxo_id in self.utxo_set:
            self.utxo_set[utxo_id].spent = True
            return True
        return False

    def get_utxo(self, tx_id: str, output_index: int) -> Optional[UTXO]:
        """Get a UTXO from the UTXO set"""
        utxo_id = self.get_utxo_id(tx_id, output_index)
        return self.utxo_set.get(utxo_id)

    def get_balance(self, address: str) -> float:
        """Get the balance of an address"""
        balance = 0.0
        for utxo in self.utxo_set.values():
            if utxo.owner_address == address and not utxo.spent:
                balance += utxo.amount
        return balance

    # Transactions

    # Users can trade and add their transaction into mempool.
    def verify_transaction_inputs(self, transaction: Transaction):
        for input_utxo in transaction.inputs:
            # Check if UTXO exists in our UTXO set
            utxo = self.get_utxo(input_utxo.tx_id, input_utxo.output_index)
            if not utxo:
                return False
            # Check if UTXO is spent
            if utxo.spent:
                return False
        return True
    
    def add_transaction(self, transaction: Transaction) -> bool:
        if transaction.tx_id == "genesis":
            self.mempool.append(transaction)
            return True

        # Check if transaction with same signature already exists in mempool
        for existing_tx in self.mempool:
            if existing_tx.signature == transaction.signature:
                logger.error(f"Transaction with same signature already exists in mempool: {transaction.tx_id}")
                return False

        if not self.verify_transaction_inputs(transaction):
            logger.error(f"Transaction inputs verification failed for transaction: {transaction.tx_id}")
            return False
        if not transaction.verify_total_amount():
            logger.error(f"Transaction total amount verification failed for transaction: {transaction.tx_id}")
            return False
        if not transaction.verify_signature():
            logger.error(f"Transaction signature verification failed for transaction: {transaction.tx_id}")
            return False
        self.mempool.append(transaction)
        return True

    # Part - 01 Cryptography Functions

    # Encode and hash the block
    def hash(self, block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    # Generate a blockchain address from a public key
    def generate_address(self, public_key: bytes) -> str:
        """Generate a blockchain address from a public key"""
        # First hash the public key with SHA256
        sha256_hash = hashlib.sha256(public_key).digest()
        # Then hash with RIPEMD160
        ripemd160_hash = hashlib.new('ripemd160', sha256_hash).digest()
        # Add version byte (0x00 for Bitcoin)
        version_ripemd160_hash = b'\x00' + ripemd160_hash
        # Double SHA256 for checksum
        double_sha256 = hashlib.sha256(hashlib.sha256(version_ripemd160_hash).digest()).digest()
        # Take first 4 bytes of checksum
        checksum = double_sha256[:4]
        # Combine version + ripemd160hash + checksum
        binary_address = version_ripemd160_hash + checksum
        # Base58 encode
        address = base58.b58encode(binary_address).decode('utf-8')
        return address

    # Part - 02 Immutable Ledger Functions

    def get_current_mining_reward(self) -> float:
        """Calculate the current mining reward based on the current block height"""
        if not self.chain: 
            return self.INITIAL_MINING_REWARD
            
        current_height = len(self.chain)
        # Calculate how many halvings have occurred
        halvings = current_height // self.HALVING_INTERVAL
        
        # Calculate reward after halvings
        reward = self.INITIAL_MINING_REWARD / (2 ** halvings)
        
        # Ensure reward doesn't go below a minimum value (optional)
        return max(reward, 0.00000001)  # Minimum reward of 0.00000001

    # Select transactions for a block
    def select_transactions_for_block(self):
        # Sort mempool by fee (higher fee first)
        sorted_mempool = sorted(self.mempool, key=lambda x: x.fee, reverse=True)
        
        selected_transactions = []
        current_block_size = 0
        
        for transaction in sorted_mempool:
            if current_block_size + transaction.size <= self.BLOCK_SIZE_LIMIT:
                selected_transactions.append(transaction)
                current_block_size += transaction.size
            else:
                break

        return selected_transactions
    
    # Create a block
    def create_block(self, proof, previous_hash, miner_address=None):
        # Check if this is the genesis block
        is_genesis = previous_hash == '0'

        if is_genesis:
            # Create a copy of mempool transactions to prevent reference issues
            all_transactions = self.mempool.copy()
        else:
            # Create coinbase transaction (mining reward)
            coinbase_tx = Transaction()
            current_reward = self.get_current_mining_reward()
            
            # Calculate total fees from selected transactions
            selected_transactions = self.select_transactions_for_block()
            total_fees = sum(tx.fee for tx in selected_transactions)
            
            # Add mining reward and fees to coinbase transaction
            coinbase_tx.add_output(UTXO(
                amount=current_reward + total_fees,
                owner_address=miner_address
            ))
            coinbase_tx.fee = 0
            coinbase_tx.update_size()

            # Add coinbase transaction as the first transaction
            all_transactions = [coinbase_tx] + selected_transactions

        # Process transactions and update UTXO set
        for tx in all_transactions:
            # Add new UTXOs from outputs
            for i, output_utxo in enumerate(tx.outputs):
                # Skip miner fee outputs as they're included in the coinbase transaction
                if output_utxo.owner_address == "miner_fee":
                    continue
                output_utxo.tx_id = tx.tx_id
                output_utxo.output_index = i
                self.add_utxo(output_utxo)

            # Spend UTXOs from inputs
            if not is_genesis and tx != coinbase_tx:
                for input_utxo in tx.inputs:
                    self.spend_utxo(input_utxo.tx_id, input_utxo.output_index)

        block = Block(
            index=len(self.chain) + 1,
            proof=proof,
            previous_hash=previous_hash,
            transactions=all_transactions
        )

        self.chain.append(block)

        # Remove transactions from mempool regardless of whether it's genesis or not
        for tx in all_transactions:
            if tx in self.mempool:  # Only remove if it's in the mempool
                self.mempool.remove(tx)

        return block

    # Get the previous block
    def get_previous_block(self):
        return self.chain[-1]

    # Check if a chain is valid
    def is_chain_valid(self, chain):
        # Convert first block to dict if it's a Block object
        previous_block = chain[0].to_dict() if hasattr(chain[0], 'to_dict') else chain[0]
        block_index = 1

        while block_index < len(chain):
            # Convert current block to dict if it's a Block object
            block = chain[block_index].to_dict() if hasattr(chain[block_index], 'to_dict') else chain[block_index]
            if block['previous_hash'] != self.hash(previous_block):
                return False
            previous_proof = previous_block['proof']
            proof = block['proof'] # will be caculated by the proof_of_work function
            hash_operation = hashlib.sha256(str(proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] != '0000':
                return False
            previous_block = block
            block_index += 1
        return True
    
    # Part - 03 Consensus Protocol Functions

    # Proof of Work
    def proof_of_work(self,previous_proof):
        new_proof = 1
        check_proof = False
        while not check_proof:
            hash_operation = hashlib.sha256(str(new_proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] == '0000':
                check_proof = True
            else:
                new_proof += 1
        return new_proof
    
    # Part - 04 Distributed P2P Network Functions
    
    # Add a node to the network
    def add_node(self, address):
        parsed_url = urlparse(address)
        self.nodes.add(parsed_url.netloc)
        return len(self.nodes)

    # Sync UTXO set with a given chain and mempool
    def sync_utxo_set(self, chain: List[Block]) -> None:
        """Sync UTXO set with a given chain and mempool"""
        # Clear current UTXO set
        self.utxo_set.clear()
        
        # First process all transactions in the chain
        for block in chain:
            # Convert block to dict if it's a Block object
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            for tx in block_dict['transactions']:
                # Add output UTXOs
                for i, output in enumerate(tx['outputs']):
                    utxo = UTXO(
                        tx_id=tx['tx_id'],
                        output_index=i,
                        amount=output['amount'],
                        owner_address=output['owner_address']
                    )
                    self.add_utxo(utxo)

                # Mark input UTXOs as spent
                for input_utxo in tx['inputs']:
                    self.spend_utxo(input_utxo['tx_id'], input_utxo['output_index'])
                
        # Then process all transactions in the mempool
        for tx in self.mempool:
            # Add output UTXOs
            for i, output_utxo in enumerate(tx.outputs):
                output_utxo.tx_id = tx.tx_id
                output_utxo.output_index = i
                self.add_utxo(output_utxo)

            # Mark input UTXOs as spent
            for input_utxo in tx.inputs:
                self.spend_utxo(input_utxo.tx_id, input_utxo.output_index)

    # Sync mempool with a given chain
    def sync_mempool(self, chain: List[Block]) -> None:
        """Sync mempool with a given chain"""
        # Remove transactions that are already in the chain
        confirmed_tx_ids = {tx.tx_id for block in chain for tx in block.transactions}
        self.mempool = [tx for tx in self.mempool if tx.tx_id not in confirmed_tx_ids]
        
        # Remove transactions with spent inputs
        valid_transactions = []
        for tx in self.mempool:
            if self.verify_transaction_inputs(tx):
                valid_transactions.append(tx)
        self.mempool = valid_transactions

    def sync_with_chain(self, chain: List[Block]) -> None:
        """Sync both UTXO set and mempool with a given chain"""
        self.sync_mempool(chain)
        self.sync_utxo_set(chain)

    # Replace the chain with the longest chain from the network
    def replace_chain(self):
        network = self.nodes
        longest_chain = None
        max_length = len(self.chain)
        for node in network:
            response = requests.get(f'http://{node}/get_chain')
            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']
                if length > max_length and self.is_chain_valid(chain):
                    max_length = length
                    longest_chain = chain
        if longest_chain:
            # Convert dictionary blocks to Block objects
            block_objects = []
            for block_dict in longest_chain:
                # Convert transactions from dictionaries to Transaction objects
                transactions = []
                for tx_dict in block_dict['transactions']:
                    tx = Transaction()
                    tx.tx_id = tx_dict['tx_id']
                    tx.timestamp = tx_dict['timestamp']
                    tx.fee = tx_dict['fee']
                    tx.update_size()
                    tx.signature = bytes.fromhex(tx_dict['signature']) if tx_dict['signature'] else None
                    tx.sender_public_key_hex = tx_dict['public_key']
                    
                    # Convert inputs
                    for input_dict in tx_dict['inputs']:
                        utxo = UTXO(
                            tx_id=input_dict['tx_id'],
                            output_index=input_dict['output_index'],
                            amount=input_dict['amount'],
                            owner_address=input_dict['owner_address']
                        )
                        tx.add_input(utxo)
                    
                    # Convert outputs
                    for output_dict in tx_dict['outputs']:
                        utxo = UTXO(
                            amount=output_dict['amount'],
                            owner_address=output_dict['owner_address']
                        )
                        tx.add_output(utxo)
                    
                    transactions.append(tx)

                block = Block(
                    index=block_dict['index'],
                    proof=block_dict['proof'],
                    previous_hash=block_dict['previous_hash'],
                    transactions=transactions
                )
                block_objects.append(block)
            
            # First sync mempool and UTXO set with the new chain
            self.sync_with_chain(block_objects)
            # Then update our chain
            self.chain = block_objects
            return True
        return False

    # The Part - 05 Mining Functions


    
    

    