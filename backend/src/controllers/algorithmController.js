const Algorithm = require('../models/Algorithm');

// @desc    Get all algorithms
// @route   GET /api/v1/algorithms
// @access  Private
exports.getAlgorithms = async (req, res, next) => {
    try {
        const algorithms = await Algorithm.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: algorithms.length,
            data: algorithms,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new algorithm
// @route   POST /api/v1/algorithms
// @access  Private
exports.createAlgorithm = async (req, res, next) => {
    try {
        const algorithm = await Algorithm.create(req.body);
        res.status(201).json({
            success: true,
            data: algorithm,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Algorithm name already exists',
            });
        }
        next(err);
    }
};

// @desc    Delete algorithm
// @route   DELETE /api/v1/algorithms/:id
// @access  Private
exports.deleteAlgorithm = async (req, res, next) => {
    try {
        const algorithm = await Algorithm.findByIdAndDelete(req.params.id);
        if (!algorithm) {
            return res.status(404).json({
                success: false,
                message: 'Algorithm not found',
            });
        }
        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        next(err);
    }
};
