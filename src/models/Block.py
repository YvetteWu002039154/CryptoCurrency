# 00 Importing Data and Type Modules
from typing import List
from datetime import datetime

# 01 Importing Modules
from models.Transaction import Transaction

class Block:
    def __init__(self, index: int, proof: int, previous_hash: str, transactions: List[Transaction]):
        self.index = index
        self.timestamp = str(datetime.now())
        self.proof = proof
        self.previous_hash = previous_hash
        self.transactions = transactions
        self.block_size = sum(tx.size for tx in transactions)

    def to_dict(self):
        """Convert block to dictionary for JSON serialization"""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'proof': self.proof,
            'previous_hash': self.previous_hash,
            'transactions': [
                {
                    'tx_id': tx.tx_id,
                    'timestamp': tx.timestamp,
                    'fee': tx.fee,
                    'signature': tx.signature.hex() if tx.signature else None,
                    'public_key': tx.sender_public_key_hex,
                    'inputs': [
                        {
                            'tx_id': utxo.tx_id,
                            'output_index': utxo.output_index,
                            'amount': utxo.amount,
                            'owner_address': utxo.owner_address
                        } for utxo in tx.inputs
                    ],
                    'outputs': [
                        {
                            'amount': utxo.amount,
                            'owner_address': utxo.owner_address
                        } for utxo in tx.outputs
                    ]
                } for tx in self.transactions
            ],
            'block_size': self.block_size
        }

