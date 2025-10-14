import mongoose from 'mongoose';

const MONGODB_URIS = {
    JEE: process.env.MONGODB_URI_JEE,
    NEET: process.env.MONGODB_URI_NEET,
};

const EXAM_DB_KEYS = {
    "JEE": "JEE",
    "JEEMAIN": "JEE",
    "JEE MAIN": "JEE",
    "JEE MAINS": "JEE",
    "JEE ADVANCED": "JEE",
    "NEET": "NEET",
    "NEET UG": "NEET",
};

function normalizeExamType(rawExamType) {
    if (!rawExamType) return null;
    const normalizedInput = rawExamType.trim().toUpperCase();
    return EXAM_DB_KEYS[normalizedInput] || null;
}

Object.entries(MONGODB_URIS).forEach(([examType, uri]) => {
    console.log(`Checking MONGODB_URI_${examType}: ${uri ? 'Found' : 'Missing'}`);
    if (!uri) {
        throw new Error(`Please define MONGODB_URI_${examType} environment variable`);
    }
});

let cached = global.mongoose || {};
if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB(examType) {
    if (!examType) {
        throw new Error('Exam type is required for database connection');
    }

    const normalizedKey = normalizeExamType(examType);

    if (!normalizedKey) {
        const availableTypes = Object.keys(EXAM_DB_KEYS).join(', ');
        throw new Error(`Unrecognized exam type: ${examType}. Available types: ${availableTypes}`);
    }

    const uri = MONGODB_URIS[normalizedKey];
    if (!uri) {
        throw new Error(`No MongoDB URI configured for exam type: ${examType} (mapped to ${normalizedKey})`);
    }

    const cacheKey = normalizedKey;

    if (!cached[cacheKey]) {
        cached[cacheKey] = { conn: null, promise: null };
    }

    // If we already have a ready connection, return it
    if (cached[cacheKey].conn && cached[cacheKey].conn.readyState === 1) {
        console.log(`Using existing connection for ${normalizedKey} MongoDB database`);
        return cached[cacheKey].conn;
    }

    // If no connection promise exists, create one
    if (!cached[cacheKey].promise) {
        console.log(`Creating new connection for ${normalizedKey} MongoDB database...`);

        cached[cacheKey].promise = new Promise(async (resolve, reject) => {
            try {
                const connection = mongoose.createConnection(uri, {
                    bufferCommands: false,
                });

                // Wait for the connection to be fully ready
                connection.on('connected', () => {
                    console.log(`Successfully connected to ${normalizedKey} MongoDB database`);
                    resolve(connection);
                });

                connection.on('error', (error) => {
                    console.error(`Connection error for ${normalizedKey}:`, error);
                    reject(error);
                });

                connection.on('disconnected', () => {
                    console.log(`Disconnected from ${normalizedKey} MongoDB database`);
                });

            } catch (error) {
                console.error(`Failed to create connection for ${normalizedKey}:`, error);
                reject(error);
            }
        });
    }

    try {
        cached[cacheKey].conn = await cached[cacheKey].promise;

        // Double-check connection is ready
        if (cached[cacheKey].conn.readyState !== 1) {
            throw new Error(`Connection to ${normalizedKey} database is not ready`);
        }

        return cached[cacheKey].conn;
    } catch (e) {
        // Clear the failed promise so we can try again
        cached[cacheKey].promise = null;
        cached[cacheKey].conn = null;
        throw e;
    }
}

export function getSupportedExamTypes() {
    return Object.keys(EXAM_DB_KEYS);
}

export function getDbKeyForExamType(examType) {
    return normalizeExamType(examType);
}

export default connectDB;
