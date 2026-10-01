import assert from "node:assert/strict";
import test from "node:test";

import { chooseQuestion, publicQuestion } from "../src/services/questionBank.js";

const questions = [
  {
    id: "q-1",
    subject: "Python",
    topic: "Basics",
    difficulty: "Easy",
    question: "Q1",
    options: ["A", "B"],
    answer: "A",
  },
  {
    id: "q-2",
    subject: "Python",
    topic: "Basics",
    difficulty: "Easy",
    question: "Q2",
    options: ["A", "B"],
    answer: "B",
  },
];

test("chooseQuestion never returns a mastered question", () => {
  const selected = chooseQuestion({
    questions,
    difficulty: "Easy",
    masteredIds: ["q-1"],
  });

  assert.equal(selected.id, "q-2");
});

test("chooseQuestion retries wrong questions only after unseen questions", () => {
  const selected = chooseQuestion({
    questions,
    difficulty: "Easy",
    seenIds: ["q-1"],
    wrongIds: ["q-1"],
  });

  assert.equal(selected.id, "q-2");

  const retry = chooseQuestion({
    questions: [questions[0]],
    difficulty: "Easy",
    seenIds: ["q-1"],
    wrongIds: ["q-1"],
  });

  assert.equal(retry.id, "q-1");
});

test("publicQuestion removes the answer", () => {
  const safe = publicQuestion(questions[0]);
  assert.equal(Object.hasOwn(safe, "answer"), false);
  assert.equal(safe.question, "Q1");
});

