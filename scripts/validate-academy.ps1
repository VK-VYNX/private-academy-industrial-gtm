[CmdletBinding()]
param(
    [string]$Root,
    [string]$ReportPath = "modules/module-01-industrial-demand-generation/delivery-pack/qa/last-validation-report.md",
    [string]$RestrictedNamesFile = ".academy/restricted-names.local.txt",
    [switch]$StrictAscii
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Root)) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Root = (Resolve-Path (Join-Path $ScriptDir "..")).Path
}

function Resolve-RepoPath {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return (Join-Path $Root $Path)
}

function Add-GateResult {
    param(
        [string]$Gate,
        [string]$Status,
        [string]$Detail
    )

    $script:Results += [pscustomobject]@{
        Gate = $Gate
        Status = $Status
        Detail = $Detail
    }
}

function Escape-MarkdownCell {
    param([string]$Value)

    return (($Value -replace "\|", "\|") -replace "`r?`n", " ")
}

function Get-RepoRelativePath {
    param([string]$Path)

    $RootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd([char[]]@([char]92, [char]47)) + [System.IO.Path]::DirectorySeparatorChar
    $PathFull = [System.IO.Path]::GetFullPath($Path)
    $RootUri = [System.Uri]$RootFull
    $PathUri = [System.Uri]$PathFull
    return [System.Uri]::UnescapeDataString($RootUri.MakeRelativeUri($PathUri).ToString()).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
}

$Results = @()
$ModuleRoot = "modules/module-01-industrial-demand-generation"
$DeliveryRoot = "$ModuleRoot/delivery-pack"
$FlowchartRoot = "$DeliveryRoot/flowcharts"

$RequiredPaths = @(
    "README.md",
    "ACADEMY-OS.md",
    "docs/academy-operating-rules.md",
    "docs/source-lineage.md",
    "docs/quality-assurance-system.md",
    "docs/release-system.md",
    "scripts/README.md",
    "scripts/validate-academy.ps1",
    "scripts/render-mermaid-flowcharts.ps1",
    "$ModuleRoot/README.md",
    "$ModuleRoot/instructor-guide.md",
    "$ModuleRoot/learner-workbook.md",
    "$ModuleRoot/ai-agent-guide.md",
    "$ModuleRoot/assessment-rubric.md",
    "$ModuleRoot/capstone-project.md",
    "$ModuleRoot/implementation-checklist.md",
    "$ModuleRoot/source-map.md",
    "$ModuleRoot/lessons/01-industrial-demand-generation-foundations.md",
    "$ModuleRoot/lessons/02-industrial-buyer-reality.md",
    "$ModuleRoot/lessons/03-icp-segments-and-demand-focus.md",
    "$ModuleRoot/lessons/04-moin-map-of-informational-needs.md",
    "$ModuleRoot/lessons/05-content-engine-for-industrial-demand.md",
    "$ModuleRoot/lessons/06-distribution-the-missing-half.md",
    "$ModuleRoot/lessons/07-signal-routing-and-demand-capture.md",
    "$ModuleRoot/lessons/08-measurement-cadence-and-90-day-pilot.md",
    "$ModuleRoot/exercises/01-demand-system-diagnostic.md",
    "$ModuleRoot/exercises/02-buyer-reality-map.md",
    "$ModuleRoot/exercises/03-icp-demand-focus.md",
    "$ModuleRoot/exercises/04-moin-workshop.md",
    "$ModuleRoot/exercises/05-content-engine-build.md",
    "$ModuleRoot/exercises/06-distribution-system-design.md",
    "$ModuleRoot/exercises/07-signal-routing-simulation.md",
    "$ModuleRoot/exercises/08-weekly-cadence-and-pilot-plan.md",
    "$DeliveryRoot/START-HERE.md",
    "$DeliveryRoot/module-1-review-hub.html",
    "$DeliveryRoot/module-field-guide.md",
    "$DeliveryRoot/workbook-print-edition.md",
    "$DeliveryRoot/facilitator-runbook.md",
    "$DeliveryRoot/workshop-agenda.md",
    "$DeliveryRoot/ai-agent-prompt-library.md",
    "$DeliveryRoot/artifact-submission-pack.md",
    "$DeliveryRoot/quality-gates.md",
    "$DeliveryRoot/implementation-sprint-plan.md",
    "$DeliveryRoot/flowcharts/README.md",
    "$DeliveryRoot/flowcharts/concept-coverage-matrix.md",
    "$DeliveryRoot/flowcharts/visual-render-qa.md",
    "$DeliveryRoot/exports/rendered-flowcharts/render-report.md",
    "$DeliveryRoot/exports/rendered-flowcharts/diagram-gallery.html",
    "$DeliveryRoot/exports/rendered-flowcharts/contact-sheet.md",
    "$DeliveryRoot/calibration-pack/README.md",
    "$DeliveryRoot/cohort-ops/README.md",
    "$DeliveryRoot/release-pack/README.md",
    "$DeliveryRoot/qa/README.md"
)

