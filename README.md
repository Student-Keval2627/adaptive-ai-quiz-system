# NeuraQuiz

NeuraQuiz is a full-stack adaptive learning platform built with React, Flask,
and MongoDB. It tracks each learner's history, prioritizes unseen questions,
adapts difficulty, reports weak topics, and issues subject certificates.

## Question bank

- 25 subjects
- 1,000 stored questions per subject
- 300 Low (`Easy`), 400 Mid (`Medium`), and 300 High (`Hard`)
- 25,000 raw JSON records and 25,000 MongoDB question records
- Correctly answered questions are not served again in the same bank version
- Incorrectly answered questions can return after unseen questions are exhausted
- Every question has four unique options and one validated answer

The production bank lives in `server/data/questions`. The materialization script
preserves the curated source questions and creates deterministic scenario-based
assessment instances. Runtime code reads the finished JSON bank directly; it
does not create learner-facing prompt variants.

## Main features

- Registration, login, session authentication, and protected routes
- Adaptive and fixed-difficulty quiz modes
- Backend answer verification and attempt validation
- Per-user question history and duplicate protection
- Topic analytics, weak-topic detection, XP, levels, and streaks
- Low-level milestone after 300 correct Easy questions
- Printable certificate after all 1,000 subject questions are mastered
- Responsive monochrome interface

## Technology

- Client: React 19, Vite, React Router, Lucide React
- Server: Python, Flask, Flask-CORS
- Database: MongoDB with PyMongo

## Local setup

### Backend (PowerShell)

```powershell
cd E:\Quiz
python -m venv .\server\venv
& ".\server\venv\Scripts\Activate.ps1"
python -m pip install -r .\server\requirements.txt
cd .\server
python .\app.py
```

MongoDB defaults to `mongodb://127.0.0.1:27017/` and database
`adaptive_ai_quiz`. Override `MONGO_URI`, `MONGO_DB_NAME`, `SECRET_KEY`,
`FLASK_PORT`, or `FLASK_DEBUG` in `server/.env` when required.

### Frontend (second PowerShell terminal)

```powershell
cd E:\Quiz\client
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/`.

## Verification

Run these commands from the repository root while the virtual environment is
active:

```powershell
python .\server\scripts\verify_question_bank_v2.py
python -m unittest discover -s .\server\tests -v

cd .\client
npm run build
```

The bank verifier fails if a file, subject, question, option, answer, duplicate,
or difficulty count does not match the production contract.

## Rebuilding the JSON bank

```powershell
cd E:\Quiz
python .\server\scripts\materialize_question_bank.py
python .\server\scripts\verify_question_bank_v2.py
```

The materialization command is deterministic and safe to run again on a
complete bank.
