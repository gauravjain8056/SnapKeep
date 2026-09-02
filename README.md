# SnapKeep

A privacy-first information and deadline assistant for students — turn messy circular screenshots into structured action items with AI, search with natural language, and keep your memory clutter-free.


## The Problem

College notices and academic circulars are almost always shared as compressed screenshots on WhatsApp or Telegram groups. Deadlines, fee payment dates, and exam registrations get lost in camera rolls, leading to missed assignments and late fees.

Traditional note apps require manual typing, and generic AI tools keep screenshot files indefinitely on remote servers. 

**SnapKeep solves this with a privacy-first workflow:**
1. Upload a notice screenshot (with an optional personal caption).
2. Gemini Vision extracts structured fields (title, course code, deadline, priority, action).
3. The image buffer is processed in RAM and discarded immediately — zero images stored on disk or cloud storage.
4. Search your saved items using natural English ("What assignments are due this week?"), with automatic 7-day retention grace periods after deadlines pass.


## Key Features

- **Direct Multimodal Extraction:** Uses Gemini 1.5 Flash to extract complex tabular notices, assignment deadlines, and fee schedules in a single pass without brittle OCR pipelines.
- **Date Ambiguity Guard:** Automatically detects vague relative dates (e.g. *"submit by Friday"*, *"next week"*) and flags them for manual confirmation instead of hallucinating timestamps.
- **In-Memory Privacy:** Screenshots are parsed strictly within memory buffers via Multer and cleared immediately after JSON extraction.
- **Natural Language & Smart Search:** Combines query intent parsing with MongoDB compound indexes and multi-field keyword matching to return relevant items in sub-50ms.
- **AI Answer Synthesis:** Summarizes retrieved notices into a friendly 1–2 sentence direct response for quick student check-ins.
- **Deterministic 7-Day Retention:** Past-deadline items enter a 7-day grace period where students can click **KEEP (+7d)** or let obsolete notices auto-expire cleanly.
- **Redis Query Caching:** Caches natural language query answers in Redis with automatic invalidation when items are created, modified, or confirmed.


## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB with Mongoose ODM
- **Caching:** Redis via `ioredis` (with automatic in-memory fallback for local dev)
- **AI Engine:** Google Gemini (`gemini-1.5-flash`)
- **Authentication:** JWT (Short-lived Access Token in Memory + Refresh Token in HttpOnly Cookie)
- **Containerization:** Docker & Docker Compose


## System Architecture

```
  [ Student Client (React / Vite) ]
                 │
                 │ HTTP (JWT Auth)
                 ▼
     [ Express API Gateway ]
        │                 │
 ┌──────┴──────────┐   ┌──┴────────────────────────┐
 │ Screenshot Flow │   │ Natural Language Query    │
 └──────┬──────────┘   └──┬────────────────────────┘
        ▼                 ▼
   Multer (RAM)     Redis Query Cache (Sub-50ms)
        ▼                 ▼
 Gemini 1.5 Flash   Intent Parser (Structured / Keyword)
        ▼                 ▼
 Ambiguity Guard   MongoDB Compound Index Query
        ▼                 ▼
  MongoDB Store     Gemini Answer Synthesis
 (Buffer Purged)          ▼
                    Student Response
```


## Project Structure

```
SnapKeep/
├── backend/
│   ├── src/
│   │   ├── config/            
│   │   ├── controllers/       
│   │   ├── middleware/        
│   │   ├── models/            
│   │   ├── routes/            
│   │   ├── services/
│   │   │   ├── ai/            
│   │   │   ├── query/         
│   │   │   ├── retention/     
│   │   │   └── cache/         
│   │   └── utils/             
│   ├── tests/                 
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        
│   │   ├── context/           
│   │   ├── pages/             
│   │   └── services/          
│   └── package.json
│
└── docker-compose.yml         
```


## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional — backend includes built-in in-memory fallback)
- Google Gemini API Key ([Get a free key here](https://aistudio.google.com/))

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-username/SnapKeep.git
cd SnapKeep
```

#### Backend Setup:
```bash
cd backend
cp .env.example .env
```
Update `backend/.env` with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/snapkeep
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

#### Frontend Setup:
```bash
cd ../frontend
cp .env.example .env
```


### 2. Run Locally

#### Option A: Running with npm (Recommended for development)

```bash
# In backend directory
npm install
npm run dev

# In frontend directory (separate terminal)
npm install
npm run dev
```

App runs at `http://localhost:5173` (API at `http://localhost:5000`).

#### Option B: Running with Docker Compose

```bash
docker-compose up --build
```



## Engineering Trade-offs & Decisions

1. **Direct Vision vs. OCR Pipeline:**
   Instead of piping screenshots through Tesseract OCR and then feeding raw text into an LLM, SnapKeep sends the image buffer directly to Gemini 1.5 Flash. This preserves table structures, signatures, and highlighted notice boxes that standard OCR tools frequently mangle.

2. **In-Memory Privacy vs. S3 Storage:**
   Most circulars are ephemeral. Uploaded screenshot buffers live only in Node.js RAM during extraction and are garbage-collected immediately once the JSON record is created. No student notices are saved as image files.

3. **Smart Structured & Multi-Field Search vs. High-Dimensional Vectors:**
   For student queries involving specific subject codes (`CS301`, `SE-Lab`), deadlines (`due tomorrow`), and categories, deterministic date filters and compound MongoDB text indexes yield faster and more accurate results without incurring embedding API rate limits or cluster indexing overhead.



## Author

**Gaurav Jain**

B.Tech IT

GitHub: [gauravjain8056](https://github.com/gauravjain8056)
