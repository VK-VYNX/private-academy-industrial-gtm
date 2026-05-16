export const SLIDE_TYPES = [
  "title",
  "promise",
  "why",
  "framework",
  "mental-model",
  "example",
  "diagnostic",
  "exercise",
  "critique",
  "ai",
  "human-correction",
  "revops",
  "failure-modes",
  "final-artifact",
  "transition",
];

const theme = {
  bg: "#F5F6F2",
  panel: "#FFFFFF",
  ink: "#172026",
  muted: "#59646A",
  line: "#D9DDD6",
  steel: "#1D6072",
  rust: "#A85D2A",
  olive: "#667A39",
  gold: "#B7953B",
  red: "#A8493D",
  dark: "#12232B",
  paleSteel: "#DCE8E9",
  paleRust: "#F0DFD5",
  paleOlive: "#E4E9D8",
};

function t(slide, ctx, text, x, y, w, h, opts = {}) {
  return ctx.addText(slide, {
    text,
    left: x,
    top: y,
    width: w,
    height: h,
    fontSize: opts.size ?? 18,
    color: opts.color ?? theme.ink,
    bold: opts.bold ?? false,
    typeface: opts.face ?? (opts.display ? "Aptos Display" : "Aptos"),
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    fill: opts.fill ?? "#00000000",
    line: opts.line ?? ctx.line(),
    insets: opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
    name: opts.name,
  });
}

function r(slide, ctx, x, y, w, h, fill, opts = {}) {
  return ctx.addShape(slide, {
    left: x,
    top: y,
    width: w,
    height: h,
    fill,
    geometry: opts.geometry ?? "rect",
    line: opts.line ?? ctx.line(),
    name: opts.name,
  });
}

function rule(slide, ctx, x, y, w, color = theme.line, h = 1) {
  r(slide, ctx, x, y, w, h, color);
}

function background(slide, ctx) {
  r(slide, ctx, 0, 0, ctx.W, ctx.H, theme.bg);
  r(slide, ctx, 0, 0, 18, ctx.H, theme.dark);
  r(slide, ctx, 18, 0, 6, ctx.H, theme.rust);
}

function kicker(slide, ctx, lesson, label, y = 34) {
  r(slide, ctx, 54, y + 7, 8, 8, theme.rust, { name: `kicker-${lesson.id}-marker` });
  t(slide, ctx, `MODULE 1 / LESSON ${lesson.id} / ${label}`.toUpperCase(), 72, y, 790, 24, {
    size: 10,
    color: theme.muted,
    bold: true,
    valign: "middle",
    name: `kicker-${lesson.id}-label`,
  });
}

function footer(slide, ctx, lesson, slideNo) {
  rule(slide, ctx, 54, 676, 1146, theme.line, 1);
  t(slide, ctx, lesson.deckTitle, 54, 688, 620, 18, { size: 9, color: theme.muted });
  t(slide, ctx, `Source: ${lesson.lessonFile} @ ${ctx.sourceCommit}`, 560, 688, 430, 18, {
    size: 8,
    color: theme.muted,
    align: "right",
  });
  t(slide, ctx, `${slideNo}/${SLIDE_TYPES.length}`, 1120, 688, 80, 18, {
    size: 9,
    color: theme.muted,
    align: "right",
  });
}

function fitLines(items, max = 6) {
  return (items || []).slice(0, max);
}

function compact(value, max = 118) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const clipped = text.slice(0, max - 3).replace(/\s+\S*$/, "");
  return `${clipped}...`;
}

function bullet(slide, ctx, items, x, y, w, opts = {}) {
  const size = opts.size ?? 16;
  const gap = opts.gap ?? 38;
  const color = opts.color ?? theme.ink;
  fitLines(items, opts.max ?? 6).forEach((item, i) => {
    const top = y + i * gap;
    r(slide, ctx, x, top + 7, 6, 6, opts.dot ?? theme.steel);
    t(slide, ctx, compact(item, opts.maxChars ?? 112), x + 18, top, w - 18, gap - 4, { size, color, valign: "top" });
  });
}

