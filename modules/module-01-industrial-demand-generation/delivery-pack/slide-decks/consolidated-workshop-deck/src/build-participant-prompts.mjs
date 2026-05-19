#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exercisePlan, finalStrategyOutputs, lessons, sourceCommit } from "./consolidated-workshop-data.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_PATH = path.resolve(PACKAGE_ROOT, "..", "..", "industrial-demand-generation-participant-prompts.md");

function lesson(id) {
  const item = lessons.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing lesson ${id}`);
  return item;
}

function bullets(items = []) {
  return items.map((item) => `- ${item}`);
}

function exerciseFor(id) {
  const item = exercisePlan.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing exercise ${id}`);
  return item;
}

function sharedInputBlock() {
  return [
    "My product or product category:",
    "[write here]",
    "",
    "Target market or sector:",
    "[write here]",
    "",
    "Geography or export market:",
    "[write here]",
    "",
    "Known buyer roles:",
    "[write here]",
    "",
    "Known sales feedback:",
    "[write here]",
    "",
    "Current content or proof assets:",
    "[write here]",
    "",
    "Current channels and events:",
    "[write here]",
    "",
    "Current follow-up process:",
    "[write here]",
  ].join("\n");
}

function promptBlock(title, body) {
  return [
    `## ${title}`,
    "",
    "Copy this into ChatGPT, Claude, or Perplexity. Fill the bracketed fields first.",
    "",
    "```text",
    body.trim(),
    "```",
    "",
    "Human review before accepting the output:",
    "",
  ];
}

function strategyRules() {
  return [
    "- Do not invent named-company examples, customer claims, certifications, metrics, or market facts.",
    "- Do not use generic SaaS demand-generation assumptions.",
    "- Mark facts, assumptions, and unknowns separately.",
    "- Prefer industrial buying committee reality over single-person persona logic.",
    "- Tie recommendations to trust, proof, buyer signals, and account movement.",
    "- If information is missing, ask for it or label the assumption clearly.",
  ].join("\n");
}

function participantSourceStandard(value) {
  const operationsAbbrev = ["Rev", "Ops"].join("");
  return value
    .replace(/\bICP\b/gu, "Ideal Customer Profile (ICP)")
    .replace(/\bMOIN\b/gu, "Map of Informational Needs (MOIN)")
    .replace(/\bSME\b/gu, "Subject Matter Expert (SME)")
    .replace(/\bweekly revenue cadence\b/giu, "weekly review rhythm")
    .replace(new RegExp(`\\b${operationsAbbrev}\\b`, "gu"), "operations team");
}

