const manifestCache = {
  value: null,
};

const subjectCache = new Map();

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

export async function getQuestionManifest() {
  if (manifestCache.value) {
    return manifestCache.value;
  }

  const response = await window.fetch("/questions/manifest.json");

  if (!response.ok) {
    throw new Error("Question bank manifest could not be loaded");
  }

  const manifest = await response.json();

  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("Question bank manifest is empty");
  }

  manifestCache.value = manifest;
  return manifest;
}

export async function getSubjects() {
  const manifest = await getQuestionManifest();

  return manifest
    .map((item) => ({
      name: String(item.name || "").trim(),
      questionCount: Number(item.questionCount) || 0,
    }))
    .filter((item) => item.name)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function loadSubjectBank(subjectName) {
  const subject = String(subjectName || "").trim();

  if (subjectCache.has(subject)) {
    return subjectCache.get(subject);
  }

  const manifest = await getQuestionManifest();
  const entry = manifest.find((item) => item.name === subject);

  if (!entry) {
    throw new Error("Invalid or unavailable subject");
  }

  const response = await window.fetch(`/questions/${entry.file}`);

  if (!response.ok) {
    throw new Error(`${subject} question bank could not be loaded`);
  }

  const rawQuestions = await response.json();

  if (!Array.isArray(rawQuestions)) {
    throw new Error(`${subject} question bank has an invalid format`);
  }

  const slug = slugify(subject);
  const questions = rawQuestions.map((item, index) => ({
    id: `${slug}-${String(index + 1).padStart(4, "0")}`,
    subject,
    topic: String(item.topic || "General").trim() || "General",
    difficulty: String(item.difficulty || "Easy").trim(),
    question: String(item.question || "").trim(),
    options: Array.isArray(item.options) ? item.options.map(String) : [],
    answer: String(item.answer || ""),
  }));

  subjectCache.set(subject, questions);
  return questions;
}

export function publicQuestion(question) {
  if (!question) {
    return null;
  }

  const { answer: _answer, ...safeQuestion } = question;
  return safeQuestion;
}

export function chooseQuestion({
  questions,
  difficulty,
  usedIds = [],
  seenIds = [],
  masteredIds = [],
  wrongIds = [],
  focusMode = true,
}) {
  const used = new Set(usedIds);
  const seen = new Set(seenIds);
  const mastered = new Set(masteredIds);
  const wrong = new Set(wrongIds);

  const allowed = questions.filter(
    (question) =>
      !used.has(question.id) &&
      !mastered.has(question.id) &&
      (!difficulty || question.difficulty === difficulty)
  );

  const unseen = allowed.filter((question) => !seen.has(question.id));

  if (unseen.length > 0) {
    return shuffle(unseen)[0];
  }

  const retryable = allowed.filter((question) => wrong.has(question.id));

  if (retryable.length > 0) {
    if (focusMode) {
      const topicCounts = new Map();

      retryable.forEach((question) => {
        topicCounts.set(
          question.topic,
          (topicCounts.get(question.topic) || 0) + 1
        );
      });

      const priorityTopic = [...topicCounts.entries()].sort(
        (left, right) => right[1] - left[1]
      )[0]?.[0];

      const focused = retryable.filter(
        (question) => question.topic === priorityTopic
      );

      if (focused.length > 0) {
        return shuffle(focused)[0];
      }
    }

    return shuffle(retryable)[0];
  }

  return null;
}

export function findQuestion(questions, questionId) {
  return questions.find((question) => question.id === questionId) || null;
}

