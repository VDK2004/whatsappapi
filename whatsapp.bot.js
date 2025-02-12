const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sessions' }),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Genereer unieke sessie ID voor cache controle
const sessionId = uuidv4();
let qrGenerated = false;

client.on('qr', async (qr) => {
    try {
        const qrImage = await qrcode.toDataURL(qr);
        console.log(`QR_BASE64:${sessionId}:${qrImage}`);
        qrGenerated = true;
    } catch (error) {
        console.error(`QR_ERROR:${error.message}`);
    }
});

client.on('ready', () => {
    console.log(`READY:${sessionId}`);
    qrGenerated = false;
});

client.on('authenticated', () => {
    console.log(`AUTHENTICATED:${sessionId}`);
});

client.on('auth_failure', (msg) => {
    console.error(`AUTH_FAILURE:${msg}`);
});

client.initialize();

// Houd proces actief
setInterval(() => {}, 1000);