const User = require('../models/User');
const AlgoAccess = require('../models/AlgoAccess');

const defaultAlgoRecords = [
    {
        userName: 'Rohit Sharma',
        email: 'rohit@northstar.io',
        accountId: 'MT5-800214',
        algoName: 'EX5 Momentum Pro',
        purchasedPlan: '90 Days',
        durationDays: 90,
        startedOn: new Date('2026-03-13'),
        expiresOn: new Date('2026-07-12'),
        status: 'active',
        heartbeatStatus: 'online',
        lastHeartbeatAt: new Date(),
        notes: 'Primary momentum account',
    },
    {
        userName: 'Ananya Mehta',
        email: 'ananya@northstar.io',
        accountId: 'MT5-800241',
        algoName: 'EX5 Scalper X',
        purchasedPlan: '30 Days',
        durationDays: 30,
        startedOn: new Date('2026-04-15'),
        expiresOn: new Date('2026-05-15'),
        status: 'expiring-soon',
        heartbeatStatus: 'delayed',
        lastHeartbeatAt: new Date(Date.now() - 9 * 60 * 1000),
        notes: 'Needs renewal follow-up',
    },
    {
        userName: 'Karan Verma',
        email: 'karan@northstar.io',
        accountId: 'MT5-800255',
        algoName: 'EX5 Gold Sniper',
        purchasedPlan: '180 Days',
        durationDays: 180,
        startedOn: new Date('2026-01-10'),
        expiresOn: new Date('2026-07-09'),
        status: 'inactive',
        heartbeatStatus: 'offline',
        lastHeartbeatAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: 'Paused by admin',
    },
    {
        userName: 'Sneha Iyer',
        email: 'sneha@northstar.io',
        accountId: 'MT5-800301',
        algoName: 'EX5 Trend Engine',
        purchasedPlan: '365 Days',
        durationDays: 365,
        startedOn: new Date('2025-10-08'),
        expiresOn: new Date('2026-12-05'),
        status: 'active',
        heartbeatStatus: 'online',
        lastHeartbeatAt: new Date(),
        notes: 'Long-term premium plan',
    },
];

exports.ensureSeedData = async () => {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: 'admin123',
            role: 'admin',
        });
        console.log('Default admin user created: admin@example.com / admin123');
    }

    const algoCount = await AlgoAccess.countDocuments();
    if (algoCount === 0) {
        await AlgoAccess.insertMany(defaultAlgoRecords);
        console.log('Seeded default EX5 algo access records');
    }
};
