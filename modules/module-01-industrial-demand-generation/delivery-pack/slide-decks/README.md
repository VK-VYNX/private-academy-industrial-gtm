# Module 1 Slide Deck Package

This package contains the instructor projection decks for the 3-hour live workshop version of Module 1: Industrial Demand Generation.

The decks are not learner handouts or marketing presentations. They are instructor operating aids: each deck teaches one lesson, frames the diagnostic, introduces the working artifact, supports structured human drafting, and forces quality control before the output becomes part of the 90-day pilot.

For the current full-workshop delivery, use the consolidated 35-slide deck first: [consolidated-workshop-deck/](consolidated-workshop-deck/). It keeps the full Module 1 operating system in one projection flow and positions exercises immediately after the concepts they depend on.

## Deck Sequence

| Deck | Timebox | Output |
|---|---:|---|
| [Lesson 01 - Industrial Demand Generation Foundations](decks/lesson-01-industrial-demand-generation-foundations/speaker-notes.md) | 20 min | demand system diagnostic |
| [Lesson 02 - Industrial Buyer Reality](decks/lesson-02-industrial-buyer-reality/speaker-notes.md) | 20 min | buying committee and proof map |
| [Lesson 03 - ICP, Segments, And Demand Focus](decks/lesson-03-icp-segments-and-demand-focus/speaker-notes.md) | 22 min | ICP and disqualification scorecard |
| [Lesson 04 - MOIN: Map Of Informational Needs](decks/lesson-04-moin-map-of-informational-needs/speaker-notes.md) | 22 min | MOIN grid |
| [Lesson 05 - Content Engine For Industrial Demand](decks/lesson-05-content-engine-for-industrial-demand/speaker-notes.md) | 22 min | content plan by demand state |
| [Lesson 06 - Distribution: The Missing Half](decks/lesson-06-distribution-the-missing-half/speaker-notes.md) | 22 min | distribution and ecosystem plan |
| [Lesson 07 - Signal Routing And Demand Capture](decks/lesson-07-signal-routing-and-demand-capture/speaker-notes.md) | 24 min | signal-routing rules and SLA |
| [Lesson 08 - Measurement, Cadence, And 90-Day Pilot](decks/lesson-08-measurement-cadence-and-90-day-pilot/speaker-notes.md) | 26 min | weekly cadence and pilot plan |

Total planned teaching time: 178 minutes, leaving 2 minutes of instructor buffer. Exercise and discussion slides are designed as short live pauses; instructors can extend them in longer formats.

## Files

| Folder Or File | Use |
|---|---|
| [consolidated-workshop-deck/](consolidated-workshop-deck/) | single 35-slide full-workshop projection deck package |
| [../industrial-demand-generation-participant-prompts.md](../industrial-demand-generation-participant-prompts.md) | participant prompt templates aligned to the consolidated deck exercises |
| [instructor-slide-content.md](instructor-slide-content.md) | comprehensive human-review Markdown for all eight decks, slide by slide |
| [exports/](exports/) | exported editable PowerPoint decks |
| [decks/](decks/) | generated per-lesson slide modules and speaker notes |
| [assets/flowcharts/](assets/flowcharts/) | copied rendered Module 1 flowchart SVGs used in the decks |
| [src/lesson-data.mjs](src/lesson-data.mjs) | editable source intelligence for every slide |
| [src/build-slide-content-md.mjs](src/build-slide-content-md.mjs) | regenerates only the Markdown content review file |
| [src/deck-runtime.mjs](src/deck-runtime.mjs) | shared artifact-tool slide layouts |
| [src/build-decks.mjs](src/build-decks.mjs) | regenerates slide modules, speaker notes, previews, manifests, and PPTX exports |
| [src/validate-decks.mjs](src/validate-decks.mjs) | checks package completeness, source links, restricted-name scan, assets, and readability rules |
| [source-index.md](source-index.md) | source lesson, flowchart, and commit mapping |
| [qa/slide-deck-validation-report.md](qa/slide-deck-validation-report.md) | latest validation report |

## Build

From the repo root:

To regenerate only the comprehensive Markdown content file:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/src/build-slide-content-md.mjs
```

To regenerate deck exports:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/src/build-decks.mjs
```

Then validate:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/src/validate-decks.mjs
```

The build uses bundled Codex artifact-tool presentation export. It does not use named-company examples, stock claims, or generic SaaS assumptions.

To regenerate and validate the consolidated workshop deck:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-participant-prompts.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-consolidated-workshop-deck.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/validate-consolidated-workshop.mjs
```
