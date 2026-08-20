const { MongoClient } = require("mongodb");

let client;
let database;
let connectionPromise;

function getMongoConfig() {
    const timeout = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS);

    return {
        uri: process.env.MONGO_URI || "mongodb://localhost:27017",
        databaseName: process.env.MONGO_DB_NAME || "vehicle_service_db",
        serverSelectionTimeoutMS: Number.isFinite(timeout) && timeout > 0 ? timeout : 5000
    };
}

async function connectMongoDB() {
    if (database) {
        return database;
    }

    if (!connectionPromise) {
        const config = getMongoConfig();
        client = new MongoClient(config.uri, {
            serverSelectionTimeoutMS: config.serverSelectionTimeoutMS
        });

        connectionPromise = client.connect()
            .then(connectedClient => {
                database = connectedClient.db(config.databaseName);
                return database;
            })
            .catch(error => {
                client = undefined;
                connectionPromise = undefined;
                throw error;
            });
    }

    return connectionPromise;
}

async function closeMongoDB() {
    const activeClient = client;
    client = undefined;
    database = undefined;
    connectionPromise = undefined;

    if (activeClient) {
        await activeClient.close();
    }
}

module.exports = {
    closeMongoDB,
    connectMongoDB,
    getMongoConfig
};