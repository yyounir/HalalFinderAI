# This file sets up Flask, CORS, and the SQLite database (mydatabase.db)
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)   # Initialize Flask App

# Enable CORS for React frontend (localhost:5173) to talk to Flask (localhost:5000)
CORS(app)               

# Specify the location of the SQLite database on your machine
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Create a database instance for our app to use in models.py and main.py
db = SQLAlchemy(app)