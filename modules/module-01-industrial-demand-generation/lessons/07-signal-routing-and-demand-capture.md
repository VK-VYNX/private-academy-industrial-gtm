# Unit 7: Signal Routing And Demand Capture

## Operator Promise

By the end of this unit, the learner can classify industrial demand signals by account fit, demand state, buying role, and evidence strength, then route each signal to the right next action.

The output is a signal-routing table with owner, SLA, next action, false-positive risk, and opportunity review criteria.

## Source Anchors

- `master-intelligence/10-signal-and-demand-routing-system.md`
- `master-intelligence/09-revops-data-architecture.md`
- `master-intelligence/07-metrics-and-account-progression.md`
- `master-intelligence/23-industrial-decision-trees.md`
- `templates/signal-routing-table.md`
- `templates/demand-level-routing-table.md`
- `templates/account-progression-board.md`

## Concept

The most expensive demand generation error is treating every signal as buying intent.

In industrial markets, engagement can mean many things:

- an engineer is learning;
- a quality head is investigating a recurring problem;
- a consultant is educating themselves;
- a distributor is checking fit;
- a procurement manager is gathering comparison material;
- a plant head is exploring a future project;
- a buyer is actively evaluating suppliers.

The signal is useful only after interpretation.

The four routing filters:

1. **Account fit:** is this account worth effort?
2. **Demand state:** content, solution, or vendor demand?
3. **Buying committee role:** who produced the signal?
4. **Evidence strength:** weak, moderate, or strong?

Only then should the team choose the next action.

## Signal Classes

| Class | Examples | Typical Owner |
|---|---|---|
| First-party | website visit, content hub use, form submission, webinar attendance, return visit | Marketing Ops or RevOps |
| Third-party | plant expansion, hiring, certification, tender, export activity, new product line | ABM, sales, or research owner |
| Ecosystem | exhibition discussion, association activity, distributor note, consultant mention, referral | Sales, partner, or channel owner |
| Sales-discovered | field visit, customer call, WhatsApp exchange, service note, referral | Sales |

Every signal should be logged with source, account, role, demand state, strength, owner, SLA, and next action.

## Demand State Routing

| Demand State | Meaning | Do | Do Not |
|---|---|---|---|
| Content demand | buyer is learning | educate, nurture, observe, build trust | send sales pitch |
| Solution demand | buyer is comparing approaches | provide frameworks, comparisons, proof, committee education | force vendor meeting too early |
| Vendor demand | buyer is evaluating suppliers | activate sales, provide proof, enable committee | keep in generic nurture |

## Industrial Signal Taxonomy

| Signal | Demand State | Strength | Default Action |
|---|---|---|---|
| Reads educational article | content | weak | continue education |
| Attends broad webinar | content | weak to moderate | tag interest and nurture |
| Repeatedly engages with application content | content or solution | moderate | move to research queue |
| Visits comparison or selection guide | solution | moderate | map committee and send related proof |
| Downloads checklist or calculator | solution | moderate | progressive profiling and research |
| Multiple stakeholders visit content hub | solution or vendor | strong | review for Active Focus |
| Requests technical consultation | vendor | strong | sales action |
| Sends RFQ or spec | vendor | strong | opportunity review |
| Asks for sample, audit, validation, or plant visit | vendor | strong | opportunity review |
| New plant or capacity expansion | solution | moderate to strong | account research and timing validation |
| New compliance or audit requirement | solution or vendor | moderate to strong | send proof and map quality role |
| Distributor flags specific project need | solution or vendor | strong if specific | sales validation |
| Consultant includes category in specification | vendor | strong | sales and partner action |

## Account Progression States

| State | Meaning | Primary Work |
|---|---|---|
| Cluster ICP | account fits the target segment, but need is unknown | educate, distribute, observe |
| Future Pipeline | account has awareness or engagement, but need is unconfirmed | research, map committee, nurture |
| Active Focus | account has need, trigger, stakeholder, timing, or relationship evidence | activate sales, enable committee |
| Opportunity | account has declared requirement, value logic, champion, and next step | qualify and run sales process |
| Disqualified | account fails fit, value, timing, access, or technical criteria | remove or low-touch nurture |

The operating mistake is moving accounts from Cluster ICP directly to Opportunity because one weak signal appeared.

## Industrial Example

A composite calibration and validation services provider publishes an audit-readiness guide for regulated manufacturers.

Signals appear:

| Signal | Interpretation | Route |
|---|---|---|
| quality coordinator reads one educational post | content demand, weak | continue education |
| same account returns to calibration interval guide | content to solution demand, moderate | add to Future Pipeline and research audit timing |
| validation head attends webinar and asks about documentation | solution demand, moderate to strong | map committee and send validation checklist |
| plant head requests audit readiness review | vendor demand, strong | Active Focus and sales action |
| procurement asks for vendor documents | vendor demand, strong | opportunity review if ICP and need confirmed |

The first signal is not a sales lead. The later signals may justify sales action because fit, role, demand state, and evidence strength changed.

## Activation Decision Rules

An account can enter Active Focus only when at least two of these are true:

