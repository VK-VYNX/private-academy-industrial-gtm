# Consolidated Workshop Deck

This package contains the single 35-slide instructor deck content plan for the Module 1 live workshop: Industrial Demand Generation.

The deck is designed for a 3-hour instructor-led session. It is not a passive learner handout, not a marketing deck, and not an eight-deck substitute. It is the full Module 1 operating system compressed into one teachable workshop flow with exercises embedded immediately after the relevant concept blocks.

Approval rule: the Markdown content file is the canonical review artifact. No PPTX should be created from this consolidated package until the content is explicitly approved.

## Core Files

| File | Use |
|---|---|
| [full-scale-35-slide-content.md](full-scale-35-slide-content.md) | canonical 35-slide content review file |
| [publish-ready-35-slide-content.md](publish-ready-35-slide-content.md) | user-facing slide content with no instructor notes |
| [exercise-01-demand-system-diagnostic.md](exercise-01-demand-system-diagnostic.md) | guided participant worksheet for Exercise 1 |
| [exercise-02-icp-and-focus-statement.md](exercise-02-icp-and-focus-statement.md) | guided participant worksheet for Exercise 2 |
| [exercise-03-buying-committee-map.md](exercise-03-buying-committee-map.md) | guided participant worksheet for Exercise 3 |
| [exercise-04-moin-grid.md](exercise-04-moin-grid.md) | guided participant worksheet for Exercise 4 |
| [exercise-05-content-plan.md](exercise-05-content-plan.md) | guided participant worksheet for Exercise 5 |
| [exercise-06-distribution-plan.md](exercise-06-distribution-plan.md) | guided participant worksheet for Exercise 6 |
| [exercise-07-signal-routing-table.md](exercise-07-signal-routing-table.md) | guided participant worksheet for Exercise 7 |
| [exercise-08-90-day-pilot-plan.md](exercise-08-90-day-pilot-plan.md) | guided participant worksheet for Exercise 8 |
| [exercise-05-content-plan-full-scale.md](exercise-05-content-plan-full-scale.md) | full-scale reference document for Exercise 5 |
| [../../industrial-demand-generation-participant-prompts.md](../../industrial-demand-generation-participant-prompts.md) | Participant prompt templates for the interleaved workshop exercises |
| [src/consolidated-workshop-data.mjs](src/consolidated-workshop-data.mjs) | Canonical slide plan, concept coverage, exercises, and final strategy outputs |
| [src/build-slide-content-md.mjs](src/build-slide-content-md.mjs) | Regenerates the Markdown slide content review file |
| [src/build-participant-prompts.mjs](src/build-participant-prompts.mjs) | Regenerates the participant prompt document |
| [src/validate-consolidated-workshop.mjs](src/validate-consolidated-workshop.mjs) | Validates coverage, exercises, prompt linkage, restricted names, and the no-PPT approval guardrail |
| [qa/consolidated-workshop-validation-report.md](qa/consolidated-workshop-validation-report.md) | Latest validation report |

## Dedicated Exercise Documents

| Exercise | Slide | File |
|---|---:|---|
| Exercise 01 - Demand System Diagnostic | 7 | [exercise-01-demand-system-diagnostic.md](exercise-01-demand-system-diagnostic.md) |
| Exercise 02 - Ideal Customer Profile And Focus Statement | 11 | [exercise-02-icp-and-focus-statement.md](exercise-02-icp-and-focus-statement.md) |
| Exercise 03 - Buying Committee Map | 15 | [exercise-03-buying-committee-map.md](exercise-03-buying-committee-map.md) |
| Exercise 04 - Buyer Question Map | 19 | [exercise-04-moin-grid.md](exercise-04-moin-grid.md) |
| Exercise 05 - Content Plan | 22 | [exercise-05-content-plan.md](exercise-05-content-plan.md) |
| Exercise 06 - Distribution Plan | 26 | [exercise-06-distribution-plan.md](exercise-06-distribution-plan.md) |
| Exercise 07 - Signal Meaning And Next-Action Table | 30 | [exercise-07-signal-routing-table.md](exercise-07-signal-routing-table.md) |
| Exercise 08 - 90-Day Pilot Plan | 34 | [exercise-08-90-day-pilot-plan.md](exercise-08-90-day-pilot-plan.md) |

## Workshop Flow

| Slides | Segment | Participant Output |
|---:|---|---|
| 1-3 | Workshop promise and artifact chain | Shared understanding of the final strategy package |
| 4-7 | Foundations and demand system diagnostic | Six layer scores and current weakness map |
| 8-11 | Ideal Customer Profile, segments, and demand focus | 90-day focus and disqualification rules |
| 12-15 | Industrial buyer reality | Buying committee and proof map |
| 16-19 | Map of Informational Needs: Buyer Question Map | Buyer questions, proof needs, and useful signals |
| 20-22 | Content engine for industrial demand | First-five asset plan by demand state |
| 23-26 | Distribution: the missing half | Channel, partner, event, and sales distribution plan |
| 27-30 | Signal meaning and next actions | Signal interpretation and next-action table |
| 31-35 | Measurement, weekly review, pilot, and leadership decision | 90-day pilot plan with stop, repair, scale criteria |

## Exercise Placement

Exercises are intentionally interleaved, so participants build the strategy as the deck progresses:

| Exercise | Slide | Participant Resource |
|---|---:|---|
| E1 Demand System Diagnostic | 7 | Exercise 01 worksheet and Prompt 1 |
| E2 Ideal Customer Profile And Focus Statement | 11 | Exercise 02 worksheet and Prompt 2 |
| E3 Buying Committee Map | 15 | Exercise 03 worksheet and Prompt 3 |
| E4 Buyer Question Map | 19 | Exercise 04 worksheet and Prompt 4 |
| E5 Content Plan By Demand State | 22 | Exercise 05 worksheet and Prompt 5 |
| E6 Distribution And Ecosystem Plan | 26 | Exercise 06 worksheet and Prompt 6 |
| E7 Signal Meaning And Next-Action Table | 30 | Exercise 07 worksheet and Prompt 7 |
| E8 90-Day Pilot Plan | 34 | Exercise 08 worksheet and Prompt 8 |

## Instructor Use

Review and approve [full-scale-35-slide-content.md](full-scale-35-slide-content.md) before any presentation export is created. The participant prompt document is separate on purpose: it supports participant drafting in free ChatGPT, Claude, or Perplexity accounts while the slide content remains a human-led instructional system.

Every exercise should end with human correction before the output is treated as workshop evidence. The instructor should push participants to mark facts, assumptions, and unknowns separately; reject generic SaaS defaults; and translate every useful output into sales actions, tracking needs, and weekly review decisions.

## Build And Validate

From the repo root:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-participant-prompts.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/build-slide-content-md.mjs
```

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" modules/module-01-industrial-demand-generation/delivery-pack/slide-decks/consolidated-workshop-deck/src/validate-consolidated-workshop.mjs
```

The validation script checks the Markdown slide content and prompt document against the source lesson coverage from Module 1 commit `9e28222`. It also fails if a PPTX export exists before approval.
