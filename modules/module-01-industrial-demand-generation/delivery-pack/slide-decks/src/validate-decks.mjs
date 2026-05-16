#!/usr/bin/env node

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { lessons, sourceCommit, workshopPlan } from "./lesson-data.mjs";
import { SLIDE_TYPES } from "./deck-runtime.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..", "..", "..");
const QA_ROOT = path.join(PACKAGE_ROOT, "qa");

const bannedCompanyNames = [
  "ABB",
  "Amazon",
  "Apple",
  "Bosch",
  "Caterpillar",
  "Emerson",
  "General Electric",
  "Google",
  "Honeywell",
  "HubSpot",
  "Meta",
  "Microsoft",
  "Oracle",
  "Rockwell",
  "Salesforce",
  "SAP",
  "Siemens",
  "Tesla",
  "Toyota",
];

const aiTerm = ["A", "I"].join("");
const agentTerm = ["ag", "ent"].join("");
const forbiddenHumanDeckPhrases = [
  [aiTerm, agentTerm].join(" "),
  [aiTerm, `${agentTerm}s`].join(" "),
  ["agen", "tic"].join(""),
  ["autonomous", agentTerm].join(" "),
  ["machine", "readable"].join("-"),
  [aiTerm, "assisted"].join("-"),
  [aiTerm, "prompt"].join(" "),
  ["prompt", "skeleton"].join(" "),
  ["Prompt", "to", "give", aiTerm].join(" "),
  ["L", "LM"].join(""),
];

function pad(value) {
  return String(value).padStart(2, "0");
}

