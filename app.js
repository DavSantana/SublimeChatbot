const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const apiToken = process.env.API_TOKEN;
const businessPhoneId = process.env.BUSINESS_PHONE;

// --- RUTA 1: VERIFICACIÓN (GET) ---
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
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; 
        const messageBody = message.text ? message.text.body.toLowerCase() : "";

        console.log(`📩 Mensaje de ${from}: ${messageBody}`);

        // --- CEREBRO DE SUBLIME 🧠 ---
        let replyText = "";

        // 1. LISTA DE PALABRAS DE ACTIVACIÓN (Trigger Words)
        // Agregamos más opciones para que sea natural iniciar
        const saludos = [
            "hola", "buenas", "hey", "qué tal", "que tal", // Saludos
            "inicio", "start", "empezar", // Comandos técnicos
            "menu", "menú", "volver", "atras", // Navegación
            "info", "informacion", "precio" // Intención de compra
        ];

        // --- LÓGICA DE RESPUESTAS ---

        // CASO A: El usuario saluda o pide el menú
        if (saludos.some(palabra => messageBody.includes(palabra))) {
          replyText = "🎓 *¡Hey! Bienvenido a Sublime* ✨\n\nAquí vestimos tu orgullo universitario. ¿Qué te gustaría hacer hoy?\n\n1️⃣ Ver Catálogo (Camisas, Totebags...)\n2️⃣ Precios al Mayor (Promociones)\n3️⃣ Productos Personalizados\n4️⃣ Hablar con Vero 👩🏻‍💻";
        } 
        
        // CASO B: Opción 1 - Catálogo
        else if (messageBody === "1" || messageBody.includes("catalogo") || messageBody.includes("catálogo")) {
          replyText = "📸 *¡Chequea nuestro flow!*\n\nLa mayoría de nuestras camisas tienen un valor de *23$ (Tasa BCV)*.\n\nPuedes ver todos los diseños aquí:\n👉 https://identidadsublime.netlify.app/\n\n----------------------------\n🔙 Escribe *Menú* para volver a las opciones.";
        } 
        
        // CASO C: Opción 2 - Mayor
        else if (messageBody === "2" || messageBody.includes("mayor")) {
          replyText = "📦 *¡Viste a toda tu promo!*\n\nManejamos precios especiales a partir de 12 piezas. Ideal para:\n✅ Promociones\n✅ Aniversarios\n✅ Eventos de carrera\n\n¿Para qué universidad los necesitas?\n\n----------------------------\n🔙 Escribe *Menú* para volver.";
        } 
        
        // CASO D: Opción 3 - Personalizados
        else if (messageBody === "3" || messageBody.includes("personalizado")) {
          replyText = "🎨 *¡Tu idea, tu estilo!*\n\nPodemos estampar tu propio diseño en nuestras prendas.\n⏱️ Tiempo de entrega: 5-7 días hábiles.\n\nEscribe *4* para enviarle tu diseño a Vero.\n\n----------------------------\n🔙 Escribe *Menú* para volver.";
        } 
        
        // CASO E: Opción 4 - Vero
        else if (messageBody === "4" || messageBody.includes("vero") || messageBody.includes("humano")) {
          replyText = "👩🏻‍💻 ¡Dale! Ya le aviso a Vero que necesitas ayuda humana.\n\nPuedes ir escribiendo tu duda o enviando tu diseño por aquí mientras ella se conecta. 👇";
        } 
        
        // CASO F: No entendió
        else {
          replyText = "No entendí muy bien 😅.\n\nEscribe *Menú* para ver las opciones disponibles.\nO escribe *Vero* para hablar con ella.";
        }

        // --- ENVIAR RESPUESTA A META ---
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v21.0/${businessPhoneId}/messages`,
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: replyText }, 
          },
        });
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    res.sendStatus(200);
  }
});

// Encender servidor
app.listen(port, () => {
  console.log(`\n🚀 Servidor Sublime listo en el puerto ${port}\n`);
});
