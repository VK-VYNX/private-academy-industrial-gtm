# Consolidated Workshop Deck

This package contains the single 35-slide instructor projection deck for the Module 1 live workshop: Industrial Demand Generation.

The deck is designed for a 3-hour instructor-led session. It is not a passive learner handout, not a marketing deck, and not an eight-deck substitute. It is the full Module 1 operating system compressed into one teachable workshop flow with exercises embedded immediately after the relevant concept blocks.

## Core Files

| File | Use |
|---|---|
| [exports/module-1-industrial-demand-generation-workshop.pptx](exports/module-1-industrial-demand-generation-workshop.pptx) | Editable PowerPoint deck for live projection |
| [../../industrial-demand-generation-participant-prompts.md](../../industrial-demand-generation-participant-prompts.md) | Participant prompt templates for the interleaved workshop exercises |
| [src/consolidated-workshop-data.mjs](src/consolidated-workshop-data.mjs) | Canonical slide plan, concept coverage, exercises, and final strategy outputs |
| [src/build-consolidated-workshop-deck.mjs](src/build-consolidated-workshop-deck.mjs) | Regenerates the PPTX, previews, layout QA, and build summary |
| [src/build-participant-prompts.mjs](src/build-participant-prompts.mjs) | Regenerates the participant prompt document |
| [src/validate-consolidated-workshop.mjs](src/validate-consolidated-workshop.mjs) | Validates coverage, exercises, prompt linkage, restricted names, and deck readability |
| [qa/consolidated-workshop-validation-report.md](qa/consolidated-workshop-validation-report.md) | Latest validation report |

## Workshop Flow

| Slides | Segment | Participant Output |
|---:|---|---|
| 1-3 | Workshop promise and artifact chain | Shared understanding of the final strategy package |
| 4-7 | Foundations and demand system diagnostic | Current weakness map and priority repairs |
| 8-11 | Industrial buyer reality | Buying committee and proof map |
| 12-15 | ICP, segments, and demand focus | 90-day ICP focus and disqualification rules |
| 16-19 | MOIN: Map of Informational Needs | Buyer question, risk, proof, and asset grid |
| 20-22 | Content engine for industrial demand | First-five asset plan by demand state |
| 23-26 | Distribution: the missing half | Channel, partner, event, and sales distribution plan |
| 27-30 | Signal routing and demand capture | Signal interpretation and routing table |
| 31-35 | Measurement, cadence, pilot, and sponsor decision | 90-day pilot plan with stop, repair, scale criteria |

## Exercise Placement

Exercises are intentionally interleaved, so participants build the strategy as the deck progresses:

| Exercise | Slide | Prompt Document Section |
|---|---:|---|
| E1 Demand System Diagnostic | 7 | Prompt 1 |
| E2 Buying Committee Map | 11 | Prompt 2 |
| E3 ICP And Disqualification Scorecard | 15 | Prompt 3 |
| E4 MOIN Grid | 19 | Prompt 4 |
| E5 Content Plan By Demand State | 22 | Prompt 5 |
| E6 Distribution And Ecosystem Plan | 26 | Prompt 6 |
| E7 Signal Routing Table | 30 | Prompt 7 |
| E8 90-Day Pilot Plan | 34 | Prompt 8 |

## Instructor Use

Project the PPTX and use the slide visuals as teaching structure. The participant prompt document is separate on purpose: it supports participant drafting in free ChatGPT, Claude, or Perplexity accounts while the deck remains a human-led instructional system.

Every exercise should end with human correction before the output is treated as workshop evidence. The instructor should push participants to mark facts, assumptions, and unknowns separately; reject generic SaaS defaults; and translate every useful output into sales, RevOps, and weekly cadence decisions.

## Build And Validate

From the repo root:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-participant-prompts.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-consolidated-workshop-deck.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/validate-consolidated-workshop.mjs
```

The validation script checks the generated deck and prompt document against the source lesson coverage from Module 1 commit `9e28222`.
