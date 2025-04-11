const { Kafka } = require('kafkajs');
const express = require('express');
const { Pool } = require('pg');

// Initialize Kafka
const kafka = new Kafka({
  clientId: 'log-consumer',
  brokers: ['kafka:9092'],
});

// Initialize Express
const app = express();
app.use(express.json());

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DB || 'logs',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
});

// Create Kafka consumer
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || 'logs-consumer-group'
});

// Initialize PostgreSQL tables and partitions
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create the logs table with partitioning on timestamp
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL,
        timestamp TIMESTAMPTZ NOT NULL,
        service VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        host VARCHAR(255),
        metadata JSONB,
        PRIMARY KEY (id, timestamp)
      ) PARTITION BY RANGE (timestamp);
    `);

    // Create GIN index for metadata for full-text search
    await client.query(`
      CREATE INDEX IF NOT EXISTS logs_metadata_gin_idx ON logs USING GIN (metadata);
    `);

    // Create text search index on message
    await client.query(`
      CREATE INDEX IF NOT EXISTS logs_message_idx ON logs USING GIN (to_tsvector('english', message));
    `);

    // Create index on service and level for common filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS logs_service_level_idx ON logs (service, level);
    `);

    // Create the partitions for the current month and next month (might want to automate this further)
    const currentMonth = new Date();
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const nextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const nextNextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs_${currentMonthStart.toISOString().slice(0, 7).replace('-', '_')} 
      PARTITION OF logs FOR VALUES FROM ('${currentMonthStart.toISOString()}') TO ('${nextMonthStart.toISOString()}');
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs_${nextMonthStart.toISOString().slice(0, 7).replace('-', '_')} 
      PARTITION OF logs FOR VALUES FROM ('${nextMonthStart.toISOString()}') TO ('${nextNextMonthStart.toISOString()}');
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database', err);
    throw err;
  } finally {
    client.release();
  }
}

// Insert log into PostgreSQL
async function insertLog(logEntry) {
  const { timestamp, service, level, message, host, ...metadata } = logEntry;

  const query = {
    text: `
      INSERT INTO logs (timestamp, service, level, message, host, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    values: [
      new Date(timestamp),
      service,
      level,
      message,
      host,
      metadata ? JSON.stringify(metadata) : null
    ],
  };

  try {
    const result = await pool.query(query);
    return result.rows[0].id;
  } catch (err) {
    console.error('Error inserting log', err);
    throw err;
  }
}

// Track topics and consumer state
const subscribedTopics = new Set();
let consumerRunning = false;
const TOPIC_CHECK_INTERVAL = 10000; // 10 seconds

// Function to check for new topics
async function checkForNewTopics() {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    const logTopics = topics.filter(topic => topic.startsWith('logs-'));
    await admin.disconnect();
    
    if (logTopics.length === 0) {
      console.warn('No log topics found. Waiting for topics to be created...');
      return false;
    }
    
    // Find new topics
    const newTopics = logTopics.filter(topic => !subscribedTopics.has(topic));
    
    if (newTopics.length > 0) {
      console.log(`Found ${newTopics.length} new log topics: ${newTopics.join(', ')}`);
      
      // If consumer is running, we need to restart it
      if (consumerRunning) {
        console.log('Stopping consumer to subscribe to new topics...');
        await consumer.stop();
        consumerRunning = false;
      }
      
      // Add new topics to our tracking set
      newTopics.forEach(topic => subscribedTopics.add(topic));
      
      // Subscribe to all topics again
      for (const topic of subscribedTopics) {
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log(`Subscribed to topic: ${topic}`);
      }
      
      // Restart consumer if it was running
      if (!consumerRunning) {
        startConsumer();
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for new topics:', error);
    return false;
  }
}

// Function to start the consumer
async function startConsumer() {
  if (consumerRunning) return;
  
  try {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const logEntry = JSON.parse(message.value.toString());
          console.log(`Processing log from ${topic}: ${logEntry.service} - ${logEntry.level}`);
          
          try {
            const id = await insertLog(logEntry);
            console.log(`Successfully inserted log with ID: ${id}`);
          } catch (dbError) {
            console.error('Failed to insert log into database:', dbError);
          }
        } catch (parseError) {
          console.error('Error processing message:', parseError);
          console.error('Raw message:', message.value.toString());
        }
      },
    });
    
    consumerRunning = true;
    console.log('Consumer started and is processing messages');
  } catch (error) {
    console.error('Error starting consumer:', error);
    consumerRunning = false;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        service, 
        level, 
        COUNT(*) as count,
        MIN(timestamp) as oldest,
        MAX(timestamp) as newest
      FROM logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY service, level
      ORDER BY service, level
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching stats', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Connect to Kafka and start server
// Initialize and start
async function startServer() {
  try {
    await initializeDatabase();
    await consumer.connect();
    
    // Initial topic check
    await checkForNewTopics();
    
    // Start consumer if topics were found
    if (subscribedTopics.size > 0 && !consumerRunning) {
      await startConsumer();
    }
    
    // Schedule periodic checks
    setInterval(checkForNewTopics, TOPIC_CHECK_INTERVAL);
    
    // Start Express server
    app.listen(process.env.PORT || 8001, () => {
      console.log(`Consumer listening on port ${process.env.PORT || 8001}`);
    });
    
    console.log('Consumer service started successfully');
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');

  try {
    await consumer.disconnect();
    await pool.end();
    console.log('Gracefully shut down');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
});

// Start the server
startServer().catch(console.error);