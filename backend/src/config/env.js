const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const parseBoolean = (value, fallback = false) => {
    if (value === undefined) {
        return fallback;
    }

    return value === 'true';
};

const parseOrigins = (value) => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

module.exports = {
    appEnv: process.env.APP_ENV || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
    enableSeed: parseBoolean(process.env.ENABLE_SEED, true),
};
