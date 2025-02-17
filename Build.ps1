﻿param (
    [switch]$SetAssemblyVersion,
    [switch]$Build,

    [switch]$SmokeTests,
    [switch]$UnitTests,
    [switch]$IntegrationTests,
    [switch]$SystemTests,
    
    [switch]$CoverReport,
    [switch]$GenerateDocs,

    [switch]$Pack,
    [switch]$Publish
)

# Load Toolkit
. ".build\BuildToolkit.ps1"

# Set MSBuild to latest version
$MsBuildVersion = "latest";

# Initialize Toolkit
Invoke-Initialize -Version (Get-Content "VERSION");

if ($Build) {
    Invoke-Build ".\MORYX-Framework.sln"
}

if ($SmokeTests) {
    $runtimePath = "$RootPath\src\StartProject\bin\$env:MORYX_BUILD_CONFIG\StartProject.exe";
    Invoke-SmokeTest $runtimePath 3 6000
}

if ($UnitTests) {
    Invoke-CoverTests -SearchFilter "*.Tests.csproj"
}

if ($IntegrationTests) {
    Invoke-CoverTests -SearchFilter "*.IntegrationTests.csproj"
}

if ($SystemTests) {
    Invoke-CoverTests -SearchFilter "*.SystemTests.csproj"
}

if ($CoverReport) {
    Invoke-CoverReport
}

if ($GenerateDocs) {
    Invoke-DocFx
}

if ($Pack) {
    Invoke-PackAll -Symbols
}

if ($Publish) {
    Invoke-Publish
}

Write-Host "Success!"