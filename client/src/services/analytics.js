export const EMPTY_ANALYTICS = {
  totalSubjects: 0,
  totalTopics: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  overallAccuracy: 0,
  weakestTopic: null,
  strongestTopic: null,
  recommendedTopic: null,
  recommendation:
    "Complete more adaptive quizzes to unlock personalized topic recommendations.",
  subjects: [],
  topics: [],
};

function accuracy(correct, answered) {
  return answered > 0 ? Math.round((correct / answered) * 100) : 0;
}

function level(value) {
  if (value < 50) return "Weak";
  if (value < 75) return "Improving";
  return "Strong";
}

function recommendation(topic) {
  if (!topic) return EMPTY_ANALYTICS.recommendation;
  if (topic.accuracy < 40) {
    return `Focus on ${topic.topic}. Review the fundamentals and practice Easy and Medium questions first.`;
  }
  if (topic.accuracy < 60) {
    return `Practice ${topic.topic} more frequently. Use Focus Mode to reinforce this weak area.`;
  }
  if (topic.accuracy < 75) {
    return `Keep practicing ${topic.topic}. Your understanding is improving, but more consistency is needed.`;
  }
  return `Continue practicing ${topic.topic} with Medium and Hard questions to strengthen mastery.`;
}

export function buildAnalytics(results, subjectFilter = "") {
  const topicMap = new Map();
  const subjectMap = new Map();

  results.forEach((result) => {
    if (subjectFilter && result.subject !== subjectFilter) return;

    (Array.isArray(result.answers) ? result.answers : []).forEach((answer) => {
      const subject = String(answer.subject || result.subject || "").trim();
      const topic = String(answer.topic || "General").trim() || "General";

      if (!subject) return;

      const key = `${subject}\u0000${topic}`;
      const topicRow = topicMap.get(key) || {
        subject,
        topic,
        answered: 0,
        correct: 0,
        difficultyStats: {
          easy: { answered: 0, correct: 0, accuracy: null },
          medium: { answered: 0, correct: 0, accuracy: null },
          hard: { answered: 0, correct: 0, accuracy: null },
        },
      };

      topicRow.answered += 1;
      if (answer.correct) topicRow.correct += 1;

      const difficultyKey = String(answer.difficulty || "Medium").toLowerCase();
      const difficulty = topicRow.difficultyStats[difficultyKey];
      if (difficulty) {
        difficulty.answered += 1;
        if (answer.correct) difficulty.correct += 1;
      }

      topicMap.set(key, topicRow);

      const subjectRow = subjectMap.get(subject) || {
        subject,
        answered: 0,
        correct: 0,
      };
      subjectRow.answered += 1;
      if (answer.correct) subjectRow.correct += 1;
      subjectMap.set(subject, subjectRow);
    });
  });

  const topics = [...topicMap.values()].map((item) => {
    Object.values(item.difficultyStats).forEach((difficulty) => {
      difficulty.accuracy =
        difficulty.answered > 0
          ? accuracy(difficulty.correct, difficulty.answered)
          : null;
    });

    const itemAccuracy = accuracy(item.correct, item.answered);
    return {
      ...item,
      wrong: Math.max(item.answered - item.correct, 0),
      accuracy: itemAccuracy,
      level: level(itemAccuracy),
    };
  });

  topics.sort(
    (left, right) =>
      left.accuracy - right.accuracy ||
      right.answered - left.answered ||
      left.subject.localeCompare(right.subject) ||
      left.topic.localeCompare(right.topic)
  );

  if (topics.length === 0) {
    return { ...EMPTY_ANALYTICS };
  }

  const subjects = [...subjectMap.values()]
    .map((item) => ({
      ...item,
      wrong: Math.max(item.answered - item.correct, 0),
      accuracy: accuracy(item.correct, item.answered),
    }))
    .sort(
      (left, right) =>
        left.accuracy - right.accuracy ||
        left.subject.localeCompare(right.subject)
    );

  const totalAnswered = topics.reduce((sum, item) => sum + item.answered, 0);
  const totalCorrect = topics.reduce((sum, item) => sum + item.correct, 0);
  const weakestTopic = topics[0];
  const strongCandidates = topics.filter((item) => item.answered >= 2);
  const strongestTopic = (strongCandidates.length ? strongCandidates : topics)
    .reduce((best, item) =>
      !best || item.accuracy > best.accuracy ||
      (item.accuracy === best.accuracy && item.answered > best.answered)
        ? item
        : best
    , null);

  return {
    totalSubjects: subjects.length,
    totalTopics: topics.length,
    totalAnswered,
    totalCorrect,
    overallAccuracy: accuracy(totalCorrect, totalAnswered),
    weakestTopic,
    strongestTopic,
    recommendedTopic: weakestTopic.topic,
    recommendation: recommendation(weakestTopic),
    subjects,
    topics,
  };
}

