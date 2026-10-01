# NeuraQuiz

NeuraQuiz is an adaptive learning platform with two supported data modes:

- Firebase-only deployment on the no-cost Spark plan
- Flask and MongoDB for the original local full-stack version

Both modes track learner history, prioritize unseen questions, adapt difficulty,
report weak topics, and issue subject certificates.

## Question bank

- 25 subjects
- 1,000 stored questions per subject
- 300 Low (`Easy`), 400 Mid (`Medium`), and 300 High (`Hard`)
- 25,000 raw JSON records
- Firebase Hosting serves the static question bank in Firebase mode
- MongoDB stores the same 25,000 records in Flask mode
- Correctly answered questions are not served again in the same bank version
- Incorrectly answered questions can return after unseen questions are exhausted
- Every question has four unique options and one validated answer

The production bank lives in `server/data/questions`. The materialization script
preserves the curated source questions and creates deterministic scenario-based
assessment instances. Runtime code reads the finished JSON bank directly; it
does not create learner-facing prompt variants.

## Main features

- Registration, login, authentication, and protected routes
- Adaptive and fixed-difficulty quiz modes
- Attempt validation and duplicate-result protection
- Per-user question history and duplicate protection
- Topic analytics, weak-topic detection, XP, levels, and streaks
- Low-level milestone after 300 correct Easy questions
- Printable certificate after all 1,000 subject questions are mastered
- Responsive monochrome interface

## Technology

- Client: React 19, Vite, React Router, Lucide React
- Firebase mode: Authentication, Cloud Firestore, Firebase Hosting
- Local server mode: Python, Flask, Flask-CORS, MongoDB with PyMongo

## Firebase Spark deployment

The default client mode is Firebase. No billing account is required. User
profiles, quiz results, attempts, progress, XP, streaks, and certificates are
stored below each authenticated user's own Firestore document. The generated
question bundle is copied from `server/data/questions` during every dev/build
command, so the 25,000-question source bank is not duplicated in Git.

```powershell
cd E:\Quiz\client
npm install
npm test
npm run build

cd E:\Quiz
firebase use neuraquiz-keval-2026
firebase deploy --only firestore:rules,hosting
```

The deployed React app uses Firebase Authentication and Firestore directly.
Because the Spark plan does not run trusted server code, answer validation in
this deployment happens in the browser. Firestore rules isolate every user's
data, but a determined user can inspect the downloadable question JSON or
modify their own client-side requests. Use the Flask mode or a paid trusted
runtime when server-enforced anti-cheat is required.

## Local Flask and MongoDB setup

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
$env:VITE_API_BASE = "http://127.0.0.1:5000"
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/`.

To test Firebase mode locally, remove `VITE_API_BASE` before starting Vite:

```powershell
Remove-Item Env:VITE_API_BASE -ErrorAction SilentlyContinue
npm run dev
```

## Verification

Run these commands from the repository root while the virtual environment is
active:

```powershell
python .\server\scripts\verify_question_bank_v2.py
python -m unittest discover -s .\server\tests -v

cd .\client
npm test
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
