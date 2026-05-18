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
    "Known CRM or RevOps fields:",
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
    "- Tie recommendations to trust, proof, signals, RevOps visibility, and account movement.",
    "- If information is missing, ask for it or label the assumption clearly.",
  ].join("\n");
}

function prompt1() {
  const l = lesson("01");
  return `${sharedInputBlock()}

Task:
Summarize my Exercise 01 demand system diagnostic. Do not choose scores for me. Use only the scores and evidence I provide.

My selected Exercise 01 scores:
- Market focus: [1-5 plus evidence]
- ICP and disqualification: [1-5 plus evidence]
- Demand creation and buyer education: [1-5 plus evidence]
- Trusted distribution: [1-5 plus evidence]
- Signal capture and routing: [1-5 plus evidence]
- Cadence and ownership: [1-5 plus evidence]

Output:
Create a table with columns: operating layer, selected score, current evidence, attention needed, and what this score means.

Then produce:
- the lowest-scoring layers;
- one plain-language diagnostic summary;
- facts, assumptions, and unknowns;
- validation questions for sales, RevOps, SME, and leadership.

Do not recommend repairs yet. This prompt is only for summarizing the diagnostic.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
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
Create a table with columns: role, current belief, required belief, fear or blocker, proof needed, circulatable asset, owner, coverage status.

Then summarize:
- hidden blockers;
- missing proof assets;
- what the champion needs to sell internally;
- what RevOps should track account by account.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
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
- fit evidence;
- trigger evidence;
- access path;
- commercial value;
- committee feasibility;
- proof availability;
- pilot feasibility;
- disqualification clarity.

Output:
Create a scorecard table, then write:
- recommended 90-day ICP focus statement;
- trigger definition;
- technical fit;
- commercial fit;
- access path;
- likely committee roles;
- at least five disqualification rules;
- risk assumptions requiring validation.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
}

function prompt4() {
  const l = lesson("04");
  return `${sharedInputBlock()}

Chosen ICP focus:
[paste from Prompt 3]

Buying committee map:
[paste from Prompt 2]

Task:
Create a MOIN grid: Map of Informational Needs.

For each critical buying role, separate buyer questions by:
- content demand: problem, risk, opportunity, cost of inaction;
- solution demand: approaches, selection criteria, implementation, comparison;
- vendor demand: proof, validation, TCO, support, procurement confidence.

Output:
Create a table with columns: role, demand state, buyer question, decision risk, proof required, asset idea, sales use, signal created.

Then prioritize the top five questions that can create account movement in the next 90 days.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
}

function prompt5() {
  const l = lesson("05");
  return `${sharedInputBlock()}

MOIN grid:
[paste from Prompt 4]

Task:
Create a first-five industrial content asset plan.

Include:
- at least two content-demand assets;
- at least two solution-demand assets;
- one vendor-demand or buyer-enablement asset.

Output:
Create a table with columns: asset, demand state, buyer role, buyer question, format, SME input required, proof required, sales use, distribution path, signal design, quality risk, build/repair/later.

Then list:
- which assets sales can use immediately;
- which assets require SME validation;
- which assets should not be built yet and why.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
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
- SME or expert profiles;
- associations and export bodies;
- trade shows and technical events;
- distributors and partners;
- consultants and project advisors;
- industry publications;
- website, search, and proven paid amplification.

Output:
Create a table with columns: asset, channel, trust reason, demand state, target role, owner, cadence, account signal, follow-up rule, operational risk.

Then create:
- event before/during/after motion;
- distributor or partner signal-capture rule;
- channels to exclude because the team cannot operate them well.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
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
Classify and route industrial demand signals.

Use four filters:
- account fit;
- demand state;
- buying committee role;
- evidence strength.

Output:
Create a table with columns: signal, source, account fit, role, demand state, strength, false-positive risk, progression state, owner, SLA, next action, missing evidence.

Allowed progression states:
- Cluster ICP;
- Future Pipeline;
- Active Focus;
- Opportunity;
- Disqualified or low-touch.

Do not route weak engagement as an opportunity.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
}

function prompt8() {
  const l = lesson("08");
  return `${sharedInputBlock()}

Paste prior artifacts:
- Demand system diagnostic: [paste]
- Buying committee map: [paste]
- ICP scorecard: [paste]
- MOIN grid: [paste]
- Content plan: [paste]
- Distribution plan: [paste]
- Signal-routing table: [paste]

Task:
Assemble a 90-day Industrial Demand Generation pilot.

Output:
Create:
1. executive summary;
2. pilot scope;
3. target ICP and exclusions;
4. buying committee risks;
5. content and proof plan;
6. distribution plan;
7. signal-routing rules;
8. RevOps fields or working boards;
9. weekly cadence agenda;
10. success metrics;
11. stop, repair, scale criteria.

Keep metrics focused on account movement and quality, not vanity activity.

Rules:
${strategyRules()}

Source standard:
${l.promise}`;
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
- Strategy body
- Tables for ICP, committee, MOIN, assets, distribution, signal routing, RevOps, metrics, cadence
- 90-day implementation plan
- Stop, repair, scale decision criteria
- Open assumptions and validation questions

Rules:
${strategyRules()}

Final quality gate:
Reject or rewrite any section that could be used unchanged by a generic SaaS company. Make the strategy industrial, committee-aware, proof-led, signal-routed, RevOps-visible, and cadence-driven.`;
}

const promptMap = {
  E1: prompt1,
  E2: prompt2,
  E3: prompt3,
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
    "- Does the output name owners, proof, signals, and RevOps implications where relevant?",
    "- What would sales, an SME, RevOps, or leadership reject?",
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
  "- The ICP is narrow enough for a 90-day pilot.",
  "- Disqualification rules are explicit.",
  "- The buying committee includes blockers, not only the visible champion.",
  "- MOIN questions are separated by role and demand state.",
  "- Content assets have SME input, sales use, distribution path, and signal design.",
  "- Distribution uses trusted channels, not owned publishing alone.",
  "- Signals are routed by fit, state, role, and strength.",
  "- RevOps fields or boards make the strategy inspectable.",
  "- The weekly cadence makes decisions, not just reports metrics.",
  "- The 90-day pilot includes stop, repair, and scale criteria.",
  "",
);

await fs.writeFile(OUTPUT_PATH, `${lines.join("\n").replace(/\n+$/u, "")}\n`, "utf8");
console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
