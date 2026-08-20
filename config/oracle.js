const oracledb = require("oracledb");

function getOracleConfig() {
    return {
        user: process.env.ORACLE_USER || "SYSTEM",
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING || "localhost:1521/XE"
    };
}

async function connectOracle() {
    return oracledb.getConnection(getOracleConfig());
}

async function closeOracleConnection(connection) {
    if (!connection) {
        return;
    }

    try {
        await connection.close();
    } catch (error) {
        console.error("Oracle connection close failed:", error.message);
    }
}

module.exports = {
    closeOracleConnection,
    connectOracle,
    getOracleConfig
};