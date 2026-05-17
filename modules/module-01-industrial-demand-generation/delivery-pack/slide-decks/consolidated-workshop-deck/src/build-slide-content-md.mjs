#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  commonIntegrativeQuestions,
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
const OUTPUT_PATH = path.join(PACKAGE_ROOT, deckMeta.contentFile);

const timing = new Map([
  [1, "3 min"],
  [2, "4 min"],
  [3, "4 min"],
  [4, "5 min"],
  [5, "6 min"],
  [6, "5 min"],
  [7, "9 min"],
  [8, "5 min"],
  [9, "5 min"],
  [10, "6 min"],
  [11, "9 min"],
  [12, "5 min"],
  [13, "5 min"],
  [14, "5 min"],
  [15, "10 min"],
  [16, "5 min"],
  [17, "5 min"],
  [18, "5 min"],
  [19, "10 min"],
  [20, "5 min"],
  [21, "6 min"],
  [22, "10 min"],
  [23, "5 min"],
  [24, "5 min"],
  [25, "5 min"],
  [26, "10 min"],
  [27, "5 min"],
  [28, "6 min"],
  [29, "5 min"],
  [30, "10 min"],
  [31, "5 min"],
  [32, "5 min"],
  [33, "6 min"],
  [34, "11 min"],
  [35, "5 min"],
]);

function lesson(id) {
  const found = lessons.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing lesson ${id}`);
  return found;
}

function exercise(id) {
  const found = exercisePlan.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing exercise ${id}`);
  return found;
}

function sourceLabels(ids) {
  return ids.map((id) => {
    const l = lesson(id);
    return `Lesson ${id}: ${l.lessonTitle}`;
  });
}

function bullets(items = []) {
  return items.map((item) => `- ${item}`);
}

function numbered(items = []) {
  return items.map((item, index) => `${index + 1}. ${item}`);
}

function compactLessonWhy(ids) {
  return ids.flatMap((id) => lesson(id).why || []).slice(0, 4);
}