$MissingRequired = @()
foreach ($Path in $RequiredPaths) {
    if (-not (Test-Path -LiteralPath (Resolve-RepoPath $Path))) {
        $MissingRequired += $Path
    }
}

if ($MissingRequired.Count -eq 0) {
    Add-GateResult "Required assets" "PASS" "$($RequiredPaths.Count) required paths found."
} else {
    Add-GateResult "Required assets" "FAIL" "Missing: $($MissingRequired -join ', ')"
}

$MarkdownFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -Filter "*.md" |
    Where-Object { $_.FullName -notmatch "\\.git\\" -and $_.FullName -notmatch "\\node_modules\\" }

$BrokenLinks = @()
$CheckedLinks = 0
foreach ($File in $MarkdownFiles) {
    $Content = Get-Content -LiteralPath $File.FullName -Raw
    $Matches = [regex]::Matches($Content, "\[[^\]]+\]\(([^)]+)\)")

    foreach ($Match in $Matches) {
        $Target = $Match.Groups[1].Value.Trim()
        if ([string]::IsNullOrWhiteSpace($Target)) {
            continue
        }

        if ($Target.StartsWith("<") -and $Target.EndsWith(">")) {
            $Target = $Target.Substring(1, $Target.Length - 2)
        }

        if ($Target -match "^(https?:|mailto:|app://|plugin://)") {
            continue
        }

        if ($Target.StartsWith("#")) {
            continue
        }

        $PathOnly = ($Target -split "#")[0]
        if ([string]::IsNullOrWhiteSpace($PathOnly)) {
            continue
        }

        if ($PathOnly -match "^[A-Za-z]+:") {
            continue
        }

        $CheckedLinks += 1
        $NormalizedTarget = [System.Uri]::UnescapeDataString($PathOnly).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $Candidate = Join-Path $File.DirectoryName $NormalizedTarget

        if (-not (Test-Path -LiteralPath $Candidate)) {
            $RelativeFile = Get-RepoRelativePath $File.FullName
            $BrokenLinks += "$RelativeFile -> $Target"
        }
    }
}

if ($BrokenLinks.Count -eq 0) {
    Add-GateResult "Markdown links" "PASS" "$CheckedLinks local links checked."
} else {
    Add-GateResult "Markdown links" "FAIL" "Broken links: $($BrokenLinks -join '; ')"
}

$MermaidFailures = @()
$MermaidBlocks = 0
$MermaidStartPattern = "^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|C4Context|gitGraph)"

