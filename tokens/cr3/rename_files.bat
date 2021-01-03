@echo off
Setlocal enabledelayedexpansion

Set "Pattern= "
Set "Replace=_"

For %%a in (*.png) Do (
    Set "File=%%~a"
    Ren "%%a" "!File:%Pattern%=%Replace%!"
)

For %%a in (*.jpg) Do (
    Set "File=%%~a"
    Ren "%%a" "!File:%Pattern%=%Replace%!"
)

Pause&Exit