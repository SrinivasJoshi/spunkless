const { Kafka, Partitioners } = require('kafkajs')
const express = require('express');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092'],
});

const app = express();
app.use(express.json());

// Create producer with retry configuration
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Add a function to ensure Kafka is ready
async function ensureTopicExists(topic) {
  const admin = kafka.admin();
  try {
    await admin.connect();
    const topics = await admin.listTopics();

    if (!topics.includes(topic)) {
      await admin.createTopics({
        topics: [{
          topic,
          numPartitions: 1,
          replicationFactor: 1
        }]
      });
      console.log(`Created topic ${topic}`);
    }
  } finally {
    await admin.disconnect();
  }
}

// Connect to Kafka on startup
async function startServer() {
  try {
    await producer.connect();
    console.log('Successfully connected to Kafka');

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Producer listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
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

    const topic = `logs-${logEntry.service}`;

    // Ensure topic exists before sending
    await ensureTopicExists(topic);

    // Send to Kafka with retry
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
  try {
    await producer.disconnect();
    console.log('Producer disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer().catch(console.error);