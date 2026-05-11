const app = require('./app');
const connectDB = require('./config/db');
const { ensureSeedData } = require('./services/seedService');
const env = require('./config/env');

const PORT = env.port;

// Connect to Database
connectDB().catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
});

const server = app.listen(PORT, async () => {
    if (env.enableSeed) {
        await ensureSeedData();
    }
    console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
