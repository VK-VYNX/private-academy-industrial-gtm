#!/usr/bin/env node

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  commonIntegrativeQuestions,
  deckMeta,
  exercisePlan,
  finalStrategyOutputs,
  lessons,
  slidePlan,
  sourceCommit,
} from "./consolidated-workshop-data.mjs";

const SLIDE_SIZE = { width: 1280, height: 720 };
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const EXPORT_ROOT = path.join(PACKAGE_ROOT, "exports");
const QA_ROOT = path.join(PACKAGE_ROOT, "qa");

const theme = {
  bg: "#F4F5EF",
  panel: "#FFFFFF",
  ink: "#172026",
  muted: "#5D686D",
  dark: "#12232B",
  steel: "#1D6072",
  rust: "#A85D2A",
  olive: "#667A39",
  gold: "#B7953B",
  red: "#A8493D",
  paleSteel: "#DCE8E9",
  paleRust: "#F1E0D5",
  paleOlive: "#E5EAD9",
  paleGold: "#F2EAD0",
  line: "#D8DDD3",
};

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
  if (!entry) throw new Error(`Could not find @oai/artifact-tool runtime package at ${packageDir}`);
  return import(pathToFileURL(entry).href);
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
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error("Frame requires width and height");
  return { left, top, width, height };
}

