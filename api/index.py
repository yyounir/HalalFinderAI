# Vercel serverless function entry point
# This file is required for Vercel to recognize the Flask app
# Vercel will look for this file and use it as the API handler

import sys
import os

# Ensure the api directory is in the path so we can import our modules
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app from main.py
# The app is configured and the database is initialized when imported
from main import app

# Export the app for Vercel
# Vercel automatically calls this for each request
