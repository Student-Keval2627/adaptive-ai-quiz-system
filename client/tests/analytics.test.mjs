import assert from "node:assert/strict";
import test from "node:test";

import { buildAnalytics } from "../src/services/analytics.js";

test("buildAnalytics aggregates topics and difficulties", () => {
  const analytics = buildAnalytics([
    {
      subject: "Python",
      answers: [
        {
          subject: "Python",
          topic: "Strings",
          difficulty: "Easy",
          correct: true,
        },
        {
          subject: "Python",
          topic: "Strings",
          difficulty: "Medium",
          correct: false,
        },
        {
          subject: "Python",
          topic: "Lists",
          difficulty: "Easy",
          correct: true,
        },
      ],
    },
  ]);

  assert.equal(analytics.totalSubjects, 1);
  assert.equal(analytics.totalTopics, 2);
  assert.equal(analytics.totalAnswered, 3);
  assert.equal(analytics.totalCorrect, 2);
  assert.equal(analytics.overallAccuracy, 67);
  assert.equal(analytics.weakestTopic.topic, "Strings");
  assert.equal(analytics.weakestTopic.difficultyStats.easy.accuracy, 100);
  assert.equal(analytics.weakestTopic.difficultyStats.medium.accuracy, 0);
});

test("buildAnalytics supports subject filtering", () => {
  const analytics = buildAnalytics(
    [
      {
        subject: "Python",
        answers: [
          { subject: "Python", topic: "Lists", difficulty: "Easy", correct: true },
        ],
      },
      {
        subject: "Java",
        answers: [
          { subject: "Java", topic: "Classes", difficulty: "Easy", correct: false },
        ],
      },
    ],
    "Java"
  );

  assert.equal(analytics.totalSubjects, 1);
  assert.equal(analytics.topics[0].subject, "Java");
  assert.equal(analytics.overallAccuracy, 0);
});

