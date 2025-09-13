# AVR Webhook Service

[![Discord](https://img.shields.io/discord/1347239846632226998?label=Discord&logo=discord)](https://discord.gg/DFTU69Hg74)
[![GitHub Repo stars](https://img.shields.io/github/stars/agentvoiceresponse/avr-sts-openai?style=social)](https://github.com/agentvoiceresponse/avr-sts-openai)
[![Docker Pulls](https://img.shields.io/docker/pulls/agentvoiceresponse/avr-sts-openai?label=Docker%20Pulls&logo=docker)](https://hub.docker.com/r/agentvoiceresponse/avr-sts-openai)
[![Ko-fi](https://img.shields.io/badge/Support%20us%20on-Ko--fi-ff5e5b.svg)](https://ko-fi.com/agentvoiceresponse)

A robust Express.js web service designed to handle webhook events from AVR Core. This service provides a clean and intuitive API for processing various types of events generated during voice interactions.

## Features

- **Express.js** based web service
- **Security** middleware (Helmet, CORS, Rate Limiting)
- **Comprehensive logging** for all events
- **Request validation** and error handling
- **Event-specific handlers** for different webhook types
- **Health check** endpoint
- **Graceful shutdown** handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Start the service:
```bash
# Development
npm run start:dev

# Production
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns the service health status and version information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "avr-webhook",
  "version": "1.0.0"
}
```

### Webhook Events
```
POST /events
```
Main endpoint for receiving webhook events from AVR Core.

**Request Body:**
```json
{
  "uuid": "unique-event-identifier",
  "type": "event-type",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "payload": {
    // Event-specific data
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event processed successfully",
  "eventId": "unique-event-identifier",
  "processedAt": "2024-01-15T10:30:00.000Z"
}
```

## Supported Event Types

| Event Type | Description | Payload Example |
|------------|-------------|-----------------|
| `call_started` | Call initiation | `{ callerId, destination }` |
| `call_ended` | Call termination | `{ duration, reason }` |
| `transcription` | Speech-to-text result | `{ text, confidence }` |
| `interruption` | AI response generated | `{ response, model, tokens }` |
| `error` | Error occurred | `{ message, error, stack }` |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |
| `RATE_LIMIT_MAX` | Max requests per IP per 15min | `100` |
| `WEBHOOK_SECRET` | Webhook signature secret | - |

### Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes per IP)
- **Request Validation**: Validates required fields
- **Error Handling**: Comprehensive error responses

## Event Processing

The service includes dedicated handlers for each event type:

- **Call Events**: Track call lifecycle
- **Transcription Events**: Process speech-to-text results
- **LLM Events**: Handle AI responses
- **TTS Events**: Manage text-to-speech completion
- **Error Events**: Log and alert on errors
- **Agent Events**: Track agent connections
- **User Input Events**: Process user interactions
- **System Events**: Handle system messages

## Development

### Running in Development Mode
```bash
npm run start:dev
```
Uses nodemon for automatic restarts on file changes.

### Docker Support
```bash
# Build image
npm run dc:build

# Push to registry
npm run dc:push
```

## Error Handling

The service provides comprehensive error handling:

- **400 Bad Request**: Missing required fields
- **404 Not Found**: Invalid endpoints
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Processing errors

All errors include timestamps and descriptive messages.

## Logging

The service logs:
- All incoming requests with IP addresses
- Event processing details
- Errors with full stack traces
- Service startup and shutdown events

## Integration with AVR Core

Configure AVR Core to send webhooks to this service:

```bash
# In avr-core service .env
WEBHOOK_URL=http://localhost:3000/events
WEBHOOK_SECRET=your-webhook-secret-here
WEBHOOK_TIMEOUT=3000
WEBHOOK_RETRY=3
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support & Community

*   **GitHub:** [https://github.com/agentvoiceresponse](https://github.com/agentvoiceresponse) - Report issues, contribute code.
*   **Discord:** [https://discord.gg/DFTU69Hg74](https://discord.gg/DFTU69Hg74) - Join the community discussion.
*   **Docker Hub:** [https://hub.docker.com/u/agentvoiceresponse](https://hub.docker.com/u/agentvoiceresponse) - Find Docker images.
*   **NPM:** [https://www.npmjs.com/~agentvoiceresponse](https://www.npmjs.com/~agentvoiceresponse) - Browse our packages.
*   **Wiki:** [https://wiki.agentvoiceresponse.com/en/home](https://wiki.agentvoiceresponse.com/en/home) - Project documentation and guides.

## Support AVR

AVR is free and open-source. If you find it valuable, consider supporting its development:

<a href="https://ko-fi.com/agentvoiceresponse" target="_blank"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support us on Ko-fi"></a>

## License

MIT License - see the [LICENSE](LICENSE.md) file for details.