function numbered(slide, ctx, items, x, y, w, opts = {}) {
  const size = opts.size ?? 15;
  const gap = opts.gap ?? 46;
  fitLines(items, opts.max ?? 6).forEach((item, i) => {
    const top = y + i * gap;
    r(slide, ctx, x, top, 26, 26, opts.fill ?? theme.paleSteel, {
      line: ctx.line(opts.stroke ?? theme.steel, 1),
    });
    t(slide, ctx, String(i + 1), x, top + 3, 26, 20, {
      size: 11,
      color: theme.steel,
      bold: true,
      align: "center",
      valign: "middle",
    });
    t(slide, ctx, compact(item, opts.maxChars ?? 104), x + 42, top - 1, w - 42, gap - 4, { size, color: theme.ink });
  });
}

function sectionHeader(slide, ctx, label, x, y, color = theme.steel) {
  r(slide, ctx, x, y + 8, 28, 2, color);
  t(slide, ctx, label.toUpperCase(), x + 38, y, 260, 18, { size: 10, color: theme.muted, bold: true });
}

function panel(slide, ctx, x, y, w, h, opts = {}) {
  r(slide, ctx, x, y, w, h, opts.fill ?? theme.panel, {
    line: ctx.line(opts.line ?? theme.line, opts.lineWidth ?? 1),
  });
}

function titleBlock(slide, ctx, title, subtitle, x = 54, y = 92, w = 760) {
  t(slide, ctx, title, x, y, w, 136, { size: 42, color: theme.ink, bold: true, display: true });
  t(slide, ctx, subtitle, x, y + 146, w - 20, 66, { size: 18, color: theme.muted });
}

function slideTitle(slide, ctx, lesson, label, title, subtitle, slideNo) {
  background(slide, ctx);
  kicker(slide, ctx, lesson, label);
  t(slide, ctx, title, 54, 74, 850, 70, { size: 30, color: theme.ink, bold: true, display: true });
  if (subtitle) {
    t(slide, ctx, subtitle, 54, 138, 860, 42, { size: 15, color: theme.muted });
  }
  footer(slide, ctx, lesson, slideNo);
}

function headerOverlay(slide, ctx, lesson, label, title, subtitle, slideNo) {
  r(slide, ctx, 0, 0, ctx.W, 190, theme.bg);
  r(slide, ctx, 0, 0, 18, 190, theme.dark);
  r(slide, ctx, 18, 0, 6, 190, theme.rust);
  kicker(slide, ctx, lesson, label);
  t(slide, ctx, title, 54, 74, 850, 70, { size: 30, color: theme.ink, bold: true, display: true });
  if (subtitle) {
    t(slide, ctx, subtitle, 54, 138, 860, 42, { size: 15, color: theme.muted });
  }
  r(slide, ctx, 0, 672, ctx.W, 48, theme.bg);
  r(slide, ctx, 0, 672, 18, 48, theme.dark);
  r(slide, ctx, 18, 672, 6, 48, theme.rust);
  footer(slide, ctx, lesson, slideNo);
}

function mainBand(slide, ctx) {
  r(slide, ctx, 24, 190, ctx.W - 24, 482, theme.bg);
}

async function addDiagram(slide, ctx, lesson, x, y, w, h) {
  const diagramPath = ctx.assetPath("flowcharts", lesson.diagram.replace(/\.svg$/i, ".png"));
  panel(slide, ctx, x, y, w, h, { fill: "#FCFCFA" });
  await ctx.addImage(slide, {
    path: diagramPath,
    left: x + 12,
    top: y + 12,
    width: w - 24,
    height: h - 24,
    fit: "contain",
    alt: `${lesson.lessonTitle} diagram`,
    name: `diagram-${lesson.id}`,
  });
}

