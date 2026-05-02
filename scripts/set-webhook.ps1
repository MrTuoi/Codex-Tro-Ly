param(
    [Parameter(Mandatory = $true)]
    [string]$TelegramBotToken,

    [Parameter(Mandatory = $true)]
    [string]$VercelUrl,

    [Parameter(Mandatory = $true)]
    [string]$WebhookSecret
)

$ErrorActionPreference = "Stop"

$body = @{
    url = "$($VercelUrl.TrimEnd('/'))/api/telegram"
    secret_token = $WebhookSecret
}

Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$TelegramBotToken/setWebhook" -Body $body
