# 00 Importing Modules
import sys
import os
# Add the src directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from models.Blockchain import BlockChain
from tools.GenerateKeys import generate_key_pair
from models.Transaction import Transaction
from models.UTXO import UTXO
import models.Block as Block

# 01 Importing Flask and JSONify Modules
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('blockchain.log'),
        logging.StreamHandler()
    ]
)

# Create logger
logger = logging.getLogger(__name__)

def create_app(port):
    app = Flask(__name__)
    
    # Enable CORS for all routes
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    blockChain = BlockChain()

    # Part - 00 Add transactions to the mempool (Users can trade and add their transaction into mempool)

    @app.route('/wallet/generate', methods=['GET', 'OPTIONS'])
    def generate_keys():
        if request.method == 'OPTIONS':
            return make_response()
            
        try:
            # Generate new key pair
            private_key_bytes, public_key_bytes = generate_key_pair()
            
            # Generate address from public key bytes
            address = blockChain.generate_address(public_key_bytes)
            
            response = {
                'private_key': private_key_bytes.hex(),
                'public_key': public_key_bytes.hex(),
                'address': address
            }
            return jsonify(response), 200
        except Exception as e:
            logger.error(f"Error generating keys: {str(e)}")
            return jsonify({'error': str(e)}), 500
        
    @app.route('/transaction/prepare', methods=['POST'])
    def prepare_transaction():
        json = request.get_json()
        logger.info(f"Received prepare_transaction request: {json}")

        # Get sender's address and private key
        sender_address = json.get('sender_address')
        sender_private_key = json.get('sender_private_key')
        outputs = json.get('outputs', [])
        fee = json.get('fee', 0)  # Get fee from request, default to 0

        if not sender_address or not sender_private_key or not outputs:
            return 'Missing required fields: sender_address, sender_private_key, and outputs', 400

        try:
            # Create new transaction
            transaction = Transaction()

            # Get available UTXOs for the sender
            available_utxos = [
                utxo for utxo in blockChain.utxo_set.values()
                if utxo.owner_address == json['sender_address'] and not utxo.spent
            ]

            logger.info(f"Available UTXOs: {available_utxos}")
            
            # Calculate total available amount
            total_available = sum(utxo.amount for utxo in available_utxos)
            total_needed = sum(output['amount'] for output in outputs) + fee  # Include fee in total needed
            
            if total_available < total_needed:
                return f'Insufficient funds. Available: {total_available}, Needed: {total_needed} (including fee: {fee})', 400
            
            # Check if any UTXO is already in use in the mempool
            for utxo in available_utxos:
                for mempool_tx in blockChain.mempool:
                    for input_utxo in mempool_tx.inputs:
                        if input_utxo.tx_id == utxo.tx_id and input_utxo.output_index == utxo.output_index:
                            return f'UTXO {utxo.tx_id}:{utxo.output_index} is already in use in a pending transaction', 400
            
            # Add inputs (UTXOs) to the transaction
            remaining_amount = total_needed
            for utxo in available_utxos:
                if remaining_amount <= 0:
                    break
                transaction.add_input(utxo)
                remaining_amount -= utxo.amount
            
            # Add outputs to the transaction
            for output in outputs:
                transaction.add_output(UTXO(
                    amount=output['amount'],
                    owner_address=output['address']
                ))
            
            # Add fee output if fee is specified
            if fee > 0:
                transaction.add_output(UTXO(
                    amount=fee,
                    owner_address="miner_fee"  # This will be replaced by the actual miner's address when the block is mined
                ))
            
            # Add change output if there's remaining amount
            if remaining_amount < 0:  # If we used more than needed
                change_amount = abs(remaining_amount)
                transaction.add_output(UTXO(
                    amount=change_amount,
                    owner_address=json['sender_address']  # Send change back to sender
                ))
            
            # Sign the transaction
            transaction.sign(json['sender_private_key'])
            
            # Update transaction metadata
            transaction.fee = fee  # Set the fee
            transaction.update_size()
            logger.info(f"Transaction : {transaction}")

            response = {
                'transaction_id': transaction.tx_id,
                'fee': transaction.fee,
                'size': transaction.size,
                'signature': transaction.signature.hex(),
                'inputs': [
                    {
                        'tx_id': utxo.tx_id,
                        'output_index': utxo.output_index,
                        'amount': utxo.amount
                    } for utxo in transaction.inputs
                ],
                'outputs': [
                    {
                        'address': utxo.owner_address,
                        'amount': utxo.amount
                    } for utxo in transaction.outputs
                ]
            }
            return jsonify(response), 200

        except Exception as e:
            logger.error(f"Error preparing transaction: {str(e)}", exc_info=True)
            return f'Error preparing transaction: {str(e)}', 400

    @app.route('/transaction/add', methods=['POST'])
    def add_transaction():
        json = request.get_json()
        logger.info(f"Received add_transaction request: {json}")
        required_keys = [ 'signature', 'public_key', 'inputs', 'outputs']
        if not all(key in json for key in required_keys):
            return 'Missing required fields: transaction_id, signature, inputs, and outputs', 400

        try:
            # Create transaction from the signed data
            transaction = Transaction()
            transaction.signature = bytes.fromhex(json['signature'])
            transaction.sender_public_key_hex = json['public_key']  # Add public key to transaction
            
            # Add inputs
            for input_data in json['inputs']:
                logger.info(f"Processing input: {input_data}")
                utxo = blockChain.get_utxo(input_data['tx_id'], input_data['output_index'])
                if not utxo:
                    return f'Input UTXO not found: {input_data["tx_id"]}:{input_data["output_index"]}', 400
                logger.info(f"Found UTXO: {utxo}")
                transaction.add_input(utxo)
            
            # Add outputs
            for output_data in json['outputs']:
                logger.info(f"Processing output: {output_data}")
                transaction.add_output(UTXO(
                    amount=output_data['amount'],
                    owner_address=output_data['address']
                ))
            
            # Update transaction metadata
            transaction.update_fee()
            transaction.update_size()
            
            # Add to mempool
            if blockChain.add_transaction(transaction):
                response = {
                    'message': 'Transaction added to mempool',
                    'transaction_id': transaction.tx_id
                }
                return jsonify(response), 201
            else:
                return 'Failed to add transaction to mempool', 400
                
        except Exception as e:
            logger.error(f"Error processing transaction: {str(e)}", exc_info=True)
            return f'Error processing transaction: {str(e)}', 400

    @app.route('/transaction/get_mempool', methods=['GET'])
    def get_mempool():
        try:
            # Convert each transaction in the mempool to a dictionary format
            mempool_transactions = []
            for tx in blockChain.mempool:
                tx_dict = {
                    'tx_id': tx.tx_id,
                    'timestamp': tx.timestamp,
                    'fee': tx.fee,
                    'size': tx.size,
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
                }
                mempool_transactions.append(tx_dict)

            response = {
                'message': 'Successfully retrieved mempool transactions',
                'count': len(mempool_transactions),
                'transactions': mempool_transactions
            }
            return jsonify(response), 200

        except Exception as e:
            logger.error(f"Error retrieving mempool: {str(e)}", exc_info=True)
            return f'Error retrieving mempool: {str(e)}', 500
    # Part - 01 Mining a Block (Miners can mine a block and add it to the blockchain)

    @app.route('/block/mine', methods=['POST'])
    def mine_block():
        json = request.get_json()
        if not json or 'miner_address' not in json:
            return 'Miner address is required', 400

        miner_address = json['miner_address']

        # Check if there are any transactions in the mempool
        if not blockChain.mempool:
            return jsonify({
                'error': 'No transactions in mempool. Mining empty blocks is not allowed.'
            }), 400

        previous_block = blockChain.get_previous_block().to_dict()
        previous_proof = previous_block['proof']
        previous_hash = blockChain.hash(previous_block)

        # Proof of Work where the proof is the nonce. The miners need to consume the computational power to find the proof
        proof = blockChain.proof_of_work(previous_proof)

        block = blockChain.create_block(proof, previous_hash, miner_address).to_dict()

        response = {
            'message': 'Congratulations, you just mined a block!',
            'index': block['index'],
            'timestamp': block['timestamp'],
            'proof': block['proof'],
            'previous_hash': block['previous_hash'],
            'mining_reward': blockChain.get_current_mining_reward()
        }
        return jsonify(response), 200

    @app.route('/chain/get', methods=['GET'])
    def get_chain():
        response = {
            'chain': [block.to_dict() for block in blockChain.chain],
            'length': len(blockChain.chain)
        }
        return jsonify(response), 200
    
    @app.route('/chain/validate', methods=['GET'])
    def validate_blockChain():
        is_valid = blockChain.is_chain_valid(blockChain.chain)
        if is_valid:
            response = {
                'message': 'The blockChain is valid.'
            }
            return jsonify(response), 200
        response = {
            'message': 'The blockChain is not valid.'
        }
        return jsonify(response), 500

    @app.route('/wallet/balance/<address>', methods=['GET'])
    def get_wallet_balance(address):
        try:
            balance = blockChain.get_balance(address)
            response = {
                'address': address,
                'balance': balance
            }
            return jsonify(response), 200
            
        except Exception as e:
            logger.error(f"Error getting wallet balance: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    # Part - 02 Connecting to other nodes (New miners can connect to the network)
    @app.route('/node/connect', methods = ['POST'])
    def connect_node():
        json = request.get_json()
        nodes = json.get('nodes')
        if nodes is None:
            return "No node", 400
        for node in nodes:
            blockChain.add_node(node)
        response = {'message': 'All the nodes are now connected. The Hadcoin blockChain now contains the following nodes:',
                    'total_nodes': list(blockChain.nodes)}
        return jsonify(response), 201

    @app.route('/node/sync', methods = ['GET'])
    def replace_chain():
        is_chain_replaced = blockChain.replace_chain()
        if is_chain_replaced:
            response = {
                'message': 'The nodes had different chains so the chain was replaced by the longest one.',
                'new_chain': [block.to_dict() for block in blockChain.chain]
            }
        else:
            response = {
                'message': 'All good. The chain is the largest one.',
                'actual_chain': [block.to_dict() for block in blockChain.chain]
            }
        return jsonify(response), 200

    return app

if __name__ == '__main__':
    app = create_app(5000)
    app.run()