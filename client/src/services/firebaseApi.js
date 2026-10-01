import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { buildAnalytics } from "./analytics";
import { auth, db, waitForAuth } from "./firebase";
import {
  chooseQuestion,
  findQuestion,
  getSubjects,
  loadSubjectBank,
  publicQuestion,
} from "./questionBank";

const DEFAULT_PROFILE = {
  learningGoal: "Improve AI & ML skills",
  preferredSubjects: ["Python", "Machine Learning", "Data Structures"],
};

const DEFAULT_STATS = {
  quizzesCompleted: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  accuracy: 0,
  bestAccuracy: 0,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  level: 1,
  lastQuizAt: null,
};

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseBody(options = {}) {
  if (!options.body) return {};

  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function cleanText(value, maxLength = 300) {
  return String(value || "").trim().slice(0, maxLength);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isoDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function friendlyAuthError(error) {
  const code = String(error?.code || "");
  const messages = {
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/weak-password": "Password must contain at least 6 characters.",
  };

  return messages[code] || error?.message || "Authentication failed";
}

function normalizeStats(stats = {}) {
  const merged = { ...DEFAULT_STATS, ...stats };
  return {
    ...merged,
    quizzesCompleted: Number(merged.quizzesCompleted) || 0,
    questionsAnswered: Number(merged.questionsAnswered) || 0,
    correctAnswers: Number(merged.correctAnswers) || 0,
    accuracy: Number(merged.accuracy) || 0,
    bestAccuracy: Number(merged.bestAccuracy) || 0,
    streak: Number(merged.streak) || 0,
    bestStreak: Number(merged.bestStreak) || 0,
    xp: Number(merged.xp) || 0,
    level: Math.max(Number(merged.level) || 1, 1),
    lastQuizAt: isoDate(merged.lastQuizAt),
  };
}

function serializeUser(uid, data = {}) {
  return {
    id: uid,
    name: data.name || auth.currentUser?.displayName || "Student",
    email: data.email || auth.currentUser?.email || "",
    role: data.role || "Student",
    profile: { ...DEFAULT_PROFILE, ...(data.profile || {}) },
    stats: normalizeStats(data.stats),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
  };
}

async function currentUser() {
  return auth.currentUser || waitForAuth();
}

async function requireUser() {
  const user = await currentUser();
  if (!user) throw Object.assign(new Error("Login required"), { status: 401 });
  return user;
}

async function ensureUserDocument(user, name = "") {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      name: cleanText(name || user.displayName || "Student", 80),
      email: user.email || "",
      role: "Student",
      profile: DEFAULT_PROFILE,
      stats: DEFAULT_STATS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const refreshed = await getDoc(userRef);
  return serializeUser(user.uid, refreshed.data());
}

async function loadCurrentUser() {
  const user = await requireUser();
  return ensureUserDocument(user);
}

function progressRef(uid, subject) {
  return doc(db, "users", uid, "subjectProgress", slugify(subject));
}

async function loadProgress(uid, subject) {
  const snapshot = await getDoc(progressRef(uid, subject));
  const data = snapshot.exists() ? snapshot.data() : {};

  return {
    subject,
    seenIds: Array.isArray(data.seenIds) ? data.seenIds : [],
    masteredIds: Array.isArray(data.masteredIds) ? data.masteredIds : [],
    wrongIds: Array.isArray(data.wrongIds) ? data.wrongIds : [],
  };
}

async function saveProgress(uid, progress) {
  await setDoc(
    progressRef(uid, progress.subject),
    {
      subject: progress.subject,
      seenIds: progress.seenIds,
      masteredIds: progress.masteredIds,
      wrongIds: progress.wrongIds,
      seenCount: progress.seenIds.length,
      masteredCount: progress.masteredIds.length,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function nextDifficulty(current, correct) {
  const index = Math.max(DIFFICULTIES.indexOf(current), 0);
  const nextIndex = correct
    ? Math.min(index + 1, DIFFICULTIES.length - 1)
    : Math.max(index - 1, 0);
  return DIFFICULTIES[nextIndex];
}

function adaptivePayload(difficulty, reason) {
  return { difficulty, reason };
}

async function startQuiz(uid, body) {
  const subject = cleanText(body.subject, 100);
  const difficultyMode = ["Adaptive", ...DIFFICULTIES].includes(body.difficulty)
    ? body.difficulty
    : "Adaptive";
  const focusMode = body.focusMode !== false;
  const bank = await loadSubjectBank(subject);
  const progress = await loadProgress(uid, subject);
  const desiredDifficulty = difficultyMode === "Adaptive" ? "Easy" : difficultyMode;
  const question =
    chooseQuestion({
      questions: bank,
      difficulty: desiredDifficulty,
      seenIds: progress.seenIds,
      masteredIds: progress.masteredIds,
      wrongIds: progress.wrongIds,
      focusMode,
    }) ||
    chooseQuestion({
      questions: bank,
      seenIds: progress.seenIds,
      masteredIds: progress.masteredIds,
      wrongIds: progress.wrongIds,
      focusMode,
    });

  if (!question) {
    throw Object.assign(
      new Error(`You have mastered all available ${subject} questions.`),
      { status: 400 }
    );
  }

  const attemptId = crypto.randomUUID();
  const attemptRef = doc(db, "users", uid, "attempts", attemptId);

  await setDoc(attemptRef, {
    attemptId,
    subject,
    difficulty: difficultyMode,
    currentDifficulty: question.difficulty,
    focusMode,
    questionIds: [question.id],
    currentQuestionId: question.id,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (!progress.seenIds.includes(question.id)) {
    progress.seenIds.push(question.id);
    await saveProgress(uid, progress);
  }

  return {
    success: true,
    attemptId,
    question: publicQuestion(question),
    adaptive: adaptivePayload(
      question.difficulty,
      difficultyMode === "Adaptive"
        ? "Starting with an Easy question and adapting after each answer."
        : `${difficultyMode} difficulty mode is active.`
    ),
  };
}

async function loadAttempt(uid, attemptId) {
  const attemptRef = doc(db, "users", uid, "attempts", attemptId);
  const snapshot = await getDoc(attemptRef);
  if (!snapshot.exists() || snapshot.data().status !== "active") {
    throw Object.assign(new Error("Active quiz attempt not found"), { status: 404 });
  }
  return { ref: attemptRef, data: snapshot.data() };
}

async function checkAnswer(uid, body) {
  const attemptId = cleanText(body.attemptId, 100);
  const questionId = cleanText(body.questionId, 120);
  const attempt = await loadAttempt(uid, attemptId);

  if (attempt.data.currentQuestionId !== questionId) {
    throw Object.assign(
      new Error("Only the current quiz question can be checked"),
      { status: 409 }
    );
  }

  const bank = await loadSubjectBank(attempt.data.subject);
  const question = findQuestion(bank, questionId);
  if (!question) throw Object.assign(new Error("Question not found"), { status: 404 });
  if (!question.options.includes(body.answer)) {
    throw Object.assign(new Error("Answer is not a valid option"), { status: 400 });
  }

  const correct = body.answer === question.answer;
  const progress = await loadProgress(uid, question.subject);
  const newlyMastered = correct && !progress.masteredIds.includes(question.id);

  if (!progress.seenIds.includes(question.id)) progress.seenIds.push(question.id);

  if (correct) {
    if (!progress.masteredIds.includes(question.id)) progress.masteredIds.push(question.id);
    progress.wrongIds = progress.wrongIds.filter((id) => id !== question.id);
  } else if (!progress.wrongIds.includes(question.id)) {
    progress.wrongIds.push(question.id);
  }

  await saveProgress(uid, progress);

  const mastered = new Set(progress.masteredIds);
  const easyCompleted = bank.filter(
    (item) => item.difficulty === "Easy" && mastered.has(item.id)
  ).length;
  const totalCompleted = progress.masteredIds.length;
  let milestone = null;
  let certificate = null;

  if (newlyMastered && question.difficulty === "Easy" && easyCompleted === 300) {
    milestone = {
      type: "LOW_LEVEL_PASSED",
      subject: question.subject,
      level: "Low",
      completed: 300,
      target: 300,
      message: `Congratulations! You have passed the Low level in ${question.subject}.`,
    };
  }

  if (newlyMastered && totalCompleted >= bank.length) {
    const certificateId = `${slugify(question.subject)}-${uid.slice(0, 8)}`;
    certificate = {
      certificateId,
      subject: question.subject,
      completedQuestions: bank.length,
      issuedAt: new Date().toISOString(),
    };
    await setDoc(
      doc(db, "users", uid, "certificates", slugify(question.subject)),
      { ...certificate, createdAt: serverTimestamp() },
      { merge: true }
    );
    milestone = {
      type: "SUBJECT_CERTIFICATE_EARNED",
      subject: question.subject,
      level: "Mastery",
      completed: bank.length,
      target: bank.length,
      certificateId,
      message: `Congratulations! You completed all ${bank.length} ${question.subject} questions and earned your certificate.`,
    };
  }

  return {
    success: true,
    correct,
    correctAnswer: question.answer,
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    masteryProgress: {
      subject: question.subject,
      totalCompleted,
      totalTarget: bank.length,
      percentage: Math.round((totalCompleted / bank.length) * 100),
      lowLevelPassed: easyCompleted >= 300,
      subjectCompleted: totalCompleted >= bank.length,
    },
    milestone,
    certificate,
  };
}

async function loadNextQuestion(uid, body) {
  const attemptId = cleanText(body.attemptId, 100);
  const previousQuestionId = cleanText(body.previousQuestionId, 120);
  const attempt = await loadAttempt(uid, attemptId);

  if (attempt.data.currentQuestionId !== previousQuestionId) {
    throw Object.assign(
      new Error("Previous question is not the current quiz question"),
      { status: 409 }
    );
  }

  const bank = await loadSubjectBank(attempt.data.subject);
  const previousQuestion = findQuestion(bank, previousQuestionId);
  if (!previousQuestion || !previousQuestion.options.includes(body.selectedAnswer)) {
    throw Object.assign(new Error("Selected answer is not valid"), { status: 400 });
  }

  const correct = body.selectedAnswer === previousQuestion.answer;
  const desiredDifficulty =
    attempt.data.difficulty === "Adaptive"
      ? nextDifficulty(previousQuestion.difficulty, correct)
      : attempt.data.difficulty;
  const progress = await loadProgress(uid, attempt.data.subject);
  const selection = {
    questions: bank,
    usedIds: attempt.data.questionIds,
    seenIds: progress.seenIds,
    masteredIds: progress.masteredIds,
    wrongIds: progress.wrongIds,
    focusMode: attempt.data.focusMode,
  };
  const question =
    chooseQuestion({ ...selection, difficulty: desiredDifficulty }) ||
    chooseQuestion(selection);

  if (!question) {
    throw Object.assign(new Error("No unanswered questions are available"), {
      status: 400,
    });
  }

  await setDoc(
    attempt.ref,
    {
      questionIds: arrayUnion(question.id),
      currentQuestionId: question.id,
      currentDifficulty: question.difficulty,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (!progress.seenIds.includes(question.id)) {
    progress.seenIds.push(question.id);
    await saveProgress(uid, progress);
  }

  return {
    success: true,
    attemptId,
    question: publicQuestion(question),
    adaptive: adaptivePayload(
      question.difficulty,
      attempt.data.difficulty === "Adaptive"
        ? correct
          ? `Correct answer — moving toward ${question.difficulty} difficulty.`
          : `Incorrect answer — reinforcing with ${question.difficulty} difficulty.`
        : `${attempt.data.difficulty} difficulty mode is active.`
    ),
  };
}

function calculateStreak(stats) {
  if (!stats.lastQuizAt) return 1;

  const previous = new Date(isoDate(stats.lastQuizAt));
  const today = new Date();
  const day = 24 * 60 * 60 * 1000;
  const previousDay = Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth(), previous.getUTCDate());
  const currentDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const difference = Math.round((currentDay - previousDay) / day);

  if (difference === 0) return Math.max(Number(stats.streak) || 0, 1);
  if (difference === 1) return (Number(stats.streak) || 0) + 1;
  return 1;
}

function serializeResult(id, data) {
  return {
    id,
    attemptId: data.attemptId || id,
    subject: data.subject || "",
    score: Number(data.score) || 0,
    total: Number(data.total) || 0,
    accuracy: Number(data.accuracy) || 0,
    xpEarned: Number(data.xpEarned) || 0,
    verified: Boolean(data.verified),
    verificationVersion: data.verificationVersion || "firebase-client-v1",
    answers: Array.isArray(data.answers) ? data.answers : [],
    createdAt: isoDate(data.createdAt),
  };
}

async function saveResult(uid, body) {
  const attemptId = cleanText(body.attemptId, 100);
  const subject = cleanText(body.subject, 100);
  const answers = Array.isArray(body.answers) ? body.answers : [];

  if (!attemptId || !subject || answers.length === 0) {
    throw Object.assign(new Error("Complete quiz result data is required"), {
      status: 400,
    });
  }

  const bank = await loadSubjectBank(subject);
  const answerMap = new Map(bank.map((question) => [question.id, question]));
  const verifiedAnswers = answers.map((answer) => {
    const question = answerMap.get(answer.questionId);
    if (!question) {
      throw Object.assign(new Error("Quiz result contains an invalid question"), {
        status: 400,
      });
    }

    return {
      questionId: question.id,
      question: question.question,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.answer,
      correct: answer.selectedAnswer === question.answer,
    };
  });

  const score = verifiedAnswers.filter((answer) => answer.correct).length;
  const total = verifiedAnswers.length;
  const resultAccuracy = Math.round((score / total) * 100);
  const xpEarned = score * 20 + 50;
  const resultRef = doc(db, "users", uid, "results", attemptId);
  const attemptRef = doc(db, "users", uid, "attempts", attemptId);
  const userRef = doc(db, "users", uid);
  const nowIso = new Date().toISOString();

  const transactionResult = await runTransaction(db, async (transaction) => {
    const [existingResult, attemptSnapshot, userSnapshot] = await Promise.all([
      transaction.get(resultRef),
      transaction.get(attemptRef),
      transaction.get(userRef),
    ]);

    if (existingResult.exists()) {
      return {
        duplicate: true,
        result: serializeResult(existingResult.id, existingResult.data()),
        user: serializeUser(uid, userSnapshot.data()),
      };
    }

    if (!attemptSnapshot.exists()) {
      throw new Error("Quiz attempt not found");
    }

    const attempt = attemptSnapshot.data();
    const servedIds = new Set(attempt.questionIds || []);

    if (
      attempt.subject !== subject ||
      verifiedAnswers.some((answer) => !servedIds.has(answer.questionId))
    ) {
      throw new Error("Quiz attempt validation failed");
    }

    const currentUserData = userSnapshot.data() || {};
    const oldStats = normalizeStats(currentUserData.stats);
    const newQuestions = oldStats.questionsAnswered + total;
    const newCorrect = oldStats.correctAnswers + score;
    const newXp = oldStats.xp + xpEarned;
    const streak = calculateStreak(currentUserData.stats || {});
    const stats = {
      quizzesCompleted: oldStats.quizzesCompleted + 1,
      questionsAnswered: newQuestions,
      correctAnswers: newCorrect,
      accuracy: Math.round((newCorrect / newQuestions) * 100),
      bestAccuracy: Math.max(oldStats.bestAccuracy, resultAccuracy),
      xp: newXp,
      level: Math.floor(newXp / 500) + 1,
      streak,
      bestStreak: Math.max(oldStats.bestStreak, streak),
      lastQuizAt: serverTimestamp(),
    };
    const storedResult = {
      attemptId,
      subject,
      score,
      total,
      accuracy: resultAccuracy,
      xpEarned,
      verified: true,
      verificationVersion: "firebase-client-v1",
      answers: verifiedAnswers,
      createdAt: serverTimestamp(),
    };

    transaction.set(resultRef, storedResult);
    transaction.set(userRef, { stats, updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(
      attemptRef,
      { status: "completed", completedAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true }
    );

    return {
      duplicate: false,
      result: serializeResult(attemptId, { ...storedResult, createdAt: nowIso }),
      stats: { ...stats, lastQuizAt: nowIso },
    };
  });

  if (transactionResult.duplicate) {
    return {
      success: true,
      duplicate: true,
      message: "This quiz result was already saved.",
      result: transactionResult.result,
      stats: transactionResult.user.stats,
    };
  }

  return {
    success: true,
    duplicate: false,
    message: "Quiz result saved successfully",
    result: transactionResult.result,
    stats: normalizeStats(transactionResult.stats),
  };
}

async function loadResults(uid, requestedLimit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(requestedLimit) || 10, 100));
  const resultQuery = query(
    collection(db, "users", uid, "results"),
    orderBy("createdAt", "desc"),
    limitQuery(safeLimit)
  );
  const snapshot = await getDocs(resultQuery);
  return snapshot.docs.map((item) => serializeResult(item.id, item.data()));
}

async function handleAuth(path, method, body) {
  if (path === "/api/auth/register" && method === "POST") {
    const name = cleanText(body.name, 80);
    if (!name) return jsonResponse({ success: false, message: "Name is required" }, 400);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        cleanText(body.email, 200).toLowerCase(),
        String(body.password || "")
      );
      await updateAuthProfile(credential.user, { displayName: name });
      const user = await ensureUserDocument(credential.user, name);
      return jsonResponse({ success: true, authenticated: true, user }, 201);
    } catch (error) {
      return jsonResponse({ success: false, message: friendlyAuthError(error) }, 400);
    }
  }

  if (path === "/api/auth/login" && method === "POST") {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        cleanText(body.email, 200).toLowerCase(),
        String(body.password || "")
      );
      const user = await ensureUserDocument(credential.user);
      return jsonResponse({ success: true, authenticated: true, user });
    } catch (error) {
      return jsonResponse({ success: false, message: friendlyAuthError(error) }, 401);
    }
  }

  if (path === "/api/auth/logout" && method === "POST") {
    await signOut(auth);
    return jsonResponse({ success: true, authenticated: false });
  }

  if (path === "/api/auth/me" && method === "GET") {
    const user = await currentUser();
    if (!user) {
      return jsonResponse(
        { success: false, authenticated: false, message: "Login required" },
        401
      );
    }
    const [serialized, subjects] = await Promise.all([
      ensureUserDocument(user),
      getSubjects(),
    ]);
    return jsonResponse({
      success: true,
      authenticated: true,
      user: serialized,
      availableSubjects: subjects.map((item) => item.name),
    });
  }

  if (path === "/api/auth/subjects" && method === "GET") {
    await requireUser();
    const subjects = await getSubjects();
    return jsonResponse({
      success: true,
      count: subjects.length,
      subjects: subjects.map((item) => item.name),
    });
  }

  if (path === "/api/auth/profile" && ["PUT", "PATCH"].includes(method)) {
    const firebaseUser = await requireUser();
    const current = await loadCurrentUser();
    const allSubjects = await getSubjects();
    const validSubjects = new Set(allSubjects.map((item) => item.name));
    const name = cleanText(body.name || current.name, 80);
    const preferredSubjects = Array.isArray(body.preferredSubjects)
      ? [...new Set(body.preferredSubjects.map(String))].filter((item) => validSubjects.has(item))
      : current.profile.preferredSubjects;
    const profile = {
      learningGoal:
        cleanText(body.learningGoal, 300) || current.profile.learningGoal,
      preferredSubjects:
        preferredSubjects.length > 0 ? preferredSubjects : current.profile.preferredSubjects,
    };

    await Promise.all([
      updateAuthProfile(firebaseUser, { displayName: name }),
      setDoc(
        doc(db, "users", firebaseUser.uid),
        { name, profile, updatedAt: serverTimestamp() },
        { merge: true }
      ),
    ]);

    return jsonResponse({
      success: true,
      message: "Profile updated successfully",
      user: serializeUser(firebaseUser.uid, { ...current, name, profile }),
      availableSubjects: allSubjects.map((item) => item.name),
    });
  }

  return null;
}

export async function firebaseApiFetch(resource, options = {}) {
  const url = new URL(String(resource), window.location.origin);
  const path = url.pathname.replace(/\/$/, "") || "/";
  const method = String(options.method || "GET").toUpperCase();
  const body = parseBody(options);

  try {
    const authResponse = await handleAuth(path, method, body);
    if (authResponse) return authResponse;

    const user = await requireUser();

    if (path === "/api/quiz/subjects" && method === "GET") {
      const subjects = await getSubjects();
      return jsonResponse({ success: true, count: subjects.length, subjects });
    }

    if (path === "/api/quiz/start" && method === "POST") {
      return jsonResponse(await startQuiz(user.uid, body), 201);
    }

    if (path === "/api/quiz/check" && method === "POST") {
      return jsonResponse(await checkAnswer(user.uid, body));
    }

    if (path === "/api/quiz/next" && method === "POST") {
      return jsonResponse(await loadNextQuestion(user.uid, body));
    }

    if (path === "/api/results" && method === "POST") {
      const saved = await saveResult(user.uid, body);
      return jsonResponse(saved, saved.duplicate ? 200 : 201);
    }

    if (path === "/api/results" && method === "GET") {
      const results = await loadResults(user.uid, url.searchParams.get("limit"));
      return jsonResponse({ success: true, count: results.length, results });
    }

    if (path === "/api/analytics/topics" && method === "GET") {
      const results = await loadResults(user.uid, 100);
      const analytics = buildAnalytics(results, url.searchParams.get("subject") || "");
      return jsonResponse({ success: true, analytics });
    }

    if (path === "/api/analytics/weak-topics" && method === "GET") {
      const results = await loadResults(user.uid, 100);
      const analytics = buildAnalytics(results, url.searchParams.get("subject") || "");
      const requestedLimit = Math.max(
        1,
        Math.min(Number(url.searchParams.get("limit")) || 5, 50)
      );
      const topics = analytics.topics
        .filter((topic) => topic.accuracy < 75)
        .slice(0, requestedLimit);
      return jsonResponse({
        success: true,
        subject: url.searchParams.get("subject") || null,
        count: topics.length,
        topics,
      });
    }

    return jsonResponse({ success: false, message: "Route not found" }, 404);
  } catch (error) {
    console.error("Firebase data service error:", error);
    return jsonResponse(
      { success: false, message: error?.message || "Firebase request failed" },
      Number(error?.status) || 500
    );
  }
}