function drawFrameworkVisual(slide, ctx, lesson, x, y, w, h) {
  panel(slide, ctx, x, y, w, h, { fill: "#FCFCFA" });
  sectionHeader(slide, ctx, "Native operating diagram", x + 24, y + 24, theme.steel);
  const items = lesson.framework.slice(0, 7);
  const colors = [theme.steel, theme.rust, theme.olive, theme.gold, theme.steel, theme.rust, theme.olive];
  const rowY = [y + 92, y + 238];
  const colW = (w - 72) / 4;
  items.forEach((item, i) => {
    const row = i < 4 ? 0 : 1;
    const col = i < 4 ? i : i - 4;
    const nodeX = x + 28 + col * colW;
    const nodeY = rowY[row];
    const nodeW = colW - 22;
    panel(slide, ctx, nodeX, nodeY, nodeW, 96, { fill: "#FFFFFF" });
    r(slide, ctx, nodeX, nodeY, nodeW, 6, colors[i]);
    t(slide, ctx, String(i + 1), nodeX + 12, nodeY + 18, 22, 22, {
      size: 13,
      color: colors[i],
      bold: true,
      align: "center",
      valign: "middle",
    });
    t(slide, ctx, compact(item, 58), nodeX + 42, nodeY + 16, nodeW - 56, 50, { size: 12, color: theme.ink, bold: true });
    if (i < items.length - 1 && col < 3) {
      rule(slide, ctx, nodeX + nodeW + 4, nodeY + 48, 16, theme.line, 2);
    }
  });
  r(slide, ctx, x + 28, y + h - 66, w - 56, 40, theme.dark, { line: ctx.line(theme.dark, 1) });
  t(slide, ctx, `Flowchart companion: assets/flowcharts/${lesson.diagram}`, x + 48, y + h - 55, w - 96, 18, {
    size: 10,
    color: "#D6E3E5",
    align: "center",
    valign: "middle",
  });
}

function drawPill(slide, ctx, text, x, y, w, fill, color = theme.ink) {
  r(slide, ctx, x, y, w, 28, fill, { line: ctx.line(fill, 1) });
  t(slide, ctx, text, x + 10, y + 5, w - 20, 16, {
    size: 9,
    bold: true,
    color,
    align: "center",
    valign: "middle",
  });
}

function notesCue(slide, ctx, value) {
  panel(slide, ctx, 922, 562, 278, 88, { fill: theme.dark, line: theme.dark });
  t(slide, ctx, "INSTRUCTOR CUE", 942, 578, 150, 16, { size: 9, color: "#AFC3C8", bold: true });
  t(slide, ctx, value, 942, 596, 230, 42, { size: 13, color: "#FFFFFF" });
}

