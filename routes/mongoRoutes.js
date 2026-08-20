const express = require("express");
const router = express.Router();

const { connectMongoDB } = require("../config/mongodb")
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0;
}

function isOptionalPositiveInteger(value) {
    return value === undefined || value === null || value === "" || isPositiveInteger(value);
}

function isOptionalNonNegativeNumber(value) {
    if (value === undefined || value === null || value === "") {
        return true;
    }

    const number = Number(value);
    return Number.isFinite(number) && number >= 0;
}

function parseDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function allocateNumericId(db, collectionName, fieldName) {
    const collection = db.collection(collectionName);
    const latest = await collection
        .find({}, { projection: { [fieldName]: 1 } })
        .sort({ [fieldName]: -1 })
        .limit(1)
        .next();
    const highestExistingId = Number(latest?.[fieldName]) || 0;

    const counter = await db.collection("_counters").findOneAndUpdate(
        { _id: `${collectionName}.${fieldName}` },
        [
            {
                $set: {
                    value: {
                        $add: [
                            {
                                $max: [
                                    { $ifNull: ["$value", 0] },
                                    highestExistingId
                                ]
                            },
                            1
                        ]
                    }
                }
            }
        ],
        { upsert: true, returnDocument: "after" }
    );

    return counter.value;
}


// =====================================================
// JOB CARDS
// =====================================================

router.get("/job-cards", async (req, res) => {

    try {

        const db = await connectMongoDB();

        const data = await db
            .collection("vehicle_job_cards")
            .find({})
            .sort({ job_card_id: -1 })
            .toArray();

        res.json(data);

    } catch (error) {

        console.error("MongoDB job cards error:", error.message);

        res.status(500).json({
            error: "Failed to retrieve job cards from MongoDB"
        });

    }

});

router.post("/job-cards", async (req, res) => {

    try {

        const {
            customer_id,
            vehicle_id,
            registration_no,
            service_type,
            technician_name,
            status,
            notes
        } = req.body;

        if (
            !isPositiveInteger(customer_id) ||
            !isPositiveInteger(vehicle_id) ||
            !isNonEmptyString(service_type) ||
            !isNonEmptyString(technician_name)
        ) {
            return res.status(400).json({
                error: "Customer ID, vehicle ID, service type and technician name are required"
            });
        }

        const db = await connectMongoDB();
        const nextId = await allocateNumericId(
            db,
            "vehicle_job_cards",
            "job_card_id"
        );

        const inserted = await db
            .collection("vehicle_job_cards")
            .insertOne({
                job_card_id: nextId,
                customer_id: Number(customer_id),
                vehicle_id: Number(vehicle_id),
                registration_no: registration_no || null,
                service_type,
                technician: {
                    name: technician_name
                },
                status: status || "Open",
                notes: notes || "",
                created_at: new Date()
            });

        res.status(201).json({
            message: "Job card added successfully",
            job_card_id: nextId,
            insertedId: inserted.insertedId
        });

    } catch (error) {

        console.error("MongoDB add job card error:", error.message);

        res.status(500).json({
            error: "Failed to add job card to MongoDB"
        });

    }

});


// =====================================================
// TECHNICIAN NOTES
// =====================================================

router.get("/technician-notes", async (req, res) => {

    try {

        const db = await connectMongoDB();

        const data = await db
            .collection("technician_notes")
            .find({})
            .sort({ note_id: -1 })
            .toArray();

        res.json(data);

    } catch (error) {

        console.error("MongoDB technician notes error:", error.message);

        res.status(500).json({
            error: "Failed to retrieve technician notes from MongoDB"
        });

    }

});

