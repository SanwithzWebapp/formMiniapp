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
    showCommandMenu(chatId); // Show the command button menu
  } else if (text === "Form Mini App") {
    sendWelcomeMessage(chatId);
  } else if (text === "Latest Data") {
    sendData(chatId);
  } else {
    sendTelegramMessage(chatId, "Unknown command. Please use the menu buttons.");
  }
}

function showCommandMenu(chatId) {
  const message = {
    chat_id: chatId,
    text: "Please choose a command from the menu below:",
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: "Form Mini App" }, { text: "Latest Data" }], // Button labels
      ],
      resize_keyboard: true, // Adjust the size of the keyboard
      one_time_keyboard: false, // Keep the keyboard visible
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

function sendWelcomeMessage(chatId) {
  const message = {
    chat_id: chatId,
    text: "Welcome to the Form Mini App system! Please click the button below to proceed",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Go to Form Mini App", url: appUrl }],
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
*ข้อมูลล่าสุด:*
- *Timestamp:* ${latestEntry.Timestamp}
- *แผนก:* ${latestEntry.แผนก}
- *ชื่อพนักงานเย็บ:* ${latestEntry.ชื่อพนักงานเย็บ}
- *ชื่อพนักงานตรวจ:* ${latestEntry.ชื่อพนักงานตรวจ}
- *รุ่น:* ${latestEntry.รุ่น}
- *ไซต์:* ${latestEntry.ไซต์}
- *เบอร์:* ${latestEntry.เบอร์}
- *ปัญหา:* ${latestEntry.ปัญหา}
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
