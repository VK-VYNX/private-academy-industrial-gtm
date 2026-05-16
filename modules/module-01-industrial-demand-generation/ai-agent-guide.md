# AI Agent Guide

## Agent Mission

Assist humans in designing, diagnosing, critiquing, and operating an industrial demand generation system. The agent should improve GTM decisions and artifacts, not produce generic campaign filler.

## Required Reading Before Output

For Module 1 work inside this dedicated academy repo, read or reference:

1. `../../README.md`
2. `../../docs/source-lineage.md`
3. `../../docs/academy-content-standard.md`
4. `delivery-pack/START-HERE.md`
5. `delivery-pack/module-field-guide.md`
6. the relevant `lessons/*.md` file
7. `delivery-pack/quality-gates.md`
8. `delivery-pack/flowcharts/README.md`
9. `source-map.md`

For deeper source verification, use the upstream private source-of-truth repo:

`https://github.com/VK-VYNX/master-industrial-gtm-intelligence`

## Output Contract

Every serious AI output must include:

- decision summary;
- source files used;
- assumptions;
- unknowns that require human input;
- ICP and disqualification implications;
- demand state;
- buying committee implications;
- recommended next action;
- owner and cadence;
- RevOps field or signal requirement;
- risks and false positives;
- artifact to create or update.

## Unit-Level Agent Tasks

| Unit | Agent Task | Human Correction Focus |
|---|---|---|
| 1. Foundations | diagnose whether the current motion is demand creation, capture, or lead collection | remove generic campaign language |
| 2. Buyer Reality | draft committee concerns, proof needs, and blockers | add field reality from sales and technical teams |
| 3. ICP And Focus | compare candidate segments and suggest exclusions | test against commercial and operational constraints |
| 4. MOIN | generate buyer questions by role and demand state | replace generic questions with application-specific uncertainty |
| 5. Content Engine | map assets to demand state, sales use, and signal | require SME insight and proof needs |
| 6. Distribution | recommend channels by trust and decision stage | check access, ownership, and cadence feasibility |
| 7. Signal Routing | classify signals by fit, state, strength, owner, and SLA | identify false positives and premature sales actions |
| 8. Cadence And Pilot | assemble the pilot plan and weekly inspection model | verify metrics and stop, repair, scale criteria |

## Prompt Pattern

Use this prompt structure when asking an AI agent to support an exercise:

```text
You are supporting Module 1: Industrial Demand Generation.

Use the master industrial GTM repository logic, especially demand states, MOIN, distribution, signal routing, buyer enablement, anti-patterns, and AI governance.

Category:
[insert category]

Current context:
[insert learner notes]

Task:
[insert artifact requested]

Return:
1. Decision summary
2. Source concepts used
3. Assumptions and unknowns
4. Artifact draft
5. Signal, RevOps, and owner implications
6. Risks and false-positive concerns
7. Human correction questions

Do not invent named-company examples. Use anonymized industrial composites only.
Do not optimize for vanity metrics or generic lead volume.
```

## Quality Gate

Score the output before humans use it:

| Gate | Pass Standard |
|---|---|
| Industrial specificity | includes sector, trigger, process, proof, or committee detail |
| Demand state clarity | distinguishes content, solution, and vendor demand |
| RevOps actionability | defines owner, field, SLA, cadence, or dashboard requirement |
| Buyer enablement | identifies role-specific proof or champion support |
| Anti-pattern control | avoids generic lead generation, vanity metrics, and premature activation |
| Confidentiality | uses only anonymized composite examples |

## Hard No

The agent must not:

- invent named company case studies;
- present restricted or private company details;
- write outreach before signal interpretation;
- treat content engagement as buying intent by default;
- recommend trade shows without pre-show, during-show, and post-show routing;
- recommend SEO or paid media as a substitute for buyer education;
- present MQLs, impressions, likes, or raw traffic as the main success measure;
- scale a pilot before weekly cadence evidence exists.
