# Release System

This document defines how academy modules move from draft to release-grade.

## Version States

| State | Meaning | Allowed Use |
|---|---|---|
| draft | content exists but QA, calibration, or delivery paths are incomplete | internal build only |
| pilot-ready | module can be tested with internal or friendly learners | controlled cohort |
| delivery-ready | module can be used with clients under facilitator supervision | live delivery |
| release-grade | module has validation report, visual QA, calibration evidence, and release checklist approval | formal academy release |

## Release Gates

A module can be marked release-grade only when all gates pass:

1. Source lineage is current.
2. Automated validation passes.
3. Mermaid diagrams render and are visually reviewed.
4. Restricted-name scan is performed with the current local restricted list.
5. Calibration examples are reviewed before live scoring.
6. Cohort feedback is reviewed and converted into repairs or release notes.
7. Quality gates confirm industrial specificity, signal routing, RevOps actionability, and AI governance.
8. Release checklist is signed off.

## Release Artifact Set

For Module 1, the release artifact set is:

- module README;
- instructor guide;
- learner workbook;
- AI agent guide;
- eight lessons;
- eight exercises;
- assessment rubric;
- capstone project;
- implementation checklist;
- delivery pack;
- flowchart atlas;
- calibration pack;
- cohort operations pack;
- release pack;
- validation report.

## Release Decision Types

| Decision | Use When | Next Action |
|---|---|---|
| release | all gates pass | tag and publish internally |
| release with watch item | gates pass but one improvement should be monitored | tag and add watch item |
| repair | module is useful but one or more gates fail | assign owner and due date |
| hold | confidentiality, source, scoring, or operational risk is material | do not deliver |

## Evidence Standard

The release decision must cite evidence:

- validation command result;
- visual render review status;
- cohort or simulation notes;
- scorer calibration notes;
- unresolved risks.

Do not release based on confidence alone.
