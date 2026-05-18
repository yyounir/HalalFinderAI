# HalalChecker AI
HalalChecker AI is a Python-based application powered by the Gemini API, designed to automate dietary compliance analysis. By instantly evaluating food items and ingredients, it removes uncertainty and delivers clear, reliable Halal verifications for everyday consumers.

## 🍕 Features
- The user can type any food brand, snack, or a food and submit the query to AI which would then answers the user's question
- Users also have the option to upload a photo to submit the query to the AI
- The Gemini AI determines if the given query or picture is halal or not and would display 3 different cards signifying the result along with explanation or advice
- Users can save a specific food to their saved lists which uses CRUD so they can access them later
- Users can install this website as a Progressive Web app, which allows the app more accessible

## 🌐 Try it Out!
https://halal-finder-ai.vercel.app/

## ⚠️ Disclaimer
HalalFinderAI uses Generative AI to analyze ingredients. While it is prompted with expert guidelines, AI can occasionally make mistakes or hallucinate. Users should always double-check responses, read physical labels, and consult official Halal certification authorities if they are unsure.

## 💻 Tech Stack
Backend: Python with Flask<br>
Databases: SQLite using CRUD <br>
AI Model: Gemini 2.5 Flash<br>
Frontend: React+Vite, Tailwind.css, Progressive Web App (PWA), CSS, JavaScript, Node.js

## 📁 Project Structure
```
HalalFinderAI/
├── api/
├── backend/
│   ├── config.py                   # Sets up Flask, CORS, and the SQLite database
│   ├── main.py                     # Contains API routes
│   └── models.py                   # Handles Database model
├── frontend/
│   ├── public (folder)             # Contains favicon
│   ├── src (folder)                # Contains assets and components to render
│   ├── index.html                  # Sets up Flask, CORS, and the SQLite database
│   ├── package.json                # Package manager from npms
│   ├── tailwindconfig.js           # Configure tailwind
│   ├── main.py                     # Contains API routes
│   └── vite.config.js              # Configures Vite
├── node_modules/        
└── README.md
```

## 🚀 Backend Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
2. Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # Mac/Linux
    python3 -m venv .venv
    source .venv/bin/activate
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
4. Create a .env file in the backend folder and add your Gemini API Key:
    ```bash
    GEMINI_API_KEY=your_actual_api_key_here
5. Start the Flask server:
    ```bash
    python main.py
    # The backend should now be running on http://127.0.0.1:5000.
## 🚀 Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
    ```bash
    cd frontend
2. Install the Node dependencies:
    ```bash
    npm install
3. Start the Vite development server:
    ```bash
    npm run dev
4. Open your browser and navigate to the local URL provided by Vite (usually http://localhost:5173).

## 🗃️ Frontend Features
### Check Page
- The default page, where the user can type or send a picture to the AI
- AI response are made from Gemini 2.5 Flash, which returns a response in json format where it shows three flags: Haram, Uncertain, Halal
- Reminds users to consult to official sites to verify information
- The user can save a response to use it later in the saves page for a quick reference, marked in the database

### Saved Page
- Used for when the user decides to save a food item that has already been responded by the AI 
- The user has options to rename, delete an item to their preference

### 💡 Tips
- Shows general tips which guides users into making smart choices when choosing products.

## 🗯️ Problems Faced / Possible Issues
- During my time testing this app on localhost, inserting an image on the deployment side does not display properly, sometimes returning as a default placeholder image when it fails to load.
- Many commits were made when trying to make the frontend/backend functional through Vercel which costed too much time to debug
- Saving foods would never save to the list when running on localhost, which I had no choice but to deploy to see the final result
- In one commit, the entire layout for the app wasn't user responsive and was completely different from what was originally developed
- Too much AI requests would cause it to not respond at all or reach its limit much sooner, which would especially delay testing a new AI-powered features

## 🌐 Future Enhancements
- Cleaner design interface throughout the app including responsive clicks/taps
- Mobile friendly design
- More tips along with cleaner pictures
- More AI-powered features

## 👥 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test throughly
5. Submit a pull request

## 📄 License
This project is open-source and available under the MIT License.

## Associated with
CMP 343 - Full Stack Web Development<br>
CUNY Lehman College - Spring 2026