export async function sendTelegramNotification(message: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Telegram API keys are missing in .env");
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // برای استفاده از تگ‌های b و code در پیام
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}