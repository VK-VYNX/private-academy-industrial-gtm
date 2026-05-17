#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { commonIntegrativeQuestions, lessons, sourceCommit, workshopPlan } from "./lesson-data.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_PATH = path.join(PACKAGE_ROOT, "instructor-slide-content.md");

function pad(value) {
  return String(value).padStart(2, "0");
}

function line(value = "") {
  return String(value);
}

function bullets(items = [], indent = 0) {
  const prefix = " ".repeat(indent);
  return items.map((item) => `${prefix}- ${item}`);
}

function numbered(items = [], indent = 0) {
  const prefix = " ".repeat(indent);
  return items.map((item, index) => `${prefix}${index + 1}. ${item}`);
}

function tableEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function failureTable(rows = []) {
  return [
    "| Failure Mode | What It Looks Like | Correction |",
    "|---|---|---|",
    ...rows.map((row) => `| ${tableEscape(row[0])} | ${tableEscape(row[1])} | ${tableEscape(row[2])} |`),
  ];
}

function mentalModelTable(rows = []) {
  return [
    "| Block | Detail |",
    "|---|---|",
    ...rows.map((row) => `| ${tableEscape(row.label)} | ${tableEscape(row.detail)} |`),
  ];
}

function deckSummaryTable() {
  return [
    "| Deck | Timebox | Final Artifact |",
    "|---|---:|---|",
    ...lessons.map((lesson) => `| ${lesson.deckTitle} | ${lesson.timebox} | ${tableEscape(lesson.artifact)} |`),
  ];
}

function slideSection(number, title, visibleLines, noteLines = []) {
  const out = [
    `### Slide ${pad(number)} - ${title}`,
    "",
    "Projected Content:",
    "",
    ...visibleLines,
  ];
  if (noteLines.length) {
    out.push("", "Instructor Notes:", "", ...noteLines);
  }
  out.push("");
  return out;
}

