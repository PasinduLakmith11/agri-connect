"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const sms_service_1 = require("../services/sms.service");
// Webhook for Twilio
const handleWebhook = async (req, res) => {
    try {
        const { From, Body } = req.body; // Twilio sends form-urlencoded usually, need body-parser
        if (!From || !Body) {
            return res.status(400).send('Missing From or Body');
        }
        const responseMessage = await sms_service_1.smsService.handleIncomingSms(From, Body);
        // Return TwiML
        res.type('text/xml');
        res.send(`
      <Response>
        <Message>${responseMessage}</Message>
      </Response>
    `);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
};
exports.handleWebhook = handleWebhook;
