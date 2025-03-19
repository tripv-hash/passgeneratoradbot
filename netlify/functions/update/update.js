const axios = require("axios").default;

exports.handler = async (event) => {
  console.log("Received an update from Telegram:", event.body);

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Errore nel parsing del corpo dell'evento:", error);
    return { statusCode: 400, body: JSON.stringify({ message: "Errore nel parsing del corpo dell'evento" }) };
  }

  // Verifica se è un messaggio o un messaggio modificato
  const message = body.message || body.edited_message;

  // Verifica che il messaggio e il campo chat esistano
  if (!message || !message.chat) {
    console.error("Messaggio o campo 'chat' mancante.");
    return { statusCode: 400, body: JSON.stringify({ message: "Messaggio o campo 'chat' mancante." }) };
  }

  const chatId = message.chat.id;

  // Comando /start: Risposta di benvenuto
  if (message.text && message.text.toLowerCase() === "/start") {
    const welcomeMessage = `
      Ciao! Benvenuto nel bot per la generazione di password. 😊
      
      Usa i seguenti comandi per generare una password:
      
      1. /generatepwd - Genera una password casuale di 12 caratteri.
      2. /generatepwd <length> - Genera una password casuale con una lunghezza specificata (es. /generatepwd 16).
      
      Se hai bisogno di aiuto, usa il comando /help.
    `;

    try {
      // Invia il messaggio di benvenuto alla chat
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: welcomeMessage,
      });
    } catch (error) {
      console.error("Errore nell'invio del messaggio di benvenuto:", error);
    }
  }

  // Comando per generare la password
  if (message.text && message.text.toLowerCase().startsWith("/generatepwd")) {
    const length = parseInt(message.text.split(" ")[1]) || 12;
    const password = generatePassword(length);

    try {
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: `🔐 Ecco la tua password:\n\`${escapeMarkdown(password)}\`\n\nTocca il pulsante qui sotto per copiarla facilmente!`,
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [[
            { text: "📋 Copia Password", switch_inline_query: password }
          ]]
        }
      });
    } catch (error) {
      console.error("Errore nell'invio della password:", error);
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Password inviata" }) };
  }

  return { statusCode: 200, body: "Nessun comando valido ricevuto" };
};

// Funzione per generare una password casuale
function generatePassword(length) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Funzione per eseguire l'escape dei caratteri speciali nel MarkdownV2
function escapeMarkdown(text) {
  return text.replace(/([_*[\]()~`>#+=-|{}.!])/g, '\\$1');
}
