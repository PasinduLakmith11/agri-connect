import { Request, Response } from 'express';
import { smsService } from '../services/sms.service';

// Webhook for Twilio
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { From, Body } = req.body; // Twilio sends form-urlencoded usually, need body-parser

        if (!From || !Body) {
            return res.status(400).send('Missing From or Body');
        }

        const responseMessage = await smsService.handleIncomingSms(From, Body);

        // Return TwiML
        res.type('text/xml');
        res.send(`
      <Response>
        <Message>${responseMessage}</Message>
      </Response>
    `);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
};
