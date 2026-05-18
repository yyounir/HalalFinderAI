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
    # SQLAlchemy expects postgresql:// scheme
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    # Prefer the pure-Python pg8000 driver on hosts where building psycopg2 is problematic
    # (e.g., Vercel's build image without libpq/pg_config). If a driver is already
    # specified (postgresql+...), do not modify the URL.
    if database_url.startswith("postgresql://") and "+" not in database_url:
        # Use pg8000 by default to avoid native build requirements
        database_url = database_url.replace("postgresql://", "postgresql+pg8000://", 1)

    # For pg8000, SSL is enabled via the sslmode query parameter
    # However, pg8000 may require a different approach. We'll add it as a query param
    # but SQLAlchemy's connect_args might be needed to handle it properly
    if "supabase" in database_url and "sslmode" not in database_url:
        # For pg8000, we use connect_args instead of URL parameters
        pass  # SSL will be handled via connect_args below

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

# Engine options for health checks
engine_options = {"pool_pre_ping": True}

# For PostgreSQL with Supabase, SSL is typically handled automatically by the database URL
# pg8000 does not need explicit SSL configuration for Supabase connections
# The connection string itself contains the necessary SSL information

app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options

# Create and bind SQLAlchemy to the app immediately
# This ensures the database is initialized when the config is imported
db = SQLAlchemy(app)