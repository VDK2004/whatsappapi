const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Create a new client with local session storage
const client = new Client({
    authStrategy: new LocalAuth(), // Saves session data locally
    puppeteer: { headless: true }  // Run in headless mode (no browser UI)
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan the QR code below to link your WhatsApp account:');
    qrcode.generate(qr, { small: true }); // Display QR code in the terminal
});

// Confirm when the client is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// Handle errors
client.on('disconnected', (reason) => {
    console.log(`Client was disconnected: ${reason}`);
});

// Initialize the client
client.initialize();

// Function to send a message
const sendMessage = async (number, message) => {
    try {
        const chatId = `${number}@c.us`; // WhatsApp chat ID format
        await client.sendMessage(chatId, message); // Send the message
        console.log(`Message sent to ${number}: ${message}`);
        return { status: 'success', message: `Message sent to ${number}` };
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error; // Re-throw the error for further handling
    }
};

// Endpoint to send a message
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ status: 'error', message: 'Number and message are required.' });
    }

    try {
        const result = await sendMessage(number, message);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'An unknown error occurred' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});