router.post("/technician-notes", async (req, res) => {

    try {

        const {
            job_card_id,
            vehicle_id,
            technician_name,
            note_type,
            note_text,
            recommendations
        } = req.body;

        if (
            !isPositiveInteger(job_card_id) ||
            !isPositiveInteger(vehicle_id) ||
            !isNonEmptyString(technician_name) ||
            !isNonEmptyString(note_type) ||
            !isNonEmptyString(note_text)
        ) {
            return res.status(400).json({
                error: "Job card ID, vehicle ID, technician name, note type and notes are required"
            });
        }

        const db = await connectMongoDB();
        const nextId = await allocateNumericId(
            db,
            "technician_notes",
            "note_id"
        );

        const inserted = await db
            .collection("technician_notes")
            .insertOne({
                note_id: nextId,
                job_card_id: Number(job_card_id),
                vehicle_id: Number(vehicle_id),
                technician: {
                    name: technician_name
                },
                note_type,
                notes: note_text,
                recommendations: Array.isArray(recommendations)
                    ? recommendations
                    : recommendations
                        ? recommendations
                            .split(",")
                            .map(item => item.trim())
                            .filter(Boolean)
                        : [],
                created_at: new Date()
            });

        res.status(201).json({
            message: "Technician note added successfully",
            note_id: nextId,
            insertedId: inserted.insertedId
        });

    } catch (error) {

        console.error("MongoDB add technician note error:", error.message);

        res.status(500).json({
            error: "Failed to add technician note to MongoDB"
        });

    }

});


// =====================================================
// SERVICE HISTORY
// =====================================================

router.get("/service-history", async (req, res) => {

    try {

        const db = await connectMongoDB();

        const data = await db
            .collection("service_history")
            .find({})
            .sort({ history_id: -1 })
            .toArray();

        res.json(data);

    } catch (error) {

        console.error("MongoDB service history error:", error.message);

        res.status(500).json({
            error: "Failed to retrieve service history from MongoDB"
        });

    }

});

router.post("/service-history", async (req, res) => {

    try {

        const {
            vehicle_id,
            booking_id,
            service_date,
            service_type,
            status,
            mileage,
            technician_name
        } = req.body;

        const parsedServiceDate = parseDate(service_date);

        if (
            !isPositiveInteger(vehicle_id) ||
            !isOptionalPositiveInteger(booking_id) ||
            !parsedServiceDate ||
            !isNonEmptyString(service_type) ||
            !isNonEmptyString(technician_name) ||
            !isOptionalNonNegativeNumber(mileage)
        ) {
            return res.status(400).json({
                error: "Provide valid vehicle, booking, service date, service type, technician and mileage values"
            });
        }

        const db = await connectMongoDB();
        const nextId = await allocateNumericId(
            db,
            "service_history",
            "history_id"
        );

        const inserted = await db
            .collection("service_history")
            .insertOne({
                history_id: nextId,
                vehicle_id: Number(vehicle_id),
                booking_id: booking_id ? Number(booking_id) : null,
                service_date: parsedServiceDate,
                service_type,
                status: status || "Completed",
                mileage: mileage !== undefined && mileage !== null && mileage !== ""
                    ? Number(mileage)
                    : null,
                technician: {
                    name: technician_name
                },
                created_at: new Date()
            });

        res.status(201).json({
            message: "Service history added successfully",
            history_id: nextId,
            insertedId: inserted.insertedId
        });

    } catch (error) {

        console.error("MongoDB add service history error:", error.message);

        res.status(500).json({
            error: "Failed to add service history to MongoDB"
        });

    }

});


// =====================================================
// COMPLAINTS & FEEDBACK
// =====================================================

router.get("/complaints", async (req, res) => {

    try {

        const db = await connectMongoDB();

        const data = await db
            .collection("complaints_feedback")
            .find({})
            .sort({ feedback_id: -1 })
            .toArray();

        res.json(data);

    } catch (error) {

        console.error("MongoDB complaints error:", error.message);

        res.status(500).json({
            error: "Failed to retrieve complaints from MongoDB"
        });

    }

});

