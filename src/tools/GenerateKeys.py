# 00 Importing Cryptography Modules
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

# 01 Importing Data and Type Modules
from typing import Dict

def generate_key_pair() -> Dict[str, str]:
    """
    Generate a new key pair (private and public key)
    Returns a dictionary containing the hex-encoded keys
    """
    # Generate private key
    private_key = ec.generate_private_key(ec.SECP256K1())

    # Get public key
    public_key = private_key.public_key()

    # Convert public key to bytes
    public_key_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )

    # Convert private key to bytes
    private_key_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Return dictionary with hex-encoded keys
    return private_key_bytes, public_key_bytes

# Example usage when run directly
if __name__ == "__main__":
    keys = generate_key_pair()
    print(f"Private Key: {private_key_bytes.hex()}")
    print(f"Public Key: {public_key_bytes.hex()}")