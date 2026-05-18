# Vercel serverless function entry point
# This file is required for Vercel to recognize the Flask app
# Vercel will call the app object for each request

import sys
import os

# Ensure the api directory is in the path so we can import our modules
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app from main.py
# The app is configured and the database is initialized when imported
from main import app

# Vercel requires exporting the WSGI app directly as 'app'
# This is automatically detected and used by Vercel's Python runtime