const details = {
  "title-system": {
    onSlide: [
      "Industrial demand generation is the operating system that creates trust, account movement, and qualified pipeline before buyers become visible as leads.",
      "Demand often exists before a form, RFQ, or sales call.",
      "The system must connect focus, buyer reality, proof, distribution, signals, routing, and cadence.",
    ],
    infographic: [
      "Central node: Account movement.",
      "Seven surrounding nodes: Focus, Buyer, MOIN, Content, Distribution, Signals, Cadence.",
      "Directional loop shows that learning returns into focus and asset decisions.",
    ],
    notes: [
      "Open by separating demand generation from lead collection. The module is about operating decisions, not campaign volume.",
      "Use industrial buyer reality as the anchor: long cycles, committees, technical proof, trust paths, and internal risk reduction.",
      "Set the expectation that every slide contributes to a final 90-day strategy, not to a decorative presentation.",
    ],
    example: "Composite equipment supplier with strong inquiry volume but weak target-account movement.",
    transition: "Move from the operating claim to the concrete workshop output.",
  },
  outcome: {
    onSlide: [
      "Final output: one executive-ready Industrial Demand Generation strategy for a chosen product or product category.",
      "The strategy must show focus, buyer reality, proof, distribution, signals, RevOps visibility, cadence, and pilot governance.",
      "Leadership should be able to stop, repair, or scale the pilot from evidence.",
    ],
    infographic: [
      "Strategy pack stack: diagnostic, committee map, ICP scorecard, MOIN grid, content plan, distribution plan, signal routing, cadence, pilot decision.",
      "Each artifact is shown as a layer feeding the 90-day pilot.",
    ],
    notes: [
      "Make the workshop standard explicit: participants are not collecting tips; they are assembling an operating plan.",
      "The instructor should keep every discussion tied to account movement and qualified pipeline quality.",
      "Vanity metrics are not sufficient proof. The work must create observable buyer and account progression.",
    ],
    transition: "Show how the artifacts build in sequence.",
  },
  "artifact-chain": {
    onSlide: finalStrategyOutputs,
    infographic: [
      "Horizontal build chain with eight exercise outputs feeding a final sponsor decision.",
      "Exercise slides are placed immediately after the concept block they depend on.",
      "End state: 90-day pilot with stop, repair, and scale criteria.",
    ],
    notes: [
      "Tell participants that the deck is paced as a working session. They will keep improving the same strategy as new concepts are introduced.",
      "The prompt document supports drafting, but human correction decides what survives.",
      "The facilitator should keep teams from jumping ahead to tactics before focus, committee, MOIN, and distribution are clear.",
    ],
    transition: "Start with why the common lead-generation model breaks in industrial markets.",
  },
  "leadgen-fail": {
    onSlide: [
      "Lead generation assumes visible intent. Industrial buyers often research, compare, and build consensus before they become visible.",
      "Lead volume can increase while target-account movement, committee coverage, and opportunity quality stay flat.",
      "The failure is not only poor content. It is a missing operating system.",
    ],
    infographic: [
      "Two-column contrast: Lead capture motion vs industrial demand generation motion.",
      "Left: forms, RFQs, campaign sends, inquiry count, generic follow-up.",
      "Right: trust paths, role-specific proof, account signals, routed next actions, weekly learning.",
    ],
    notes: [
      "Do not insult lead capture. Reframe it as one layer that fails when treated as the whole system.",
      "Use the composite food processing equipment example: exhibition cards and RFQs looked healthy, but sales saw low-fit and price-led demand.",
      "The repair is to measure movement inside the chosen ICP, not raw activity.",
    ],
    diagnostics: [
      "Are we celebrating inquiry count while ignoring fit and buying stage?",
      "Can sales explain why a target account should be acted on now?",
      "Do we know which role, if any, created the signal?",
    ],
    transition: "Replace lead volume thinking with the industrial demand engine.",
  },
  "engine-loop": {
    onSlide: [
      "Revenue goal and market focus define where demand matters.",
      "ICP and buying committee define who must move.",
      "MOIN and proof assets define what uncertainty must be reduced.",
      "Trusted distribution creates circulation.",
      "Signals, routing, enablement, and cadence turn evidence into action.",
    ],
    infographic: [
      "Closed loop: Focus -> Buyer -> MOIN -> Content -> Distribution -> Signals -> Routing -> Cadence -> Focus.",
      "Each node has a failure warning: generic, invisible, unproved, unpublished, misread, unrouted, unlearned.",
    ],
    notes: [
      "Stress interdependence. Content without distribution is invisible. Signals without routing are noise. Cadence without decisions is reporting.",
      "The engine is the module's core mental model and will reappear in each exercise.",
      "Ask participants to identify which node is currently weakest in their company.",
    ],
    transition: "Before routing anything, classify the demand state correctly.",
  },
  "demand-states": {
    onSlide: [
      "Content demand: buyers are learning the problem, risk, opportunity, or cost of inaction.",
      "Solution demand: buyers compare approaches, requirements, implementation paths, and tradeoffs.",
      "Vendor demand: buyers evaluate proof, validation, support, TCO, procurement confidence, and supplier risk.",
      "A signal only matters after fit, state, role, and strength are interpreted.",
    ],
    infographic: [
      "Three-stage ladder: Content demand -> Solution demand -> Vendor demand.",
      "Under each stage: buyer question, asset job, signal meaning, routing action.",
      "Side warning: engagement is not automatically buying intent.",
    ],
    notes: [
      "Use this slide to slow down over-eager sales activation. A technical article view is not the same as a vendor evaluation signal.",
      "Show how the same content interaction means different things for an operator, procurement user, and executive sponsor.",
      "Tie this to later MOIN and signal-routing exercises.",
    ],
    transition: "Participants now diagnose where their current engine breaks.",
  },
  "exercise-diagnostic": {
    onSlide: [
      "Score the current demand system by operating layer.",
      "Name the weakest layer and its commercial consequence.",
      "Choose one focus repair, one content or distribution repair, and one signal or cadence repair.",
    ],
    infographic: [
      "Diagnostic scorecard with six columns: Market focus, ICP, Demand creation, Distribution, Signal routing, Cadence.",
      "Bottom row: priority repair, owner, first two-week move.",
    ],
    notes: [
      "Timebox the first pass. The point is not perfection; it is to expose the operating gap.",
      "Pair review should challenge vague repairs such as 'post more content' or 'improve leads'.",
      "Require every repair to name a business consequence and an owner.",
    ],
    exercise: "E1",
    transition: "The next block explains why buyer reality is more complex than the visible lead.",
  },
  "committee-map": {
    onSlide: [
      "Industrial buying is committee-shaped even when only one person is visible.",
      "The visible champion may understand the value while technical, operations, finance, quality, maintenance, procurement, or leadership remain unconvinced.",
      "External advisors, consultants, distributors, and project partners can shape trust before sales appears.",
    ],
    infographic: [
      "Committee constellation around the champion.",
      "Nodes: technical evaluator, operations, quality, maintenance, procurement, finance, leadership, external advisor.",
      "Each node has a fear, proof need, and influence path.",
    ],
    notes: [
      "This is the antidote to persona simplification. The buyer is a role network, not a single avatar.",
      "Ask participants which hidden role most often blocks late-stage deals in their category.",
      "Make proof circulation the main idea: the champion needs assets that travel internally.",
    ],
    transition: "Clarify why buyer enablement is different from sales enablement.",
  },
  "enablement-lanes": {
    onSlide: [
      "Sales enablement helps the seller communicate.",
      "Buyer enablement helps the buyer create internal confidence when the seller is absent.",
      "Industrial demand generation must help champions reduce perceived risk across the committee.",
    ],
    infographic: [
      "Split lane diagram.",
      "Seller lane: talk track, objection handling, qualification.",
      "Buyer lane: proof pack, technical comparison, risk memo, implementation path, internal business case.",
      "Intersection: sales uses buyer assets to create account movement.",
    ],
    notes: [
      "Do not allow the group to treat content as only top-of-funnel publishing.",
      "Buyer enablement assets should be circulatable, specific, and defensible in internal meetings.",
      "Use the question: What would the champion forward to operations, finance, or procurement?",
    ],
    transition: "Turn roles and enablement needs into a proof matrix.",
  },
  "proof-matrix": {
    onSlide: [
      "For each role, document current belief, required belief, fear or blocker, proof needed, asset, owner, and coverage status.",
      "The matrix exposes unsupported assumptions before they damage pipeline quality.",
      "Missing proof is a demand generation problem, not only a sales objection.",
    ],
    infographic: [
      "Role-by-proof matrix.",
      "Rows: operations, quality, maintenance, finance, procurement.",
      "Columns: current belief, required belief, fear, proof, asset, owner.",
      "Color code gaps as missing, partial, or ready.",
    ],
    notes: [
      "Keep the group specific. 'Trust us' is not proof. 'We are reliable' is not a circulatable asset.",
      "A good proof asset reduces one role's risk in language that role can defend.",
      "The matrix becomes a direct input to MOIN and content planning.",
    ],
    transition: "Participants now map their own committee and proof gaps.",
  },
  "exercise-committee": {
    onSlide: [
      "Map at least five buying roles.",
      "For each role, name the belief shift, blocker, required proof, asset, and owner.",
      "Flag roles where the company currently has no credible proof.",
    ],
    infographic: [
      "Working matrix: role, current belief, required belief, blocker, proof, asset, owner.",
      "Bottom strip: hidden blocker, missing asset, RevOps field to track.",
    ],
    notes: [
      "Push teams to include procurement and finance even when sales rarely speaks to them.",
      "Ask for at least one external influence path where relevant: distributor, consultant, association, event, project advisor.",
      "Human correction should remove generic role stereotypes and replace them with category-specific risks.",
    ],
    exercise: "E2",
    transition: "With buyer reality mapped, narrow the market focus.",
  },
  "icp-focus": {
    onSlide: [
      "Broad markets make content generic, signals noisy, and sales effort expensive.",
      "A 90-day demand pilot needs a narrow ICP focus with clear fit, trigger, access path, and proof feasibility.",
      "Focus is a resource decision. It determines what not to build, not only what to pursue.",
    ],
    infographic: [
      "Funnel compression visual: broad market -> candidate segments -> 90-day focus segment.",
      "Criteria tags: fit, trigger, access, commercial value, proof, committee feasibility.",
    ],
    notes: [
      "Treat ICP as operational focus, not a theoretical market description.",
      "Industrial teams often resist narrowing because each segment has some opportunity. The pilot needs learning quality, not maximum surface area.",
      "The segment must be reachable through trusted channels and supported by available proof.",
    ],
    transition: "Score candidate segments before choosing the focus.",
  },
  "icp-scorecard": {
    onSlide: [
      "Score candidate segments on fit evidence, trigger evidence, access path, commercial value, committee feasibility, proof availability, and pilot feasibility.",
      "The winning segment should be narrow enough to create specific content and reliable signals.",
      "A high-value segment is not viable if the team cannot reach it, prove value, or route signals.",
    ],
    infographic: [
      "Segment scorecard matrix.",
      "Rows: Segment A, Segment B, Segment C.",
      "Columns: fit, trigger, access, value, proof, feasibility.",
      "Decision footer: recommended focus plus assumptions to validate.",
    ],
    notes: [
      "Make the group distinguish evidence from preference.",
      "If two segments score similarly, choose the one with stronger access path and proof readiness for the 90-day pilot.",
      "The scorecard should produce a focus statement and validation risks.",
    ],
    transition: "A good ICP also says no clearly.",
  },
  "disqualification-gates": {
    onSlide: [
      "Weak-fit demand must be downgraded or rejected before it consumes sales and SME effort.",
      "Disqualification rules protect cadence quality and prevent false-positive signals.",
      "The rule is not 'ignore everything else'. It is 'do not route weak-fit activity as priority demand'.",
    ],
    infographic: [
      "Gate sequence: technical fit, trigger, role access, budget reality, proof feasibility, timing, service feasibility.",
      "Outcomes: route, nurture, research, downgrade, reject.",
    ],
    notes: [
      "Industrial teams often over-serve poor-fit demand because every inquiry feels valuable.",
      "Disqualification improves sales trust in demand generation. It shows that marketing is protecting attention, not flooding the system.",
      "Rules should be explicit enough for RevOps and sales to apply consistently.",
    ],
    transition: "Participants now choose the 90-day segment and rejection rules.",
  },
  "exercise-icp": {
    onSlide: [
      "Compare three candidate segments.",
      "Select one 90-day ICP focus.",
      "Write technical fit, commercial fit, trigger, access path, committee roles, and disqualification rules.",
    ],
    infographic: [
      "Candidate scorecard plus focus statement box.",
      "Rejection gate panel: reject, downgrade, nurture, or research.",
    ],
    notes: [
      "Do not let teams write a broad category such as 'manufacturers'. The focus must be specific enough to drive asset and channel choices.",
      "The best answer includes what the company will not pursue during the pilot.",
      "Ask sales to validate whether the chosen focus would improve opportunity quality.",
    ],
    exercise: "E3",
    transition: "With a focused ICP, map the buyer's informational needs.",
  },
  "moin-grid": {
    onSlide: [
      "MOIN means Map of Informational Needs.",
      "It converts buyer uncertainty into a role-specific content and proof roadmap.",
      "The unit of planning is not a topic. It is a buyer question that blocks movement.",
    ],
    infographic: [
      "Role-by-demand-state grid.",
      "Rows: champion, technical, operations, finance, procurement.",
      "Columns: content demand, solution demand, vendor demand.",
      "Each cell asks: question, risk, proof, asset idea.",
    ],
    notes: [
      "MOIN prevents random content planning. It starts from what each role must understand to move.",
      "Good MOIN entries use buyer language: risk, tradeoff, decision criteria, implementation concern, validation need.",
      "The grid becomes the content engine's source of truth.",
    ],
    transition: "Separate buyer questions by demand state.",
  },
  "buyer-questions": {
    onSlide: [
      "Content demand questions clarify problem, risk, opportunity, and cost of inaction.",
      "Solution demand questions compare approaches, requirements, implementation paths, and tradeoffs.",
      "Vendor demand questions test proof, validation, service, TCO, procurement confidence, and supplier risk.",
    ],
    infographic: [
      "Three stacked question banks by demand state.",
      "Each bank shows sample question pattern, required proof, and likely signal.",
    ],
    notes: [
      "Demand state determines asset job. A vendor proof sheet is premature for a buyer still defining the problem.",
      "Ask participants to identify questions that sales hears repeatedly but marketing has never turned into assets.",
      "Questions should be connected to account movement and signal interpretation.",
    ],
    transition: "Turn questions into proof, assets, and signals.",
  },
  "question-proof": {
    onSlide: [
      "Every serious buyer question should create a chain: question -> risk -> proof -> asset -> sales use -> distribution path -> signal.",
      "If the chain breaks, the content engine produces activity without operational value.",
      "Prioritize questions that reduce committee risk or reveal account movement.",
    ],
    infographic: [
      "Pipeline diagram from buyer question to signal.",
      "Checkpoints: proof source, SME owner, asset format, sales use, channel, CRM signal.",
    ],
    notes: [
      "This is the bridge from MOIN to content. Content is not approved because it is interesting; it is approved because it performs a job.",
      "Use a composite example: operations asks about downtime during installation; the chain produces an implementation-risk asset and a routing signal.",
      "Make teams name the signal each asset should create.",
    ],
    transition: "Participants now build their MOIN grid.",
  },
  "exercise-moin": {
    onSlide: [
      "Build the role-by-demand-state question map for the chosen ICP.",
      "For each priority question, name decision risk, proof required, asset idea, sales use, and signal created.",
      "Prioritize the top five questions for the next 90 days.",
    ],
    infographic: [
      "MOIN working grid.",
      "Rows by role; columns by demand state; cells capture question, risk, proof, asset, signal.",
    ],
    notes: [
      "Keep participants out of generic educational topics. Every entry must connect to a real buying uncertainty.",
      "The instructor should ask: What proof would make this believable inside the buyer's organization?",
      "The output becomes the direct input to the first-five asset plan.",
    ],
    exercise: "E4",
    transition: "Use MOIN to design the content engine.",
  },
  "content-engine": {
    onSlide: [
      "Industrial content is not a publishing calendar. Every asset needs a job.",
      "A useful asset has buyer question, proof source, sales use, distribution path, signal, and owner.",
      "Content must support demand creation, buyer enablement, demand capture, and sales learning.",
    ],
    infographic: [
      "Asset job card.",
      "Fields: demand state, buyer role, question, proof, asset format, sales use, channel, signal, owner.",
      "Warning stripe: no asset without a job.",
    ],
    notes: [
      "This is where many teams drift into content volume. Pull them back to asset purpose.",
      "SME input matters because industrial buyers need technical credibility, implementation realism, and proof specificity.",
      "Content must be usable by sales and observable by RevOps.",
    ],
    transition: "Define the minimum useful asset system.",
  },
  "first-five-assets": {
    onSlide: [
      "Build a minimum asset system before building a large library.",
      "Recommended starting set: problem-risk asset, selection criteria guide, proof or application note, champion internal pack, vendor validation asset.",
      "Each asset must map to one buyer role, one demand state, one distribution path, and one signal.",
    ],
    infographic: [
      "Five-asset portfolio grid.",
      "Rows: five assets.",
      "Columns: demand state, buyer role, proof source, sales use, channel, signal.",
    ],
    notes: [
      "The first five assets should cover the biggest movement blockers from MOIN, not the easiest topics to write.",
      "Ask which asset would help sales create a better second conversation with a target account.",
      "Do not approve assets that cannot be distributed through a trusted path.",
    ],
    transition: "Participants now create the first-five roadmap.",
  },
  "exercise-content": {
    onSlide: [
      "Choose five priority assets from the MOIN grid.",
      "For each asset, specify demand state, role, proof source, sales use, channel, signal, SME owner, and due date.",
      "Reject assets that do not support buyer movement or signal interpretation.",
    ],
    infographic: [
      "Five-asset roadmap matrix.",
      "Fields: asset, demand state, role, proof, SME input, sales use, channel, signal, owner.",
    ],
    notes: [
      "Have participants explicitly mark missing proof or SME input.",
      "The best plans are small, sharp, and usable. More assets are not automatically better.",
      "Use peer critique to catch generic content titles and unsupported claims.",
    ],
    exercise: "E5",
    transition: "Content only works if it circulates through trusted paths.",
  },
  "distribution-half": {
    onSlide: [
      "Publishing is not distribution.",
      "Industrial insight must circulate through channels buyers already trust: sales conversations, SMEs, distributors, partners, associations, events, peer networks, and targeted account follow-up.",
      "A content asset without a distribution path is unfinished.",
    ],
    infographic: [
      "Publishing-only path vs trusted-circulation path.",
      "Publishing-only: company page, website post, campaign send, low observable trust.",
      "Trusted circulation: SME, sales, association, event, distributor, account follow-up, captured signals.",
    ],
    notes: [
      "Make this a hard reset for teams that equate posting with distribution.",
      "Industrial markets often rely on trust transfer. The path matters as much as the asset.",
      "Distribution planning should include signal capture and follow-up rules from the beginning.",
    ],
    transition: "Choose channels as an ecosystem, not as isolated tactics.",
  },
  "channel-ecosystem": {
    onSlide: [
      "Select channels by buyer trust, demand state, segment access, operational capacity, and observable account evidence.",
      "Owned channels, sales channels, SME channels, partner channels, event channels, and distributor channels should reinforce each other.",
      "The best channel is the one that can carry proof to the right role and create usable signals.",
    ],
    infographic: [
      "Channel ecosystem map around the chosen ICP.",
      "Rings: owned, sales, SME, partner, event, distributor, association.",
      "Each channel includes trust reason, asset fit, signal captured, and owner.",
    ],
    notes: [
      "Ask where the buyer already pays attention before asking where the company wants to post.",
      "Do not approve a channel without an owner and capture method.",
      "Distribution should be prioritized for the 90-day ICP, not the entire market.",
    ],
    transition: "Events, partners, and distributors need explicit operating rules.",
  },
  "event-partner": {
    onSlide: [
      "Offline and partner activity becomes demand generation only when it is planned, captured, routed, and learned from.",
      "Events need pre-event account focus, live role and question capture, post-event routing, and cadence review.",
      "Partners and distributors need proof assets, signal definitions, feedback loops, and escalation rules.",
    ],
    infographic: [
      "Event and partner motion flow.",
      "Pre: target accounts, proof assets, role hypotheses.",
      "During: questions, roles, objections, competitor context, urgency.",
      "Post: route, enable, nurture, disqualify, learn.",
    ],
    notes: [
      "Industrial companies often have rich offline signals that never become operational evidence.",
      "The facilitator should ask what field or sales observations are currently trapped in notebooks, calls, or memory.",
      "A partner channel needs enablement and feedback, not just collateral forwarding.",
    ],
    transition: "Participants now design distribution and capture rules.",
  },
  "exercise-distribution": {
    onSlide: [
      "Map channels for the chosen ICP and first-five assets.",
      "For each channel, name trust reason, owner, cadence, account signal, capture method, and follow-up rule.",
      "Include at least one sales or SME-led path and one ecosystem path where relevant.",
    ],
    infographic: [
      "Distribution planning board.",
      "Rows: channels.",
      "Columns: trust reason, asset, owner, cadence, signal, capture method, follow-up rule.",
    ],
    notes: [
      "Reject plans that are only a posting schedule.",
      "Force the group to connect distribution to account-level evidence and routing.",
      "The output should make clear who does what next week.",
    ],
    exercise: "E6",
    transition: "Once signals appear, interpret them carefully.",
  },
  "signal-filters": {
    onSlide: [
      "The expensive error is treating every signal as buying intent.",
      "Interpret signals by account fit, demand state, role, strength, recency, source trust, and pattern over time.",
      "The same signal can mean educate, research, map committee, enable champion, activate sales, or disqualify.",
    ],
    infographic: [
      "Signal filter stack.",
      "Filters: fit, state, role, strength, source, recency, pattern, risk.",
      "Output actions: educate, nurture, research, route, enable, activate, disqualify.",
    ],
    notes: [
      "Use examples: a procurement visit to vendor validation content differs from a student download or a low-fit RFQ.",
      "Signal interpretation protects sales trust and reduces false urgency.",
      "Make participants distinguish evidence from wishful reading.",
    ],
    transition: "Use the routing tree to turn interpreted signals into next actions.",
  },
  "routing-tree": {
    onSlide: [
      "Route by fit, state, role, and strength before choosing action.",
      "Weak content-demand signal: educate or observe.",
      "Moderate solution-demand signal: research, map committee, or enable sales conversation.",
      "Strong vendor-demand signal from a high-fit account: activate sales or opportunity review.",
      "Weak-fit or misleading signal: downgrade or disqualify.",
    ],
    infographic: [
      "Decision tree with four gates: fit -> demand state -> role -> strength.",
      "Leaf actions: educate, research, map committee, enable champion, sales activation, disqualify.",
    ],
    notes: [
      "The routing tree prevents content engagement from becoming automatic sales outreach.",
      "Every route should have owner, SLA, next action, and evidence to review.",
      "Tie this to the CRM or RevOps object on the next slide.",
    ],
    transition: "Make the signal operational in RevOps.",
  },
  "revops-signal": {
    onSlide: [
      "A signal becomes operational only when it is captured as a visible object.",
      "Minimum fields: account, segment, role, demand state, source, asset, strength, owner, SLA, next action, evidence, hypothesis, and false-positive risk.",
      "If a signal lives only in chat, memory, event notes, or inboxes, the operating system cannot learn.",
    ],
    infographic: [
      "RevOps signal object card.",
      "Top: account and ICP fit.",
      "Middle: role, state, strength, source, evidence.",
      "Bottom: owner, SLA, next action, risk, cadence status.",
    ],
    notes: [
      "This slide translates demand generation into operations. The work is not done until fields, owners, and decisions are visible.",
      "RevOps does not need every possible behavior. It needs fields that support routing and learning.",
      "The object should help sales understand why the next action is justified.",
    ],
    transition: "Participants now classify signals and assign routing.",
  },
  "exercise-routing": {
    onSlide: [
      "Classify five realistic signals from the chosen ICP.",
      "For each, capture fit, role, demand state, strength, source, owner, SLA, next action, and false-positive risk.",
      "Separate sales activation from education, research, committee mapping, nurture, and disqualification.",
    ],
    infographic: [
      "Signal routing table.",
      "Columns: signal, fit, role, state, strength, owner, SLA, next action, risk.",
    ],
    notes: [
      "The instructor should challenge any automatic handoff to sales.",
      "Ask what would make the team wrong about each signal.",
      "The best output makes the next action obvious and auditable.",
    ],
    exercise: "E7",
    transition: "Measurement now needs to track movement and learning, not just activity.",
  },
  measurement: {
    onSlide: [
      "Measure movement, committee coverage, signal quality, sales use, opportunity quality, and learning velocity.",
      "Do not use vanity metrics as primary proof.",
      "The pilot should show whether target accounts are moving and whether the system is improving decisions.",
    ],
    infographic: [
      "Metric hierarchy.",
      "Top: business outcome and quality pipeline.",
      "Middle: target-account movement, committee coverage, vendor-demand signals, sales-accepted actions.",
      "Base: content completion, distribution execution, signal capture, cadence decisions.",
    ],
    notes: [
      "This slide protects the workshop from campaign optimism.",
      "Leading indicators matter only when they connect to account movement and better sales decisions.",
      "Ask what metric would prove the system is learning, not just producing output.",
    ],
    transition: "Those metrics need a weekly decision rhythm.",
  },
  "weekly-cadence": {
    onSlide: [
      "Cadence is not reporting. It is a decision rhythm.",
      "Weekly review should decide what to build, route, repair, disqualify, or escalate.",
      "Cadence owners should include demand generation, sales, RevOps, SME input, and leadership when needed.",
    ],
    infographic: [
      "Weekly cadence board.",
      "Columns: evidence, decision, owner, this-week action.",
      "Rows: account progression, routing, proof gaps, distribution, sales feedback, pilot risks.",
    ],
    notes: [
      "A cadence meeting without decisions becomes theater. The output should be commitments.",
      "Make the group define who brings evidence and who can decide.",
      "The cadence protects the 90-day pilot from drifting into disconnected tasks.",
    ],
    transition: "Convert the operating system into a 90-day pilot.",
  },
  "pilot-roadmap": {
    onSlide: [
      "A 90-day pilot should prove learning quality before scale.",
      "Days 1-15: focus, committee, MOIN, baseline fields, cadence setup.",
      "Days 16-45: first-five assets, distribution paths, capture rules.",
      "Days 46-75: signal routing, sales enablement, proof repair, account movement review.",
      "Days 76-90: evidence review and sponsor decision.",
    ],
    infographic: [
      "Four-phase roadmap.",
      "Phase 1 setup, Phase 2 build and distribute, Phase 3 route and learn, Phase 4 decide.",
      "Each phase includes outputs, metrics, and decision gates.",
    ],
    notes: [
      "The pilot is deliberately narrow. The purpose is to test whether the operating system can create credible movement.",
      "The team should not scale until proof, routing, and cadence are working.",
      "Stop, repair, and scale criteria must be defined before the pilot begins.",
    ],
    transition: "Participants assemble the full pilot plan.",
  },
  "exercise-pilot": {
    onSlide: [
      "Assemble all prior artifacts into one 90-day pilot plan.",
      "Define scope, assets, distribution, signal routing, cadence, metrics, risks, owners, and sponsor decision criteria.",
      "Write stop, repair, and scale criteria before claiming success.",
    ],
    infographic: [
      "Pilot assembly canvas.",
      "Fields: scope, assets, distribution, signals, cadence, metrics, risks, decision criteria.",
    ],
    notes: [
      "This is the capstone build moment. Participants should use the previous seven outputs, not start from scratch.",
      "Human correction should remove unsupported claims, generic tactics, and missing ownership.",
      "The pilot should be narrow enough to run and evidence-rich enough for leadership to decide.",
    ],
    exercise: "E8",
    transition: "Close with the sponsor decision standard.",
  },
  "sponsor-decision": {
    onSlide: [
      "The final strategy gives leadership a decision from evidence, not campaign optimism.",
      "Stop if the ICP, proof, access path, or cadence cannot support credible movement.",
      "Repair if the system shows promise but one operating layer is weak.",
      "Scale only when account movement, signal quality, sales use, proof coverage, and cadence evidence are visible.",
    ],
    infographic: [
      "Sponsor decision matrix.",
      "Rows: strategy complete, evidence visible, cadence owned, quality gates passed.",
      "Columns: stop, repair, scale.",
      "Footer: leadership decision and next 30-day commitment.",
    ],
    notes: [
      "End by reinforcing discipline. The deck is not a pitch for marketing activity; it is a decision system.",
      "The final review should expose assumptions, unknowns, and operational risks.",
      "A good strategy makes rejection possible. That is what makes approval meaningful.",
    ],
    transition: "Workshop closes with participant strategy review and sponsor-ready cleanup.",
  },
};

