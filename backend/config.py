# This file sets up Flask, CORS, and the SQLite database (mydatabase.db)
from flask import Flask
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)   # Initialize Flask App

# Enable CORS for React frontend (localhost:5173) to talk to Flask (localhost:5000)
CORS(app)               

# Specify the location of the SQLite database on your machine
# Ensure instance folder exists and use an absolute path for SQLite to avoid "unable to open database file" errors
os.makedirs(app.instance_path, exist_ok=True)
db_file = os.path.join(app.instance_path, 'mydatabase.db')
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Create a database instance for our app to use in models.py and main.py
db = SQLAlchemy(app)