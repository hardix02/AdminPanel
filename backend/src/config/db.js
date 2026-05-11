const mongoose = require('mongoose');
const env = require('./env');

let cached = global.__mongooseConnection;

if (!cached) {
    cached = global.__mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    try {
        if (cached.conn) {
            return cached.conn;
        }

        if (!cached.promise) {
            cached.promise = mongoose.connect(env.mongoUri).then((mongooseInstance) => mongooseInstance);
        }

        cached.conn = await cached.promise;
        console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
        return cached.conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        cached.promise = null;
        throw error;
    }
};

module.exports = connectDB;
