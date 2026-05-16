#!/usr/bin/env node

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { lessons, sourceCommit, workshopPlan } from "./lesson-data.mjs";
import { SLIDE_TYPES } from "./deck-runtime.mjs";

const SLIDE_SIZE = { width: 1280, height: 720 };
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const MODULE_DELIVERY_ROOT = path.resolve(PACKAGE_ROOT, "..");
const RENDERED_FLOWCHARTS = path.join(MODULE_DELIVERY_ROOT, "exports", "rendered-flowcharts");
const ASSET_ROOT = path.join(PACKAGE_ROOT, "assets");
const EXPORT_ROOT = path.join(PACKAGE_ROOT, "exports");
const QA_ROOT = path.join(PACKAGE_ROOT, "qa");

function pad(value) {
  return String(value).padStart(2, "0");
}

function ensureInside(child, parent) {
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe path outside ${parent}: ${child}`);
  }
}

function runtimeNodeModules() {
  if (process.env.CODEX_RUNTIME_NODE_MODULES) return process.env.CODEX_RUNTIME_NODE_MODULES;
  if (process.env.NODE_PATH) {
    const first = process.env.NODE_PATH.split(path.delimiter).find(Boolean);
    if (first && fsSync.existsSync(path.join(first, "@oai", "artifact-tool"))) return first;
  }
  const home = process.env.USERPROFILE || process.env.HOME;
  return path.join(home, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
}

async function importArtifactTool() {
  const packageDir = path.join(runtimeNodeModules(), "@oai", "artifact-tool");
  const candidates = [
    path.join(packageDir, "dist", "node", "artifact_tool.mjs"),
    path.join(packageDir, "dist", "artifact_tool.mjs"),
  ];
  const entry = candidates.find((candidate) => fsSync.existsSync(candidate));
  if (!entry) {
    throw new Error(`Could not find @oai/artifact-tool runtime package at ${packageDir}`);
  }
  return import(pathToFileURL(entry).href);
}

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  if (!bytes.byteLength) throw new Error(`Image file is empty: ${imagePath}`);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function saveBlob(blob, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  if (blob && typeof blob.arrayBuffer === "function") {
    await fs.writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
    return;
  }
  if (blob instanceof Uint8Array || Buffer.isBuffer(blob)) {
    await fs.writeFile(outputPath, Buffer.from(blob));
    return;
  }
  throw new Error("Expected a Blob or Uint8Array");
}

function normalizeFrame(options) {
  const left = options.left ?? options.x ?? 0;
  const top = options.top ?? options.y ?? 0;
  const width = options.width ?? options.w;
  const height = options.height ?? options.h;
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error("Frame requires width and height");
  }
  return { left, top, width, height };
}

function createContext() {
  const transparent = "#00000000";
  return {
    W: SLIDE_SIZE.width,
    H: SLIDE_SIZE.height,
    sourceCommit,
    assetRoot: ASSET_ROOT,
    assetPath: (...parts) => path.join(ASSET_ROOT, ...parts),
    line(fill = transparent, width = 0, style = "solid") {
      return { style, fill, width };
    },
    addShape(slide, optionsForShape) {
      const {
        geometry = "rect",
        fill = transparent,
        line = { style: "solid", fill: transparent, width: 0 },
        name,
        ...frameOptions
      } = optionsForShape;
      return slide.shapes.add({
        geometry,
        name,
        position: normalizeFrame(frameOptions),
        fill,
        line,
      });
    },
    addText(slide, optionsForText) {
      const {
        text = "",
        fontSize = 24,
        color = "#111827",
        bold = false,
        typeface = "Aptos",
        align = "left",
        valign = "top",
        fill = transparent,
        line = { style: "solid", fill: transparent, width: 0 },
        insets = { left: 0, right: 0, top: 0, bottom: 0 },
        name,
        ...frameOptions
      } = optionsForText;
      const shape = this.addShape(slide, {
        ...frameOptions,
        name,
        geometry: "rect",
        fill,
        line,
      });
      shape.text = String(text ?? "");
      shape.text.fontSize = fontSize;
      shape.text.color = color;
      shape.text.bold = Boolean(bold);
      shape.text.typeface = typeface;
      shape.text.alignment = align;
      shape.text.verticalAlignment = valign;
      shape.text.insets = insets;
      return shape;
    },
    async addImage(slide, optionsForImage) {
      const {
        path: imagePath,
        blob,
        dataUrl,
        uri,
        fit = "contain",
        alt = "",
        name,
        ...frameOptions
      } = optionsForImage;
      const source = blob
        ? { blob }
        : dataUrl
          ? { dataUrl }
          : uri
            ? { uri }
            : { blob: await readImageBlob(imagePath) };
      const image = slide.images.add({ ...source, fit, alt, name });
      image.position = normalizeFrame(frameOptions);
      return image;
    },
  };
}

async function syncAssets() {
  const required = new Set();
  for (const lesson of lessons) {
    required.add(lesson.diagram);
    for (const diagram of lesson.supportingDiagrams || []) required.add(diagram);
  }
  const outDir = path.join(ASSET_ROOT, "flowcharts");
  await fs.mkdir(outDir, { recursive: true });
  for (const name of [...required].sort()) {
    const source = path.join(RENDERED_FLOWCHARTS, name);
    const destination = path.join(outDir, name);
    if (!fsSync.existsSync(source)) throw new Error(`Missing rendered flowchart: ${source}`);
    await fs.copyFile(source, destination);
  }
  await fs.writeFile(
    path.join(outDir, "README.md"),
    [
      "# Slide Deck Flowchart Assets",
      "",
      "These SVG files are copied from `../exports/rendered-flowcharts/` by `src/build-decks.mjs` so the slide deck package is self-contained.",
      "",
      ...[...required].sort().map((name) => `- ${name}`),
      "",
    ].join("\n"),
    "utf8",
  );
}

async function writeSlideModules(lesson) {
  const deckDir = path.join(PACKAGE_ROOT, "decks", lesson.slug);
  const slidesDir = path.join(deckDir, "slides");
  ensureInside(slidesDir, PACKAGE_ROOT);
  await fs.mkdir(slidesDir, { recursive: true });
  for (let index = 1; index <= SLIDE_TYPES.length; index += 1) {
    const modulePath = path.join(slidesDir, `slide-${pad(index)}.mjs`);
    const exportName = `slide${pad(index)}`;
    const source = [
      'import { renderSlide } from "../../../src/deck-runtime.mjs";',
      'import { lessons } from "../../../src/lesson-data.mjs";',
      "",
      `const lesson = lessons.find((item) => item.id === "${lesson.id}");`,
      "",
      `export async function ${exportName}(presentation, ctx) {`,
      `  return renderSlide(presentation, ctx, lesson, ${index});`,
      "}",
      "",
    ].join("\n");
    await fs.writeFile(modulePath, source, "utf8");
  }
}

function slideNote(type, lesson) {
  const title = {
    title: lesson.lessonTitle,
    promise: "Lesson Promise",
    why: "Why This Matters In Industrial Markets",
    framework: "Core Framework",
    "mental-model": "Mental Model",
    example: "Anonymized Industrial Example",
    diagnostic: "Diagnostic Questions",
    exercise: "Exercise Setup",
    critique: "Group Critique",
    "drafting-drill": "Structured Drafting Drill",
    "quality-control": "Human Quality Control",
    revops: "RevOps Translation",
    "failure-modes": "Failure Modes / Anti-Patterns",
    "final-artifact": "Final Artifact",
    transition: "Transition",
  }[type];

  const body = {
    title: [
      `Open by naming this as ${lesson.timebox} of operating work, not a lecture.`,
      `Anchor the room on the lesson output: ${lesson.artifact}.`,
      "Remind participants to keep one manufacturing or export category consistent through the workshop.",
    ],
    promise: [
      lesson.promise,
      `The required output is: ${lesson.output}`,
      "Do not move on until learners know what they will submit at the end of the lesson.",
    ],
    why: [
      ...lesson.why,
      "Instructor move: ask for a current example where the team is measuring activity while the account has not actually moved.",
    ],
    framework: [
      lesson.frameworkTitle,
      ...lesson.framework,
      `Visual companion: ${lesson.diagram}.`,
    ],
    "mental-model": [
      lesson.mentalModelTitle,
      ...lesson.mentalModel.map((item) => `${item.label}: ${item.detail}`),
      "Ask the room which part would break first in their current operating system.",
    ],
    example: [
      `Composite example: ${lesson.exampleTitle}.`,
      ...lesson.example,
      "Keep the example anonymized and category-level. Do not invite named-company comparisons.",
    ],
    diagnostic: [
      lesson.diagnosticLead,
      ...lesson.diagnosticPrompts,
      "Use the prompts as a rapid room diagnostic before the artifact exercise.",
    ],
    exercise: [
      `${lesson.exerciseTitle}: ${lesson.exerciseTime}.`,
      ...lesson.exerciseSteps,
      `Expected artifact: ${lesson.artifact}.`,
    ],
    critique: [
      "Use the critique loop: learner presents, peers name strength, peers identify one false assumption or missing owner, then the group repairs the artifact.",
      ...lesson.critique,
    ],
    "drafting-drill": [
      "Use this as the structured drafting brief.",
      lesson.draftingBrief,
      "Require the draft to list assumptions and unknowns before learners accept any recommendation.",
      ...lesson.draftingStandards,
    ],
    "quality-control": [
      "The correction standard is operational judgment, not cosmetic polish.",
      ...lesson.qualityControl,
      "Instructor move: ask what field evidence, SME proof, or sales reality is missing.",
    ],
    revops: [
      lesson.revopsTitle,
      ...lesson.revops,
      "If this cannot be represented in a CRM field, board, owner model, or temporary working table, it is not operational yet.",
    ],
    "failure-modes": [
      "Use these anti-patterns to normalize rejection of weak work.",
      ...lesson.failureModes.map((row) => `${row[0]}: ${row[1]} -> ${row[2]}`),
    ],
    "final-artifact": [
      `Learners submit: ${lesson.artifact}.`,
      ...lesson.finalArtifact,
      "Exit gate: the artifact must change sales behavior, RevOps tracking, content decisions, or weekly cadence.",
    ],
    transition: [
      lesson.transition,
      `Next: ${lesson.nextLesson}.`,
      "Ask learners what artifact they are carrying forward before opening the next deck.",
    ],
  }[type];

  return { title, body };
}

async function writeSpeakerNotes(lesson) {
  const deckDir = path.join(PACKAGE_ROOT, "decks", lesson.slug);
  await fs.mkdir(deckDir, { recursive: true });
  const lines = [
    `# ${lesson.deckTitle} - Speaker Notes`,
    "",
    `Timebox: ${lesson.timebox}`,
    "",
    `Source lesson: \`${lesson.lessonFile}\``,
    "",
    `Source commit: \`${sourceCommit}\``,
    "",
    `Primary visual: \`assets/flowcharts/${lesson.diagram}\``,
    "",
    "## Instructor Use",
    "",
    "Use these notes as the instructor depth layer. The projected slides are intentionally concise so the instructor can teach, diagnose, and run artifact production without turning the deck into a handout.",
    "",
  ];
  SLIDE_TYPES.forEach((type, index) => {
    const note = slideNote(type, lesson);
    lines.push(`## Slide ${pad(index + 1)}: ${note.title}`, "");
    for (const item of note.body) lines.push(`- ${item}`);
    lines.push("");
  });
  await fs.writeFile(path.join(deckDir, "speaker-notes.md"), lines.join("\n"), "utf8");
}

