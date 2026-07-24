
# Configuration automatique du PATH pour Java
# Exécuter ce script en tant qu'administrateur

$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

if ($currentPath -notlike "*$javaPath*") {
    $newPath = $currentPath + ";" + $javaPath
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    Write-Host "✅ Java ajouté au PATH système"
} else {
    Write-Host "✅ Java déjà dans le PATH"
}

# Redémarrer le terminal pour appliquer les changements
Write-Host "🔄 Redémarrez le terminal pour appliquer les changements"
