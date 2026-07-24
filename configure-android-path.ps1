
# Configuration automatique du PATH pour Android
# Exécuter ce script en tant qu'administrateur

$androidHome = "C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk"
$platformTools = "C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk\platform-tools"
$tools = "C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk\tools"

# Variables d'environnement
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "Machine")

# PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = $currentPath + ";" + $platformTools + ";" + $tools
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")

Write-Host "✅ Android SDK configuré"
Write-Host "✅ ANDROID_HOME = $androidHome"
Write-Host "✅ PATH mis à jour"
Write-Host "🔄 Redémarrez le terminal pour appliquer les changements"
