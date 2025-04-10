import fetch from 'node-fetch';

// Configuration
const CONFIG = {
    producerUrl: 'http://localhost:8000/spunkless-producer-api/logs',
    services: ['web-server', 'auth-service', 'payment-processor', 'user-service', 'inventory-api'],
    levels: ['info', 'warn', 'error', 'debug'],
    batchSize: 7, // How many logs to send in each batch
    batchCount: 7, // How many batches to send
    delayBetweenBatchesMs: 1000, // Delay between batches
};

// Sample events and actions for generating realistic messages
const events = [
    'login', 'logout', 'page_view', 'button_click', 'form_submit',
    'api_call', 'database_query', 'payment_process', 'order_create',
    'user_signup', 'data_export', 'email_send', 'notification_send'
];

const outcomes = [
    'succeeded', 'failed', 'timed out', 'partially completed',
    'rejected', 'accepted', 'queued', 'processed'
];

// Generate a random log entry
function generateLogEntry() {
    const service = CONFIG.services[Math.floor(Math.random() * CONFIG.services.length)];
    const level = CONFIG.levels[Math.floor(Math.random() * CONFIG.levels.length)];

    // Generate a realistic message
    const event = events[Math.floor(Math.random() * events.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const userId = Math.floor(Math.random() * 10000);
    const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;

    let message = '';
    let metadata = {};

    switch (level) {
        case 'info':
            message = `${event} ${outcome} for user ${userId}`;
            metadata = { userId, requestId, duration: Math.random() * 500 };
            break;
        case 'warn':
            message = `Slow ${event} detected (${Math.floor(Math.random() * 1000)}ms)`;
            metadata = { userId, requestId, threshold: 200, performance: 'degraded' };
            break;
        case 'error':
            message = `Failed to process ${event}: ${getRandomError()}`;
            metadata = { userId, requestId, errorCode: Math.floor(Math.random() * 100) };
            break;
        case 'debug':
            message = `Detailed ${event} trace for request ${requestId}`;
            metadata = {
                userId,
                requestId,
                params: { id: userId, action: event },
                headers: { 'user-agent': 'Mozilla/5.0', 'content-type': 'application/json' }
            };
            break;
    }

    return {
        service,
        level,
        message,
        metadata
    };
}

// Random error messages
function getRandomError() {
    const errors = [
        'Connection refused',
        'Timeout exceeded',
        'Invalid input',
        'Resource not found',
        'Permission denied',
        'Internal server error',
        'Service unavailable',
        'Database constraint violation',
        'Memory limit exceeded'
    ];

    return errors[Math.floor(Math.random() * errors.length)];
}

// Send a batch of logs
async function sendLogBatch(batchNumber) {
    console.log(`Sending batch ${batchNumber + 1} of ${CONFIG.batchCount}...`);

    const logs = [];
    const promises = [];

    for (let i = 0; i < CONFIG.batchSize; i++) {
        const logEntry = generateLogEntry();
        logs.push(logEntry);

        promises.push(
            fetch(CONFIG.producerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            })
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error(`Failed to send log: ${res.status} ${res.statusText}`);
                })
                .then(data => {
                    console.log(data);
                    console.log(`✅ Log sent to ${logEntry.service} (${logEntry.level}): "${logEntry.message.substring(0, 40)}..."`);
                    return data;
                })
                .catch(err => {
                    console.error(`❌ Error sending log: ${err.message}`);
                    throw err;
                })
        );
    }

    try {
        await Promise.all(promises);
        console.log(`✨ Batch ${batchNumber + 1} completed: ${CONFIG.batchSize} logs sent\n`);
    } catch (error) {
        console.error(`⚠️ Batch ${batchNumber + 1} had some failures\n`);
    }
}

// Main function to run the generator
async function runGenerator() {
    console.log(`Starting log generator...`);
    console.log(`Will send ${CONFIG.batchSize * CONFIG.batchCount} logs to ${CONFIG.producerUrl}\n`);

    for (let i = 0; i < CONFIG.batchCount; i++) {
        await sendLogBatch(i);

        if (i < CONFIG.batchCount - 1) {
            console.log(`Waiting ${CONFIG.delayBetweenBatchesMs}ms before next batch...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatchesMs));
        }
    }

    console.log(`\n🎉 Log generation completed! ${CONFIG.batchSize * CONFIG.batchCount} logs sent to Spunkless.`);
}

// Run the generator
runGenerator().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});