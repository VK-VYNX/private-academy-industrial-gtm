[CmdletBinding()]
param(
    [string]$Root,
    [string]$FlowchartPath = "modules/module-01-industrial-demand-generation/delivery-pack/flowcharts",
    [string]$OutputPath = "modules/module-01-industrial-demand-generation/delivery-pack/exports/rendered-flowcharts",
    [ValidateSet("svg", "png", "pdf")]
    [string]$Format = "svg",
    [switch]$UseNpx,
    [string]$MermaidCommand,
    [string]$NpmCachePath = ".academy/npm-cache"
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

function Get-RepoRelativePath {
    param([string]$Path)

    $RootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd([char[]]@([char]92, [char]47)) + [System.IO.Path]::DirectorySeparatorChar
    $PathFull = [System.IO.Path]::GetFullPath($Path)
    $RootUri = [System.Uri]$RootFull
    $PathUri = [System.Uri]$PathFull
    return [System.Uri]::UnescapeDataString($RootUri.MakeRelativeUri($PathUri).ToString()).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
}

$FlowchartDir = Resolve-RepoPath $FlowchartPath
$OutputDir = Resolve-RepoPath $OutputPath
$TmpDir = Join-Path $OutputDir "tmp"

if (-not (Test-Path -LiteralPath $FlowchartDir)) {
    throw "Flowchart directory not found: $FlowchartPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

$Cli = $null
$BaseArgs = @()

if ($MermaidCommand) {
    $Cli = $MermaidCommand
} else {
    $ResolvedMmdc = Get-Command mmdc -ErrorAction SilentlyContinue
    if ($ResolvedMmdc) {
        $Cli = $ResolvedMmdc.Source
    } elseif ($UseNpx) {
        $ResolvedNpx = Get-Command npx.cmd -ErrorAction SilentlyContinue
        if (-not $ResolvedNpx) {
            throw "npx.cmd was not found. Install Mermaid CLI or pass -MermaidCommand."
        }
        $Cli = $ResolvedNpx.Source
        $BaseArgs = @("--yes", "@mermaid-js/mermaid-cli")
        $NpmCacheFullPath = Resolve-RepoPath $NpmCachePath
        New-Item -ItemType Directory -Force -Path $NpmCacheFullPath | Out-Null
        $env:npm_config_cache = $NpmCacheFullPath
    } else {
        throw "Mermaid CLI was not found. Install mmdc or rerun with -UseNpx."
    }
}

$MarkdownFiles = Get-ChildItem -LiteralPath $FlowchartDir -File -Filter "*.md" |
    Where-Object { $_.BaseName -match "^\d\d-" } |
    Sort-Object Name

$Rendered = @()
$Failures = @()
$StopRender = $false

foreach ($File in $MarkdownFiles) {
    $Content = Get-Content -LiteralPath $File.FullName -Raw
    $Blocks = [regex]::Matches($Content, '(?ms)^```mermaid\s*(.*?)^```\s*$')

    if ($Blocks.Count -eq 0) {
        $Failures += "$($File.Name): no Mermaid block found"
        continue
    }

    $Index = 0
    foreach ($Block in $Blocks) {
        $Index += 1
        $Stem = $File.BaseName
        if ($Blocks.Count -gt 1) {
            $Stem = "$Stem-$Index"
        }

        $MmdFile = Join-Path $TmpDir "$Stem.mmd"
        $OutputFile = Join-Path $OutputDir "$Stem.$Format"
        Set-Content -LiteralPath $MmdFile -Value $Block.Groups[1].Value.Trim() -Encoding UTF8

        $Args = @()
        $Args += $BaseArgs
        $Args += @("-i", $MmdFile, "-o", $OutputFile, "--backgroundColor", "white")

        if ($Format -eq "pdf") {
            $Args += @("--pdfFit")
        }

        & $Cli @Args
        if ($LASTEXITCODE -ne 0) {
            $Failures += "$($File.Name): Mermaid CLI exited with $LASTEXITCODE"
            if ($UseNpx -and $Rendered.Count -eq 0) {
                $StopRender = $true
                break
            }
            continue
        }

        if (-not (Test-Path -LiteralPath $OutputFile)) {
            $Failures += "$($File.Name): output file was not created"
            continue
        }

        $Rendered += [pscustomobject]@{
            Source = $File.Name
            Output = Get-RepoRelativePath $OutputFile
        }
    }

    if ($StopRender) {
        break
    }
}

$ReportPath = Join-Path $OutputDir "render-report.md"
$ContactSheetPath = Join-Path $OutputDir "contact-sheet.md"
$Now = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$Report = @()
$Report += "# Mermaid Render Report"
$Report += ""
$Report += "Generated: $Now"
$Report += ""
$Report += "Format: ``$Format``"
$Report += ""
$Report += "| Source | Output |"
$Report += "|---|---|"
foreach ($Item in $Rendered) {
    $Report += "| $($Item.Source) | $($Item.Output) |"
}

if ($Failures.Count -gt 0) {
    $Report += ""
    $Report += "## Failures"
    foreach ($Failure in $Failures) {
        $Report += "- $Failure"
    }
}

Set-Content -LiteralPath $ReportPath -Value ($Report -join [Environment]::NewLine) -Encoding UTF8

$ContactSheet = @()
$ContactSheet += "# Flowchart Render Contact Sheet"
$ContactSheet += ""
$ContactSheet += "Generated: $Now"
$ContactSheet += ""
$ContactSheet += "Use this contact sheet for fast visual QA after rendering the Module 1 Mermaid atlas."
$ContactSheet += ""
foreach ($Item in $Rendered) {
    $Leaf = Split-Path -Leaf $Item.Output
    $ContactSheet += "## $($Item.Source)"
    $ContactSheet += ""
    $ContactSheet += "![Rendered diagram](./$Leaf)"
    $ContactSheet += ""
}

Set-Content -LiteralPath $ContactSheetPath -Value ($ContactSheet -join [Environment]::NewLine) -Encoding UTF8

Write-Host "Rendered $($Rendered.Count) Mermaid diagram(s)."
Write-Host "Render report written to $(Get-RepoRelativePath $ReportPath)"
Write-Host "Contact sheet written to $(Get-RepoRelativePath $ContactSheetPath)"

if ($Failures.Count -gt 0) {
    exit 1
}

exit 0
