param([Parameter(Mandatory=$true)][string]$Bank,[Parameter(Mandatory=$true)][string]$File,[switch]$ReviewPeriod)
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
 $taskInput=@{password=$taskPassword}
 if($ReviewPeriod){
  $taskFrom=Read-Host 'Data inicial das compras (AAAA-MM-DD), somente neste computador'
  $taskTo=Read-Host 'Data final das compras (AAAA-MM-DD), somente neste computador'
  $taskConfirmation=Read-Host 'Confirma que o período se aplica às datas originais dos lançamentos? Digite SIM'
  if($taskConfirmation -cne 'SIM'){throw 'Período não confirmado; auditoria cancelada.'}
  $taskInput.reviewPeriod=@{from=$taskFrom;to=$taskTo;confirmed=$true}
 }
 $taskInput | ConvertTo-Json -Compress | & $taskNode $taskAuditor $Bank $File --private-input-stdin --expected-engine $taskEngine.codeHash
 if($LASTEXITCODE -ne 0){throw 'Auditoria não concluída. Nenhum conteúdo foi registrado.'}
} finally {
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer)
 $taskPassword=$null
 $taskInput=$null
 $taskFrom=$null
 $taskTo=$null
 $taskSecret.Dispose()
}
