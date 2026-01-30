import { Router } from 'express';
import twilio from 'twilio';
import { handleInboundSMS } from '../services/smsService.js';
import { queueAuditLog } from '../queues/index.js';

const router = Router();

// Twilio webhook signature verification
const validateTwilioRequest = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return next(); // Skip in development
    }

    const twilioSignature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        req.body
    );

    if (!isValid) {
        console.error('Invalid Twilio signature');
        return res.status(403).send('Forbidden');
    }

    next();
};

// ==========================================
// INBOUND SMS WEBHOOK
// ==========================================
router.post('/inbound', validateTwilioRequest, async (req, res) => {
    try {
        const { From: from, Body: body, MessageSid: messageSid } = req.body;

        console.log(`Inbound SMS from ${from}: ${body}`);

        // Audit log
        await queueAuditLog({
            action: 'sms_inbound',
            entity_type: 'sms',
            entity_id: null,
            metadata: { from, body: body.substring(0, 100), messageSid }
        });

        // Process the SMS
        const result = await handleInboundSMS(from, body);

        // TwiML response
        const twiml = new twilio.twiml.MessagingResponse();
        if (result.reply) {
            twiml.message(result.reply);
        }

        res.type('text/xml');
        res.send(twiml.toString());

    } catch (error) {
        console.error('SMS webhook error:', error);

        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message('Error processing your request. Please try again.');

        res.type('text/xml');
        res.send(twiml.toString());
    }
});

// ==========================================
// SMS STATUS CALLBACK
// ==========================================
router.post('/status', validateTwilioRequest, async (req, res) => {
    try {
        const { MessageSid, MessageStatus, To, ErrorCode } = req.body;

        console.log(`SMS ${MessageSid} to ${To}: ${MessageStatus}`);

        // Update SMS queue record
        if (MessageStatus === 'delivered') {
            // Mark as successfully delivered
        } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
            console.error(`SMS delivery failed: ${ErrorCode}`);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('SMS status callback error:', error);
        res.sendStatus(500);
    }
});

// ==========================================
// MANUAL SMS SEND (Admin Only)
// ==========================================
router.post('/send', async (req, res) => {
    try {
        const { to, message, requestId } = req.body;

        if (!to || !message) {
            return res.status(400).json({ success: false, error: 'Missing to or message' });
        }

        const { queueSMS } = await import('../queues/index.js');
        await queueSMS(to, message, { requestId });

        res.json({ success: true, message: 'SMS queued' });

    } catch (error) {
        console.error('Manual SMS error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