function createContext() {
  const transparent = "#00000000";
  return {
    W: SLIDE_SIZE.width,
    H: SLIDE_SIZE.height,
    sourceCommit,
    line(fill = transparent, width = 0, style = "solid") {
      return { style, fill, width };
    },
    addShape(slide, options) {
      const { geometry = "rect", fill = transparent, line = { style: "solid", fill: transparent, width: 0 }, name, ...frame } = options;
      return slide.shapes.add({ geometry, name, position: normalizeFrame(frame), fill, line });
    },
    addText(slide, options) {
      const {
        text = "",
        fontSize = 24,
        color = theme.ink,
        bold = false,
        typeface = "Aptos",
        align = "left",
        valign = "top",
        fill = transparent,
        line = { style: "solid", fill: transparent, width: 0 },
        insets = { left: 0, right: 0, top: 0, bottom: 0 },
        name,
        ...frame
      } = options;
      const shape = this.addShape(slide, { ...frame, name, geometry: "rect", fill, line });
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
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function compact(value, max = 110) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).replace(/\s+\S*$/u, "")}...`;
}

function l(id) {
  const found = lessons.find((lesson) => lesson.id === id);
  if (!found) throw new Error(`Missing lesson ${id}`);
  return found;
}

function ex(id) {
  const found = exercisePlan.find((exercise) => exercise.id === id);
  if (!found) throw new Error(`Missing exercise ${id}`);
  return found;
}

function rect(slide, ctx, x, y, w, h, fill, opts = {}) {
  return ctx.addShape(slide, {
    left: x,
    top: y,
    width: w,
    height: h,
    fill,
    geometry: opts.geometry ?? "rect",
    line: opts.line ?? ctx.line(opts.stroke ?? fill, opts.strokeWidth ?? 0),
    name: opts.name,
  });
}

function text(slide, ctx, value, x, y, w, h, opts = {}) {
  return ctx.addText(slide, {
    text: value,
    left: x,
    top: y,
    width: w,
    height: h,
    fontSize: opts.size ?? 16,
    color: opts.color ?? theme.ink,
    bold: opts.bold ?? false,
    typeface: opts.display ? "Aptos Display" : "Aptos",
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    fill: opts.fill ?? "#00000000",
    line: opts.line ?? ctx.line(),
    insets: opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function line(slide, ctx, x, y, w, h = 2, color = theme.line) {
  rect(slide, ctx, x, y, w, h, color);
}

function bg(slide, ctx, item) {
  rect(slide, ctx, 0, 0, ctx.W, ctx.H, theme.bg);
  rect(slide, ctx, 0, 0, 24, ctx.H, theme.dark);
  rect(slide, ctx, 24, 0, 6, ctx.H, theme.rust);
  text(slide, ctx, "PRIVATE ACADEMY / MODULE 1 / INDUSTRIAL DEMAND GENERATION", 56, 28, 640, 18, {
    size: 9,
    color: theme.muted,
    bold: true,
  });
  text(slide, ctx, `${pad(item.no)} / ${slidePlan.length}`, 1120, 28, 90, 18, {
    size: 9,
    color: theme.muted,
    align: "right",
    bold: true,
  });
  line(slide, ctx, 56, 674, 1130, 1, theme.line);
  text(slide, ctx, "Consolidated instructor deck", 56, 690, 320, 16, { size: 9, color: theme.muted });
  text(slide, ctx, `Source commit ${sourceCommit}`, 930, 690, 250, 16, { size: 8, color: theme.muted, align: "right" });
}

function title(slide, ctx, item) {
  text(slide, ctx, item.title, 56, 66, 820, 58, { size: 30, bold: true, display: true });
  text(slide, ctx, item.subtitle, 56, 122, 900, 44, { size: 15, color: theme.muted });
}

function chromeOverlay(slide, ctx, item) {
  rect(slide, ctx, 0, 0, ctx.W, 176, theme.bg, { stroke: theme.bg, strokeWidth: 1 });
  rect(slide, ctx, 0, 0, 24, 176, theme.dark, { stroke: theme.dark, strokeWidth: 1 });
  rect(slide, ctx, 24, 0, 6, 176, theme.rust, { stroke: theme.rust, strokeWidth: 1 });
  text(slide, ctx, "PRIVATE ACADEMY / MODULE 1 / INDUSTRIAL DEMAND GENERATION", 56, 28, 640, 18, {
    size: 9,
    color: theme.muted,
    bold: true,
  });
  text(slide, ctx, `${pad(item.no)} / ${slidePlan.length}`, 1120, 28, 90, 18, {
    size: 9,
    color: theme.muted,
    align: "right",
    bold: true,
  });
  title(slide, ctx, item);
  rect(slide, ctx, 0, 668, ctx.W, 52, theme.bg, { stroke: theme.bg, strokeWidth: 1 });
  rect(slide, ctx, 0, 668, 24, 52, theme.dark, { stroke: theme.dark, strokeWidth: 1 });
  rect(slide, ctx, 24, 668, 6, 52, theme.rust, { stroke: theme.rust, strokeWidth: 1 });
  line(slide, ctx, 56, 674, 1130, 1, theme.line);
  text(slide, ctx, "Consolidated instructor deck", 56, 690, 320, 16, { size: 9, color: theme.muted });
  text(slide, ctx, `Source commit ${sourceCommit}`, 930, 690, 250, 16, { size: 8, color: theme.muted, align: "right" });
}

function section(slide, ctx, label, x, y, color = theme.steel) {
  rect(slide, ctx, x, y + 7, 30, 2, color);
  text(slide, ctx, label.toUpperCase(), x + 40, y, 280, 18, { size: 9, color: theme.muted, bold: true });
}

function panel(slide, ctx, x, y, w, h, opts = {}) {
  rect(slide, ctx, x, y, w, h, opts.fill ?? theme.panel, {
    stroke: opts.stroke ?? theme.line,
    strokeWidth: opts.strokeWidth ?? 1,
  });
}

function pill(slide, ctx, value, x, y, w, fill, color = theme.ink) {
  rect(slide, ctx, x, y, w, 28, fill, { stroke: fill, strokeWidth: 1 });
  text(slide, ctx, value, x + 8, y + 6, w - 16, 14, { size: 9, bold: true, color, align: "center" });
}

function bullets(slide, ctx, items, x, y, w, opts = {}) {
  const gap = opts.gap ?? 38;
  const max = opts.max ?? items.length;
  items.slice(0, max).forEach((value, index) => {
    const top = y + index * gap;
    rect(slide, ctx, x, top + 8, 7, 7, opts.dot ?? theme.steel);
    text(slide, ctx, compact(value, opts.maxChars ?? 100), x + 20, top, w - 20, gap - 4, {
      size: opts.size ?? 14,
      color: opts.color ?? theme.ink,
      bold: opts.bold ?? false,
    });
  });
}

function miniCard(slide, ctx, label, value, x, y, w, h, color = theme.steel, fill = "#FFFFFF") {
  panel(slide, ctx, x, y, w, h, { fill });
  rect(slide, ctx, x, y, w, 6, color);
  text(slide, ctx, label, x + 18, y + 20, w - 36, 20, { size: 10, color, bold: true });
  text(slide, ctx, value, x + 18, y + 48, w - 36, h - 60, { size: 15, bold: true, display: true });
}

function drawFlow(slide, ctx, items, x, y, w, h, opts = {}) {
  const gap = opts.gap ?? 12;
  const cellW = (w - gap * (items.length - 1)) / items.length;
  items.forEach((item, index) => {
    const left = x + index * (cellW + gap);
    miniCard(slide, ctx, item.label ?? String(index + 1), item.value ?? item, left, y, cellW, h, item.color ?? [theme.steel, theme.rust, theme.olive, theme.gold][index % 4], item.fill ?? "#FFFFFF");
    if (index < items.length - 1) line(slide, ctx, left + cellW + 2, y + h / 2, gap - 4, 2, theme.muted);
  });
}

function drawMatrix(slide, ctx, rows, cols, x, y, w, h, opts = {}) {
  const labelW = opts.labelW ?? 170;
  const headerH = 42;
  const rowH = (h - headerH) / rows.length;
  const colW = (w - labelW) / cols.length;
  panel(slide, ctx, x, y, w, h, { fill: "#FFFFFF" });
  rect(slide, ctx, x, y, w, headerH, theme.dark);
  text(slide, ctx, opts.corner ?? "", x + 10, y + 13, labelW - 20, 14, { size: 9, color: "#FFFFFF", bold: true });
  cols.forEach((col, c) => text(slide, ctx, col, x + labelW + c * colW + 8, y + 12, colW - 16, 18, { size: 10, color: "#FFFFFF", bold: true, align: "center" }));
  rows.forEach((row, r) => {
    const top = y + headerH + r * rowH;
    if (r % 2) rect(slide, ctx, x, top, w, rowH, "#F9FAF7");
    line(slide, ctx, x, top, w, 1, theme.line);
    text(slide, ctx, row, x + 12, top + 12, labelW - 24, 22, { size: 11, bold: true });
    cols.forEach((_, c) => {
      const fill = [theme.paleSteel, theme.paleRust, theme.paleOlive][c % 3];
      rect(slide, ctx, x + labelW + c * colW + 16, top + 12, colW - 32, rowH - 24, fill, { stroke: fill });
    });
  });
}

function drawSlide(presentation, ctx, item) {
  const slide = presentation.slides.add();
  bg(slide, ctx, item);
  title(slide, ctx, item);
  rect(slide, ctx, 30, 186, ctx.W - 30, 482, theme.bg, { stroke: theme.bg, strokeWidth: 1 });
  const S = {
    one: l("01"),
    two: l("02"),
    three: l("03"),
    four: l("04"),
    five: l("05"),
    six: l("06"),
    seven: l("07"),
    eight: l("08"),
  };

  switch (item.type) {
    case "title-system":
      renderTitleSystem(slide, ctx, item, S);
      break;
    case "outcome":
      renderOutcome(slide, ctx);
      break;
    case "artifact-chain":
      renderArtifactChain(slide, ctx);
      break;
    case "leadgen-fail":
      renderLeadGenFail(slide, ctx);
      break;
    case "engine-loop":
      renderEngineLoop(slide, ctx, S.one);
      break;
    case "demand-states":
      renderDemandStates(slide, ctx);
      break;
    case "exercise-diagnostic":
      renderExercise(slide, ctx, item, S.one, ["Market focus", "ICP", "Demand creation", "Distribution", "Signal routing", "Cadence"], "Score each layer, then name one repair in focus, content/distribution, and signal/cadence.");
      break;
    case "committee-map":
      renderCommittee(slide, ctx);
      break;
    case "enablement-lanes":
      renderEnablement(slide, ctx);
      break;
    case "proof-matrix":
      renderProofMatrix(slide, ctx);
      break;
    case "exercise-committee":
      renderExercise(slide, ctx, item, S.two, ["Role", "Fear", "Required belief", "Proof", "Asset", "Owner"], "Map at least five roles. Include blockers, procurement, finance, and external advisors where relevant.");
      break;
    case "icp-focus":
      renderIcpFocus(slide, ctx);
      break;
    case "icp-scorecard":
      renderIcpScorecard(slide, ctx);
      break;
    case "disqualification-gates":
      renderDisqualification(slide, ctx);
      break;
    case "exercise-icp":
      renderExercise(slide, ctx, item, S.three, ["Fit", "Trigger", "Access", "Value", "Proof", "Exclusion"], "Choose one 90-day focus segment and write at least five rejection rules.");
      break;
    case "moin-grid":
      renderMoinGrid(slide, ctx);
      break;
    case "buyer-questions":
      renderBuyerQuestions(slide, ctx);
      break;
    case "question-proof":
      renderQuestionProof(slide, ctx);
      break;
    case "exercise-moin":
      renderExercise(slide, ctx, item, S.four, ["Role", "Demand state", "Question", "Risk", "Proof", "Signal"], "Build the buyer question grid and prioritize five assets by account movement potential.");
      break;
    case "content-engine":
      renderContentEngine(slide, ctx);
      break;
    case "first-five-assets":
      renderFirstFive(slide, ctx);
      break;
    case "exercise-content":
      renderExercise(slide, ctx, item, S.five, ["Asset", "State", "SME input", "Sales use", "Channel", "Signal"], "Create two content-demand assets, two solution-demand assets, and one vendor or enablement asset.");
      break;
    case "distribution-half":
      renderDistributionHalf(slide, ctx);
      break;
    case "channel-ecosystem":
      renderChannelEcosystem(slide, ctx);
      break;
    case "event-partner":
      renderEventPartner(slide, ctx);
      break;
    case "exercise-distribution":
      renderExercise(slide, ctx, item, S.six, ["Channel", "Trust reason", "Owner", "Cadence", "Signal", "Follow-up"], "Map channels the team can actually operate. Every channel needs an owner and signal-capture rule.");
      break;
    case "signal-filters":
      renderSignalFilters(slide, ctx);
      break;
    case "routing-tree":
      renderRoutingTree(slide, ctx);
      break;
    case "revops-signal":
      renderRevopsSignal(slide, ctx);
      break;
    case "exercise-routing":
      renderExercise(slide, ctx, item, S.seven, ["Signal", "Fit", "State", "Role", "Strength", "Action"], "Classify five signals. Downgrade weak or low-fit signals before they reach sales.");
      break;
    case "measurement":
      renderMeasurement(slide, ctx);
      break;
    case "weekly-cadence":
      renderWeeklyCadence(slide, ctx);
      break;
    case "pilot-roadmap":
      renderPilotRoadmap(slide, ctx);
      break;
    case "exercise-pilot":
      renderExercise(slide, ctx, item, S.eight, ["Scope", "Assets", "Distribution", "Signals", "Cadence", "Decision"], "Assemble prior artifacts into a 90-day pilot with success metrics and stop, repair, scale criteria.");
      break;
    case "sponsor-decision":
      renderSponsorDecision(slide, ctx);
      break;
    default:
      throw new Error(`Unknown slide type ${item.type}`);
  }
  chromeOverlay(slide, ctx, item);
  return slide;
}

function renderTitleSystem(slide, ctx, item, S) {
  text(slide, ctx, deckMeta.promise, 56, 176, 660, 44, { size: 18, bold: true });
  const nodes = ["Focus", "Buyer", "MOIN", "Content", "Distribution", "Signals", "Cadence"];
  const cx = 872;
  const cy = 356;
  const radius = 182;
  nodes.forEach((node, i) => {
    const angle = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius - 70;
    const y = cy + Math.sin(angle) * radius - 34;
    miniCard(slide, ctx, String(i + 1), node, x, y, 140, 68, [theme.steel, theme.rust, theme.olive, theme.gold][i % 4]);
  });
  rect(slide, ctx, cx - 94, cy - 58, 188, 116, theme.dark, { stroke: theme.dark });
  text(slide, ctx, "Account movement", cx - 74, cy - 30, 148, 52, { size: 23, color: "#FFFFFF", bold: true, align: "center", display: true });
  panel(slide, ctx, 56, 260, 560, 244, { fill: "#FFFFFF" });
  section(slide, ctx, "Module 1 operating claim", 88, 294, theme.rust);
  bullets(slide, ctx, [
    "Demand exists before it becomes a form, RFQ, or sales call.",
    "Industrial buyers move through committees, proof, trust, and timing.",
    "The system must route evidence into sales action and weekly learning.",
  ], 88, 338, 460, { gap: 48, size: 17 });
}

function renderOutcome(slide, ctx) {
  drawFlow(slide, ctx, finalStrategyOutputs.slice(0, 5).map((value, i) => ({ label: `Part ${i + 1}`, value, color: [theme.steel, theme.rust, theme.olive, theme.gold, theme.steel][i] })), 56, 226, 1070, 112);
  drawFlow(slide, ctx, finalStrategyOutputs.slice(5).map((value, i) => ({ label: `Part ${i + 6}`, value, color: [theme.rust, theme.olive, theme.gold, theme.steel, theme.rust][i] })), 150, 402, 970, 112);
  panel(slide, ctx, 56, 562, 1110, 74, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "The participant output is a strategy, not a notes document: ICP, committee, questions, assets, channels, signals, cadence, and sponsor decision in one operating plan.", 88, 584, 1030, 26, { size: 18, color: "#FFFFFF", bold: true, align: "center" });
}

function renderArtifactChain(slide, ctx) {
  const items = exercisePlan.map((exercise) => ({ label: exercise.id, value: exercise.output, color: [theme.steel, theme.rust, theme.olive, theme.gold][Number(exercise.lessonId) % 4] }));
  items.forEach((item, i) => {
    const x = 70 + (i % 4) * 284;
    const y = 214 + Math.floor(i / 4) * 160;
    miniCard(slide, ctx, item.label, item.value, x, y, 246, 116, item.color);
  });
  panel(slide, ctx, 180, 548, 900, 74, { fill: "#FFFFFF" });
  text(slide, ctx, "Each exercise is placed immediately after the concept block it operationalizes. The deck teaches, then participants build.", 220, 570, 820, 26, { size: 20, bold: true, align: "center", display: true });
}

function renderLeadGenFail(slide, ctx) {
  panel(slide, ctx, 70, 210, 500, 340, { fill: "#FFFFFF" });
  section(slide, ctx, "Lead-gen habit", 104, 242, theme.red);
  bullets(slide, ctx, ["Forms and MQLs dominate.", "Traffic and impressions look positive.", "Sales receives names without context.", "Weak RFQs consume expert attention."], 104, 290, 390, { dot: theme.red, gap: 48, size: 17 });
  panel(slide, ctx, 690, 210, 500, 340, { fill: "#FFFFFF" });
  section(slide, ctx, "Industrial demand system", 724, 242, theme.steel);
  bullets(slide, ctx, ["High-fit account movement.", "Committee roles and proof needs.", "Trusted circulation creates evidence.", "Signals routed by fit, state, role, strength."], 724, 290, 390, { dot: theme.steel, gap: 48, size: 17 });
  rect(slide, ctx, 590, 338, 78, 38, theme.dark, { stroke: theme.dark });
  text(slide, ctx, "RESET", 604, 350, 50, 12, { size: 10, color: "#FFFFFF", bold: true, align: "center" });
}

function renderEngineLoop(slide, ctx, lesson) {
  const items = lesson.framework.slice(0, 7);
  items.forEach((value, i) => {
    const x = 64 + (i % 4) * 292;
    const y = i < 4 ? 226 : 404;
    miniCard(slide, ctx, String(i + 1), value, x, y, 250, 112, [theme.steel, theme.rust, theme.olive, theme.gold][i % 4]);
  });
  panel(slide, ctx, 842, 404, 360, 112, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "If one job is missing, the system leaks trust, signal quality, or sales action.", 874, 434, 300, 42, { size: 20, color: "#FFFFFF", bold: true, display: true });
}

function renderDemandStates(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "Content demand", value: "Buyer learns problem, risk, opportunity, and cost of inaction.", color: theme.steel },
    { label: "Solution demand", value: "Buyer compares approaches, requirements, criteria, and implementation paths.", color: theme.rust },
    { label: "Vendor demand", value: "Buyer evaluates proof, fit, TCO, support, and supplier confidence.", color: theme.olive },
  ], 70, 242, 1070, 128, { gap: 26 });
  drawFlow(slide, ctx, [
    { label: "Cluster ICP", value: "Fit known; need unknown", color: theme.paleSteel },
    { label: "Future Pipeline", value: "Engagement; need unconfirmed", color: theme.paleRust },
    { label: "Active Focus", value: "Trigger or stakeholder evidence", color: theme.paleOlive },
    { label: "Opportunity", value: "Requirement, value logic, champion, next step", color: theme.paleGold },
  ], 100, 456, 1010, 106, { gap: 18 });
}

function renderExercise(slide, ctx, item, lesson, labels, instruction) {
  const exercise = ex(item.exerciseId);
  panel(slide, ctx, 58, 206, 300, 390, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, exercise.id, 92, 236, 70, 36, { size: 28, color: theme.gold, bold: true, display: true });
  text(slide, ctx, exercise.title, 92, 286, 220, 64, { size: 24, color: "#FFFFFF", bold: true, display: true });
  text(slide, ctx, exercise.output, 92, 386, 220, 92, { size: 15, color: "#DDE8EA" });
  pill(slide, ctx, lesson.timebox, 92, 520, 116, theme.paleGold, theme.dark);
  const cellW = 132;
  labels.forEach((label, i) => {
    const x = 410 + (i % 3) * 230;
    const y = 232 + Math.floor(i / 3) * 136;
    miniCard(slide, ctx, `Field ${i + 1}`, label, x, y, 190, 96, [theme.steel, theme.rust, theme.olive][i % 3]);
  });
  panel(slide, ctx, 410, 526, 690, 70, { fill: "#FFFFFF" });
  text(slide, ctx, instruction, 438, 548, 630, 26, { size: 17, bold: true, align: "center" });
}

function renderCommittee(slide, ctx) {
  const roles = ["Champion", "Decision", "Technical", "Operations", "Quality", "Maintenance", "Procurement", "Finance", "Leadership"];
  roles.forEach((role, i) => {
    const x = 68 + (i % 3) * 370;
    const y = 218 + Math.floor(i / 3) * 118;
    miniCard(slide, ctx, `Role ${i + 1}`, role, x, y, 310, 82, [theme.steel, theme.rust, theme.olive][i % 3]);
  });
  panel(slide, ctx, 270, 584, 720, 46, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "Deal stalls are often missing internal proof, not missing follow-up.", 300, 598, 660, 18, { size: 17, color: "#FFFFFF", bold: true, align: "center" });
}

function renderEnablement(slide, ctx) {
  panel(slide, ctx, 74, 226, 480, 330, { fill: "#FFFFFF" });
  section(slide, ctx, "Sales enablement", 108, 260, theme.rust);
  bullets(slide, ctx, ["What should sales say?", "What deck supports the meeting?", "How do we handle the objection in conversation?"], 108, 314, 360, { dot: theme.rust, gap: 58, size: 18 });
  panel(slide, ctx, 700, 226, 480, 330, { fill: "#FFFFFF" });
  section(slide, ctx, "Buyer enablement", 734, 260, theme.steel);
  bullets(slide, ctx, ["What must the champion repeat internally?", "What proof reduces role-specific risk?", "What asset helps the committee move without us?"], 734, 314, 360, { dot: theme.steel, gap: 58, size: 18 });
}

function renderProofMatrix(slide, ctx) {
  drawMatrix(slide, ctx, ["Operations", "Quality", "Maintenance", "Finance", "Procurement"], ["Fear", "Proof", "Asset", "Owner"], 74, 216, 1080, 372, { corner: "Role" });
  text(slide, ctx, "The proof matrix prevents the team from compressing the buying committee into one persona.", 160, 616, 960, 22, { size: 18, bold: true, align: "center" });
}

function renderIcpFocus(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "Too broad", value: "All manufacturers / all OEMs / all exporters", color: theme.red },
    { label: "Pilot focus", value: "Specific category + trigger + value threshold + reachable committee", color: theme.steel },
    { label: "Learning", value: "Specific questions, proof, access paths, routing, and exclusions", color: theme.olive },
  ], 76, 260, 1060, 132, { gap: 26 });
  panel(slide, ctx, 178, 480, 860, 74, { fill: "#FFFFFF" });
  text(slide, ctx, "Focus is revenue discipline, not positioning theater.", 220, 502, 780, 26, { size: 25, bold: true, display: true, align: "center" });
}

function renderIcpScorecard(slide, ctx) {
  drawMatrix(slide, ctx, ["Segment A", "Segment B", "Segment C"], ["Fit", "Trigger", "Access", "Value", "Proof", "Feasibility"], 70, 220, 1080, 270, { corner: "Candidate" });
  panel(slide, ctx, 170, 540, 880, 70, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "Recommendation must include both selection logic and rejection logic.", 210, 562, 800, 26, { size: 22, color: "#FFFFFF", bold: true, align: "center", display: true });
}

function renderDisqualification(slide, ctx) {
  const gates = ["Low fit", "No trigger", "No access path", "Price-only RFQ", "No repeat potential", "No proof path"];
  drawFlow(slide, ctx, gates.map((gate, i) => ({ label: `Gate ${i + 1}`, value: gate, color: i % 2 ? theme.rust : theme.red })), 56, 236, 1110, 100, { gap: 14 });
  drawFlow(slide, ctx, [
    { label: "Downgrade", value: "Low-touch nurture", color: theme.paleRust },
    { label: "Reject", value: "Do not consume sales or SME effort", color: theme.paleGold },
    { label: "Repair", value: "Clarify missing evidence before action", color: theme.paleOlive },
  ], 210, 444, 840, 116, { gap: 28 });
}

function renderMoinGrid(slide, ctx) {
  drawMatrix(slide, ctx, ["Champion", "Technical", "Operations", "Finance", "Procurement"], ["Content demand", "Solution demand", "Vendor demand"], 74, 218, 1080, 348, { corner: "Role" });
  text(slide, ctx, "MOIN maps uncertainty by role and demand state before the team decides what to build.", 160, 606, 960, 22, { size: 18, bold: true, align: "center" });
}

function renderBuyerQuestions(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "Problem belief", value: "Why does this matter now?", color: theme.steel },
    { label: "Approach belief", value: "Which solution path reduces risk?", color: theme.rust },
    { label: "Supplier belief", value: "Why trust this vendor for our use case?", color: theme.olive },
  ], 76, 250, 1060, 130, { gap: 28 });
  panel(slide, ctx, 210, 472, 840, 78, { fill: "#FFFFFF" });
  text(slide, ctx, "A strong asset answers a buyer question, reduces a decision risk, creates a signal, and gives sales a usable next move.", 244, 492, 770, 34, { size: 20, bold: true, align: "center" });
}

function renderQuestionProof(slide, ctx) {
  drawFlow(slide, ctx, ["Question", "Decision risk", "Proof", "Asset", "Sales use", "Signal"].map((v, i) => ({ label: String(i + 1), value: v, color: [theme.steel, theme.rust, theme.olive, theme.gold][i % 4] })), 60, 275, 1120, 118);
  panel(slide, ctx, 188, 492, 880, 62, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "This is the conversion path from buyer uncertainty to operating evidence.", 230, 511, 800, 22, { size: 21, color: "#FFFFFF", bold: true, align: "center" });
}

function renderContentEngine(slide, ctx) {
  const jobs = ["Problem education", "Application education", "Decision criteria", "Proof", "Buyer enablement", "Demand capture", "Sales support"];
  jobs.forEach((job, i) => {
    const x = 62 + (i % 4) * 286;
    const y = i < 4 ? 222 : 396;
    miniCard(slide, ctx, `Job ${i + 1}`, job, x, y, 246, 104, [theme.steel, theme.rust, theme.olive, theme.gold][i % 4]);
  });
  text(slide, ctx, "Content without sales use, distribution, or signal design becomes volume.", 248, 602, 760, 22, { size: 20, bold: true, align: "center" });
}

function renderFirstFive(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "2x", value: "Content-demand assets", color: theme.steel },
    { label: "2x", value: "Solution-demand assets", color: theme.rust },
    { label: "1x", value: "Vendor-demand or buyer-enablement asset", color: theme.olive },
  ], 150, 240, 920, 130, { gap: 30 });
  drawMatrix(slide, ctx, ["Asset 1", "Asset 2", "Asset 3"], ["SME input", "Sales use", "Channel", "Signal"], 150, 448, 920, 142, { corner: "Plan" });
}

function renderDistributionHalf(slide, ctx) {
  panel(slide, ctx, 76, 230, 460, 300, { fill: "#FFFFFF" });
  section(slide, ctx, "Publishing", 110, 260, theme.red);
  bullets(slide, ctx, ["Company page", "Website post", "Campaign send", "Low observable trust"], 110, 306, 340, { dot: theme.red, gap: 44, size: 17 });
  panel(slide, ctx, 720, 230, 460, 300, { fill: "#FFFFFF" });
  section(slide, ctx, "Trusted circulation", 754, 260, theme.steel);
  bullets(slide, ctx, ["SMEs and sales", "Associations and events", "Distributors and advisors", "Signals captured into cadence"], 754, 306, 340, { dot: theme.steel, gap: 44, size: 17 });
}

function renderChannelEcosystem(slide, ctx) {
  const channels = ["Sales", "SME", "Association", "Event", "Distributor", "Consultant", "Publication", "Search"];
  channels.forEach((channel, i) => {
    const x = 78 + (i % 4) * 278;
    const y = i < 4 ? 226 : 400;
    miniCard(slide, ctx, `Channel ${i + 1}`, channel, x, y, 238, 102, [theme.steel, theme.rust, theme.olive, theme.gold][i % 4]);
  });
  text(slide, ctx, "Select channels by buyer trust, stage fit, owner capacity, and account evidence.", 190, 604, 900, 22, { size: 20, bold: true, align: "center" });
}

function renderEventPartner(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "Before", value: "ICP invite list, proof assets, meeting intent", color: theme.steel },
    { label: "During", value: "Role, question, trigger, objection, next action", color: theme.rust },
    { label: "72 hours", value: "Route signals, owner, SLA, follow-up", color: theme.olive },
    { label: "Partner loop", value: "Distributor evidence and qualification rules", color: theme.gold },
  ], 76, 260, 1060, 134, { gap: 22 });
  panel(slide, ctx, 210, 492, 840, 70, { fill: "#FFFFFF" });
  text(slide, ctx, "Events and partners become demand generation only when field evidence enters the operating system.", 244, 512, 770, 26, { size: 20, bold: true, align: "center" });
}

function renderSignalFilters(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "1", value: "Account fit", color: theme.steel },
    { label: "2", value: "Demand state", color: theme.rust },
    { label: "3", value: "Buying role", color: theme.olive },
    { label: "4", value: "Evidence strength", color: theme.gold },
  ], 120, 252, 1000, 132, { gap: 28 });
  panel(slide, ctx, 250, 488, 760, 72, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "Only after these filters should the team assign action.", 290, 510, 680, 24, { size: 22, color: "#FFFFFF", bold: true, align: "center" });
}

function renderRoutingTree(slide, ctx) {
  drawFlow(slide, ctx, ["Educate", "Research", "Map committee", "Enable champion", "Activate sales", "Review opportunity", "Disqualify"].map((v, i) => ({ label: `Action ${i + 1}`, value: v, color: [theme.steel, theme.rust, theme.olive, theme.gold][i % 4] })), 48, 252, 1150, 106);
  drawMatrix(slide, ctx, ["Weak", "Moderate", "Strong"], ["Content demand", "Solution demand", "Vendor demand"], 210, 454, 840, 132, { corner: "Signal strength" });
}

function renderRevopsSignal(slide, ctx) {
  drawMatrix(slide, ctx, ["Signal object", "Progression board", "SLA tracker", "Learning log"], ["Field", "Owner", "Decision", "Next action"], 88, 220, 1040, 286, { corner: "RevOps layer" });
  panel(slide, ctx, 220, 560, 820, 56, { fill: "#FFFFFF" });
  text(slide, ctx, "If a signal lives only in chat, memory, or event notes, the operating system cannot learn.", 250, 578, 760, 20, { size: 18, bold: true, align: "center" });
}

function renderMeasurement(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "Reach", value: "Target-account reach", color: theme.paleSteel },
    { label: "Movement", value: "Future Pipeline / Active Focus", color: theme.paleRust },
    { label: "Coverage", value: "Roles engaged and enabled", color: theme.paleOlive },
    { label: "Quality", value: "Strong signals and opportunity quality", color: theme.paleGold },
  ], 88, 250, 1030, 132, { gap: 22 });
  panel(slide, ctx, 188, 488, 880, 72, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "Revenue may not close in 90 days. Movement quality can still prove whether the motion works.", 230, 508, 800, 28, { size: 21, color: "#FFFFFF", bold: true, align: "center" });
}

function renderWeeklyCadence(slide, ctx) {
  drawMatrix(slide, ctx, ["Progression", "Routing", "Proof gaps", "Commitments"], ["Evidence", "Decision", "Owner", "This week"], 88, 220, 1040, 286, { corner: "Agenda" });
  panel(slide, ctx, 220, 560, 820, 56, { fill: "#FFFFFF" });
  text(slide, ctx, "Cadence exists to make decisions: build, route, repair, disqualify, or escalate.", 250, 578, 760, 20, { size: 18, bold: true, align: "center" });
}

function renderPilotRoadmap(slide, ctx) {
  drawFlow(slide, ctx, [
    { label: "1", value: "Scope and ICP", color: theme.steel },
    { label: "2", value: "MOIN and content", color: theme.rust },
    { label: "3", value: "Distribution and signals", color: theme.olive },
    { label: "4", value: "Routing and activation", color: theme.gold },
    { label: "5", value: "Readout and decision", color: theme.steel },
  ], 64, 282, 1120, 124, { gap: 18 });
  drawFlow(slide, ctx, [
    { label: "Stop", value: "No quality movement", color: theme.red },
    { label: "Repair", value: "Motion works but layer leaks", color: theme.rust },
    { label: "Scale", value: "Repeatable movement and sales use", color: theme.olive },
  ], 220, 494, 820, 90, { gap: 26 });
}

function renderSponsorDecision(slide, ctx) {
  drawMatrix(slide, ctx, ["Strategy complete?", "Evidence visible?", "Cadence owned?", "Quality gates passed?"], ["Stop", "Repair", "Scale"], 90, 220, 1040, 260, { corner: "Sponsor question" });
  panel(slide, ctx, 200, 540, 860, 78, { fill: theme.dark, stroke: theme.dark });
  text(slide, ctx, "The final deck and workshop outputs must let leadership approve, repair, or reject the pilot from evidence.", 240, 562, 780, 28, { size: 22, color: "#FFFFFF", bold: true, align: "center", display: true });
}

async function build() {
  await fs.mkdir(EXPORT_ROOT, { recursive: true });
  await fs.mkdir(QA_ROOT, { recursive: true });
  const artifact = await importArtifactTool();
  const { Presentation, PresentationFile } = artifact;
  const presentation = Presentation.create({ slideSize: SLIDE_SIZE });
  const ctx = createContext();
  const slides = slidePlan.map((item) => drawSlide(presentation, ctx, item));
  if (slides.length !== deckMeta.slideCount) throw new Error(`Expected ${deckMeta.slideCount} slides, built ${slides.length}`);

  const previewDir = path.join(QA_ROOT, "previews");
  const layoutDir = path.join(QA_ROOT, "layout");
  const manifestDir = path.join(QA_ROOT, "manifests");
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  await fs.mkdir(manifestDir, { recursive: true });

  for (let index = 0; index < slides.length; index += 1) {
    const preview = await presentation.export({ slide: slides[index], format: "png", scale: 0.45 });
    await saveBlob(preview, path.join(previewDir, `slide-${pad(index + 1)}.png`));
    try {
      const layout = await presentation.export({ slide: slides[index], format: "layout" });
      await saveBlob(layout, path.join(layoutDir, `slide-${pad(index + 1)}.layout.json`));
    } catch (error) {
      await fs.writeFile(path.join(layoutDir, `slide-${pad(index + 1)}.layout-error.txt`), String(error.message || error), "utf8");
    }
  }

  const outputPath = path.join(EXPORT_ROOT, deckMeta.outputFile);
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(outputPath);
  const stat = await fs.stat(outputPath);
  const manifest = {
    title: deckMeta.title,
    sourceCommit,
    slideCount: slides.length,
    output: path.relative(PACKAGE_ROOT, outputPath).replaceAll("\\", "/"),
    outputBytes: stat.size,
    builtAt: new Date().toISOString(),
    slides: slidePlan.map((item) => ({
      no: item.no,
      title: item.title,
      type: item.type,
      sourceLessons: item.sourceLessons,
      conceptKeys: item.conceptKeys,
      exerciseId: item.exerciseId || null,
    })),
  };
  await fs.writeFile(path.join(manifestDir, "consolidated-workshop-deck.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(QA_ROOT, "last-build-summary.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Built ${outputPath}`);
}

build().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
