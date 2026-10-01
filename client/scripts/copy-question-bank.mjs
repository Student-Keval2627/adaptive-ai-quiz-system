import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const clientDirectory = join(scriptDirectory, "..");
const sourceDirectory = join(clientDirectory, "..", "server", "data", "questions");
const targetDirectory = join(clientDirectory, "public", "questions");

await rm(targetDirectory, { recursive: true, force: true });
await mkdir(targetDirectory, { recursive: true });

const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith(".json"))
  .sort();

const manifest = [];

for (const file of files) {
  const sourcePath = join(sourceDirectory, file);
  const questions = JSON.parse(await readFile(sourcePath, "utf8"));

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error(`${file} does not contain a question array`);
  }

  const name = String(questions[0].subject || "").trim();

  if (!name) {
    throw new Error(`${file} has no subject name`);
  }

  const difficultyCounts = questions.reduce(
    (counts, question) => {
      const difficulty = String(question.difficulty || "").trim();
      counts[difficulty] = (counts[difficulty] || 0) + 1;
      return counts;
    },
    {}
  );

  manifest.push({
    name,
    file,
    questionCount: questions.length,
    difficultyCounts,
  });

  await cp(sourcePath, join(targetDirectory, file));
}

manifest.sort((left, right) => left.name.localeCompare(right.name));

await writeFile(
  join(targetDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

const totalQuestions = manifest.reduce(
  (total, subject) => total + subject.questionCount,
  0
);

console.log(
  `Prepared ${totalQuestions} questions across ${manifest.length} subjects.`
);

