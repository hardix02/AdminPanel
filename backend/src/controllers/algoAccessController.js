const AlgoAccess = require('../models/AlgoAccess');

const toPayload = (record) => {
    const now = new Date();
    const expiresOn = new Date(record.expiresOn);
    const startedOn = new Date(record.startedOn);
    const diffInDays = Math.ceil((expiresOn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
        id: record._id,
        userName: record.userName,
        email: record.email,
        accountId: record.accountId,
        algoName: record.algoName,
        purchasedPlan: record.purchasedPlan,
        durationDays: record.durationDays,
        durationLabel: record.status === 'inactive' ? 'Paused' : `${Math.max(diffInDays, 0)} days left`,
        startedOn: startedOn.toISOString().slice(0, 10),
        expiresOn: expiresOn.toISOString().slice(0, 10),
        status: record.status,
        heartbeatStatus: record.heartbeatStatus,
        lastHeartbeatAt: record.lastHeartbeatAt,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
};

const getSummary = async () => {
    const records = await AlgoAccess.find().sort({ expiresOn: 1 });

    return {
        total: records.length,
        active: records.filter((record) => record.status === 'active').length,
        inactive: records.filter((record) => record.status === 'inactive').length,
        expiringSoon: records.filter((record) => record.status === 'expiring-soon').length,
    };
};

exports.getAlgoAccessList = async (req, res, next) => {
    try {
        const { search = '', status = 'all' } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { accountId: { $regex: search, $options: 'i' } },
                { algoName: { $regex: search, $options: 'i' } },
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const records = await AlgoAccess.find(query).sort({ expiresOn: 1, createdAt: -1 });
        const summary = await getSummary();

        res.status(200).json({
            success: true,
            count: records.length,
            summary,
            data: records.map(toPayload),
        });
    } catch (err) {
        next(err);
    }
};

exports.createAlgoAccess = async (req, res, next) => {
    try {
        const record = await AlgoAccess.create(req.body);

        res.status(201).json({
            success: true,
            data: toPayload(record),
        });
    } catch (err) {
        next(err);
    }
};

exports.updateAlgoAccess = async (req, res, next) => {
    try {
        const record = await AlgoAccess.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!record) {
            return res.status(404).json({ message: 'Algo access record not found' });
        }

        res.status(200).json({
            success: true,
            data: toPayload(record),
        });
    } catch (err) {
        next(err);
    }
};

exports.toggleAlgoAccessStatus = async (req, res, next) => {
    try {
        const record = await AlgoAccess.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Algo access record not found' });
        }

        if (record.status === 'inactive') {
            record.status = 'active';
            record.heartbeatStatus = 'online';
            record.lastHeartbeatAt = new Date();
        } else {
            record.status = 'inactive';
            record.heartbeatStatus = 'offline';
        }

        await record.save();

        res.status(200).json({
            success: true,
            data: toPayload(record),
        });
    } catch (err) {
        next(err);
    }
};

exports.extendAlgoAccess = async (req, res, next) => {
    try {
        const record = await AlgoAccess.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Algo access record not found' });
        }

        const extensionDays = Number(req.body.days) || 30;
        const baseDate = record.expiresOn > new Date() ? record.expiresOn : new Date();
        baseDate.setDate(baseDate.getDate() + extensionDays);

        record.expiresOn = baseDate;
        record.durationDays += extensionDays;
        if (record.status !== 'inactive') {
            record.status = 'active';
            record.heartbeatStatus = 'online';
            record.lastHeartbeatAt = new Date();
        }

        await record.save();

        res.status(200).json({
            success: true,
            data: toPayload(record),
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteAlgoAccess = async (req, res, next) => {
    try {
        const record = await AlgoAccess.findByIdAndDelete(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Algo access record not found' });
        }

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        next(err);
    }
};


// ✅ Check Algo Access by Account Number & Algo Name
exports.checkAlgoAccess = async (req, res, next) => {
    try {
        const { accountNumber, algoName } = req.query;

        if (!accountNumber || !algoName) {
            return res.status(400).json({
                success: false,
                message: 'accountNumber and algoName are required',
            });
        }

        // Find matching record
        const record = await AlgoAccess.findOne({
            accountId: accountNumber,
            algoName: algoName,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'No access found for this account and algo',
            });
        }

        const now = new Date();
        const expiryDate = new Date(record.expiresOn);

        // Determine if active
        const isActive =
            record.status === 'active' &&
            expiryDate > now;

        res.status(200).json({
            success: true,
            data: {
                isActive: isActive,
                expiryDateTime: expiryDate
                    .toISOString()
                    .replace('T', ' ')
                    .split('.')[0],
                authorisedAccountNumber: record.accountId,
                oneTimeUse: record.oneTimeUse || false, // make sure field exists in model
            },
        });
    } catch (err) {
        next(err);
    }
};