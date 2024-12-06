const token = "XXXXXXXXX"; // Telegram bot token
const appUrl = "XXXXXXXXXX"; // App URL
const jsonApiUrl = "https://opensheet.elk.sh/XXXXXXX/XXXXX"; // JSON API URL

function doPost(e) {
  try {
    const contents = e.postData?.contents;
    if (contents) {
      const parsed = JSON.parse(contents);
      if (parsed.message) {
        handleTelegram(parsed);
      } else {
        handleFormSubmission(e.parameter);
      }
    }
  } catch (error) {
    Logger.log(`Error in doPost: ${error.message}`);
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: 'Invalid request.' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleTelegram(parsed) {
  const chatId = parsed.message?.chat?.id;
  const text = parsed.message?.text;

  if (text === "/start") {
    sendWelcomeMessage(chatId);
  } else if (text === "/data") {
    sendData(chatId);
  }
}

function sendWelcomeMessage(chatId) {
  const message = {
    chat_id: chatId,
    text: "Welcome to the Form Mini App system! Please click the button below to proceed",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Form Mini App", url: appUrl }],
      ],
    }),
  };

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(message),
  };

  UrlFetchApp.fetch(telegramUrl, options);
}

function sendData(chatId) {
  try {
    const response = UrlFetchApp.fetch(jsonApiUrl);
    const data = JSON.parse(response.getContentText());

    if (data && data.length > 0) {
      const latestEntry = data[data.length - 1]; // Get the latest entry
      const messageText = `
*Latest Data:*
- *Timestamp:* ${latestEntry.Timestamp}
- *Division:* ${latestEntry.แผนก}
- *Name:* ${latestEntry.ชื่อพนักงาน}
- *Model:* ${latestEntry.รุ่น}
- *Size:* ${latestEntry.ไซต์}
- *Issue:* ${latestEntry.ปัญหา}
- [File Link](${latestEntry["File URL"]})
`;

      sendTelegramMessage(chatId, messageText);
    } else {
      sendTelegramMessage(chatId, "No data available.");
    }
  } catch (error) {
    Logger.log(`Error fetching data: ${error.message}`);
    sendTelegramMessage(chatId, "Error fetching data. Please try again later.");
  }
}

function sendTelegramMessage(chatId, text) {
  const message = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown", // Allows formatting with asterisks, underscores, etc.
  };

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(message),
  };

  UrlFetchApp.fetch(telegramUrl, options);
}
