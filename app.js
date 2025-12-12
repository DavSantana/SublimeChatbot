/*
 * CÓDIGO ACTUALIZADO: CHATBOT CON RESPUESTA (ECHO)
 */

const express = require('express');
const axios = require('axios'); // Importamos Axios para hablar con Meta
const app = express();

app.use(express.json());

// Variables de entorno (Las que guardaste en Render)
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const apiToken = process.env.API_TOKEN;
const businessPhoneId = process.env.BUSINESS_PHONE;

// --- RUTA 1: VERIFICACIÓN (GET) ---
// Esta parte sigue igual, para que Meta no se desconecte
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFICADO');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// --- RUTA 2: RECIBIR Y RESPONDER (POST) ---
app.post('/', async (req, res) => {
  try {
    // 1. Verificar si hay un mensaje entrante
    const body = req.body;
    
    // Verificamos que sea un evento de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      
      // Navegamos por el objeto JSON complejo que envía Meta
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        
        // Extraemos los datos importantes
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número del usuario
        const messageBody = message.text ? message.text.body : "Recibí un archivo multimedia"; 

        console.log(`📩 Mensaje recibido de ${from}: ${messageBody}`);

        // 2. RESPONDER AL USUARIO (Aquí usamos Axios)
        // Enviamos una petición a la API de Graph de Facebook
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v21.0/${businessPhoneId}/messages`,
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            to: from, // Respondemos al mismo número
            text: { body: `Tu bot dice: ${messageBody}` }, // Eco del mensaje
          },
        });
        
        console.log('📤 Respuesta enviada exitosamente');
      }
    }
    
    // Siempre respondemos 200 OK a Meta
    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.response ? error.response.data : error.message);
    res.sendStatus(200); // Respondemos OK aunque falle para no bloquear el webhook
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Servidor escuchando en el puerto ${port}\n`);
});
