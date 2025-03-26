const { Kafka } = require('kafkajs')
const express = require('express');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092'],
});

const app = express();
app.use(express.json());

const producer = kafka.producer();

// Connect to Kafka on startup
async function startServer() {
    await producer.connect();
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Producer listening on portt ${process.env.PORT || 8000}`);
    });
}

// API endpoint for log ingestion
app.post('/spunkless-producer-api/logs', async (req, res) => {
    try {
      const logEntry = {
        ...req.body,
        timestamp: new Date().toISOString(),
        host: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      };
      
      // Validate log entry
      if (!logEntry.service || !logEntry.message || !logEntry.level) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Determine topic based on service or other criteria
      const topic = `logs-${logEntry.service}`;
      
      // Send to Kafka
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(logEntry) }]
      });
      
      res.status(202).json({ status: 'Log accepted' });
    } catch (error) {
      console.error('Failed to produce message', error);
      res.status(500).json({ error: 'Failed to process log' });
    }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await producer.disconnect();
    process.exit(0);
});
  
startServer().catch(console.error);