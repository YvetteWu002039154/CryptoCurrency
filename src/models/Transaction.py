# 00 Importing Modules
from models.UTXO import UTXO

# 01 Importing Cryptography Modules
from cryptography.hazmat.primitives.serialization import load_der_private_key
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

# 02 Importing Hashlib and Base58 Modules
import hashlib
from datetime import datetime 
from uuid import uuid4

# 03 Importing Data and Type Modules
from typing import List, Optional

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

class Transaction:
    def __init__(self):
        self.inputs: List[UTXO] = []
        self.outputs: List[UTXO] = []
        self.timestamp: str = str(datetime.now())
        self.tx_id: str = hashlib.sha256(
            f"{self.timestamp}{uuid4()}".encode()
        ).hexdigest()
        self.fee = 0
        self.signature = None
        self.sender_public_key_hex = None 
        self.size = 0
    
    # Part - 01 String Representation Functions

    def __str__(self) -> str:
        """Return a string representation of the transaction"""
        return (
            f"Transaction ID: {self.tx_id}\n"
            f"Timestamp: {self.timestamp}\n"
            f"Fee: {self.fee}\n"
            f"Signature: {self.signature.hex() if self.signature else None}\n"
            f"Public Key: {self.sender_public_key_hex}\n"  # Add public key to string representation
            f"Inputs:\n{self._format_utxos(self.inputs)}\n"
            f"Outputs:\n{self._format_utxos(self.outputs)}"
        )

    def _format_utxos(self, utxos: List[UTXO]) -> str:
        """Helper method to format UTXOs in a readable way"""
        if not utxos:
            return "  None"
        return "\n".join(f"  {i+1}. {utxo}" for i, utxo in enumerate(utxos))

    # Part - 02 Transaction Functions

    def add_input(self, utxo: UTXO) -> bool:
        """Add an input to the transaction"""
        # Check if UTXO is already spent
        if utxo.spent:
            logger.error(f"Cannot add spent UTXO: {utxo.tx_id}:{utxo.output_index}")
            return False
        
        # Check if this UTXO is already in the transaction
        for existing_input in self.inputs:
            if existing_input.tx_id == utxo.tx_id and existing_input.output_index == utxo.output_index:
                logger.error(f"UTXO already added to transaction: {utxo.tx_id}:{utxo.output_index}")
                return False
        
        self.inputs.append(utxo)
        return True

    def add_output(self, utxo: UTXO) -> None:
        """Add an output to the transaction"""
        self.outputs.append(utxo)

    def update_fee(self) -> None:
        input_sum = sum(input_tx.amount for input_tx in self.inputs)
        output_sum = sum(output_tx.amount for output_tx in self.outputs)
        self.fee = input_sum - output_sum

    def update_size(self) -> None:
        self.size = len(str(self))

    def _create_message(self) -> str:
        """Create a consistent message format for signing and verification"""
        # Format inputs
        input_str = "|".join([
            f"{utxo.tx_id}:{utxo.output_index}:{utxo.amount}"
            for utxo in self.inputs
        ])
        
        # Format outputs
        output_str = "|".join([
            f"{utxo.owner_address}:{utxo.amount}"
            for utxo in self.outputs
        ])
        
        # Combine with a distinct separator
        return f"{input_str}||{output_str}"
    
    def sign(self, private_key_hex: str) -> None:
        """Sign the transaction"""
        try:
            # Create the message to sign
            message = self._create_message()
            message_hash = hashlib.sha256(message.encode()).digest()
            
            # Load the private key  
            private_key = load_der_private_key(bytes.fromhex(private_key_hex), password=None)
            
            # Sign the message
            signature = private_key.sign(message_hash, ec.ECDSA(hashes.SHA256()))
            self.signature = signature
            
        except Exception as e:
            logger.error(f"Error during signing: {str(e)}")
            raise

    # Part - 03 Transaction Verification Functions
    def verify_total_amount(self) -> bool:
        """Verify the transaction"""
        # Check if transaction is valid
        if not self.inputs or not self.outputs:
            return False

        # Verify that input amount is greater than or equal to output amount
        input_sum = sum(input_tx.amount for input_tx in self.inputs)
        output_sum = sum(output_tx.amount for output_tx in self.outputs)
        if input_sum < output_sum:
            return False
        # Verify that the fee is correct
        if self.fee < 0:
            return False
        return True
    
    def verify_signature(self) -> bool:
        """Verify the signature using the stored public key"""
        if not self.signature or not self.sender_public_key_hex:
            return False

        try:
            # Create the message to verify using the same format
            message = self._create_message()
            message_hash = hashlib.sha256(message.encode()).digest()
            
            # Convert hex string back to bytes
            public_key_bytes = bytes.fromhex(self.sender_public_key_hex)
            
            # Reconstruct the public key object
            public_key = ec.EllipticCurvePublicKey.from_encoded_point(
                ec.SECP256K1(), public_key_bytes
            )
            
            # Verify the signature
            public_key.verify(self.signature, message_hash, ec.ECDSA(hashes.SHA256()))
            return True

        except Exception as e:
            logger.error(f"Signature verification failed with error: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            return False