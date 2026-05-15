# Quality Assurance System

This document defines how the Private Academy repo protects quality, confidentiality, and operational usefulness.

## QA Gates

| Gate | Pass Standard | Failure Response |
|---|---|---|
| Repository navigation | all local Markdown links resolve | fix links before release |
| Required files | each module has the expected guides, lessons, exercises, rubrics, examples, and delivery pack | add missing assets or mark module incomplete |
| Mermaid structure | every Mermaid fence closes and starts with a recognized diagram declaration | repair the diagram before visual review |
| Visual render | diagrams render to SVG or PNG and are readable at delivery size | repair labels, layout, or node density |
| Confidentiality | no restricted real company names or private client facts appear | remove, anonymize, or quarantine |
| Industrial specificity | examples, questions, and templates are industrial rather than generic SaaS | repair with sector, buyer, proof, and cadence details |
| AI governance | AI outputs show assumptions, unknowns, source concepts, and human correction needs | reject or repair output |
| Scoring calibration | reviewers can distinguish weak, repairable, and field-ready submissions | run calibration before live grading |
| Release readiness | validation report, render review, calibration notes, and release checklist are complete | hold release |

## Automated Validation

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\validate-academy.ps1
```

The script checks:

- required repo and Module 1 paths;
- local Markdown links;
- Mermaid code fence structure;
- minimum flowchart count;
- ASCII-only repository text files;
- restricted-name terms from a local file when configured;
- built-in public-company example terms that should not appear in academy examples.

## Restricted-Name Handling

Do not commit restricted client or inspiration names to this repo.

For local scans, create this untracked file:

```text
.academy/restricted-names.local.txt
```

Add one restricted term per line. Lines starting with `#` are ignored.

The file is ignored by Git, so the academy can scan sensitive terms without storing them in the repository.

## Visual QA

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\render-mermaid-flowcharts.ps1 -UseNpx
```

Then review:

- whether every rendered diagram is nonblank;
- whether text is readable;
- whether labels fit their nodes;
- whether decision diamonds are understandable;
- whether failure loops route back to repair;
- whether no named-company examples appear in labels;
- whether the visual sequence explains the module without a facilitator.

Use [../modules/module-01-industrial-demand-generation/delivery-pack/flowcharts/visual-render-qa.md](../modules/module-01-industrial-demand-generation/delivery-pack/flowcharts/visual-render-qa.md) to record the review.

## QA Roles

| Role | Owns |
|---|---|
| Academy owner | release decision and source-boundary compliance |
| Facilitator | learning experience, critique loops, and artifact quality |
| Reviewer | scoring calibration and capstone decision |
| RevOps operator | field translation into data, routing, cadence, and dashboards |
| AI operator | prompt use, rejection rules, and human correction log |

## No-Fluff Rule

Quality is not polish alone. A beautiful artifact that cannot change sales, RevOps, buyer enablement, or account progression is not academy-grade.
