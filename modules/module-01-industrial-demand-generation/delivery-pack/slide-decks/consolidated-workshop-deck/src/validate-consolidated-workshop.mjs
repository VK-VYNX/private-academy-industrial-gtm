#!/usr/bin/env node

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

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
const EXPORT_PATH = path.join(PACKAGE_ROOT, "exports", deckMeta.outputFile);
const PROMPT_PATH = path.resolve(PACKAGE_ROOT, deckMeta.participantPromptFile);
const SUMMARY_PATH = path.join(QA_ROOT, "last-build-summary.json");
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

function flattenText(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) flattenText(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) flattenText(item, out);
  }
  return out;
}

function collectVisibleLayoutText(value, out = []) {
  if (value == null) return out;
  if (Array.isArray(value)) {
    for (const item of value) collectVisibleLayoutText(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if ((key === "text" || key === "textPreview") && typeof item === "string") {
        out.push(item);
      } else {
        collectVisibleLayoutText(item, out);
      }
    }
  }
  return out;
}

function decodeXmlText(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function findEndOfCentralDirectory(buffer) {
  const signature = 0x06054b50;
  const minOffset = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === signature) return offset;
  }
  throw new Error("Could not locate ZIP end of central directory");
}

function extractZipEntries(buffer, filter) {
  const entries = [];
  const eocd = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(eocd + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocd + 16);
  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    if (filter(fileName)) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
        throw new Error(`Invalid local ZIP header for ${fileName}`);
      }
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      let data;
      if (compressionMethod === 0) data = compressed;
      else if (compressionMethod === 8) data = zlib.inflateRawSync(compressed);
      else throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${fileName}`);
      entries.push({ fileName, data });
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function extractPptxVisibleText(pptxPath) {
  const buffer = await fs.readFile(pptxPath);
  const entries = extractZipEntries(buffer, (name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name));
  return entries
    .map((entry) => {
      const xml = entry.data.toString("utf8");
      return Array.from(xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g))
        .map((match) => decodeXmlText(match[1]))
        .join("\n");
    })
    .join("\n");
}

function validateSlidePlan(errors, warnings, checks) {
  if (slidePlan.length !== deckMeta.slideCount) {
    errors.push(`Expected ${deckMeta.slideCount} slides, found ${slidePlan.length}`);
  }

  const seen = new Set();
  for (let index = 1; index <= deckMeta.slideCount; index += 1) {
    const slide = slidePlan.find((entry) => entry.no === index);
    if (!slide) errors.push(`Missing slide ${index}`);
  }

  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const coveredLessons = new Set();
  const coveredConcepts = new Set();
  const exerciseSlides = new Map();

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

    const longProjectionText = flattenText(slide).filter((text) => text.length > 155);
    if (longProjectionText.length) {
      warnings.push(`Slide ${pad(slide.no)} has ${longProjectionText.length} long text field(s) that should stay in instructor narration`);
    }
  }

  for (const lesson of lessons) {
    if (!coveredLessons.has(lesson.id)) errors.push(`Lesson ${lesson.id} is not represented in the consolidated slide plan`);
  }

  const missingConcepts = requiredConcepts.filter((concept) => !coveredConcepts.has(concept));
  if (missingConcepts.length) {
    errors.push(`Required concepts missing from slide plan: ${missingConcepts.join(", ")}`);
  }

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

async function validateGeneratedFiles(errors, warnings, checks) {
  const pptxBytes = await statNonEmpty(EXPORT_PATH, "PPTX export", errors, 50_000);
  await statNonEmpty(PROMPT_PATH, "Participant prompt document", errors, 5_000);
  await statNonEmpty(SUMMARY_PATH, "Build summary", errors, 500);

  const previewDir = path.join(QA_ROOT, "previews");
  const layoutDir = path.join(QA_ROOT, "layout");
  const previews = fsSync.existsSync(previewDir)
    ? fsSync.readdirSync(previewDir).filter((name) => /^slide-\d+\.png$/i.test(name)).sort()
    : [];
  const layouts = fsSync.existsSync(layoutDir)
    ? fsSync.readdirSync(layoutDir).filter((name) => /^slide-\d+\.layout\.json$/i.test(name)).sort()
    : [];

  if (previews.length !== deckMeta.slideCount) errors.push(`Expected ${deckMeta.slideCount} preview PNGs, found ${previews.length}`);
  if (layouts.length !== deckMeta.slideCount) errors.push(`Expected ${deckMeta.slideCount} layout JSON files, found ${layouts.length}`);

  for (let index = 1; index <= deckMeta.slideCount; index += 1) {
    await statNonEmpty(path.join(previewDir, `slide-${pad(index)}.png`), `Preview slide ${pad(index)}`, errors, 2_000);
    await statNonEmpty(path.join(layoutDir, `slide-${pad(index)}.layout.json`), `Layout slide ${pad(index)}`, errors, 2_000);
  }

  const summaryText = await readIfExists(SUMMARY_PATH);
  if (summaryText) {
    const summary = JSON.parse(summaryText);
    if (summary.slideCount !== deckMeta.slideCount) {
      errors.push(`Build summary slide count is ${summary.slideCount}, expected ${deckMeta.slideCount}`);
    }
    if (summary.sourceCommit !== sourceCommit) {
      errors.push(`Build summary source commit is ${summary.sourceCommit}, expected ${sourceCommit}`);
    }
    if (summary.outputBytes !== pptxBytes) {
      warnings.push(`Build summary output size ${summary.outputBytes} differs from current PPTX size ${pptxBytes}`);
    }
  }

  checks.push(`PPTX export bytes: ${pptxBytes}`);
  checks.push(`Preview PNGs: ${previews.length}/${deckMeta.slideCount}`);
  checks.push(`Layout JSON files: ${layouts.length}/${deckMeta.slideCount}`);
}

async function validatePromptDocument(errors, checks) {
  const promptText = await readIfExists(PROMPT_PATH);
  if (!promptText) return;

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

async function validateRestrictedLanguage(errors, checks) {
  const promptText = await readIfExists(PROMPT_PATH);
  const deckDataText = flattenText(slidePlan).join("\n");
  let pptxVisibleText = "";
  try {
    pptxVisibleText = await extractPptxVisibleText(EXPORT_PATH);
  } catch (error) {
    errors.push(`Could not scan PPTX visible text: ${error.message}`);
  }
  const layoutDir = path.join(QA_ROOT, "layout");
  let layoutText = "";
  if (fsSync.existsSync(layoutDir)) {
    const layoutFiles = fsSync.readdirSync(layoutDir).filter((name) => name.endsWith(".json"));
    for (const file of layoutFiles) {
      const raw = await readIfExists(path.join(layoutDir, file));
      if (!raw) continue;
      layoutText += `\n${collectVisibleLayoutText(JSON.parse(raw)).join("\n")}`;
    }
  }

  const restrictedHits = [];
  const restrictedScanItems = [
    ["slide plan", deckDataText],
    ["rendered layouts", layoutText],
    ["PPTX visible slide text", pptxVisibleText],
    ["participant prompts", promptText],
  ];

  for (const [label, text] of restrictedScanItems) {
    for (const hit of scanTerms(text, bannedCompanyNames)) restrictedHits.push(`${hit} in ${label}`);
  }
  if (restrictedHits.length) {
    errors.push(`Restricted-name scan found unexpected real company references: ${restrictedHits.join("; ")}`);
  }

  const deckToolHits = [];
  for (const [label, text] of [
    ["slide plan", deckDataText],
    ["rendered layouts", layoutText],
    ["PPTX visible slide text", pptxVisibleText],
  ]) {
    for (const hit of scanTerms(text, forbiddenDeckPhrases)) deckToolHits.push(`${hit} in ${label}`);
  }
  if (deckToolHits.length) {
    errors.push(`Human-led deck scan found tool-prompt language inside the deck: ${deckToolHits.join("; ")}`);
  }

  checks.push("Restricted-name scan completed across deck layouts, PPTX visible text, and prompt document");
  checks.push("PPTX visible slide text scan completed");
  checks.push("Human-led deck scan completed across slide plan, rendered layouts, and PPTX visible text");
}

async function writeReport(errors, warnings, checks) {
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
    "# Consolidated Workshop Deck Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Status: ${errors.length ? "FAIL" : "PASS"}`,
    "",
    `Source commit: \`${sourceCommit}\``,
    `Deck: \`${rel(EXPORT_PATH)}\``,
    `Participant prompts: \`${rel(PROMPT_PATH)}\``,
    "",
    "## Checks",
    "",
    ...checks.map((check) => `- ${check}`),
    "- Slide plan mapped to all eight Module 1 lessons",
    "- Exercises are interleaved after relevant concepts",
    "- Participant prompt document supports full final strategy assembly",
    "- Restricted-name scan completed",
    "- Human-led deck scan completed",
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
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Errors",
    "",
    ...(errors.length ? errors.map((error) => `- ${error}`) : ["- None"]),
  ];

  await fs.writeFile(REPORT_PATH, `${reportLines.join("\n")}\n`, "utf8");
}

async function main() {
  const errors = [];
  const warnings = [];
  const checks = [];

  validateSlidePlan(errors, warnings, checks);
  await validateGeneratedFiles(errors, warnings, checks);
  await validatePromptDocument(errors, checks);
  await validateModuleSource(errors, checks);
  await validateRestrictedLanguage(errors, checks);
  await writeReport(errors, warnings, checks);

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
