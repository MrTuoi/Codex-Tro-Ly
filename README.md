# Codex Tro Ly Telegram

Bot Telegram nay chay khong can bat may tinh ca nhan:

1. Telegram gui webhook den Vercel.
2. Vercel xac thuc chat id.
3. Neu co `OPENAI_API_KEY`, Vercel goi OpenAI Responses API va tra ket qua ve Telegram.
4. Neu khong co `OPENAI_API_KEY`, Vercel co the fallback sang GitHub Actions qua `repository_dispatch`.

## Secrets can cau hinh

### Vercel Environment Variables

- `TELEGRAM_BOT_TOKEN`: token bot tu BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: chuoi bi mat tuy y de Telegram ky webhook.
- `ALLOWED_CHAT_IDS`: vi du `1730041490`.
- `GITHUB_OWNER`: `MrTuoi`.
- `GITHUB_REPO`: `Codex-Tro-Ly`.
- `GH_DISPATCH_TOKEN`: GitHub fine-grained token co quyen `Actions: read/write` va `Contents: read` tren repo.
- `OPENAI_API_KEY`: API key OpenAI de Vercel tra loi truc tiep.
- `OPENAI_MODEL`: mac dinh `gpt-5.2`.

### GitHub Repository Secrets

- `TELEGRAM_BOT_TOKEN`: token bot tu BotFather.
- `OPENAI_API_KEY`: API key OpenAI dung de chay Codex CLI trong GitHub Actions.

## Dat webhook Telegram

Sau khi deploy Vercel, chay:

PowerShell:

```powershell
.\scripts\set-webhook.ps1 `
  -TelegramBotToken "<TELEGRAM_BOT_TOKEN>" `
  -VercelUrl "https://<ten-app-vercel>.vercel.app" `
  -WebhookSecret "<TELEGRAM_WEBHOOK_SECRET>"
```

Hoac dung curl:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<ten-app-vercel>.vercel.app/api/telegram" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Kiem tra webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

## Chay local

```bash
npm run lint
```

## Luu y

- Vercel chi nhan webhook va kich hoat job, khong chay Codex truc tiep.
- Neu dung `OPENAI_API_KEY` tren Vercel, bot tra loi truc tiep tu Vercel va khong can GitHub Actions cho hoi dap thong thuong.
- GitHub Actions fallback van can `OPENAI_API_KEY` trong GitHub secrets neu muon chay Codex CLI.
- Khong commit token vao repo.
