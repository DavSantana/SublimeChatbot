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

        // Detectar saludos
        if (messageBody.includes("hola") || messageBody.includes("buenas") || messageBody.includes("inicio")) {
          replyText = "🎓 *¡Hola! Bienvenido a Sublime* ✨\n\nAquí vestimos tu orgullo universitario. ¿Qué te gustaría hacer hoy?\n\n1️⃣ Ver Catálogo (Camisas, Totebags, Suéteres)\n2️⃣ Precios al Mayor (Para grupos/promociones)\n3️⃣ Productos Personalizados\n4️⃣ Hablar con Vero 👩🏻‍💻";
        } 
        // Opción 1: Catálogo
        else if (messageBody === "1" || messageBody.includes("catalogo") || messageBody.includes("catálogo")) {
          // TIP: Aquí puedes pegar el link real de tu Instagram o PDF
          replyText = "📸 ¡Chequea nuestro flow!\n\nPuedes ver todos nuestros diseños disponibles aquí:\n👉 https://identidadsublime.netlify.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn4lB-LzqKyh4xgFS1Cf_dE3-vrQdKun1pLXQEVUti24NLe-Z49cmKMyfA6z4_aem_YYXQgRpKtr60hCLaYBLQEA\n\nAvísame si te gusta alguno.";
        } 
        // Opción 2: Mayor
        else if (messageBody === "2" || messageBody.includes("mayor") || messageBody.includes("precio")) {
          replyText = "📦 *¡Viste a toda tu promo!*\n\nManejamos precios especiales a partir de 12 piezas. Ideal para:\n✅ Promociones\n✅ Aniversarios\n✅ Eventos de carrera\n\n¿Para qué carrera o universidad los necesitas?";
        } 
        // Opción 3: Personalizados
        else if (messageBody === "3" || messageBody.includes("personalizado")) {
          replyText = "🎨 *¡Tu idea, tu estilo!*\n\nPodemos estampar el diseño que quieras en nuestras prendas. El tiempo de entrega es de 5 a 7 días hábiles.\n\nEscribe *4* para enviarle tu diseño a Vero.";
        } 
        // Opción 4: Hablar con Vero
        else if (messageBody === "4" || messageBody.includes("vero") || messageBody.includes("humano")) {
          replyText = "👩🏻‍💻 ¡Dale! Ya le aviso a Vero que necesitas ayuda personalizada.\n\nEscribe tu duda por aquí y ella te responderá en cuanto se desocupe. 👇";
        } 
        // Respuesta por defecto
        else {
          replyText = "No entendí muy bien 😅.\nEscribe *Hola* para ver el menú de opciones.";
        }

        // Enviar la respuesta
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
