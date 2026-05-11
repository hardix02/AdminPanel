const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));

// Request Logger
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const algoAccess = require('./routes/algoAccessRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/algo-access', algoAccess);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: env.nodeEnv === 'production' ? null : err.stack,
    });
});

module.exports = app;