async function renderTitle(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  background(slide, ctx);
  kicker(slide, ctx, lesson, "Instructor projection deck");
  titleBlock(slide, ctx, lesson.lessonTitle, "Industrial Demand Generation / Live workshop projection system", 54, 112, 760);
  drawPill(slide, ctx, lesson.timebox, 54, 350, 120, theme.paleSteel, theme.steel);
  drawPill(slide, ctx, "Instructor-led", 188, 350, 136, theme.paleRust, theme.rust);
  drawPill(slide, ctx, "Artifact-first", 338, 350, 128, theme.paleOlive, theme.olive);
  panel(slide, ctx, 850, 94, 350, 456, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Lesson output", 878, 126, theme.rust);
  t(slide, ctx, lesson.artifact, 878, 158, 286, 76, { size: 22, color: theme.ink, bold: true, display: true });
  sectionHeader(slide, ctx, "Workshop rule", 878, 270, theme.steel);
  t(slide, ctx, "Teach the operating decision, run the diagnostic, then force a usable artifact. The slide is a prompt, not the handout.", 878, 302, 274, 92, {
    size: 15,
    color: theme.muted,
  });
  sectionHeader(slide, ctx, "Source commit", 878, 428, theme.olive);
  t(slide, ctx, ctx.sourceCommit, 878, 460, 160, 24, { size: 16, color: theme.ink, bold: true });
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderPromise(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "lesson promise", "The promise is an operating capability, not a concept label.", "Use this slide to set the standard for the artifact learners must produce.", slideNo);
  panel(slide, ctx, 54, 214, 650, 250, { fill: "#FFFFFF" });
  t(slide, ctx, lesson.promise, 84, 244, 590, 116, { size: 25, color: theme.ink, bold: true, display: true });
  rule(slide, ctx, 84, 386, 560, theme.rust, 2);
  t(slide, ctx, lesson.output, 84, 410, 560, 38, { size: 16, color: theme.muted });
  panel(slide, ctx, 754, 214, 446, 250, { fill: theme.dark, line: theme.dark });
  sectionHeader(slide, ctx, "Instructor stance", 788, 244, theme.gold);
  bullet(slide, ctx, [
    "Ask for evidence before opinion.",
    "Use the workbook for capture.",
    "Keep AI useful but subordinate to human correction.",
    "Do not accept generic SaaS or lead-gen answers.",
  ], 788, 282, 346, { size: 15, color: "#FFFFFF", dot: theme.gold, gap: 42 });
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderWhy(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "why it matters", "Industrial GTM punishes shallow assumptions.", "The instructor should tie every point back to long-cycle risk, committee proof, and trusted circulation.", slideNo);
  panel(slide, ctx, 54, 212, 540, 336, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Industrial reality", 86, 242, theme.steel);
  bullet(slide, ctx, lesson.why, 86, 282, 456, { size: 16, gap: 50, max: 5 });
  panel(slide, ctx, 640, 212, 560, 336, { fill: "#F9FAF7" });
  sectionHeader(slide, ctx, "Instructor correction", 672, 242, theme.rust);
  numbered(slide, ctx, [
    "Move from activity to account movement.",
    "Move from one persona to committee risk.",
    "Move from content volume to buyer uncertainty.",
    "Move from engagement scoring to signal interpretation.",
    "Move from reporting to weekly operating decisions.",
  ], 672, 286, 464, { size: 15, gap: 46, fill: theme.paleRust, stroke: theme.rust });
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderFramework(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const subtitle = "Use the diagram as the visual anchor; the visible path is the teachable sequence.";
  slideTitle(slide, ctx, lesson, "core framework", lesson.frameworkTitle, subtitle, slideNo);
  mainBand(slide, ctx);
  drawFrameworkVisual(slide, ctx, lesson, 24, 190, 1256, 482);
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "core framework", lesson.frameworkTitle, subtitle, slideNo);
  return slide;
}

async function renderMentalModel(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "mental model", lesson.mentalModelTitle, "Keep this slide conversational: make learners say what would change in their current system.", slideNo);
  const items = lesson.mentalModel.slice(0, 4);
  const startX = 54;
  const gap = 24;
  const width = (1146 - gap * 3) / 4;
  items.forEach((item, i) => {
    const x = startX + i * (width + gap);
    const color = [theme.steel, theme.rust, theme.olive, theme.gold][i % 4];
    panel(slide, ctx, x, 238, width, 286, { fill: "#FFFFFF" });
    r(slide, ctx, x, 238, width, 7, color);
    t(slide, ctx, item.label, x + 22, 272, width - 44, 44, { size: 24, color, bold: true, display: true });
    t(slide, ctx, item.detail, x + 22, 342, width - 44, 118, { size: 16, color: theme.ink });
  });
  notesCue(slide, ctx, "Ask: which box is weakest in your current category?");
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderExample(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const subtitle = "Use as an anonymized industrial pattern, not a named-company case study.";
  slideTitle(slide, ctx, lesson, "composite example", lesson.exampleTitle, subtitle, slideNo);
  mainBand(slide, ctx);
  panel(slide, ctx, 24, 190, 1256, 482, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Pattern and repair", 64, 230, theme.steel);
  bullet(slide, ctx, lesson.example, 64, 278, 1080, { size: 16, gap: 58, max: 5, maxChars: 128, dot: theme.rust });
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "composite example", lesson.exampleTitle, subtitle, slideNo);
  return slide;
}

async function renderDiagnostic(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "diagnostic", "Run the room on one hard operating question.", "This slide is the short live diagnostic before the exercise.", slideNo);
  panel(slide, ctx, 54, 206, 1146, 128, { fill: theme.dark, line: theme.dark });
  t(slide, ctx, lesson.diagnosticLead, 90, 230, 1056, 70, { size: 31, color: "#FFFFFF", bold: true, display: true, valign: "middle" });
  sectionHeader(slide, ctx, "Prompt stack", 74, 382, theme.steel);
  const cols = [lesson.diagnosticPrompts.slice(0, 3), lesson.diagnosticPrompts.slice(3, 6)];
  cols.forEach((list, i) => bullet(slide, ctx, list, 92 + i * 548, 424, 460, { size: 16, gap: 52, max: 3, dot: i ? theme.rust : theme.steel }));
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderExercise(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "exercise setup", lesson.exerciseTitle, "The exercise produces a working artifact, not class discussion notes.", slideNo);
  panel(slide, ctx, 54, 214, 330, 320, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Timebox", 86, 246, theme.rust);
  t(slide, ctx, lesson.exerciseTime, 86, 284, 238, 60, { size: 26, color: theme.ink, bold: true, display: true });
  sectionHeader(slide, ctx, "Output", 86, 384, theme.steel);
  t(slide, ctx, lesson.artifact, 86, 420, 244, 76, { size: 17, color: theme.muted });
  panel(slide, ctx, 430, 214, 770, 320, { fill: "#F9FAF7" });
  sectionHeader(slide, ctx, "Learner actions", 464, 246, theme.olive);
  numbered(slide, ctx, lesson.exerciseSteps, 464, 292, 640, { size: 16, gap: 68, fill: theme.paleOlive, stroke: theme.olive, max: 4 });
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderCritique(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const title = "Critique the operating decision, not the writing style.";
  const subtitle = "Peers should find one false assumption, missing proof need, or unclear owner.";
  slideTitle(slide, ctx, lesson, "group critique", title, subtitle, slideNo);
  mainBand(slide, ctx);
  panel(slide, ctx, 24, 190, 1256, 482, { fill: "#FFFFFF" });
  const left = lesson.critique.slice(0, Math.ceil(lesson.critique.length / 2));
  const right = lesson.critique.slice(Math.ceil(lesson.critique.length / 2));
  sectionHeader(slide, ctx, "Test the artifact", 64, 230, theme.steel);
  numbered(slide, ctx, left, 64, 278, 500, { size: 15, gap: 62, fill: theme.paleSteel, stroke: theme.steel, max: 4 });
  sectionHeader(slide, ctx, "Force the repair", 690, 230, theme.rust);
  numbered(slide, ctx, right, 690, 278, 500, { size: 15, gap: 62, fill: theme.paleRust, stroke: theme.rust, max: 4 });
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "group critique", title, subtitle, slideNo);
  return slide;
}

async function renderAi(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const title = "Use AI to structure the attempt, then make humans responsible for judgment.";
  const subtitle = "The prompt is constrained by source, assumptions, output standard, and human validation.";
  slideTitle(slide, ctx, lesson, "ai-assisted exercise", title, subtitle, slideNo);
  mainBand(slide, ctx);
  panel(slide, ctx, 24, 190, 640, 482, { fill: theme.dark, line: theme.dark });
  sectionHeader(slide, ctx, "Prompt to give AI", 64, 230, theme.gold);
  t(slide, ctx, compact(lesson.aiPrompt, 420), 64, 278, 530, 230, { size: 15, color: "#FFFFFF" });
  panel(slide, ctx, 664, 190, 616, 482, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Required output standard", 704, 230, theme.steel);
  bullet(slide, ctx, lesson.aiOutputStandards, 704, 278, 460, { size: 15, gap: 50, max: 6, dot: theme.steel });
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "ai-assisted exercise", title, subtitle, slideNo);
  return slide;
}

async function renderHuman(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const title = "AI can draft structure. Humans must repair industrial reality.";
  const subtitle = "This slide gives the instructor a rejection standard.";
  slideTitle(slide, ctx, lesson, "human correction", title, subtitle, slideNo);
  mainBand(slide, ctx);
  panel(slide, ctx, 24, 190, 806, 482, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Reject or repair when AI output...", 64, 230, theme.red);
  bullet(slide, ctx, lesson.humanCorrection, 64, 278, 640, { size: 16, gap: 48, max: 6, dot: theme.red });
  panel(slide, ctx, 830, 190, 450, 482, { fill: "#F9FAF7" });
  sectionHeader(slide, ctx, "Quality control", 870, 230, theme.olive);
  t(slide, ctx, "The correction standard is not nicer wording. It is better industrial judgment: category specificity, proof, owner, field, SLA, cadence, and disqualification where needed.", 870, 278, 300, 150, {
    size: 17,
    color: theme.ink,
  });
  notesCue(slide, ctx, "Ask what the AI is guessing.");
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "human correction", title, subtitle, slideNo);
  return slide;
}

async function renderRevops(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  slideTitle(slide, ctx, lesson, "revops translation", lesson.revopsTitle, "Every artifact must become inspectable in a field, board, owner model, or cadence.", slideNo);
  const items = lesson.revops.slice(0, 9);
  const cols = 3;
  const startX = 70;
  const startY = 238;
  const cellW = 350;
  const cellH = 74;
  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * 382;
    const y = startY + row * 94;
    panel(slide, ctx, x, y, cellW, cellH, { fill: "#FFFFFF" });
    r(slide, ctx, x, y, 6, cellH, [theme.steel, theme.rust, theme.olive][col]);
    t(slide, ctx, item, x + 22, y + 18, cellW - 42, 34, { size: 16, color: theme.ink, bold: true, valign: "middle" });
  });
  notesCue(slide, ctx, "If it cannot be tracked, it is not operational yet.");
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

async function renderFailures(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const title = "Name the anti-pattern before it becomes field behavior.";
  const subtitle = "Use this slide to make weak work easier to reject in the moment.";
  slideTitle(slide, ctx, lesson, "failure modes", title, subtitle, slideNo);
  mainBand(slide, ctx);
  const x = 24;
  const y = 190;
  const w = 1256;
  const rowH = 76;
  panel(slide, ctx, x, y, w, 482, { fill: "#FFFFFF" });
  r(slide, ctx, x, y, w, 42, theme.dark, { line: ctx.line(theme.dark, 1) });
  t(slide, ctx, "Failure mode", x + 22, y + 12, 250, 18, { size: 11, color: "#FFFFFF", bold: true });
  t(slide, ctx, "What it looks like", x + 330, y + 12, 290, 18, { size: 11, color: "#FFFFFF", bold: true });
  t(slide, ctx, "Correction", x + 700, y + 12, 300, 18, { size: 11, color: "#FFFFFF", bold: true });
  lesson.failureModes.slice(0, 4).forEach((row, i) => {
    const top = y + 42 + i * rowH;
    if (i % 2 === 1) r(slide, ctx, x, top, w, rowH, "#FAFBF8");
    rule(slide, ctx, x, top, w, theme.line, 1);
    t(slide, ctx, row[0], x + 22, top + 18, 260, 28, { size: 15, color: theme.ink, bold: true });
    t(slide, ctx, compact(row[1], 72), x + 330, top + 18, 300, 34, { size: 14, color: theme.muted });
    t(slide, ctx, compact(row[2], 84), x + 700, top + 18, 360, 34, { size: 14, color: theme.ink });
  });
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "failure modes", title, subtitle, slideNo);
  return slide;
}

