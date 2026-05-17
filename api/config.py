# This file sets up Flask, CORS, and the SQLite database
from flask import Flask
import os
import tempfile
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app)               

# Check if we are running on Vercel
is_vercel = os.environ.get("VERCEL") == "1"
database_url = os.environ.get("DATABASE_URL") # For future Postgres upgrades

if database_url:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
elif is_vercel:
    # On Vercel, use the /tmp directory (the only writable folder)
    db_file = os.path.join(tempfile.gettempdir(), 'mydatabase.db')
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"
else:
    # On Localhost, use the instance folder like normal
    os.makedirs(app.instance_path, exist_ok=True)
    db_file = os.path.join(app.instance_path, 'mydatabase.db')
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Create a database instance
db = SQLAlchemy(app)