function detailFor(slide) {
  const detail = details[slide.type];
  if (!detail) throw new Error(`Missing slide detail for ${slide.type}`);
  return detail;
}

function exerciseBlock(slide) {
  if (!slide.exerciseId) return [];
  const item = exercise(slide.exerciseId);
  return [
    "",
    "### Exercise Setup",
    "",
    `Participant output: ${item.output}`,
    "",
    "Use the matching participant drafting template in the separate prompt document. The template is a drafting aid only; the accepted workshop output must pass human correction.",
    "",
    "Human quality control:",
    "",
    ...bullets([
      "Mark facts, assumptions, and unknowns separately.",
      "Reject generic SaaS defaults and unsupported market claims.",
      "Replace broad statements with industrial category, buyer role, proof, owner, and next action.",
      "Translate the output into sales, RevOps, and weekly cadence implications.",
    ]),
  ];
}

function slideSection(slide) {
  const detail = detailFor(slide);
  const rows = [
    `## Slide ${String(slide.no).padStart(2, "0")} - ${slide.title}`,
    "",
    `Timebox: ${timing.get(slide.no) || "TBD"}`,
    `Source: ${sourceLabels(slide.sourceLessons).join("; ")}`,
    `Concept keys: ${slide.conceptKeys.join(", ")}`,
    "",
    "### Slide Promise",
    "",
    slide.subtitle,
    "",
    "### On-Slide Content",
    "",
    ...bullets(detail.onSlide),
    "",
    "### Infographic Direction",
    "",
    ...bullets(detail.infographic),
    "",
    "### Instructor Talking Points",
    "",
    ...bullets(detail.notes),
  ];

  if (detail.example) {
    rows.push("", "### Composite Industrial Example", "", detail.example);
  }

  const why = compactLessonWhy(slide.sourceLessons);
  if (why.length) {
    rows.push("", "### Why This Matters In Industrial Markets", "", ...bullets(why));
  }

  if (detail.diagnostics) {
    rows.push("", "### Diagnostic Questions", "", ...bullets(detail.diagnostics));
  }

  rows.push(...exerciseBlock(slide));

  rows.push(
    "",
    "### RevOps Translation",
    "",
    ...bullets([
      "Define the account-level evidence this concept should create.",
      "Name the field, owner, SLA, and next action required to make the evidence operational.",
      "Bring the evidence into weekly cadence for review, repair, or routing.",
    ]),
    "",
    "### Transition",
    "",
    detail.transition,
    "",
  );

  return rows;
}

