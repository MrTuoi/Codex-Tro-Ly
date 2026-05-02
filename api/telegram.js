const TELEGRAM_LIMIT = 3900;

function json(status, body) {
  return { status, body };
}

async function telegram(method, data) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data)
  });
  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(payload)}`);
  }
  return payload.result;
}

async function dispatchToGithub({ chatId, prompt, statusMessageId }) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GH_DISPATCH_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28"
    },
    body: JSON.stringify({
      event_type: "telegram_codex_prompt",
      client_payload: {
        chat_id: String(chatId),
        prompt,
        status_message_id: String(statusMessageId)
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub dispatch failed: ${response.status} ${text}`);
  }
}

function isAllowed(chatId) {
  const allowed = (process.env.ALLOWED_CHAT_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(String(chatId));
}

export default async function handler(request, response) {
  const send = (status, body) => response.status(status).json(body);

  if (request.method !== "POST") {
    const result = json(405, { ok: false, error: "method_not_allowed" });
    return send(result.status, result.body);
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const actualSecret = request.headers["x-telegram-bot-api-secret-token"] || "";
  if (expectedSecret && actualSecret !== expectedSecret) {
    const result = json(401, { ok: false, error: "unauthorized" });
    return send(result.status, result.body);
  }

  const update = request.body || {};
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = (message?.text || "").trim();

  if (!chatId || !text) {
    const result = json(200, { ok: true, ignored: true });
    return send(result.status, result.body);
  }

  if (text === "/id") {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: `Telegram ID cua ban la: ${chatId}`
    });
    const result = json(200, { ok: true });
    return send(result.status, result.body);
  }

  if (!isAllowed(chatId)) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Chat nay chua duoc phep dung bot."
    });
    const result = json(200, { ok: true });
    return send(result.status, result.body);
  }

  if (text === "/start" || text === "/help") {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Hay gui yeu cau cho Codex truc tiep trong chat nay. Bot se xu ly tren GitHub Actions va tra ket qua tai day."
    });
    const result = json(200, { ok: true });
    return send(result.status, result.body);
  }

  const status = await telegram("sendMessage", {
    chat_id: chatId,
    text: "Codex dang khoi dong tren GitHub Actions..."
  });

  try {
    await dispatchToGithub({
      chatId,
      prompt: text.slice(0, TELEGRAM_LIMIT),
      statusMessageId: status.message_id
    });
  } catch (error) {
    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: status.message_id,
      text: `Khong the kich hoat GitHub Actions: ${error.message}`.slice(0, TELEGRAM_LIMIT)
    });
  }

  const result = json(200, { ok: true });
  return send(result.status, result.body);
}
