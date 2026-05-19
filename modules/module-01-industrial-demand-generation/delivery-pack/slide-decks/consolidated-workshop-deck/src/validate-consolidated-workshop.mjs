#!/usr/bin/env node

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  deckMeta,
  exercisePlan,
  finalStrategyOutputs,
  lessons,
  requiredConcepts,
  slidePlan,
  sourceCommit,
} from "./consolidated-workshop-data.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..", "..", "..", "..");
const QA_ROOT = path.join(PACKAGE_ROOT, "qa");
const CONTENT_PATH = path.join(PACKAGE_ROOT, deckMeta.contentFile);
const PROMPT_PATH = path.resolve(PACKAGE_ROOT, deckMeta.participantPromptFile);
const REPORT_PATH = path.join(QA_ROOT, "consolidated-workshop-validation-report.md");

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
const forbiddenDeckPhrases = [
  [aiTerm, agentTerm].join(" "),
  [aiTerm, `${agentTerm}s`].join(" "),
  ["agen", "tic"].join(""),
  ["autonomous", agentTerm].join(" "),
  ["machine", "readable"].join("-"),
  [aiTerm, "assisted"].join("-"),
  [aiTerm, "prompt"].join(" "),
  ["prompt", "outputs"].join(" "),
  ["prompt", "skeleton"].join(" "),
  ["Chat", "GPT"].join(""),
  "Claude",
  "Perplexity",
  ["L", "LM"].join(""),
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function rel(filePath) {
  return path.relative(REPO_ROOT, filePath).replaceAll(path.sep, "/");
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function statNonEmpty(filePath, label, errors, minimumBytes = 1) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size < minimumBytes) {
      errors.push(`${label} is empty or too small: ${rel(filePath)}`);
    }
    return stat.size;
  } catch {
    errors.push(`${label} is missing: ${rel(filePath)}`);
    return 0;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scanTerms(text, terms) {
  const hits = [];
  for (const term of terms) {
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
    if (pattern.test(text)) hits.push(term);
  }
  return hits;
}

function validateNoPptArtifacts(errors, checks) {
  const exportDir = path.join(PACKAGE_ROOT, "exports");
  const pptxFiles = fsSync.existsSync(exportDir)
    ? fsSync.readdirSync(exportDir).filter((name) => /\.pptx$/i.test(name))
    : [];

  if (pptxFiles.length) {
    errors.push(`PPTX export exists before content approval: ${pptxFiles.join(", ")}`);
  }

  const pptBuilder = path.join(PACKAGE_ROOT, "src", "build-consolidated-workshop-deck.mjs");
  if (fsSync.existsSync(pptBuilder)) {
    errors.push("PPTX build script exists before content approval. Keep the consolidated package Markdown-first until approved.");
  }

  checks.push("Approval-first guardrail: no PPTX export present");
}

function validateSlidePlan(errors, checks) {
  if (slidePlan.length !== deckMeta.slideCount) {
    errors.push(`Expected ${deckMeta.slideCount} slides, found ${slidePlan.length}`);
  }

  const seen = new Set();
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const coveredLessons = new Set();
  const coveredConcepts = new Set();
  const exerciseSlides = new Map();

  for (let index = 1; index <= deckMeta.slideCount; index += 1) {
    const slide = slidePlan.find((entry) => entry.no === index);
    if (!slide) errors.push(`Missing slide ${index}`);
  }

  for (const slide of slidePlan) {
    if (seen.has(slide.no)) errors.push(`Duplicate slide number ${slide.no}`);
    seen.add(slide.no);

    if (!String(slide.title || "").trim()) errors.push(`Slide ${slide.no} has no title`);
    if (!Array.isArray(slide.sourceLessons) || !slide.sourceLessons.length) {
      errors.push(`Slide ${slide.no} has no source lesson mapping`);
    }
    for (const lessonId of slide.sourceLessons || []) {
      if (!lessonIds.has(lessonId)) errors.push(`Slide ${slide.no} references unknown lesson ${lessonId}`);
      coveredLessons.add(lessonId);
    }
    for (const conceptKey of slide.conceptKeys || []) coveredConcepts.add(conceptKey);
    if (slide.exerciseId) exerciseSlides.set(slide.exerciseId, slide);
  }

  for (const lesson of lessons) {
    if (!coveredLessons.has(lesson.id)) errors.push(`Lesson ${lesson.id} is not represented in the consolidated slide plan`);
  }

  const missingConcepts = requiredConcepts.filter((concept) => !coveredConcepts.has(concept));
  if (missingConcepts.length) errors.push(`Required concepts missing from slide plan: ${missingConcepts.join(", ")}`);

  for (const exercise of exercisePlan) {
    const slide = exerciseSlides.get(exercise.id);
    if (!slide) errors.push(`Exercise ${exercise.id} is missing from the slide plan`);
    if (slide && slide.no !== exercise.slide) {
      errors.push(`Exercise ${exercise.id} expected on slide ${exercise.slide}, found slide ${slide.no}`);
    }
  }

  checks.push(`Slide count: ${slidePlan.length}/${deckMeta.slideCount}`);
  checks.push(`Source lessons covered: ${coveredLessons.size}/8`);
  checks.push(`Required concepts covered: ${coveredConcepts.size}/${requiredConcepts.length}`);
  checks.push(`Interleaved exercises placed: ${exerciseSlides.size}/${exercisePlan.length}`);
}

async function validateMarkdownContent(errors, checks) {
  const contentText = await readIfExists(CONTENT_PATH);
  if (!contentText) {
    errors.push(`Markdown slide content is missing: ${rel(CONTENT_PATH)}`);
    return;
  }

  const contentBytes = await statNonEmpty(CONTENT_PATH, "Markdown slide content", errors, 25_000);

  for (const slide of slidePlan) {
    const heading = `## Slide ${pad(slide.no)} - ${slide.title}`;
    if (!contentText.includes(heading)) errors.push(`Markdown content missing slide heading: ${heading}`);
  }

  const requiredSections = [
    "### Slide Promise",
    "### On-Slide Content",
    "### Infographic Direction",
    "### Instructor Talking Points",
    "### Operations Translation",
    "### Transition",
  ];
  for (const section of requiredSections) {
    if (!contentText.includes(section)) errors.push(`Markdown content missing required section: ${section}`);
  }

  for (const concept of requiredConcepts) {
    if (!contentText.includes(concept)) errors.push(`Markdown content missing concept key: ${concept}`);
  }

  for (const exercise of exercisePlan) {
    if (!contentText.includes(`${exercise.id} ${exercise.title}`)) {
      errors.push(`Markdown content missing exercise placement: ${exercise.id} ${exercise.title}`);
    }
  }

  const deckHits = scanTerms(contentText, forbiddenDeckPhrases);
  if (deckHits.length) {
    errors.push(`Markdown deck content contains non-human deck/tool language: ${deckHits.join(", ")}`);
  }

  const restrictedHits = scanTerms(contentText, bannedCompanyNames);
  if (restrictedHits.length) {
    errors.push(`Markdown deck content contains restricted real-company references: ${restrictedHits.join(", ")}`);
  }

  checks.push(`Markdown slide content bytes: ${contentBytes}`);
  checks.push("Markdown content includes all 35 slide headings and required sections");
  checks.push("Markdown content has no tool-specific or restricted-name deck language");
}

async function validatePromptDocument(errors, checks) {
  const promptText = await readIfExists(PROMPT_PATH);
  if (!promptText) {
    errors.push(`Participant prompt document is missing: ${rel(PROMPT_PATH)}`);
    return;
  }

  await statNonEmpty(PROMPT_PATH, "Participant prompt document", errors, 5_000);

  const requiredPhrases = [
    "ChatGPT",
    "Claude",
    "Perplexity",
    "Final Synthesis Prompt",
    "Do not invent named-company examples",
    "Do not use generic SaaS demand-generation assumptions",
    "Mark facts, assumptions, and unknowns separately",
  ];

  for (const phrase of requiredPhrases) {
    if (!promptText.includes(phrase)) errors.push(`Participant prompt document missing required phrase: ${phrase}`);
  }

  for (const exercise of exercisePlan) {
    if (!promptText.includes(exercise.promptTitle)) {
      errors.push(`Participant prompt document missing ${exercise.promptTitle}`);
    }
  }

  for (const output of finalStrategyOutputs) {
    if (!promptText.toLowerCase().includes(output.toLowerCase())) {
      errors.push(`Participant prompt document missing final output: ${output}`);
    }
  }

  const restrictedHits = scanTerms(promptText, bannedCompanyNames);
  if (restrictedHits.length) {
    errors.push(`Participant prompt document contains restricted real-company references: ${restrictedHits.join(", ")}`);
  }

  checks.push(`Participant prompts present: ${exercisePlan.length} exercises plus final synthesis`);
  checks.push(`Final strategy outputs present: ${finalStrategyOutputs.length}/${finalStrategyOutputs.length}`);
}

async function validateModuleSource(errors, checks) {
  const sourceFiles = [
    "README.md",
    "source-map.md",
    "source-coverage-audit.md",
    "instructor-guide.md",
    "learner-workbook.md",
    "capstone-project.md",
    "assessment-rubric.md",
    "delivery-pack/module-field-guide.md",
    ...lessons.map((lesson) => `lessons/${lesson.id}-${lesson.lessonTitle.toLowerCase().replace(/[:]/g, "").replace(/,/g, "").replace(/\s+/g, "-")}.md`),
  ];

  for (const file of sourceFiles) {
    const sourcePath = path.join(REPO_ROOT, "modules", "module-01-industrial-demand-generation", file);
    await statNonEmpty(sourcePath, "Module source file", errors, 500);
  }

  checks.push(`Module source files checked: ${sourceFiles.length}`);
}

async function writeReport(errors, checks) {
  await fs.mkdir(QA_ROOT, { recursive: true });

  const conceptRows = requiredConcepts.map((concept) => {
    const slides = slidePlan
      .filter((slide) => (slide.conceptKeys || []).includes(concept))
      .map((slide) => slide.no)
      .join(", ");
    return `| ${concept} | ${slides || "MISSING"} |`;
  });

  const exerciseRows = exercisePlan.map((exercise) => {
    const slide = slidePlan.find((entry) => entry.exerciseId === exercise.id);
    const status = slide && slide.no === exercise.slide ? "PASS" : "FAIL";
    return `| ${exercise.id} | ${exercise.title} | ${exercise.slide} | ${exercise.promptTitle} | ${status} |`;
  });

  const reportLines = [
    "# Consolidated Workshop Markdown Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Status: ${errors.length ? "FAIL" : "PASS"}`,
    "",
    `Source commit: \`${sourceCommit}\``,
    `Slide content: \`${rel(CONTENT_PATH)}\``,
    `Participant prompts: \`${rel(PROMPT_PATH)}\``,
    "",
    "## Checks",
    "",
    ...checks.map((check) => `- ${check}`),
    "- Slide plan mapped to all eight Module 1 lessons",
    "- Exercises are interleaved after relevant concepts",
    "- Participant prompt document supports full final strategy assembly",
    "- PPTX generation is blocked until content approval",
    "",
    "## Required Concept Coverage",
    "",
    "| Concept | Slides |",
    "|---|---:|",
    ...conceptRows,
    "",
    "## Exercise Placement",
    "",
    "| Exercise | Output | Slide | Prompt Linkage | Status |",
    "|---|---|---:|---|---|",
    ...exerciseRows,
    "",
    "## Final Strategy Outputs",
    "",
    ...finalStrategyOutputs.map((output) => `- ${output}`),
    "",
    "## Errors",
    "",
    ...(errors.length ? errors.map((error) => `- ${error}`) : ["- None"]),
  ];

  await fs.writeFile(REPORT_PATH, `${reportLines.join("\n")}\n`, "utf8");
}

async function main() {
  const errors = [];
  const checks = [];

  validateNoPptArtifacts(errors, checks);
  validateSlidePlan(errors, checks);
  await validateMarkdownContent(errors, checks);
  await validatePromptDocument(errors, checks);
  await validateModuleSource(errors, checks);
  await writeReport(errors, checks);

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} error(s). Report: ${rel(REPORT_PATH)}`);
    process.exit(1);
  }

  console.log(`Validation passed. Report: ${rel(REPORT_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
