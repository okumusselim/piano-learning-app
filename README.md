# Piano Pal 🎹

A piano learning web app for beginners (children and adults). Upload sheet music photos → see every note labelled → hear the piece played back → play along with your acoustic piano.

## Features

| Stage | Feature |
|-------|---------|
| 1 | Upload JPG/PNG/PDF sheet music from beginner learning books |
| 1 | AI vision (Claude) recognises and labels every note (C4, D4, etc.) |
| 2 | Converts sheet to MIDI and plays it back with a grand piano sound |
| 3 | Listens via microphone, detects each note you play, gives live feedback |
| 3 | Auto-pauses on wrong notes, slows tempo if you're lagging |

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
  - `opensheetmusicdisplay` — render MusicXML in browser
  - `tone.js` + Salamander Grand Piano soundfont — playback
  - `pitchy` — real-time browser pitch detection
  - `zustand` — state management
  - `framer-motion` — feedback animations
- **Backend**: Python 3.12 + FastAPI
  - `anthropic` (Claude Opus 4.6 vision) — optical music recognition
  - `music21` — MusicXML + MIDI generation
  - `pdf2image` + `Pillow` — PDF/image preprocessing

## Getting Started

### 1. Configure

```bash
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Run with Docker Compose (easiest)

```bash
docker-compose up
```

Frontend: http://localhost:5173
Backend API docs: http://localhost:8000/docs

### 3. Run manually

**Backend:**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # or: source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
# Windows needs poppler installed separately: https://github.com/oschwartz10612/poppler-windows
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
# From project root
npm install
npm run dev
```

## Deployment

- **Frontend** → [Vercel](https://vercel.com): connect repo, set `VITE_API_BASE_URL` to your Railway URL
- **Backend** → [Railway](https://railway.app): connect repo, root dir = `backend/`, set `ANTHROPIC_API_KEY`

The Docker image only requires `poppler-utils` as a system dep — no GPU, no Java runtime.

## Project Structure

```
piano-learning-app/
├── src/                        # React frontend
│   ├── api/client.ts           # Axios API wrappers
│   ├── components/
│   │   ├── upload/             # UploadZone
│   │   ├── sheet/              # SheetViewer + NoteLabel overlays (OSMD)
│   │   ├── player/             # PlaybackBar, TempoControl, PianoKeyboard
│   │   └── playalong/          # PlayAlongMode, FeedbackBadge, PitchMeter
│   ├── hooks/
│   │   ├── useUpload.ts        # Upload + OMR state machine
│   │   ├── usePlayback.ts      # Tone.js transport
│   │   ├── usePitchDetection.ts # Web Audio + pitchy
│   │   └── usePlayAlong.ts     # Pitch vs expected note logic
│   ├── pages/                  # HomePage, SheetPage, PlayPage
│   └── store/musicStore.ts     # Zustand global state
├── backend/
│   └── app/
│       ├── api/endpoints/      # upload.py, omr.py, midi.py, health.py
│       ├── services/           # vision_omr.py, musicxml_builder.py, midi_generator.py
│       └── utils/              # image_utils.py, music_theory.py
└── docker-compose.yml
```

## How It Works

1. **Upload** — file sent to backend, resized and contrast-enhanced
2. **OMR** — Claude vision API reads the sheet image, returns JSON with all notes, durations, measures, key/time signature
3. **MusicXML** — `music21` converts the JSON to standard MusicXML
4. **Note labels** — Pillow draws note name pills on the annotated image; OSMD renders MusicXML interactively with overlaid labels
5. **MIDI** — `music21` exports MIDI; Tone.js Sampler (Salamander Grand Piano) schedules playback
6. **Play-along** — `pitchy` detects pitch from microphone; detected note compared against expected note sequence; transport auto-pauses on wrong notes, slows tempo if lagging
