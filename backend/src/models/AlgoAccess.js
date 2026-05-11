const mongoose = require('mongoose');

const algoAccessSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, 'Please add a user name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            trim: true,
            lowercase: true,
        },
        accountId: {
            type: String,
            required: [true, 'Please add an account id'],
            unique: true,
            trim: true,
        },
        algoName: {
            type: String,
            required: [true, 'Please add an algo name'],
            trim: true,
        },
        purchasedPlan: {
            type: String,
            required: [true, 'Please add a purchased plan'],
            trim: true,
        },
        durationDays: {
            type: Number,
            required: [true, 'Please add a duration in days'],
            min: 1,
        },
        startedOn: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        expiresOn: {
            type: Date,
            required: [true, 'Please add an expiry date'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'expiring-soon'],
            default: 'active',
        },
        heartbeatStatus: {
            type: String,
            enum: ['online', 'offline', 'delayed'],
            default: 'online',
        },
        lastHeartbeatAt: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AlgoAccess', algoAccessSchema);
