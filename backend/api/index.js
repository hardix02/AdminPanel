const app = require('../src/app');
const connectDB = require('../src/config/db');
const { ensureSeedData } = require('../src/services/seedService');
const env = require('../src/config/env');

let bootstrapPromise;

const bootstrap = async () => {
    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            await connectDB();
            if (env.enableSeed) {
                await ensureSeedData();
            }
        })();
    }

    return bootstrapPromise;
};

module.exports = async (req, res) => {
    await bootstrap();
    return app(req, res);
};
