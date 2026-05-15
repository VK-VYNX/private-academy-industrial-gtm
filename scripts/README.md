# Scripts

These scripts turn the academy repo into a self-checking operating system.

## Validate The Academy

```powershell
powershell -ExecutionPolicy Bypass -File scripts\validate-academy.ps1
```

Checks:

- required repo and Module 1 assets;
- local Markdown links;
- Mermaid code fence structure;
- minimum flowchart count;
- ASCII text hygiene;
- restricted-name terms from `.academy/restricted-names.local.txt` when present;
- built-in public-company example terms that should not appear in academy examples.

## Render Mermaid Flowcharts

```powershell
powershell -ExecutionPolicy Bypass -File scripts\render-mermaid-flowcharts.ps1 -UseNpx
```

This extracts Mermaid fences from the Module 1 flowchart library and renders them into:

```text
modules/module-01-industrial-demand-generation/delivery-pack/exports/rendered-flowcharts/
```

Use `-UseNpx` when Mermaid CLI is not already installed locally. The first run may need network access.
