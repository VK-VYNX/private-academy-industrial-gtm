# Academy Operating System

This repository is not only a curriculum repository. It is the delivery, QA, calibration, and release operating system for the Private Academy - Industrial GTM.

The upstream intelligence repo remains the source-of-truth research and framework layer. This repo turns that intelligence into repeatable academy delivery.

## Operating Stack

| Layer | Purpose | Primary Location |
|---|---|---|
| Source boundary | keeps the academy grounded in master intelligence and confidentiality rules | [docs/source-lineage.md](docs/source-lineage.md) |
| Academy rules | defines what every module must protect and produce | [docs/academy-operating-rules.md](docs/academy-operating-rules.md) |
| Content standard | defines the minimum depth required for academy-grade lesson and page content | [docs/academy-content-standard.md](docs/academy-content-standard.md) |
| Module body | teaches the operating system and produces artifacts | [modules/module-01-industrial-demand-generation/](modules/module-01-industrial-demand-generation/) |
| Delivery pack | gives learners, facilitators, AI operators, sponsors, and RevOps teams a usable module | [modules/module-01-industrial-demand-generation/delivery-pack/](modules/module-01-industrial-demand-generation/delivery-pack/) |
| Visual atlas | converts the Module 1 concepts into Mermaid diagrams | [modules/module-01-industrial-demand-generation/delivery-pack/flowcharts/](modules/module-01-industrial-demand-generation/delivery-pack/flowcharts/) |
| QA automation | checks links, required files, Mermaid fences, restricted names, ASCII, and module completeness | [scripts/](scripts/) |
| Calibration | trains reviewers to score weak, repairable, and field-ready work consistently | [modules/module-01-industrial-demand-generation/delivery-pack/calibration-pack/](modules/module-01-industrial-demand-generation/delivery-pack/calibration-pack/) |
| Cohort operations | pilots the module with real learners and captures improvement evidence | [modules/module-01-industrial-demand-generation/delivery-pack/cohort-ops/](modules/module-01-industrial-demand-generation/delivery-pack/cohort-ops/) |
| Release system | defines when the module can be tagged, exported, and delivered | [modules/module-01-industrial-demand-generation/delivery-pack/release-pack/](modules/module-01-industrial-demand-generation/delivery-pack/release-pack/) |

## Operator Routes

| Operator | First Move | Proof Of Progress |
|---|---|---|
| Academy owner | run QA, review release checklist, approve version status | validation report and release decision |
| Facilitator | run cohort protocol, use scorer calibration, collect feedback | scored artifacts and feedback log |
| Learner | complete workbook, submit capstone artifacts, repair gaps | field-ready 90-day pilot |
| AI operator | use prompt library and rejection rules | corrected AI output with assumptions and unknowns |
| RevOps operator | inspect signal fields, cadence, dashboard needs, and SLA rules | operational signal-routing model |
| Executive sponsor | review pilot summary, risks, and scale decision | stop, repair, or scale decision |

## Definition Of Academy-Grade

A module is academy-grade when it satisfies all of these conditions:

- it has a clear operating promise and artifact output;
- every lesson produces a usable artifact;
- every artifact has a review standard;
- examples are anonymized composites;
- AI-assisted work has rejection rules and human correction;
- diagrams render and are visually reviewed before release;
- learners can self-serve the delivery pack without repo knowledge;
- facilitators can run a cohort without inventing process;
- reviewers can score work consistently;
- RevOps can translate outputs into fields, owners, SLAs, dashboards, and cadence;
- release decisions are based on evidence, not enthusiasm.

## Operating Cycle

1. Source review: confirm the module still aligns with upstream master intelligence.
2. Delivery prep: review START-HERE, field guide, workbook, prompt library, examples, and templates.
3. Visual QA: render Mermaid diagrams and inspect readability.
4. Automated QA: run the validation script and fix all failures.
5. Calibration: score weak, repairable, and field-ready examples before reviewing live learner work.
6. Cohort pilot: run a small cohort or internal simulation.
7. Artifact review: score capstones with the rubric and quality gates.
8. Release decision: tag, repair, or hold the module.

## Required Commands

Run the academy validation gate:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\validate-academy.ps1
```

Render the Mermaid visual atlas when Mermaid CLI is available:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\render-mermaid-flowcharts.ps1 -UseNpx
```

If the render command uses `npx`, it may need network access the first time it downloads Mermaid CLI.

## Release Principle

The academy can be inspiring. The release system must be unsentimental.

If the module lacks visual QA, restricted-name scan, link validation, calibration evidence, and a release decision, it is not release-grade yet.
