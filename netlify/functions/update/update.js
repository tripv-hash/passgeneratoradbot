const axios = require("axios").default;

exports.handler = async (event) => {
  console.log("Received an update from Telegram:", event.body);

  const chatId = "6088938467"; // Inserisci l'ID della chat Telegram a cui inviare il messaggio
  const message = "Ciao! Questo è un messaggio inviato dal bot."; // Il messaggio che vuoi inviare

  try {
    // Costruisci l'URL con il token preso dalle variabili d'ambiente
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    // Esegui la richiesta POST a Telegram
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
    });

    console.log("Message sent successfully:", response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Messaggio inviato con successo!",
        telegramResponse: response.data,
      }),
    };
  } catch (error) {
    console.error("Errore nell'invio del messaggio:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Errore nell'invio del messaggio.",
        error: error.message,
      }),
    };
  }
};


