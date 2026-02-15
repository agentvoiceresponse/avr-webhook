require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-AVR-WEBHOOK-SECRET']
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/events', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Simple webhook secret verification middleware
 * Verifies that the X-AVR-WEBHOOK-SECRET header matches the WEBHOOK_SECRET environment variable
 */
function verifyWebhookSecret(req, res, next) {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  // Skip verification if no secret is configured
  if (!webhookSecret) {
    console.warn('[WARNING] WEBHOOK_SECRET not configured, skipping secret verification');
    return next();
  }

  const providedSecret = req.headers['x-avr-webhook-secret'];
  
  if (!providedSecret) {
    console.warn(`[SECURITY] Missing X-AVR-WEBHOOK-SECRET header from IP: ${req.ip}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-AVR-WEBHOOK-SECRET header',
      timestamp: new Date().toISOString()
    });
  }

  if (providedSecret !== webhookSecret) {
    console.warn(`[SECURITY] Invalid webhook secret from IP: ${req.ip}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid webhook secret',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`[SECURITY] Valid webhook secret verified for IP: ${req.ip}`);
  next();
}

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'avr-webhook',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * Webhook event handler
 * POST /events
 * Handles incoming webhook events from avr-core
 */
app.post('/events', verifyWebhookSecret, async (req, res) => {
  try {
    const { uuid, type, timestamp, payload } = req.body;

    // Validate required fields
    if (!uuid || !type || !timestamp) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['uuid', 'type', 'timestamp'],
        received: Object.keys(req.body)
      });
    }

    // Validate event type
    const validEventTypes = [
      'call_initiated',
      'call_started',
      'call_ended',
      'interruption',
      'transcription',
      'dtmf_digit',
      'error'
    ];

    if (!validEventTypes.includes(type)) {
      console.warn(`[WARNING] Unknown event type received: ${type}`);
    }

    // Log the incoming event
    console.log(`[EVENT] ${type.toUpperCase()} - UUID: ${uuid} - Timestamp: ${timestamp}`);
    
    if (payload) {
      console.log(`[PAYLOAD] ${JSON.stringify(payload, null, 2)}`);
    }

    // Process the event based on type
    await processWebhookEvent(uuid, type, timestamp, payload);

    // Send acknowledgment response
    res.status(200).json({
      success: true,
      message: 'Event processed successfully',
      eventId: uuid,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ERROR] Failed to process webhook event:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process webhook event',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process webhook event based on type
 * @param {string} uuid - Unique identifier for the event
 * @param {string} type - Type of event
 * @param {string} timestamp - Event timestamp
 * @param {Object} payload - Event payload data
 */
async function processWebhookEvent(uuid, type, timestamp, payload) {
  try {
    switch (type) {
      case 'call_initiated':
        await handleCallInitiated(uuid, payload);
        break;

      case 'call_started':
        await handleCallStarted(uuid, payload);
        break;
      
      case 'call_ended':
        await handleCallEnded(uuid, payload);
        break;
      
      case 'transcription':
        await handleTranscription(uuid, payload);
        break;

      case 'interruption':
        await handleInterruption(uuid, payload);
        break;

      case 'dtmf_digit':
        await handleDtmfDigit(uuid, payload);
        break;

      case 'error':
        await handleError(uuid, payload);
        break;
            
      default:
        console.log(`[INFO] Unhandled event type: ${type}`);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to process event ${type} for UUID ${uuid}:`, error);
    throw error;
  }
}

/**
 * Handle call initiated events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleCallInitiated(uuid, payload) {
  console.log(`[CALL_INITIATED] Call initiated - UUID: ${uuid}`);

  // Example: Store call information in database
  // await database.calls.create({
  //   uuid,
  //   startTime: new Date(),
  //   callerId: payload?.callerId,
  //   destination: payload?.destination,
  //   status: 'active'
  // });

  // Example: Send notification to monitoring system
  // await notificationService.send('call_initiated', { uuid, payload });

  // Example: Return STS URL with custom parameters
  return res.json({
    sts_url: `ws://localhost:6030?uuid=${uuid}&my_custom_param=my_custom_value`,
  });
}

/**
 * Handle call started events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleCallStarted(uuid, payload) {
  console.log(`[CALL_STARTED] Call initiated - UUID: ${uuid}`);
  
  // Example: Store call information in database
  // await database.calls.create({
  //   uuid,
  //   startTime: new Date(),
  //   callerId: payload?.callerId,
  //   destination: payload?.destination,
  //   status: 'active'
  // });
  
  // Example: Send notification to monitoring system
  // await notificationService.send('call_started', { uuid, payload });
}

/**
 * Handle call ended events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleCallEnded(uuid, payload) {
  console.log(`[CALL_ENDED] Call terminated - UUID: ${uuid}`);
  
  // Example: Update call record in database
  // await database.calls.update(uuid, {
  //   endTime: new Date(),
  //   duration: payload?.duration,
  //   status: 'completed',
  //   reason: payload?.reason
  // });
  
  // Example: Generate call summary
  // await generateCallSummary(uuid, payload);
}

/**
 * Handle interruption events
/**
 * Handle DTMF digit events
/**
 * Handle DTMF digit events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleDtmfDigit(uuid, payload) {
  console.log(`[DTMF_DIGIT] DTMF digit: ${payload?.digit} - UUID: ${uuid}`);
}

/**
 * Handle interruption events
/**
 * Handle interruption events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleInterruption(uuid, payload) {
  console.log(`[INTERRUPTION] Interruption - UUID: ${uuid}`);
}

/**
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleInterruption(uuid, payload) {
  console.log(`[INTERRUPTION] Interruption - UUID: ${uuid}`);
}


/**
 * Handle transcription events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleTranscription(uuid, payload) {
  console.log(`[TRANSCRIPTION] Text: "${payload?.text}" - UUID: ${uuid}`);
  
  // Example: Store transcription in database
  // await database.transcriptions.create({
  //   uuid,
  //   text: payload?.text,
  //   confidence: payload?.confidence,
  //   timestamp: new Date()
  // });
  
  // Example: Process transcription for intent analysis
  // await intentAnalysis.process(payload?.text, uuid);
}

/**
 * Handle error events
 * @param {string} uuid - Event UUID
 * @param {Object} payload - Event payload
 */
async function handleError(uuid, payload) {
  console.error(`[ERROR] ${payload?.message || 'Unknown error'} - UUID: ${uuid}`);
  
  // Example: Log error to monitoring system
  // await errorReporting.log({
  //   uuid,
  //   error: payload?.error,
  //   message: payload?.message,
  //   stack: payload?.stack,
  //   timestamp: new Date()
  // });
  
  // Example: Send alert to administrators
  // await alertService.send('error_occurred', { uuid, payload });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('[GLOBAL_ERROR]', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AVR Webhook Service running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Webhook endpoint: http://localhost:${PORT}/events`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
