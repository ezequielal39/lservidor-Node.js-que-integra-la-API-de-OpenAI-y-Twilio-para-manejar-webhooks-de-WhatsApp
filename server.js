require('dotenv').config();
const express = require('express');
const openai = require('openai');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // manejo de los cuerpos de las solicitudes URL-encoded

// configurando OpenAI y Twilio
openai.apiKey = process.env.OPENAI_API_KEY;
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Manejando Webhooks para mensajes de WhatsApp
app.post('/whatsapp', async (req, res) => {
    const userMessage = req.body.Body;
    const userPhoneNumber = req.body.From;
    const twilioPhoneNumber = req.body.To;

    try {
        const response = await openai.Completion.create({
            engine: "text-davinci-003",
            prompt: userMessage,
            max_tokens: 150
        });

        const reply = response.data.choices[0].text.trim();

        // Enviar la respuesta a través de Twilio
        await twilioClient.messages.create({
            body: reply,
            from: twilioPhoneNumber,
            to: userPhoneNumber
        });

        res.status(200).send('Mensaje enviado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server run in port ${PORT}`);
});