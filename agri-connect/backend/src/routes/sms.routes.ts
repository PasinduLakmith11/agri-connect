import { Router } from 'express';
import * as smsController from '../controllers/sms.controller';
import express from 'express';

const router = Router();

// Twilio webhooks usually verify signature, skipping for mock
// Also they send application/x-www-form-urlencoded
router.post('/webhook', express.urlencoded({ extended: true }), smsController.handleWebhook);

export default router;