async function writeSourceIndex() {
  const lines = [
    "# Slide Deck Source Index",
    "",
    `Canonical Module 1 commit: \`${sourceCommit}\``,
    "",
    "GitHub source remains canonical. Decks are instructor projection assets derived from the Module 1 lesson files and rendered flowchart library.",
    "",
    "| Deck | Source Lesson | PPTX Export | Primary Diagram | Supporting Diagrams |",
    "|---|---|---|---|---|",
  ];
  for (const lesson of lessons) {
    const lessonName = lesson.lessonFile.split("/lessons/").at(-1);
    lines.push(
      `| ${lesson.deckTitle} | [${lessonName}](../../lessons/${lessonName}) | [${lesson.slug}.pptx](exports/${lesson.slug}.pptx) | \`${lesson.diagram}\` | ${(lesson.supportingDiagrams || []).map((name) => `\`${name}\``).join(", ")} |`,
    );
  }
  lines.push(
    "",
    "## Build Inputs",
    "",
    "- Lesson markdown files under `../../lessons/`.",
    "- Instructor guide, learner workbook, capstone project, assessment rubric, and module field guide.",
    "- Rendered flowchart SVGs copied from `../exports/rendered-flowcharts/` into `assets/flowcharts/`.",
    "- Editable slide data in `src/lesson-data.mjs` and shared layouts in `src/deck-runtime.mjs`.",
    "",
    "## Confidentiality Boundary",
    "",
    "Deck examples are anonymized category-level composites. They are not named-company case studies and should not be taught as facts about any specific company.",
    "",
  );
  await fs.writeFile(path.join(PACKAGE_ROOT, "source-index.md"), lines.join("\n"), "utf8");
}

async function importModuleFresh(modulePath) {
  const stat = await fs.stat(modulePath);
  return import(`${pathToFileURL(modulePath).href}?mtime=${stat.mtimeMs}`);
}

async function buildDeck(artifact, lesson) {
  const { Presentation, PresentationFile } = artifact;
  const presentation = Presentation.create({ slideSize: SLIDE_SIZE });
  const ctx = createContext();
  const slides = [];
  const slidesDir = path.join(PACKAGE_ROOT, "decks", lesson.slug, "slides");
  for (let index = 1; index <= SLIDE_TYPES.length; index += 1) {
    const modulePath = path.join(slidesDir, `slide-${pad(index)}.mjs`);
    const module = await importModuleFresh(modulePath);
    const fn = module[`slide${pad(index)}`];
    if (typeof fn !== "function") throw new Error(`Missing slide function in ${modulePath}`);
    const before = presentation.slides.count;
    const slide = await fn(presentation, ctx);
    if (presentation.slides.count !== before + 1) {
      throw new Error(`${modulePath} must add exactly one slide`);
    }
    slides.push(slide);
  }

  const previewDir = path.join(QA_ROOT, "previews", lesson.slug);
  const layoutDir = path.join(QA_ROOT, "layout", lesson.slug);
  const manifestDir = path.join(QA_ROOT, "manifests");
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  await fs.mkdir(manifestDir, { recursive: true });

  const previewPaths = [];
  for (let index = 0; index < slides.length; index += 1) {
    const previewPath = path.join(previewDir, `slide-${pad(index + 1)}.png`);
    const preview = await presentation.export({ slide: slides[index], format: "png", scale: 0.45 });
    await saveBlob(preview, previewPath);
    previewPaths.push(previewPath);
    try {
      const layout = await presentation.export({ slide: slides[index], format: "layout" });
      await saveBlob(layout, path.join(layoutDir, `slide-${pad(index + 1)}.layout.json`));
    } catch (error) {
      await fs.writeFile(path.join(layoutDir, `slide-${pad(index + 1)}.layout-error.txt`), String(error.message || error), "utf8");
    }
  }

  await fs.mkdir(EXPORT_ROOT, { recursive: true });
  const out = path.join(EXPORT_ROOT, `${lesson.slug}.pptx`);
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(out);
  const stat = await fs.stat(out);
  if (stat.size <= 0) throw new Error(`Empty PPTX export: ${out}`);
  const manifest = {
    deck: lesson.deckTitle,
    sourceCommit,
    output: path.relative(PACKAGE_ROOT, out).replaceAll("\\", "/"),
    outputBytes: stat.size,
    slideCount: slides.length,
    previewCount: previewPaths.length,
    slideSize: SLIDE_SIZE,
    sourceLesson: lesson.lessonFile,
    primaryDiagram: lesson.diagram,
    builtAt: new Date().toISOString(),
  };
  await fs.writeFile(path.join(manifestDir, `${lesson.slug}.json`), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

async function main() {
  await fs.mkdir(PACKAGE_ROOT, { recursive: true });
  await fs.mkdir(QA_ROOT, { recursive: true });
  await syncAssets();
  await writeSourceIndex();
  for (const lesson of lessons) {
    await writeSlideModules(lesson);
    await writeSpeakerNotes(lesson);
  }
  const artifact = await importArtifactTool();
  const manifests = [];
  for (const lesson of lessons) {
    manifests.push(await buildDeck(artifact, lesson));
    console.log(`Built ${lesson.deckTitle}`);
  }
  await fs.writeFile(
    path.join(QA_ROOT, "last-build-summary.json"),
    `${JSON.stringify({ workshopPlan, sourceCommit, decks: manifests }, null, 2)}\n`,
    "utf8",
  );
  console.log(`Built ${manifests.length} decks into ${EXPORT_ROOT}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