async function main() {
  const lines = [
    "# Industrial Demand Generation - Full-Scale 35-Slide Workshop Content",
    "",
    `Source commit: \`${sourceCommit}\``,
    "",
    "Status: Markdown content for review and approval. No PPT export should be created from this content until the content is explicitly approved.",
    "",
    "This document is the canonical slide-deck content review file for the consolidated Module 1 workshop. It defines the slide sequence, on-slide content, infographic direction, instructor talking points, exercise placement, and quality-control expectations.",
    "",
    "The separate participant prompt document supports workshop drafting. This slide content remains human-instructor teaching material.",
    "",
    "## Workshop Outcome",
    "",
    deckMeta.promise,
    "",
    "Participants complete the workshop with these strategy artifacts:",
    "",
    ...bullets(finalStrategyOutputs),
    "",
    "## Coverage Rules",
    "",
    "The 35-slide sequence must cover these Module 1 concept keys:",
    "",
    ...bullets(requiredConcepts),
    "",
    "## Exercise Placement",
    "",
    "| Exercise | Slide | Output | Participant Template |",
    "|---|---:|---|---|",
    ...exercisePlan.map((item) => `| ${item.id} ${item.title} | ${item.slide} | ${item.output} | ${item.promptTitle} |`),
    "",
    "## Common Instructor Questions",
    "",
    ...bullets(commonIntegrativeQuestions),
    "",
    "## Slide-By-Slide Content",
    "",
    ...slidePlan.flatMap(slideSection),
  ];

  await fs.writeFile(OUTPUT_PATH, `${lines.join("\n").trimEnd()}\n`, "utf8");
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