- strong ICP fit;
- named stakeholder engaged;
- buying committee role identified;
- product or service need evidence exists;
- timing signal exists;
- relationship path exists;
- account consumed solution or vendor-demand content;
- sales can define a relevant next conversation.

An account should not enter Active Focus if:

- one person liked a generic post;
- the account is not ICP-fit;
- no buying committee member is known;
- evidence is only low-intent web traffic;
- sales cannot state why now;
- there is no next action beyond "follow up."

## Diagnostic Question

Which signals deserve education, research, activation, opportunity review, or disqualification?

Use these prompts:

- What is the account fit?
- What demand state does this signal represent?
- Which role created the signal?
- Is the signal weak, moderate, or strong?
- What other evidence exists?
- What is the false-positive risk?
- What should sales do or not do?
- What does RevOps need to log?
- What is the SLA?

## Individual Exercise

Classify signals.

| Signal | Source | Account Fit | Role | Demand State | Strength | Owner | SLA | Next Action | False-Positive Risk |
|---|---|---|---|---|---|---|---|---|---|
|  |  | high/medium/low |  | content/solution/vendor | weak/moderate/strong |  |  |  |  |
|  |  | high/medium/low |  | content/solution/vendor | weak/moderate/strong |  |  |  |  |
|  |  | high/medium/low |  | content/solution/vendor | weak/moderate/strong |  |  |  |  |
|  |  | high/medium/low |  | content/solution/vendor | weak/moderate/strong |  |  |  |  |
|  |  | high/medium/low |  | content/solution/vendor | weak/moderate/strong |  |  |  |  |

Then define opportunity review criteria.

| Criterion | Required Evidence |
|---|---|
| ICP fit |  |
| Named stakeholder |  |
| Need or trigger |  |
| Demand state |  |
| Value or project potential |  |
| Next step |  |
| Committee risk |  |

## Group Critique

Peers must identify:

- one signal being over-routed to sales;
- one signal that deserves faster action;
- one signal that requires committee mapping;
- one signal that should be disqualified or low-touch nurtured;
- one missing field that would make routing unreliable.

The group should challenge any "sales should follow up" answer that lacks role, demand state, relevance, and next action.

## AI-Assisted Attempt

Ask AI to classify the signal table.

Required AI output:

| Output | Required Standard |
|---|---|
| Demand state | content, solution, or vendor with rationale |
| Signal strength | weak, moderate, or strong |
| Progression state | Cluster ICP, Future Pipeline, Active Focus, Opportunity, Disqualified |
| Owner | sales, marketing, RevOps, partner, SME |
| SLA | action timing |
| Next action | specific action, not generic follow-up |
| False-positive concern | why the signal might be misleading |
| Missing evidence | what must be checked before escalation |

## Human Correction

Humans must repair AI output when it:

- treats engagement as buying intent;
- skips the ICP fit check;
- ignores buying role;
- recommends outreach without relevance;
- routes weak signals as opportunities;
- leaves strong vendor-demand signals in nurture;
- ignores false positives;
- gives no owner or SLA.

## RevOps Translation

Signal routing requires a signal object or equivalent working table.

Minimum fields:

| Field | Purpose |
|---|---|
| Signal date | timing and SLA tracking |
| Account | account-level movement |
| Contact or role | committee interpretation |
| Signal source | first-party, third-party, ecosystem, sales-discovered |
| Asset or context | what created the signal |
| Demand state | content, solution, vendor |
| Signal strength | weak, moderate, strong |
| Fit status | high, medium, low, disqualified |
| Progression state | Cluster ICP, Future Pipeline, Active Focus, Opportunity |
| Owner | who acts next |
| SLA | by when |
| Next action | nurture, research, map, enable, activate, opportunity review, disqualify |
| False-positive risk | why the signal may mislead |

## Failure Modes

| Failure Mode | What It Looks Like | Correction |
|---|---|---|
| Intent inflation | every click becomes a lead | route by fit, state, role, strength |
| Weak sales handoff | sales receives names with no context | provide signal reason and next action |
| Signal decay | strong signal sits untouched | define SLA and owner |
| No false-positive logic | poor-fit accounts consume resources | add fit and disqualification filters |
| CRM blindness | signals live in chats or notes | create signal object or shared board |
| Over-nurture | vendor demand stays in generic sequence | activate sales when strong vendor evidence appears |

## Final Artifact

Submit a signal-routing table with:

- weak, moderate, and strong signal examples;
- content, solution, and vendor demand;
- source class;
- buying role;
- owner and SLA;
- next action;
- false-positive risk;
- opportunity review criteria.

## Completion Standard

This unit is complete only when the learner can defend:

- why a signal is or is not buying intent;
- what account state should change;
- what sales should do next;
- what RevOps should track;
- what evidence is missing;
- how false positives will be prevented.

If every signal becomes a sales task, it fails.

## Integrative Questions

- How does this affect sales?
- What signal would prove this is working?
- What would RevOps need to track?
- What content would help the buyer move forward?
- What would an AI agent likely get wrong here?
- What would make this fail in an industrial company?
