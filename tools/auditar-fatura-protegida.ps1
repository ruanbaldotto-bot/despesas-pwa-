param([Parameter(Mandatory=$true)][string]$Bank,[Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference='Stop'
# Password is entered locally, not in command arguments, chat, files or reports.
$taskSecret=Read-Host 'Senha do PDF (somente neste computador)' -AsSecureString
$taskPointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecret)
try {
 $taskPassword=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer)
 $taskPassword | & node (Join-Path $PSScriptRoot 'auditar-faturas-locais.cjs') $Bank $File --password-stdin
} finally {
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer)
 $taskPassword=$null
 $taskSecret.Dispose()
}
