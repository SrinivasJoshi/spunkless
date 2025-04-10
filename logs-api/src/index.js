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

// Validation functions
const validateTimeRange = (range = {}) => {
  if (!range.start && !range.end) return true;
  if (!range.start || !range.end) return true; // Allow partial ranges
  return new Date(range.start) <= new Date(range.end);
};

const validateMetadata = (metadata = {}) => {
  if (!metadata || Object.keys(metadata).length === 0) return true;
  return Object.keys(metadata).every(key =>
    typeof key === 'string' &&
    key.length > 0 &&
    /^[a-zA-Z0-9_]+$/.test(key)
  );
};

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
      timeRange,
      search,
      page = 1,
      limit = 50,
      sort = 'timestamp',
      order = 'desc'
    } = req.query;

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 1000);
    const offset = (pageNum - 1) * limitNum;

    // Base query
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Handle timeRange
    if (timeRange) {
      query += ` AND timestamp > NOW() - INTERVAL '${timeRange}'`;
    }

    // Add filters
    if (service) {
      query += ` AND service = $${paramIndex++}`;
      params.push(service);
    }

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      params.push(level);
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

    if (timeRange) {
      countQuery += ` AND timestamp > NOW() - INTERVAL '${timeRange}'`;
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

app.post('/api/logs/search', async (req, res) => {
  try {
    const {
      query,
      services = [],
      levels = [],
      timeRange = {},
      metadata = {},
      page = 1,
      limit = 20
    } = req.body;

    // Validate inputs
    if (!validateTimeRange(timeRange)) {
      return res.status(400).json({
        error: 'Invalid time range. Start date must be before or equal to end date.'
      });
    }

    if (!validateMetadata(metadata)) {
      return res.status(400).json({
        error: 'Invalid metadata format. Keys must be non-empty and contain only letters, numbers, and underscores.'
      });
    }

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 1000);
    const offset = (pageNum - 1) * limitNum;

    // Build the query
    let sqlQuery = 'SELECT * FROM logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply full text search on message
    if (query && query.trim()) {
      sqlQuery += ` AND (
        message ILIKE $${paramIndex} OR
        to_tsvector('english', message) @@ plainto_tsquery('english', $${paramIndex})
      )`;
      params.push(`%${query.trim()}%`);
      paramIndex++;
    }

    // Apply service filter
    if (services && services.length > 0) {
      sqlQuery += ` AND service = ANY($${paramIndex++})`;
      params.push(services);
    }

    // Apply level filter
    if (levels && levels.length > 0) {
      sqlQuery += ` AND level = ANY($${paramIndex++})`;
      params.push(levels);
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

    // Apply metadata filters - Fixed version
    if (metadata && Object.keys(metadata).length > 0) {
      Object.entries(metadata).forEach(([key, value]) => {
        sqlQuery += ` AND metadata->'metadata' @> $${paramIndex++}`;
        params.push(JSON.stringify({ [key]: Number(value) }));  // Convert to number since userId is numeric
      });
    }

    // Add ordering
    sqlQuery += ' ORDER BY timestamp DESC';

    // Add pagination
    sqlQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    // Count query (without ORDER BY, LIMIT and OFFSET)
    const countQuery = sqlQuery.split(' ORDER BY ')[0].replace('SELECT *', 'SELECT COUNT(*)');
    const countParams = params.slice(0, -2);

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
    console.error('Error in advanced search:', err);
    res.status(500).json({
      error: 'Failed to perform advanced search',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get metadata (available services and log levels)
app.get('/api/metadata', async (req, res) => {
  try {
    // Get unique services and levels from the logs table
    const [servicesResult, levelsResult] = await Promise.all([
      pool.query('SELECT DISTINCT service FROM logs ORDER BY service'),
      pool.query('SELECT DISTINCT level FROM logs ORDER BY level')
    ]);

    res.status(200).json({
      services: servicesResult.rows.map(row => row.service),
      levels: levelsResult.rows.map(row => row.level)
    });
  } catch (err) {
    console.error('Error fetching metadata:', err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Convert timeRange to PostgreSQL interval
    let interval;
    switch (timeRange) {
      case '1h': interval = '1 hour'; break;
      case '6h': interval = '6 hours'; break;
      case '7d': interval = '7 days'; break;
      case '30d': interval = '30 days'; break;
      default: interval = '24 hours';
    }

    // Run multiple queries in parallel
    const [
      totalLogs,
      byService,
      byLevel,
      topErrors,
      recentActivity
    ] = await Promise.all([
      // Total logs count
      pool.query(`
        SELECT COUNT(*) as total
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
      `),

      // Logs by service
      pool.query(`
        SELECT service, COUNT(*) as count
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY service
        ORDER BY count DESC
      `),

      // Logs by level
      pool.query(`
        SELECT level, COUNT(*) as count
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY level
        ORDER BY count DESC
      `),

      // Top errors
      pool.query(`
        SELECT message, COUNT(*) as count
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        AND level = 'error'
        GROUP BY message
        ORDER BY count DESC
        LIMIT 5
      `),

      // Recent activity trend
      pool.query(`
        SELECT 
          date_trunc('hour', timestamp) as hour,
          COUNT(*) as count
        FROM logs
        WHERE timestamp > NOW() - INTERVAL '${interval}'
        GROUP BY hour
        ORDER BY hour DESC
      `)
    ]);

    // Format the response
    res.status(200).json({
      metrics: {
        totalLogs: parseInt(totalLogs.rows[0].total),
        uniqueServices: byService.rows.length,
        errorCount: byLevel.rows.find(r => r.level === 'error')?.count || 0,
        warningCount: byLevel.rows.find(r => r.level === 'warn')?.count || 0
      },
      byService: byService.rows,
      byLevel: byLevel.rows,
      topErrors: topErrors.rows,
      activityTrend: recentActivity.rows
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
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