foreach ($File in $MarkdownFiles) {
    $Content = Get-Content -LiteralPath $File.FullName -Raw
    $Openings = [regex]::Matches($Content, '(?m)^```mermaid\s*$').Count
    $Blocks = [regex]::Matches($Content, '(?ms)^```mermaid\s*(.*?)^```\s*$')

    if ($Openings -ne $Blocks.Count) {
        $RelativeFile = Get-RepoRelativePath $File.FullName
        $MermaidFailures += "$RelativeFile has $Openings Mermaid openings but $($Blocks.Count) closed blocks."
        continue
    }

    foreach ($Block in $Blocks) {
        $MermaidBlocks += 1
        $Lines = $Block.Groups[1].Value -split "`r?`n"
        $FirstLine = ($Lines | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 1).Trim()
        if ($FirstLine -notmatch $MermaidStartPattern) {
            $RelativeFile = Get-RepoRelativePath $File.FullName
            $MermaidFailures += "$RelativeFile has an unrecognized Mermaid start line: $FirstLine"
        }
    }
}

if ($MermaidFailures.Count -eq 0) {
    Add-GateResult "Mermaid fences" "PASS" "$MermaidBlocks Mermaid blocks checked."
} else {
    Add-GateResult "Mermaid fences" "FAIL" "$($MermaidFailures -join '; ')"
}

$FlowchartDir = Resolve-RepoPath $FlowchartRoot
$NumberedFlowcharts = @()
if (Test-Path -LiteralPath $FlowchartDir) {
    $NumberedFlowcharts = Get-ChildItem -LiteralPath $FlowchartDir -File -Filter "*.md" |
        Where-Object { $_.BaseName -match "^\d\d-" }
}

if ($NumberedFlowcharts.Count -ge 33) {
    Add-GateResult "Flowchart coverage" "PASS" "$($NumberedFlowcharts.Count) numbered Mermaid flowchart files found."
} else {
    Add-GateResult "Flowchart coverage" "FAIL" "Expected at least 33 numbered flowchart files; found $($NumberedFlowcharts.Count)."
}

$RenderedFlowchartDir = Resolve-RepoPath "$DeliveryRoot/exports/rendered-flowcharts"
$RenderedSvgs = @()
$InvalidRenderedSvgs = @()
if (Test-Path -LiteralPath $RenderedFlowchartDir) {
    $RenderedSvgs = Get-ChildItem -LiteralPath $RenderedFlowchartDir -File -Filter "*.svg"
    foreach ($Svg in $RenderedSvgs) {
        $ContainsSvgRoot = Select-String -LiteralPath $Svg.FullName -Pattern "<svg" -Quiet
        if ($Svg.Length -lt 1000 -or -not $ContainsSvgRoot) {
            $InvalidRenderedSvgs += "$($Svg.Name) ($($Svg.Length) bytes)"
        }
    }
}

if ($RenderedSvgs.Count -ge 33 -and $InvalidRenderedSvgs.Count -eq 0) {
    Add-GateResult "Rendered flowcharts" "PASS" "$($RenderedSvgs.Count) rendered SVG files found and nonblank."
} elseif ($InvalidRenderedSvgs.Count -gt 0) {
    Add-GateResult "Rendered flowcharts" "FAIL" "Invalid rendered SVGs: $($InvalidRenderedSvgs -join ', ')"
} else {
    Add-GateResult "Rendered flowcharts" "FAIL" "Expected at least 33 rendered SVG files; found $($RenderedSvgs.Count)."
}

$TextFiles = Get-ChildItem -LiteralPath $Root -Recurse -File |
    Where-Object {
        $_.FullName -notmatch "\\.git\\" -and
        $_.FullName -notmatch "\\node_modules\\" -and
        (
            $_.Extension -in @(".md", ".ps1", ".txt", ".json", ".yml", ".yaml") -or
            $_.Name -eq ".gitignore"
        )
    }

