const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DB || 'logs',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get logs with filtering and pagination
app.get('/api/logs', async (req, res) => {
  try {
    const {
      service,
      level,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
      sort = 'timestamp',
      order = 'desc'
    } = req.query;

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 1000); // Cap at 1000 records
    const offset = (pageNum - 1) * limitNum;

    // Base query
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add filters
    if (service) {
      query += ` AND service = $${paramIndex++}`;
      params.push(service);
    }

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      params.push(level);
    }

    if (startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    // Add text search
    if (search) {
      query += ` AND (
        message ILIKE $${paramIndex++} OR 
        to_tsvector('english', message) @@ plainto_tsquery('english', $${paramIndex++}) OR
        metadata::text ILIKE $${paramIndex++}
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, search, searchPattern);
    }

    // Add sorting
    const validSortColumns = ['timestamp', 'service', 'level', 'id'];
    const validSortOrders = ['asc', 'desc'];

    const sortColumn = validSortColumns.includes(sort) ? sort : 'timestamp';
    const sortOrder = validSortOrders.includes(order.toLowerCase()) ? order : 'desc';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    // Count total matching records (for pagination info)
    let countQuery = 'SELECT COUNT(*) FROM logs WHERE 1=1';
    const countParams = [...params.slice(0, params.length - 2)]; // Exclude LIMIT and OFFSET

    // Add same filters to count query
    if (service) {
      countQuery += ' AND service = $1';
      paramIndex = 2;
    } else {
      paramIndex = 1;
    }

    if (level) {
      countQuery += ` AND level = $${paramIndex++}`;
    }

    if (startDate) {
      countQuery += ` AND timestamp >= $${paramIndex++}`;
    }

    if (endDate) {
      countQuery += ` AND timestamp <= $${paramIndex++}`;
    }

    if (search) {
      countQuery += ` AND (
        message ILIKE $${paramIndex++} OR 
        to_tsvector('english', message) @@ plainto_tsquery('english', $${paramIndex++}) OR
        metadata::text ILIKE $${paramIndex++}
      )`;
    }

    // Execute queries
    const [logsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      data: logsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error fetching logs', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get a single log by ID
app.get('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching log by ID', err);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

// Advanced search with full-text search capabilities
app.post('/api/logs/search', async (req, res) => {
  try {
    const {
      query,             // Full text search query
      services = [],     // Array of services to filter by
      levels = [],       // Array of levels to filter by
      timeRange = {},    // { start: ISO date, end: ISO date }
      metadata = {},     // Key-value pairs to search in metadata
      page = 1,
      limit = 50
    } = req.body;

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 1000); // Cap at 1000 records
    const offset = (pageNum - 1) * limitNum;

    // Build the query
    let sqlQuery = 'SELECT * FROM logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply full text search on message
    if (query) {
      sqlQuery += ` AND to_tsvector('english', message) @@ plainto_tsquery('english', $${paramIndex++})`;
      params.push(query);
    }

    // Apply service filter
    if (services.length > 0) {
      sqlQuery += ` AND service IN (${services.map((_, i) => `$${paramIndex++}`).join(',')})`;
      params.push(...services);
    }

    // Apply level filter
    if (levels.length > 0) {
      sqlQuery += ` AND level IN (${levels.map((_, i) => `$${paramIndex++}`).join(',')})`;
      params.push(...levels);
    }

    // Apply time range filter
    if (timeRange.start) {
      sqlQuery += ` AND timestamp >= $${paramIndex++}`;
      params.push(new Date(timeRange.start));
    }

    if (timeRange.end) {
      sqlQuery += ` AND timestamp <= $${paramIndex++}`;
      params.push(new Date(timeRange.end));
    }

    // Apply metadata filters (JSONB queries)
    if (Object.keys(metadata).length > 0) {
      Object.entries(metadata).forEach(([key, value]) => {
        sqlQuery += ` AND metadata->>'${key}' = $${paramIndex++}`;
        params.push(value.toString());
      });
    }

    // Add ordering
    sqlQuery += ' ORDER BY timestamp DESC';

    // Add pagination
    sqlQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    // Count query for pagination (without limit/offset)
    let countQuery = sqlQuery.split(' LIMIT ')[0].replace('SELECT *', 'SELECT COUNT(*)');
    const countParams = params.slice(0, params.length - 2);

    // Execute queries
    const [logsResult, countResult] = await Promise.all([
      pool.query(sqlQuery, params),
      pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      data: logsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error in advanced search', err);
    res.status(500).json({ error: 'Failed to search logs' });
  }
});

// Get statistics and aggregations
app.get('/api/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Convert timeRange to a PostgreSQL interval
    let interval;
    switch (timeRange) {
      case '1h':
        interval = '1 hour';
        break;
      case '6h':
        interval = '6 hours';
        break;
      case '24h':
      case '1d':
        interval = '1 day';
        break;
      case '7d':
        interval = '7 days';
        break;
      case '30d':
        interval = '30 days';
        break;
      default:
        interval = '1 day'; // Default to 24 hours
    }

    // Run different aggregation queries
    const [
      byService,
      byLevel,
      byHour,
      topErrors
    ] = await Promise.all([
      // Count by service
      pool.query(`
        SELECT 
          service, 
          COUNT(*) as count 
        FROM logs 
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY service 
        ORDER BY count DESC
      `),

      // Count by level
      pool.query(`
        SELECT 
          level, 
          COUNT(*) as count 
        FROM logs 
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY level 
        ORDER BY count DESC
      `),

      // Count by hour (for charts)
      pool.query(`
        SELECT 
          date_trunc('hour', timestamp) as hour,
          COUNT(*) as count
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY hour
        ORDER BY hour
      `),

      // Top error messages
      pool.query(`
        SELECT 
          message,
          COUNT(*) as count
        FROM logs
        WHERE 
          level IN ('error', 'critical', 'alert', 'emergency') AND
          timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY message
        ORDER BY count DESC
        LIMIT 10
      `)
    ]);

    res.status(200).json({
      byService: byService.rows,
      byLevel: byLevel.rows,
      byHour: byHour.rows,
      topErrors: topErrors.rows,
      timeRange
    });
  } catch (err) {
    console.error('Error fetching stats', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get available services and levels (for UI filters)
app.get('/api/metadata', async (req, res) => {
  try {
    const [services, levels] = await Promise.all([
      pool.query('SELECT DISTINCT service FROM logs ORDER BY service'),
      pool.query('SELECT DISTINCT level FROM logs ORDER BY level')
    ]);

    res.status(200).json({
      services: services.rows.map(row => row.service),
      levels: levels.rows.map(row => row.level)
    });
  } catch (err) {
    console.error('Error fetching metadata', err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Start the server
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Logs API server listening on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down API server...');

  try {
    await pool.end();
    console.log('Database connections closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
});