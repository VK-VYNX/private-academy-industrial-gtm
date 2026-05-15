# AI Agent Prompt Library

## How To Use This Library

These prompts are designed to accelerate work without letting AI become the final authority.

Every AI output must be reviewed by a human using [quality-gates.md](quality-gates.md).

## Universal System Prompt

```text
You are supporting Module 1 of a private academy for industrial B2B GTM operators.

Use industrial demand generation logic, not generic B2B marketing. Treat demand generation as an operating system connecting ICP, buying committee, MOIN, content, distribution, signal routing, buyer enablement, RevOps, and weekly cadence.

Do not invent named-company case studies. Use anonymized category-level industrial examples only.

Do not optimize for vanity metrics, raw lead volume, generic MQLs, impressions, likes, or unguided traffic.

For every answer, separate facts, assumptions, unknowns, and recommended next actions.
```

## Universal Output Contract

Ask the agent to return:

1. Decision summary
2. Source concepts used
3. Assumptions
4. Unknowns requiring human input
5. Artifact draft
6. Sales implication
7. RevOps implication
8. Signal or evidence needed
9. Anti-pattern risk
10. Human correction questions

## Unit 1 Prompt: Demand System Diagnostic

```text
Using the category and notes below, diagnose the current demand generation system.

Category:
[insert]

Current notes:
[insert]

Classify whether the motion is mainly demand creation, demand capture, lead collection, disconnected activity, or an operating system.

Return:
1. strongest current layer
2. weakest current layer
3. missing evidence
4. false assumption
5. three repair actions
6. one signal RevOps must track
7. one likely anti-pattern
```

## Unit 2 Prompt: Buying Committee Map

```text
Build a buying committee map for this industrial category and ICP.

Category and ICP:
[insert]

Known sales feedback:
[insert]

Return a table with role, concern, proof needed, likely blocker, missing asset, and owner action.

Include champion, decision maker, technical evaluator, production, quality, maintenance, procurement, finance, and consultant or distributor where relevant.
```

## Unit 3 Prompt: ICP And Demand Focus

```text
Compare these candidate industrial segments for a 90-day demand generation pilot.

Segments:
[insert]

Score each by:
1. ICP fit
2. trigger evidence
3. access path
4. value potential
5. buying process complexity
6. disqualification risk

Recommend one segment for a 90-day pilot and write the exclusion rules.
```

## Unit 4 Prompt: MOIN Grid

```text
Create a MOIN grid for the selected ICP.

ICP:
[insert]

Buying committee:
[insert]

Return buyer questions by role across:
1. content demand
2. solution demand
3. vendor demand

For each role, include the required asset and sales use.

Avoid topic-list thinking. Write questions the buyer would actually need answered.
```

## Unit 5 Prompt: Content Engine

```text
Turn this MOIN grid into a content engine.

MOIN grid:
[insert]

Return a table with:
1. asset
2. buyer question
3. demand state
4. format
5. SME input needed
6. sales use
7. signal created
8. owner
9. quality risk

Reject generic SEO filler and brochure-first content.
```

## Unit 6 Prompt: Distribution System

```text
Design a trust-based distribution system for these industrial content assets.

Content assets:
[insert]

Available channels or constraints:
[insert]

Return a table with asset, channel, trust reason, demand state, owner, cadence, account signal, and follow-up rule.

Include owned, expert-led, sales, partner, event, association, paid, search, or distributor channels only where they make sense.
```

## Unit 7 Prompt: Signal Routing

```text
Route these account signals.

ICP:
[insert]

Signals:
[insert]

For each signal, classify:
1. source
2. ICP fit
3. likely role
4. demand state
5. strength
6. progression state
7. owner
8. SLA
9. next action
10. false-positive risk

Do not recommend sales activation unless fit, role, demand state, and evidence strength justify it.
```

## Unit 8 Prompt: Weekly Cadence And Pilot

```text
Assemble a 90-day Industrial Demand Generation Pilot from the artifacts below.

Artifacts:
[insert]

Return:
1. executive summary
2. pilot scope
3. phase plan
4. weekly cadence agenda
5. success metrics
6. RevOps fields or tracking requirements
7. stop, repair, scale criteria
8. anti-pattern risks
9. unresolved assumptions
```

## Capstone Critique Prompt

```text
Review this 90-day Industrial Demand Generation Pilot as a strict executive reviewer.

Pilot:
[insert]

Score from 1 to 5 on:
1. ICP focus
2. buying committee depth
3. MOIN quality
4. content utility
5. distribution strength
6. signal routing
7. RevOps actionability
8. weekly cadence
9. success metrics
10. anti-pattern control

Return:
1. pass, repair, or reject
2. top three strengths
3. top five repair requirements
4. missing evidence
5. risks if launched as-is
```

## AI Output Rejection Rules

Reject the output if it:

- names a real company as a case study;
- gives broad marketing advice without industrial context;
- skips disqualification;
- treats engagement as buying intent;
- gives content ideas without sales use or signal design;
- recommends distribution without owner or cadence;
- measures success with vanity metrics;
- recommends scale before pilot proof.
