from datetime import datetime

class UTXO:
    def __init__(self,amount: float, owner_address: str, tx_id: str = None, output_index: int = None):
        self.timestamp: str = str(datetime.now())
        self.amount: float = amount
        self.owner_address = owner_address
        self.tx_id = tx_id
        self.output_index = output_index
        self.spent = False
    def to_dict(self):
        """Convert UTXO to dictionary for JSON serialization"""
        return {
            'timestamp': self.timestamp,
            'amount': self.amount,
            'owner_address': self.owner_address,
            'tx_id': self.tx_id,
            'output_index': self.output_index,
            'spent': self.spent
        }
