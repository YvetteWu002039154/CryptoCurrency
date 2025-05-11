# 00 Importing Modules
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from src.app import create_app

if __name__ == '__main__':
    app = create_app(5002)  # For node2
    app.run(host='0.0.0.0', port=5002)