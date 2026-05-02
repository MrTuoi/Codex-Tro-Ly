import fs from "node:fs";

const TELEGRAM_LIMIT = 3900;

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
}

function chunks(text) {
  const value = text || "(khong co noi dung)";
  const result = [];
  for (let index = 0; index < value.length; index += TELEGRAM_LIMIT) {
    result.push(value.slice(index, index + TELEGRAM_LIMIT));
  }
  return result;
}

const [chatId, statusMessageId, resultPath] = process.argv.slice(2);
const result = fs.readFileSync(resultPath, "utf8").trim();

if (statusMessageId && result.length <= TELEGRAM_LIMIT) {
  await telegram("editMessageText", {
    chat_id: chatId,
    message_id: statusMessageId,
    text: result || "(khong co noi dung)"
  });
} else {
  for (const chunk of chunks(result)) {
    await telegram("sendMessage", { chat_id: chatId, text: chunk });
  }
}