$NonAsciiFiles = @()
foreach ($File in $TextFiles) {
    $Content = Get-Content -LiteralPath $File.FullName -Raw
    $HasNonAscii = $false
    foreach ($Char in $Content.ToCharArray()) {
        if ([int][char]$Char -gt 127) {
            $HasNonAscii = $true
            break
        }
    }

    if ($HasNonAscii) {
        $NonAsciiFiles += Get-RepoRelativePath $File.FullName
    }
}

if ($NonAsciiFiles.Count -eq 0) {
    Add-GateResult "ASCII hygiene" "PASS" "$($TextFiles.Count) text files checked."
} elseif ($StrictAscii) {
    Add-GateResult "ASCII hygiene" "FAIL" "Non-ASCII text found in: $($NonAsciiFiles -join ', ')"
} else {
    Add-GateResult "ASCII hygiene" "WARN" "Non-ASCII text found in: $($NonAsciiFiles -join ', ')"
}

$RestrictedTerms = @(
    "ABB",
    "Amazon",
    "Apple",
    "Bosch",
    "Caterpillar",
    "Ford",
    "General Electric",
    "Honeywell",
    "John Deere",
    "Rockwell Automation",
    "Schneider Electric",
    "Siemens",
    "Tesla",
    "Toyota"
)

$RestrictedFilePath = Resolve-RepoPath $RestrictedNamesFile
$LocalRestrictedLoaded = $false
if (Test-Path -LiteralPath $RestrictedFilePath) {
    $LocalRestrictedLoaded = $true
    $RestrictedTerms += Get-Content -LiteralPath $RestrictedFilePath |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_.Length -gt 0 -and -not $_.StartsWith("#") }
}

$RestrictedTerms = $RestrictedTerms | Sort-Object -Unique
$RestrictedHits = @()
foreach ($Term in $RestrictedTerms) {
    $Pattern = "(?i)(?<![A-Za-z0-9])$([regex]::Escape($Term))(?![A-Za-z0-9])"
    foreach ($File in $MarkdownFiles) {
        $Content = Get-Content -LiteralPath $File.FullName -Raw
        if ($Content -match $Pattern) {
            $RelativeFile = Get-RepoRelativePath $File.FullName
            $RestrictedHits += "$Term in $RelativeFile"
        }
    }
}

if ($RestrictedHits.Count -eq 0) {
    if ($LocalRestrictedLoaded) {
        Add-GateResult "Restricted-name scan" "PASS" "$($RestrictedTerms.Count) restricted terms checked, including local list."
    } else {
        Add-GateResult "Restricted-name scan" "PASS" "$($RestrictedTerms.Count) built-in public-company example terms checked. No local restricted-name file found."
    }
} else {
    Add-GateResult "Restricted-name scan" "FAIL" "$($RestrictedHits -join '; ')"
}

$ReportFullPath = Resolve-RepoPath $ReportPath
$ReportDirectory = Split-Path -Parent $ReportFullPath
if (-not (Test-Path -LiteralPath $ReportDirectory)) {
    New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
}

$Now = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$Report = @()
$Report += "# Last Academy Validation Report"
$Report += ""
$Report += "Generated: $Now"
$Report += ""
$Report += "| Gate | Status | Detail |"
$Report += "|---|---|---|"
foreach ($Result in $Results) {
    $Report += "| $(Escape-MarkdownCell $Result.Gate) | $(Escape-MarkdownCell $Result.Status) | $(Escape-MarkdownCell $Result.Detail) |"
}
$Report += ""
$Report += "Command:"
$Report += ""
$Report += '```powershell'
$Report += "powershell -ExecutionPolicy Bypass -File scripts\validate-academy.ps1"
$Report += '```'

Set-Content -LiteralPath $ReportFullPath -Value ($Report -join [Environment]::NewLine) -Encoding UTF8

$Failures = $Results | Where-Object { $_.Status -eq "FAIL" }

$Results | Format-Table -AutoSize | Out-String | Write-Host
Write-Host "Validation report written to $ReportPath"

if ($Failures.Count -gt 0) {
    exit 1
}

exit 0
