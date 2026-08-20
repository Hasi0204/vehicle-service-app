require("dotenv").config({ quiet: true });

const path = require("path");
const express = require("express");
const cors = require("cors");

const { connectOracle, closeOracleConnection } = require("./config/oracle");
const { connectMongoDB, closeMongoDB } = require("./config/mongodb");
const oracleRoutes = require("./routes/oracleRoutes");
const mongoRoutes = require("./routes/mongoRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : false }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
    if (
        ["POST", "PUT", "PATCH"].includes(req.method) &&
        (req.body === undefined ||
            req.body === null ||
            Array.isArray(req.body) ||
            typeof req.body !== "object")
    ) {
        return res.status(400).json({ error: "A JSON object request body is required" });
    }

    return next();
});

// The frontend currently lives at the repository root. Serve only the three
// public assets instead of exposing source files and local configuration.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/app.js", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "app.js"));
});

app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "style.css"));
});

app.use("/api/oracle", oracleRoutes);
app.use("/api/mongo", mongoRoutes);

async function getDatabaseStatus() {
    const [oracleResult, mongoResult] = await Promise.allSettled([
        (async () => {
            const connection = await connectOracle();
            await closeOracleConnection(connection);
        })(),
        connectMongoDB()
    ]);

    return {
        oracle: oracleResult.status === "fulfilled" ? "connected" : "unavailable",
        mongodb: mongoResult.status === "fulfilled" ? "connected" : "unavailable"
    };
}

app.get(["/api/health", "/api/test"], async (req, res) => {
    const services = await getDatabaseStatus();
    const healthy = Object.values(services).every(status => status === "connected");

    res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "degraded",
        services
    });
});

app.use("/api", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const status = error.type === "entity.too.large"
        ? 413
        : error instanceof SyntaxError && error.status === 400
            ? 400
            : 500;
    console.error("Request failed:", error.message);
    return res.status(status).json({
        error: status === 413
            ? "Request body is too large"
            : status === 400
                ? "Invalid JSON request body"
                : "Internal server error"
    });
});

function startServer(port = Number(process.env.PORT) || 3000) {
    const server = app.listen(port, () => {
        const address = server.address();
        const activePort = typeof address === "object" && address ? address.port : port;
        console.log(`Server running at http://localhost:${activePort}`);
    });

    return server;
}

async function shutdown(server) {
    await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
    });

    await closeMongoDB();
}

if (require.main === module) {
    const server = startServer();

    for (const signal of ["SIGINT", "SIGTERM"]) {
        process.once(signal, async () => {
            try {
                await shutdown(server);
                process.exit(0);
            } catch (error) {
                console.error("Server shutdown failed:", error.message);
                process.exit(1);
            }
        });
    }
}

module.exports = {
    app,
    getDatabaseStatus,
    shutdown,
    startServer
};