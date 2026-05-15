# Visual Render QA

Use this file after rendering the Module 1 Mermaid flowcharts.

## Render Command

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\render-mermaid-flowcharts.ps1 -UseNpx
```

Rendered files are written to:

```text
modules/module-01-industrial-demand-generation/delivery-pack/exports/rendered-flowcharts/
```

## Current Render Evidence

| Evidence | Status |
|---|---|
| SVG render report | generated at `../exports/rendered-flowcharts/render-report.md` |
| rendered SVG count | 33 numbered diagrams |
| machine nonblank check | passed: every SVG file is present and contains an `<svg` root |
| contact sheet | generated at `../exports/rendered-flowcharts/contact-sheet.md` |
| human visual inspection | pending reviewer initials and notes below |

## Review Standard

A diagram passes visual QA when:

- it renders without an error;
- it is not blank;
- node labels are readable;
- labels do not visually collide;
- decision points are clear;
- failure paths route to repair, rejection, or rescope;
- sales, marketing, RevOps, leadership, or AI-agent implications are visible when relevant;
- no named-company examples appear;
- the diagram explains behavior, not decoration.

## Review Log

| Diagram Range | Reviewer | Status | Required Repair |
|---|---|---|---|
| 00-04 module map, demand OS, buyer, ICP |  | pending |  |
| 05-10 MOIN, content, distribution, signals, enablement, cadence |  | pending |  |
| 11-16 AI loop, capstone, quality gates, sprint, rhythm, roles |  | pending |  |
| 17-23 governance, delivery paths, lifecycle, audit, channels, events, partners |  | pending |  |
| 24-32 RevOps, metrics, anti-patterns, sponsor loop, certification, confidentiality, templates, alignment, AI rejection |  | pending |  |

## Visual Repair Decision

| Issue | Repair Move |
|---|---|
| label too long | split into fewer words or separate nodes |
| diagram too dense | create a second diagram or remove non-decision details |
| unclear decision | rewrite as a yes/no or route-based question |
| weak industrial specificity | add buyer role, proof need, signal, owner, or cadence detail |
| generic marketing language | replace with industrial demand-state, trust-path, or account-progression language |
| missing RevOps implication | add field, owner, SLA, dashboard, or weekly cadence node |
| missing AI risk | add assumption, unknown, rejection, or human correction node |

## Release Note

Visual QA is not complete until the rendered files have been inspected by a human. Mermaid fence validation only proves that the source files are structurally present.