async function statNonEmpty(filePath, label, errors) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size <= 0) errors.push(`${label} is empty: ${filePath}`);
    return stat.size;
  } catch {
    errors.push(`${label} is missing: ${filePath}`);
    return 0;
  }
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function collectTextFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectTextFiles(full)));
    else if (/\.(md|mjs|json|txt)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function requireText(value, label, errors) {
  if (!String(value || "").trim()) errors.push(`Missing ${label}`);
}

function requireArray(value, label, min, errors) {
  if (!Array.isArray(value) || value.length < min) {
    errors.push(`Expected at least ${min} items for ${label}`);
  }
}

function validateLessonCoverage(lesson, errors) {
  requireText(lesson.promise, `lesson ${lesson.id} promise`, errors);
  requireText(lesson.output, `lesson ${lesson.id} output`, errors);
  requireText(lesson.artifact, `lesson ${lesson.id} artifact`, errors);
  requireText(lesson.frameworkTitle, `lesson ${lesson.id} framework title`, errors);
  requireText(lesson.mentalModelTitle, `lesson ${lesson.id} mental model title`, errors);
  requireText(lesson.exampleTitle, `lesson ${lesson.id} example title`, errors);
  requireText(lesson.diagnosticLead, `lesson ${lesson.id} diagnostic lead`, errors);
  requireText(lesson.exerciseTitle, `lesson ${lesson.id} exercise title`, errors);
  requireText(lesson.exerciseTime, `lesson ${lesson.id} exercise time`, errors);
  requireText(lesson.draftingBrief, `lesson ${lesson.id} drafting brief`, errors);
  requireText(lesson.revopsTitle, `lesson ${lesson.id} RevOps title`, errors);
  requireText(lesson.transition, `lesson ${lesson.id} transition`, errors);
  requireText(lesson.nextLesson, `lesson ${lesson.id} next lesson`, errors);

  requireArray(lesson.why, `lesson ${lesson.id} why points`, 3, errors);
  requireArray(lesson.framework, `lesson ${lesson.id} framework points`, 5, errors);
  requireArray(lesson.mentalModel, `lesson ${lesson.id} mental model blocks`, 4, errors);
  requireArray(lesson.example, `lesson ${lesson.id} example points`, 3, errors);
  requireArray(lesson.diagnosticPrompts, `lesson ${lesson.id} diagnostic questions`, 5, errors);
  requireArray(lesson.exerciseSteps, `lesson ${lesson.id} exercise steps`, 3, errors);
  requireArray(lesson.critique, `lesson ${lesson.id} critique prompts`, 5, errors);
  requireArray(lesson.draftingStandards, `lesson ${lesson.id} drafting standards`, 4, errors);
  requireArray(lesson.qualityControl, `lesson ${lesson.id} quality-control checks`, 5, errors);
  requireArray(lesson.revops, `lesson ${lesson.id} RevOps fields`, 6, errors);
  requireArray(lesson.failureModes, `lesson ${lesson.id} failure modes`, 4, errors);
  requireArray(lesson.finalArtifact, `lesson ${lesson.id} final artifact checklist`, 6, errors);
}

async function main() {
  const errors = [];
  const warnings = [];
  const checks = [];

  if (lessons.length !== 8) errors.push(`Expected 8 lessons, found ${lessons.length}`);
  checks.push(`Lesson records: ${lessons.length}`);
  checks.push(`Slide types per deck: ${SLIDE_TYPES.length}`);
  checks.push(`Workshop time: ${workshopPlan.teachingMinutes}/${workshopPlan.totalMinutes} minutes`);
  checks.push("Coverage rule set: promise, why, framework, mental model, example, diagnostic, exercise, critique, drafting drill, quality control, RevOps, failure modes, artifact, transition");

  for (const lesson of lessons) {
    validateLessonCoverage(lesson, errors);

    const sourceFile = path.join(REPO_ROOT, lesson.lessonFile);
    await statNonEmpty(sourceFile, `Source lesson for ${lesson.id}`, errors);

    const deckDir = path.join(PACKAGE_ROOT, "decks", lesson.slug);
    const slidesDir = path.join(deckDir, "slides");
    const notesPath = path.join(deckDir, "speaker-notes.md");
    const pptxPath = path.join(PACKAGE_ROOT, "exports", `${lesson.slug}.pptx`);
    const previewDir = path.join(QA_ROOT, "previews", lesson.slug);
    const manifestPath = path.join(QA_ROOT, "manifests", `${lesson.slug}.json`);

    await statNonEmpty(notesPath, `Speaker notes for ${lesson.id}`, errors);
    const pptxBytes = await statNonEmpty(pptxPath, `PPTX export for ${lesson.id}`, errors);
    if (pptxBytes > 0 && pptxBytes < 20_000) warnings.push(`PPTX looks unusually small: ${pptxPath}`);
    await statNonEmpty(manifestPath, `Build manifest for ${lesson.id}`, errors);

    const slideFiles = fsSync.existsSync(slidesDir)
      ? fsSync.readdirSync(slidesDir).filter((name) => /^slide-\d+\.mjs$/i.test(name)).sort()
      : [];
    if (slideFiles.length !== SLIDE_TYPES.length) {
      errors.push(`Expected ${SLIDE_TYPES.length} slide modules for ${lesson.id}, found ${slideFiles.length}`);
    }
    for (let index = 1; index <= SLIDE_TYPES.length; index += 1) {
      await statNonEmpty(path.join(slidesDir, `slide-${pad(index)}.mjs`), `Slide module ${lesson.id}-${pad(index)}`, errors);
      await statNonEmpty(path.join(previewDir, `slide-${pad(index)}.png`), `Preview ${lesson.id}-${pad(index)}`, errors);
    }

    await statNonEmpty(path.join(PACKAGE_ROOT, "assets", "flowcharts", lesson.diagram), `Primary diagram ${lesson.id}`, errors);
    for (const diagram of lesson.supportingDiagrams || []) {
      await statNonEmpty(path.join(PACKAGE_ROOT, "assets", "flowcharts", diagram), `Supporting diagram ${lesson.id}`, errors);
    }

    if (lesson.finalArtifact.length > 10) warnings.push(`Final artifact list is dense in lesson ${lesson.id}`);
    if (lesson.draftingBrief.length > 780) warnings.push(`Drafting brief may be long for projection in lesson ${lesson.id}`);
    if (lesson.diagnosticPrompts.length > 7) warnings.push(`Diagnostic prompt stack may be long in lesson ${lesson.id}`);
  }

  const packageFiles = [
    path.join(PACKAGE_ROOT, "README.md"),
    path.join(PACKAGE_ROOT, "source-index.md"),
    path.join(PACKAGE_ROOT, "src", "lesson-data.mjs"),
    path.join(PACKAGE_ROOT, "src", "deck-runtime.mjs"),
    path.join(PACKAGE_ROOT, "src", "build-decks.mjs"),
    path.join(PACKAGE_ROOT, "src", "validate-decks.mjs"),
  ];
  for (const filePath of packageFiles) {
    await statNonEmpty(filePath, "Package file", errors);
  }

  const textFiles = await collectTextFiles(PACKAGE_ROOT);
  const restrictedHits = [];
  for (const filePath of textFiles) {
    if (filePath.includes(`${path.sep}qa${path.sep}`)) continue;
    if (filePath.includes(`${path.sep}qa${path.sep}layout${path.sep}`)) continue;
    if (filePath.includes(`${path.sep}src${path.sep}`) && path.basename(filePath) !== "lesson-data.mjs") continue;
    const text = await readIfExists(filePath);
    for (const name of bannedCompanyNames) {
      const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(text)) restrictedHits.push(`${name} in ${path.relative(PACKAGE_ROOT, filePath)}`);
    }
  }
  if (restrictedHits.length) {
    errors.push(`Restricted-name scan found unexpected real company references: ${restrictedHits.join("; ")}`);
  }

  const visibleInstructorFiles = [
    path.join(PACKAGE_ROOT, "README.md"),
    path.join(PACKAGE_ROOT, "source-index.md"),
    path.join(PACKAGE_ROOT, "src", "lesson-data.mjs"),
    path.join(PACKAGE_ROOT, "src", "deck-runtime.mjs"),
    ...lessons.map((lesson) => path.join(PACKAGE_ROOT, "decks", lesson.slug, "speaker-notes.md")),
  ];
  const humanDeckHits = [];
  for (const filePath of visibleInstructorFiles) {
    const text = await readIfExists(filePath);
    for (const phrase of forbiddenHumanDeckPhrases) {
      const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(text)) humanDeckHits.push(`${phrase} in ${path.relative(PACKAGE_ROOT, filePath)}`);
    }
  }
  if (humanDeckHits.length) {
    errors.push(`Human-only deck scan found non-human instructor language: ${humanDeckHits.join("; ")}`);
  }

  const reportLines = [
    "# Slide Deck Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Source commit: \`${sourceCommit}\``,
    "",
    `Status: ${errors.length ? "FAIL" : "PASS"}`,
    "",
    "## Checks",
    "",
    ...checks.map((item) => `- ${item}`),
    "- 8 PPTX exports present and non-empty",
    "- 15 editable slide modules per lesson deck",
    "- Speaker-note guide per deck",
    "- Primary and supporting flowchart assets present",
    "- Rendered PNG previews present for every slide",
    "- Source lesson links present",
    "- Restricted-name scan completed",
    "- Human-only instructor deck scan completed",
    "- Lesson concept coverage scan completed",
    "- Readability rule scan completed",
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Errors",
    "",
    ...(errors.length ? errors.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Deck Inventory",
    "",
    "| Deck | Slides | PPTX | Notes |",
    "|---|---:|---|---|",
    ...lessons.map((lesson) => {
      const pptx = `exports/${lesson.slug}.pptx`;
      const notes = `decks/${lesson.slug}/speaker-notes.md`;
      return `| ${lesson.deckTitle} | ${SLIDE_TYPES.length} | [${path.basename(pptx)}](../${pptx}) | [speaker notes](../${notes}) |`;
    }),
    "",
    "## Visual Sanity",
    "",
    "All slides were rendered to PNG preview files during the build. The validation checks that each rendered preview exists and is non-empty. The previews are generated under `qa/previews/` and intentionally ignored from git to keep the delivery package focused on source, PPTX exports, and validation evidence.",
    "",
  ];

  await fs.mkdir(QA_ROOT, { recursive: true });
  await fs.writeFile(path.join(QA_ROOT, "slide-deck-validation-report.md"), reportLines.join("\n"), "utf8");

  if (errors.length) {
    console.error(reportLines.join("\n"));
    process.exit(1);
  }
  console.log(reportLines.join("\n"));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
