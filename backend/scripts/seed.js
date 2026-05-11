const connectDB = require('../src/config/db');
const { ensureSeedData } = require('../src/services/seedService');

(async () => {
    try {
        await connectDB();
        await ensureSeedData();
        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error(`Seed failed: ${error.message}`);
        process.exit(1);
    }
})();