function lessonSections(lesson) {
  const commonCheck = commonIntegrativeQuestions.join(" / ");
  const instructorCorrection = [
    "Move from activity to account movement.",
    "Move from one persona to committee risk.",
    "Move from content volume to buyer uncertainty.",
    "Move from engagement scoring to signal interpretation.",
    "Move from reporting to weekly operating decisions.",
  ];

  const slides = [
    slideSection(
      1,
      "Title Slide",
      [
        `- Title: ${lesson.lessonTitle}`,
        "- Subtitle: Industrial Demand Generation / Live workshop projection system",
        `- Timebox: ${lesson.timebox}`,
        "- Format: Instructor-led",
        "- Method: Artifact-first",
        `- Lesson output: ${lesson.artifact}`,
        "- Workshop rule: Teach the operating decision, run the diagnostic, then force a usable artifact. The slide is a teaching cue, not the handout.",
        `- Source commit: ${sourceCommit}`,
      ],
      [
        `- Open by naming this as ${lesson.timebox} of operating work, not a lecture.`,
        `- Anchor the room on the lesson output: ${lesson.artifact}.`,
        "- Remind participants to keep one manufacturing or export category consistent through the workshop.",
      ],
    ),
    slideSection(
      2,
      "Lesson Promise",
      [
        `- Promise: ${lesson.promise}`,
        `- Required output: ${lesson.output}`,
        "- Instructor stance:",
        ...bullets([
          "Ask for evidence before opinion.",
          "Use the workbook for capture.",
          "Keep first drafts subordinate to human correction.",
          "Do not accept generic SaaS or lead-generation answers.",
        ], 2),
      ],
      [
        "- Use this slide to set the standard for the artifact learners must produce.",
        "- Do not move on until learners know what they will submit at the end of the lesson.",
      ],
    ),
    slideSection(
      3,
      "Why This Matters In Industrial Markets",
      [
        "- Industrial reality:",
        ...bullets(lesson.why, 2),
        "- Instructor correction:",
        ...numbered(instructorCorrection, 2),
      ],
      [
        "- Tie every point back to long-cycle risk, committee proof, and trusted circulation.",
        "- Ask for a current example where the team is measuring activity while the account has not actually moved.",
      ],
    ),
    slideSection(
      4,
      "Core Framework",
      [
        `- Framework title: ${lesson.frameworkTitle}`,
        "- Operating sequence:",
        ...numbered(lesson.framework, 2),
        `- Primary visual companion: assets/flowcharts/${lesson.diagram}`,
        ...(lesson.supportingDiagrams?.length
          ? ["- Supporting visual companions:", ...bullets(lesson.supportingDiagrams.map((diagram) => `assets/flowcharts/${diagram}`), 2)]
          : []),
      ],
      [
        "- Use the diagram as the visual anchor.",
        "- Treat the visible path as the teachable operating sequence.",
      ],
    ),
    slideSection(
      5,
      "Mental Model",
      [
        `- Mental model title: ${lesson.mentalModelTitle}`,
        "",
        ...mentalModelTable(lesson.mentalModel),
      ],
      [
        "- Keep this slide conversational.",
        "- Ask learners which block is weakest in their current system.",
      ],
    ),
    slideSection(
      6,
      "Anonymized Industrial Example",
      [
        `- Example title: ${lesson.exampleTitle}`,
        ...bullets(lesson.example, 2),
      ],
      [
        "- Use this as an anonymized industrial pattern, not a named-company case study.",
        "- Keep the discussion at category level.",
      ],
    ),
    slideSection(
      7,
      "Diagnostic Questions",
      [
        `- Lead question: ${lesson.diagnosticLead}`,
        "- Question stack:",
        ...bullets(lesson.diagnosticPrompts, 2),
      ],
      [
        "- Run the room on one hard operating question.",
        "- Use the prompts as a rapid room diagnostic before the artifact exercise.",
      ],
    ),
    slideSection(
      8,
      "Exercise Setup",
      [
        `- Exercise: ${lesson.exerciseTitle}`,
        `- Timebox: ${lesson.exerciseTime}`,
        `- Output: ${lesson.artifact}`,
        "- Learner actions:",
        ...numbered(lesson.exerciseSteps, 2),
      ],
      [
        "- The exercise produces a working artifact, not class discussion notes.",
        "- Keep learners anchored to the same category they chose earlier.",
      ],
    ),
    slideSection(
      9,
      "Group Critique",
      [
        "- Critique standard: Critique the operating decision, not the writing style.",
        "- Prompts:",
        ...bullets(lesson.critique, 2),
      ],
      [
        "- Peers should find one false assumption, missing proof need, or unclear owner.",
        "- Use the critique loop: learner presents, peers name a strength, peers identify one false assumption or missing owner, then the group repairs the artifact.",
      ],
    ),
    slideSection(
      10,
      "Structured Drafting Drill",
      [
        "- Title: Structure the first draft before the room critiques it.",
        "- Brief:",
        `  - ${lesson.draftingBrief}`,
        "- Required output standard:",
        ...bullets(lesson.draftingStandards, 2),
      ],
      [
        "- The brief is constrained by source evidence, assumptions, output standard, and validation.",
        "- Require the draft to list assumptions and unknowns before learners accept any recommendation.",
      ],
    ),
    slideSection(
      11,
      "Human Quality Control",
      [
        "- Title: Reject weak artifacts before they become operating practice.",
        "- Reject or repair when the artifact:",
        ...bullets(lesson.qualityControl, 2),
        "- Quality-control standard: The correction standard is not nicer wording. It is better industrial judgment: category specificity, proof, owner, field, SLA, cadence, and disqualification where needed.",
      ],
      [
        "- The correction standard is operational judgment, not cosmetic polish.",
        "- Ask what field evidence, SME proof, or sales reality is missing.",
      ],
    ),
    slideSection(
      12,
      "RevOps Translation",
      [
        `- RevOps title: ${lesson.revopsTitle}`,
        "- Fields, boards, owner model, or cadence requirements:",
        ...bullets(lesson.revops, 2),
      ],
      [
        "- Every artifact must become inspectable in a field, board, owner model, or cadence.",
        "- If it cannot be tracked, it is not operational yet.",
      ],
    ),
    slideSection(
      13,
      "Failure Modes / Anti-Patterns",
      failureTable(lesson.failureModes),
      [
        "- Name the anti-pattern before it becomes field behavior.",
        "- Use this slide to make weak work easier to reject in the moment.",
      ],
    ),
    slideSection(
      14,
      "Final Artifact",
      [
        `- Learners submit: ${lesson.artifact}`,
        "- Artifact checklist:",
        ...bullets(lesson.finalArtifact, 2),
        "- Completion standard: The artifact passes only if sales, marketing, RevOps, and leadership can inspect it and know what to do next.",
        "- Rejection rule: If it could be used unchanged by a generic SaaS company, it fails.",
      ],
      [
        "- Treat this as the exit gate before transitioning.",
        "- Exit gate: the artifact must change sales behavior, RevOps tracking, content decisions, or weekly cadence.",
      ],
    ),
    slideSection(
      15,
      "Transition",
      [
        `- Carry forward: ${lesson.artifact}`,
        `- Bridge: ${lesson.transition}`,
        `- Next: ${lesson.nextLesson}`,
        `- Recurring instructor check: ${commonCheck}`,
      ],
      [
        "- Ask learners what artifact they are carrying forward before opening the next deck.",
        "- Keep the lesson connected to the overall Module 1 operating system.",
      ],
    ),
  ];

  return [
    `## ${lesson.deckTitle}`,
    "",
    `Source lesson: \`${lesson.lessonFile}\``,
    "",
    `Timebox: ${lesson.timebox}`,
    "",
    `Final lesson artifact: ${lesson.artifact}`,
    "",
    `Primary diagram: \`assets/flowcharts/${lesson.diagram}\``,
    "",
    ...(lesson.supportingDiagrams?.length
      ? [`Supporting diagrams: ${lesson.supportingDiagrams.map((diagram) => `\`assets/flowcharts/${diagram}\``).join(", ")}`, ""]
      : []),
    ...slides.flat(),
  ];
}

function buildDocument() {
  return [
    "# Module 1 Instructor Slide Content",
    "",
    "This file is the human-review source for the eight instructor projection decks in Module 1: Industrial Demand Generation.",
    "",
    "Use this Markdown file to review knowledge, teaching sequence, diagnostics, exercises, critique prompts, RevOps translation, and artifact standards before any future slide export work. The PowerPoint files are delivery artifacts; this file is the content review surface.",
    "",
    `Source commit: \`${sourceCommit}\``,
    "",
    `Workshop format: ${workshopPlan.format}`,
    "",
    `Planned teaching time: ${workshopPlan.teachingMinutes}/${workshopPlan.totalMinutes} minutes`,
    "",
    `Instructor rule: ${workshopPlan.instructorRule}`,
    "",
    "## Deck Sequence",
    "",
    ...deckSummaryTable(),
    "",
    "## Global Instructor Checks",
    "",
    ...bullets(commonIntegrativeQuestions),
    "",
    ...lessons.flatMap(lessonSections),
  ].map(line).join("\n");
}

await fs.writeFile(OUTPUT_PATH, `${buildDocument().replace(/\n+$/u, "")}\n`, "utf8");
console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