async function renderArtifact(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  const title = "What learners must leave this lesson able to submit.";
  const subtitle = "Treat this as the exit gate before transitioning.";
  slideTitle(slide, ctx, lesson, "final artifact", title, subtitle, slideNo);
  mainBand(slide, ctx);
  panel(slide, ctx, 24, 190, 716, 482, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Artifact checklist", 64, 230, theme.steel);
  const left = lesson.finalArtifact.slice(0, Math.ceil(lesson.finalArtifact.length / 2));
  const right = lesson.finalArtifact.slice(Math.ceil(lesson.finalArtifact.length / 2));
  bullet(slide, ctx, left, 64, 278, 280, { size: 15, gap: 48, max: 6 });
  bullet(slide, ctx, right, 386, 278, 280, { size: 15, gap: 48, max: 6, dot: theme.rust });
  panel(slide, ctx, 740, 190, 540, 482, { fill: theme.dark, line: theme.dark });
  sectionHeader(slide, ctx, "Completion standard", 782, 238, theme.gold);
  t(slide, ctx, "The artifact passes only if sales, marketing, RevOps, leadership, and an AI agent could inspect it and know what to do next.", 782, 292, 360, 140, { size: 21, color: "#FFFFFF", bold: true, display: true });
  t(slide, ctx, "If it could be used unchanged by a generic SaaS company, it fails.", 782, 494, 340, 52, { size: 15, color: "#D6E3E5" });
  footer(slide, ctx, lesson, slideNo);
  headerOverlay(slide, ctx, lesson, "final artifact", title, subtitle, slideNo);
  return slide;
}

async function renderTransition(presentation, ctx, lesson, slideNo) {
  const slide = presentation.slides.add();
  background(slide, ctx);
  kicker(slide, ctx, lesson, "transition");
  t(slide, ctx, `Carry forward: ${lesson.artifact}`, 54, 118, 880, 66, { size: 31, color: theme.ink, bold: true, display: true });
  panel(slide, ctx, 54, 230, 760, 190, { fill: "#FFFFFF" });
  sectionHeader(slide, ctx, "Bridge", 88, 262, theme.steel);
  t(slide, ctx, lesson.transition, 88, 300, 640, 82, { size: 22, color: theme.ink, display: true });
  panel(slide, ctx, 858, 230, 342, 190, { fill: theme.dark, line: theme.dark });
  sectionHeader(slide, ctx, "Next", 890, 262, theme.gold);
  t(slide, ctx, lesson.nextLesson, 890, 302, 250, 70, { size: 22, color: "#FFFFFF", bold: true, display: true });
  panel(slide, ctx, 54, 468, 1146, 98, { fill: "#F9FAF7" });
  t(slide, ctx, commonQuestionLine(), 86, 500, 1040, 34, { size: 17, color: theme.muted, align: "center", valign: "middle" });
  footer(slide, ctx, lesson, slideNo);
  return slide;
}

function commonQuestionLine() {
  return "Recurring instructor check: sales impact / signal / RevOps field / buyer content / AI risk / industrial failure mode";
}

export async function renderSlide(presentation, ctx, lesson, slideNo) {
  const type = SLIDE_TYPES[slideNo - 1];
  switch (type) {
    case "title":
      return renderTitle(presentation, ctx, lesson, slideNo);
    case "promise":
      return renderPromise(presentation, ctx, lesson, slideNo);
    case "why":
      return renderWhy(presentation, ctx, lesson, slideNo);
    case "framework":
      return renderFramework(presentation, ctx, lesson, slideNo);
    case "mental-model":
      return renderMentalModel(presentation, ctx, lesson, slideNo);
    case "example":
      return renderExample(presentation, ctx, lesson, slideNo);
    case "diagnostic":
      return renderDiagnostic(presentation, ctx, lesson, slideNo);
    case "exercise":
      return renderExercise(presentation, ctx, lesson, slideNo);
    case "critique":
      return renderCritique(presentation, ctx, lesson, slideNo);
    case "ai":
      return renderAi(presentation, ctx, lesson, slideNo);
    case "human-correction":
      return renderHuman(presentation, ctx, lesson, slideNo);
    case "revops":
      return renderRevops(presentation, ctx, lesson, slideNo);
    case "failure-modes":
      return renderFailures(presentation, ctx, lesson, slideNo);
    case "final-artifact":
      return renderArtifact(presentation, ctx, lesson, slideNo);
    case "transition":
      return renderTransition(presentation, ctx, lesson, slideNo);
    default:
      throw new Error(`Unknown slide type for slide ${slideNo}: ${type}`);
  }
}