router.post("/complaints", async (req, res) => {

    try {

        const {
            customer_id,
            vehicle_id,
            feedback_type,
            description,
            rating,
            priority,
            status,
            resolution
        } = req.body;

        const numericRating = rating === undefined || rating === null || rating === ""
            ? null
            : Number(rating);

        if (
            !isPositiveInteger(customer_id) ||
            !isPositiveInteger(vehicle_id) ||
            !isNonEmptyString(feedback_type) ||
            !isNonEmptyString(description) ||
            (numericRating !== null &&
                (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5))
        ) {
            return res.status(400).json({
                error: "Provide valid customer, vehicle, complaint details and a rating from 1 to 5"
            });
        }

        const db = await connectMongoDB();
        const nextId = await allocateNumericId(
            db,
            "complaints_feedback",
            "feedback_id"
        );

        const inserted = await db
            .collection("complaints_feedback")
            .insertOne({
                feedback_id: nextId,
                customer_id: Number(customer_id),
                vehicle_id: Number(vehicle_id),
                feedback_type,
                description,
                rating: numericRating,
                priority: priority || "Medium",
                status: status || "Open",
                resolution: resolution || "",
                created_at: new Date()
            });

        res.status(201).json({
            message: "Complaint added successfully",
            feedback_id: nextId,
            insertedId: inserted.insertedId
        });

    } catch (error) {

        console.error("MongoDB add complaint error:", error.message);

        res.status(500).json({
            error: "Failed to add complaint to MongoDB"
        });

    }

});


// =====================================================
// DIAGNOSTICS
// =====================================================

router.get("/diagnostics", async (req, res) => {

    try {

        const db = await connectMongoDB();

        const data = await db
            .collection("diagnostic_summaries")
            .find({})
            .sort({ diagnostic_id: -1 })
            .toArray();

        res.json(data);

    } catch (error) {

        console.error("MongoDB diagnostics error:", error.message);

        res.status(500).json({
            error: "Failed to retrieve diagnostic summaries from MongoDB"
        });

    }

});

router.post("/diagnostics", async (req, res) => {

    try {

        const {
            vehicle_id,
            booking_id,
            diagnostic_date,
            diagnostic_tool,
            overall_result,
            mileage,
            fault_codes,
            recommendations
        } = req.body;

        const parsedDiagnosticDate = parseDate(diagnostic_date);

        if (
            !isPositiveInteger(vehicle_id) ||
            !isOptionalPositiveInteger(booking_id) ||
            !parsedDiagnosticDate ||
            !isNonEmptyString(diagnostic_tool) ||
            !isOptionalNonNegativeNumber(mileage) ||
            (fault_codes !== undefined && !Array.isArray(fault_codes)) ||
            (recommendations !== undefined && !Array.isArray(recommendations))
        ) {
            return res.status(400).json({
                error: "Provide valid vehicle, booking, diagnostic, mileage and list values"
            });
        }

        const db = await connectMongoDB();
        const nextId = await allocateNumericId(
            db,
            "diagnostic_summaries",
            "diagnostic_id"
        );

        const inserted = await db
            .collection("diagnostic_summaries")
            .insertOne({
                diagnostic_id: nextId,
                vehicle_id: Number(vehicle_id),
                booking_id: booking_id ? Number(booking_id) : null,
                diagnostic_date: parsedDiagnosticDate,
                diagnostic_tool,
                overall_result: overall_result || "Normal",
                mileage: mileage !== undefined && mileage !== null && mileage !== ""
                    ? Number(mileage)
                    : null,
                fault_codes: Array.isArray(fault_codes) ? fault_codes : [],
                recommendations: Array.isArray(recommendations) ? recommendations : [],
                created_at: new Date()
            });

        res.status(201).json({
            message: "Diagnostic added successfully",
            diagnostic_id: nextId,
            insertedId: inserted.insertedId
        });

    } catch (error) {

        console.error("MongoDB add diagnostic error:", error.message);

        res.status(500).json({
            error: "Failed to add diagnostic to MongoDB"
        });

    }

});


module.exports = router;