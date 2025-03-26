# Spunkless - Distributed Logging System

A modern, scalable logging infrastructure built with Node.js, Kafka, and PostgreSQL.

## System Architecture

![Architecture](https://via.placeholder.com/800x400?text=Spunkless+Architecture)

The system consists of three main components:

1. **Log Producer** - REST API for receiving logs from applications
2. **Log Consumer** - Service that consumes logs from Kafka and stores them in PostgreSQL
3. **Logs API** - REST API for searching, filtering, and analyzing logs

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spunkless.git
   cd spunkless
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Send a test log:
   ```bash
   curl -X POST http://localhost:8000/spunkless-producer-api/logs \
     -H "Content-Type: application/json" \
     -d '{
       "service": "test-service",
       "level": "info",
       "message": "Test log message"
     }'
   ```

4. Query the logs API:
   ```bash
   curl "http://localhost:8002/api/logs?service=test-service"
   ```

## Services

### Producer (Port 8000)

The producer service exposes a REST API endpoint for log ingestion:

- **POST /spunkless-producer-api/logs** - Submit logs to the system

### Consumer

The consumer service processes logs from Kafka and stores them in PostgreSQL. It doesn't expose any external ports as it operates as a background service.

### Logs API (Port 8002)

The Logs API provides endpoints for searching and analyzing logs:

- **GET /api/logs** - Get logs with filtering and pagination
- **POST /api/logs/search** - Advanced search with full-text capabilities
- **GET /api/stats** - Get log statistics and aggregations
- **GET /api/metadata** - Get available services and log levels

## Development

Each service has its own directory with a dedicated `package.json` file. To run a service in development mode:

```bash
cd <service-directory>
npm install
npm run dev
```

## Scaling

The system is designed to be horizontally scalable:

- Producer and Logs API can be scaled by adding more instances behind a load balancer
- Consumer can be scaled by adding more instances with the same consumer group ID
- Kafka and PostgreSQL can be clustered for higher availability

## License

MIT