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

  const message = body.message || body.edited_message;

  if (!message || !message.chat) {
    console.error("Messaggio o campo 'chat' mancante.");
    return { statusCode: 400, body: JSON.stringify({ message: "Messaggio o campo 'chat' mancante." }) };
  }

  const chatId = message.chat.id;

  // Comando /generatepwd: Genera una password casuale
  if (message.text && message.text.toLowerCase().startsWith("/generatepwd")) {
    let length = 12; // Lunghezza predefinita della password

    const parts = message.text.split(" ");
    if (parts[1] && !isNaN(parts[1])) {
      length = parseInt(parts[1]);
    }

    const password = generatePassword(length);  // Genera la password
    const responseMessage = `Ecco la tua password temporanea di ${length} caratteri:

\`\`\`
${password}
\`\`\`

Puoi copiarla direttamente da qui!`;

    try {
      // Invia il messaggio con la password
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: responseMessage,
      });

      console.log("Password sent successfully!");
      return { statusCode: 200, body: JSON.stringify({ message: "Password sent successfully!" }) };
    } catch (error) {
      console.error("Error sending password:", error.message);
      return { statusCode: 500, body: JSON.stringify({ message: "Error sending password.", error: error.message }) };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "No valid command received.",
    }),
  };
};

function generatePassword(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}
