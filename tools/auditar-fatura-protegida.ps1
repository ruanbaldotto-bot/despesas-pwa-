param([Parameter(Mandatory=$true)][string]$Bank,[Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference='Stop'
# Resolve code from this script's directory, independent of the shell working directory.
$taskNode=(Get-Command node -CommandType Application -ErrorAction Stop).Source
$taskAuditor=Join-Path $PSScriptRoot 'auditar-faturas-locais.cjs'
$taskEngineRaw=& $taskNode $taskAuditor --engine-info
if($LASTEXITCODE -ne 0){throw 'Não foi possível verificar o motor local.'}
$taskEngine=$taskEngineRaw | ConvertFrom-Json
if(!$taskEngine.coreSynced -or !$taskEngine.clientSynced -or !$taskEngine.importsLocal){throw 'Código gerado divergente. Execute tools\sync-core.cjs antes de auditar.'}
Write-Host ('Motor: '+$taskEngine.version+' | SHA-256: '+$taskEngine.codeHash)
# Password stays in the interactive local process, never in arguments or files.
$taskSecret=Read-Host 'Senha do PDF (somente neste computador)' -AsSecureString
$taskPointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecret)
try {
 $taskPassword=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer)
 $taskPassword | & $taskNode $taskAuditor $Bank $File --password-stdin --expected-engine $taskEngine.codeHash
 if($LASTEXITCODE -ne 0){throw 'Auditoria não concluída. Nenhum conteúdo foi registrado.'}
} finally {
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer)
 $taskPassword=$null
 $taskSecret.Dispose()
}