function prompt1() {
  const l = lesson("01");
  return `${sharedInputBlock()}

Task:
Summarize my Exercise 01 demand system diagnostic. Do not choose scores for me. Use only the scores and evidence I provide.

My selected Exercise 01 scores:
- Market focus: [1-5 plus evidence]
- Ideal Customer Profile (ICP) and disqualification: [1-5 plus evidence]
- Demand creation and buyer education: [1-5 plus evidence]
- Trusted distribution: [1-5 plus evidence]
- Signal meaning and next action: [1-5 plus evidence]
- Weekly review and ownership: [1-5 plus evidence]

Output:
Create a table with columns: operating layer, selected score, current evidence, attention needed, and what this score means.

Then produce:
- the lowest-scoring layers;
- one plain-language diagnostic summary;
- facts, assumptions, and unknowns;
- validation questions for sales, Subject Matter Experts (SMEs), and leadership.

Do not recommend repairs yet. This prompt is only for summarizing the diagnostic.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt2() {
  const l = lesson("02");
  return `${sharedInputBlock()}

Task:
Build a buying committee and proof map for my selected industrial product or product category.

Include at least these role types where relevant:
- visible champion;
- decision maker;
- technical evaluator;
- production or operations;
- quality, validation, or compliance;
- maintenance or service;
- procurement;
- finance;
- leadership;
- consultant, distributor, or project advisor.

Output:
Create a table with columns: role, what the role cares about, possible blocker, proof needed.

Then summarize:
- the most important committee roles;
- the common blocker;
- the proof most needed.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt3() {
  const l = lesson("03");
  return `${sharedInputBlock()}

Candidate segments:
1. [segment 1]
2. [segment 2]
3. [segment 3]

Task:
Compare the three candidate industrial segments and recommend one narrow 90-day demand focus.

Score each segment from 1-5 on:
- segment clarity;
- trigger;
- fit;
- access;
- proof.

Output:
Create a simple checklist table, then write only:
- recommended 90-day Ideal Customer Profile (ICP) focus statement;
- reason this focus is strongest;
- what not to prioritize during the pilot.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt4() {
  const l = lesson("04");
  return `${sharedInputBlock()}

Chosen Ideal Customer Profile (ICP) focus:
[paste from Prompt 2]

Buying committee map:
[paste from Prompt 3]

Task:
Create a Map of Informational Needs (MOIN) buyer-question map.

For each critical buying role, separate buyer questions by:
- content demand: problem, risk, opportunity, cost of inaction;
- solution demand: approaches, selection criteria, implementation, comparison;
- vendor demand: proof, validation, Total Cost of Ownership (TCO), support, procurement confidence.

Output:
Create a table with columns: priority, role, demand state, buyer question.

Choose five to eight buyer questions total.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt5() {
  const l = lesson("05");
  return `${sharedInputBlock()}

Buyer question map:
[paste from Prompt 4]

Task:
Create a first-five industrial content asset plan.

Include:
- at least two content-demand assets;
- at least two solution-demand assets;
- one vendor-demand or buyer-enablement asset.

Output:
Create a table with columns: asset, buyer question answered, asset type, proof needed, build/repair/use-as-is/later decision.

Then list:
- which five assets belong in the 90-day pilot;
- which assets should be built, repaired, used as-is, or left for later.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt6() {
  const l = lesson("06");
  return `${sharedInputBlock()}

First-five asset plan:
[paste from Prompt 5]

Task:
Create a trust-based distribution and ecosystem plan.

Consider:
- sales sharing;
- Subject Matter Expert (SME) or expert profiles;
- associations and export bodies;
- trade shows and technical events;
- distributors and partners;
- consultants and project advisors;
- industry publications;
- website, search, and proven paid amplification.

Output:
Create a table with columns: asset, distribution path, trust reason, target buyer role.

Do not create a giant channel plan. Choose one trusted path for each asset.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt7() {
  const l = lesson("07");
  return `${sharedInputBlock()}

Known or expected signals:
1. [signal 1]
2. [signal 2]
3. [signal 3]
4. [signal 4]
5. [signal 5]

Task:
Interpret industrial demand signals and choose the next action.

Use four simple checks:
- what the buyer did;
- what it probably means;
- whether the account is a good fit;
- what could make the signal misleading.

Output:
Create a table with columns: buyer signal, what it probably means, good-fit account, next action, misreading risk.

Do not route weak engagement as an opportunity.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function prompt8() {
  const l = lesson("08");
  return `${sharedInputBlock()}

Paste prior artifacts:
- Demand system diagnostic: [paste]
- Ideal Customer Profile focus statement: [paste]
- Buying committee map: [paste]
- Buyer question map: [paste]
- Content plan: [paste]
- Distribution plan: [paste]
- Signal meaning and next-action table: [paste]

Task:
Assemble a 90-day Industrial Demand Generation pilot.

Output:
Create:
1. pilot scope;
2. 90-day focus;
3. main buying roles;
4. top buyer questions;
5. first-five assets;
6. trusted distribution paths;
7. signal actions;
8. four-phase 90-day action plan;
9. five success measures;
10. stop, repair, scale criteria.

Keep metrics focused on account movement and quality, not vanity activity.

Rules:
${strategyRules()}

Source standard:
${participantSourceStandard(l.promise)}`;
}

function synthesisPrompt() {
  return `${sharedInputBlock()}

Paste all completed exercise outputs:
[paste all eight outputs here]

Task:
Turn the eight workshop outputs into a full-scale Industrial Demand Generation strategy for my chosen product or product category.

Required sections:
${finalStrategyOutputs.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Output format:
- Executive summary
- Eight workshop artifacts in the Slide 03 sequence
- 90-day pilot plan
- Stop, repair, scale decision criteria
- Open assumptions and validation questions

Rules:
${strategyRules()}

Final quality gate:
Reject or rewrite any section that could be used unchanged by a generic SaaS company. Make the strategy industrial, committee-aware, proof-led, signal-aware, and focused on account movement.`;
}

const promptMap = {
  E1: prompt1,
  E2: prompt3,
  E3: prompt2,
  E4: prompt4,
  E5: prompt5,
  E6: prompt6,
  E7: prompt7,
  E8: prompt8,
};

const lines = [
  "# Industrial Demand Generation Participant Prompt Templates",
  "",
  "These prompt templates support the consolidated Module 1 instructor-led workshop. Participants can use a free ChatGPT, Claude, or Perplexity account to draft each artifact, but the instructor and participant must validate every output with industrial judgment before accepting it.",
  "",
  `Source commit: \`${sourceCommit}\``,
  "",
  "## How To Use",
  "",
  "- Choose one product or product category and keep it consistent for the full workshop.",
  "- Fill the bracketed inputs before pasting a prompt into a chat tool.",
  "- Paste prior exercise outputs into later prompts where requested.",
  "- Treat every generated response as a first draft, not final truth.",
  "- Keep confidential customer names, pricing, designs, and private sales notes out of free chat tools.",
  "- Use anonymized category-level examples only.",
  "",
  "## Final Workshop Output",
  "",
  ...bullets(finalStrategyOutputs),
  "",
  "## Shared Quality Rules",
  "",
  strategyRules(),
  "",
];

for (const exercise of exercisePlan) {
  const makePrompt = promptMap[exercise.id];
  lines.push(...promptBlock(exercise.promptTitle, makePrompt()));
  lines.push(
    `- Does the output help produce: ${exercise.output}?`,
    "- Are facts, assumptions, and unknowns clearly separated?",
    "- Does the output stay within the exercise artifact and stop there?",
    "- What would sales, a Subject Matter Expert, or leadership reject?",
    "",
  );
}

lines.push(...promptBlock("Final Synthesis Prompt - Full Industrial Demand Generation Strategy", synthesisPrompt()));
lines.push(
  "- Does the final strategy connect all eight artifacts into one operating system?",
  "- Does it include explicit stop, repair, and scale criteria?",
  "- Does it avoid vanity metrics and generic lead-generation assumptions?",
  "- Can leadership approve, repair, or reject the pilot from evidence?",
  "",
  "## Human Quality-Control Checklist",
  "",
  "- The Ideal Customer Profile is narrow enough for a 90-day pilot.",
  "- Disqualification rules are explicit.",
  "- The buying committee includes blockers, not only the visible champion.",
  "- Map of Informational Needs questions are separated by role and demand state.",
  "- Content assets have Subject Matter Expert input, sales use, distribution path, and signal design.",
  "- Distribution uses trusted channels, not owned publishing alone.",
  "- Signals are interpreted by fit, state, role, and strength.",
  "- The weekly review makes decisions, not just reports metrics.",
  "- The 90-day pilot includes stop, repair, and scale criteria.",
  "",
);

await fs.writeFile(OUTPUT_PATH, `${lines.join("\n").replace(/\n+$/u, "")}\n`, "utf8");
console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
