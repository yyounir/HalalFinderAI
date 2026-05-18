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

    # Ensure SSL for Supabase/Postgres if not specified
    if "supabase" in database_url and "sslmode" not in database_url:
        # append sslmode=require preserving existing query params
        if "?" in database_url:
            database_url = database_url + "&sslmode=require"
        else:
            database_url = database_url + "?sslmode=require"

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

# Optional engine options to keep connections healthy on hosted Postgres
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}

# Create a SQLAlchemy object here but don't bind to the app yet.
# Binding (db.init_app) happens in api/main.py so we can handle
# initialization errors (missing drivers, bad DATABASE_URL) without
# double-registering the extension on the Flask app.
db = SQLAlchemy()