const axios = require("axios").default;

exports.handler = async (event) => {
  console.log("Received an update from Telegram:", event.body);

  const body = JSON.parse(event.body);
  const message = body.message;
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
      // Invia il messaggio di benvenuto al chat
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: welcomeMessage,
      });

      console.log("Welcome message sent successfully!");
      return { statusCode: 200, body: JSON.stringify({ message: "Welcome message sent." }) };
    } catch (error) {
      console.error("Error sending welcome message:", error.message);
      return { statusCode: 500, body: JSON.stringify({ message: "Error sending welcome message.", error: error.message }) };
    }
  }

  // Comando /help: Spiega i comandi
  if (message.text && message.text.toLowerCase() === "/help") {
    const helpMessage = `
      Benvenuto nel bot! Ecco i comandi disponibili:
      
      1. /generatepwd - Genera una password casuale di 12 caratteri.
      2. /generatepwd <length> - Genera una password casuale di una lunghezza specificata (es. /generatepwd 16).
      
      Usa questi comandi per ricevere una password temporanea.
    `;

    try {
      // Invia il messaggio di aiuto
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: helpMessage,
      });

      console.log("Help message sent successfully!");
      return { statusCode: 200, body: JSON.stringify({ message: "Help message sent." }) };
    } catch (error) {
      console.error("Error sending help message:", error.message);
      return { statusCode: 500, body: JSON.stringify({ message: "Error sending help message.", error: error.message }) };
    }
  }

  // Comando /generatepwd: Genera una password casuale
  if (message.text && message.text.toLowerCase().startsWith("/generatepwd")) {
    let length = 12; // Lunghezza predefinita della password

    // Controlla se è stata fornita una lunghezza nel comando
    const parts = message.text.split(" ");
    if (parts[1] && !isNaN(parts[1])) {
      length = parseInt(parts[1]);
    }

    const password = generatePassword(length);  // Chiama la funzione per generare la password
    const responseMessage = `Ecco la tua password temporanea di ${length} caratteri: ${password}`;

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

// Funzione per generare una password casuale
function generatePassword(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}
