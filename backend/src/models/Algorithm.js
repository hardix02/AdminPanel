const mongoose = require('mongoose');

const algorithmSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add an algorithm name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Algorithm', algorithmSchema);
