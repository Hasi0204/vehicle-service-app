const express = require("express");
    const router = express.Router();
    const { connectOracle, closeOracleConnection } = require("../config/oracle");
    const oracledb = require("oracledb");

    function isPositiveInteger(value) {
        const number = Number(value);
        return Number.isSafeInteger(number) && number > 0;
    }

    function isNonEmptyString(value) {
        return typeof value === "string" && value.trim().length > 0;
    }

    function isNonNegativeNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0;
    }

    function isOptionalNonNegativeNumber(value) {
        return value === undefined || value === null || value === "" || isNonNegativeNumber(value);
    }

    function isOptionalNonNegativeInteger(value) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        const number = Number(value);
        return Number.isSafeInteger(number) && number >= 0;
    }

    function isOptionalIsoDate(value) {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }

    async function getNextId(connection, tableName, columnName) {
        const allowedIdentifiers = new Set([
            "CUSTOMER.CUSTOMER_ID",
            "VEHICLE.VEHICLE_ID",
            "SERVICE_BOOKING.BOOKING_ID",
            "INVOICE.INVOICE_ID",
            "PAYMENT.PAYMENT_ID",
            "SPARE_PART.PART_ID"
        ]);

        if (!allowedIdentifiers.has(`${tableName}.${columnName}`)) {
            throw new Error("Unsupported Oracle ID sequence");
        }

        // The legacy schema uses numeric primary keys without sequences. Lock
        // the table while allocating MAX + 1 so concurrent API requests cannot
        // choose the same identifier.
        await connection.execute(`LOCK TABLE ${tableName} IN EXCLUSIVE MODE`);
        const result = await connection.execute(`
            SELECT NVL(MAX(${columnName}), 0) + 1 AS NEXT_ID
            FROM ${tableName}
        `);

        return result.rows[0][0];
    }

    router.param("id", (req, res, next, value) => {
        if (!isPositiveInteger(value)) {
            return res.status(400).json({ error: "ID must be a positive integer" });
        }

        return next();
    });


    // =====================================================
    // CUSTOMERS - GET
    // =====================================================

    router.get("/customers", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    CUSTOMER_ID,
                    FIRST_NAME,
                    LAST_NAME,
                    PHONE,
                    EMAIL
                FROM CUSTOMER
                ORDER BY CUSTOMER_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle customers error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve customers from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // CUSTOMERS - ADD
    // =====================================================


    router.post("/customers", async (req, res) => {

        let connection;

        try {

            const {
                first_name,
                last_name,
                phone,
                email
            } = req.body;

            if (
                !isNonEmptyString(first_name) ||
                !isNonEmptyString(last_name) ||
                !isNonEmptyString(phone)
            ) {

                return res.status(400).json({
                    error: "First name, last name and phone are required"
                });

            }

            connection = await connectOracle();
                        const result = await connection.execute(
                `BEGIN
                    ADD_CUSTOMER(
                        :first_name, :last_name, :phone, :email, :customer_id
                    );
                 END;`,
                {
                    first_name,
                    last_name,
                    phone,
                    email: email || null,
                    customer_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const customerId = result.outBinds.customer_id;



            res.status(201).json({
                message: "Customer added successfully",
                customer_id: customerId
            });

        } catch (error) {

            console.error("Oracle customer insert error:", error);

            res.status(500).json({
                error: "Failed to add customer"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // CUSTOMERS - EDIT
    // =====================================================

    router.put("/customers/:id", async (req, res) => {

        let connection;

        try {

            const customerId = Number(req.params.id);

            const {
                first_name,
                last_name,
                phone,
                email
            } = req.body;

            if (
                !isNonEmptyString(first_name) ||
                !isNonEmptyString(last_name) ||
                !isNonEmptyString(phone)
            ) {

                return res.status(400).json({
                    error: "First name, last name and phone are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE CUSTOMER
                SET
                    FIRST_NAME = :first_name,
                    LAST_NAME = :last_name,
                    PHONE = :phone,
                    EMAIL = :email
                WHERE CUSTOMER_ID = :customer_id
                `,
                {
                    customer_id: customerId,
                    first_name,
                    last_name,
                    phone,
                    email: email || null
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Customer not found"
                });

            }

            res.json({
                message: "Customer updated successfully"
            });

        } catch (error) {

            console.error("Oracle customer update error:", error);

            res.status(500).json({
                error: "Failed to update customer"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // VEHICLES - GET
    // =====================================================
    router.get("/vehicles", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    VEHICLE_ID,
                    CUSTOMER_ID,
                    REGISTRATION_NO,
                    MAKE,
                    MODEL,
                    MANUFACTURING_YEAR,
                    VEHICLE_TYPE,
                    CURRENT_MILEAGE
                FROM VEHICLE
                ORDER BY VEHICLE_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle vehicles error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve vehicles from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // VEHICLES - ADD
    // =====================================================

    router.post("/vehicles", async (req, res) => {

        let connection;

        try {

            const {
                customer_id,
                registration_no,
                make,
                model,
                manufacturing_year,
                vehicle_type,
                current_mileage
            } = req.body;

            if (
                !isPositiveInteger(customer_id) ||
                !isNonEmptyString(registration_no) ||
                !isNonEmptyString(make) ||
                !isNonEmptyString(model) ||
                !isOptionalNonNegativeInteger(manufacturing_year) ||
                !isOptionalNonNegativeNumber(current_mileage)
            ) {

                return res.status(400).json({
                    error: "Customer, registration, make and model are required"
                });

            }

            connection = await connectOracle();

            // Check customer exists
            const customerCheck = await connection.execute(
                `
                SELECT CUSTOMER_ID
                FROM CUSTOMER
                WHERE CUSTOMER_ID = :customer_id
                `,
                {
                    customer_id: Number(customer_id)
                }
            );

            if (customerCheck.rows.length === 0) {

                return res.status(400).json({
                    error: "Customer ID does not exist"
                });

            }

            const result = await connection.execute(
                `BEGIN
                    ADD_VEHICLE(
                        :customer_id, :registration_no, :make, :model,
                        :manufacturing_year, :vehicle_type, :current_mileage, :vehicle_id
                    );
                 END;`,
                {
                    customer_id: Number(customer_id),
                    registration_no,
                    make,
                    model,
                    manufacturing_year:
                        manufacturing_year
                            ? Number(manufacturing_year)
                            : null,
                    vehicle_type:
                        vehicle_type || null,
                    current_mileage:
                        current_mileage !== undefined &&
                        current_mileage !== ""
                            ? Number(current_mileage)
                            : null,
                    vehicle_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const vehicleId = result.outBinds.vehicle_id;

            res.status(201).json({
                message: "Vehicle added successfully",
                vehicle_id: vehicleId
            });

        } catch (error) {

            console.error("Oracle vehicle insert error:", error);

            res.status(500).json({
                error: "Failed to add vehicle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // VEHICLES - EDIT
    // =====================================================

    router.put("/vehicles/:id", async (req, res) => {

        let connection;

        try {

            const vehicleId = Number(req.params.id);

            const {
                customer_id,
                registration_no,
                make,
                model,
                manufacturing_year,
                vehicle_type,
                current_mileage
            } = req.body;

            if (
                !isPositiveInteger(customer_id) ||
                !isNonEmptyString(registration_no) ||
                !isNonEmptyString(make) ||
                !isNonEmptyString(model) ||
                !isOptionalNonNegativeInteger(manufacturing_year) ||
                !isOptionalNonNegativeNumber(current_mileage)
            ) {

                return res.status(400).json({
                    error: "Customer, registration, make and model are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE VEHICLE
                SET
                    CUSTOMER_ID = :customer_id,
                    REGISTRATION_NO = :registration_no,
                    MAKE = :make,
                    MODEL = :model,
                    MANUFACTURING_YEAR = :manufacturing_year,
                    VEHICLE_TYPE = :vehicle_type,
                    CURRENT_MILEAGE = :current_mileage
                WHERE VEHICLE_ID = :vehicle_id
                `,
                {
                    vehicle_id: vehicleId,
                    customer_id: Number(customer_id),
                    registration_no,
                    make,
                    model,
                    manufacturing_year:
                        manufacturing_year
                            ? Number(manufacturing_year)
                            : null,
                    vehicle_type:
                        vehicle_type || null,
                    current_mileage:
                        current_mileage !== undefined &&
                        current_mileage !== ""
                            ? Number(current_mileage)
                            : null
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Vehicle not found"
                });

            }

            res.json({
                message: "Vehicle updated successfully"
            });

        } catch (error) {

            console.error("Oracle vehicle update error:", error);

            res.status(500).json({
                error: "Failed to update vehicle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SERVICE BOOKINGS - GET
    // =====================================================

    router.get("/bookings", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    BOOKING_ID,
                    VEHICLE_ID,
                    BOOKING_DATE,
                    SERVICE_DATE,
                    SERVICE_TYPE,
                    DESCRIPTION,
                    BOOKING_STATUS
                FROM SERVICE_BOOKING
                ORDER BY BOOKING_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle bookings error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve service bookings from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SERVICE BOOKINGS - ADD
    // =====================================================

    router.post("/bookings", async (req, res) => {

        let connection;

        try {

            const {
                vehicle_id,
                booking_date,
                service_date,
                service_type,
                description,
                booking_status
            } = req.body;

            if (
                !isPositiveInteger(vehicle_id) ||
                !isOptionalIsoDate(booking_date) ||
                !isOptionalIsoDate(service_date) ||
                !service_date ||
                !isNonEmptyString(service_type)
            ) {

                return res.status(400).json({
                    error: "Vehicle, service date and service type are required"
                });

            }

            connection = await connectOracle();

            const vehicleCheck = await connection.execute(
                `
                SELECT VEHICLE_ID
                FROM VEHICLE
                WHERE VEHICLE_ID = :vehicle_id
                `,
                {
                    vehicle_id: Number(vehicle_id)
                }
            );

            if (vehicleCheck.rows.length === 0) {

                return res.status(400).json({
                    error: "Vehicle ID does not exist"
                });

            }

            const result = await connection.execute(
                `BEGIN
                    ADD_BOOKING(
                        :vehicle_id, :booking_date, :service_date, :service_type,
                        :description, :booking_status, :booking_id
                    );
                 END;`,
                {
                    vehicle_id: Number(vehicle_id),
                    booking_date: booking_date || null,
                    service_date,
                    service_type,
                    description: description || null,
                    booking_status:
                        booking_status || "Pending",
                    booking_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const bookingId = result.outBinds.booking_id;

            res.status(201).json({
                message: "Booking added successfully",
                booking_id: bookingId
            });

        } catch (error) {

            console.error("Oracle booking insert error:", error);

            res.status(500).json({
                error: "Failed to add booking"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SERVICE BOOKINGS - EDIT
    // =====================================================

    router.put("/bookings/:id", async (req, res) => {

        let connection;

        try {

            const bookingId = Number(req.params.id);

            const {
                vehicle_id,
                service_date,
                service_type,
                description,
                booking_status
            } = req.body;

            if (
                !isPositiveInteger(vehicle_id) ||
                !isOptionalIsoDate(service_date) ||
                !service_date ||
                !isNonEmptyString(service_type)
            ) {

                return res.status(400).json({
                    error: "Vehicle, service date and service type are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE SERVICE_BOOKING
                SET
                    VEHICLE_ID = :vehicle_id,
                    SERVICE_DATE =
                        TO_DATE(:service_date, 'YYYY-MM-DD'),
                    SERVICE_TYPE = :service_type,
                    DESCRIPTION = :description,
                    BOOKING_STATUS = :booking_status
                WHERE BOOKING_ID = :booking_id
                `,
                {
                    booking_id: bookingId,
                    vehicle_id: Number(vehicle_id),
                    service_date,
                    service_type,
                    description: description || null,
                    booking_status:
                        booking_status || "Pending"
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Booking not found"
                });

            }

            res.json({
                message: "Booking updated successfully"
            });

        } catch (error) {

            console.error("Oracle booking update error:", error);

            res.status(500).json({
                error: "Failed to update booking"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // INVOICES - GET
    // =====================================================

    router.get("/invoices", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    INVOICE_ID,
                    BOOKING_ID,
                    INVOICE_DATE,
                    SUBTOTAL,
                    TAX_AMOUNT,
                    TOTAL_AMOUNT,
                    PAYMENT_STATUS
                FROM INVOICE
                ORDER BY INVOICE_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle invoices error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve invoices from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // INVOICES - ADD
    // =====================================================

    router.post("/invoices", async (req, res) => {

        let connection;

        try {

            const {
                booking_id,
                invoice_date,
                subtotal,
                payment_status
            } = req.body;

            if (
                !isPositiveInteger(booking_id) ||
                !isNonNegativeNumber(subtotal) ||
                !isOptionalIsoDate(invoice_date)
            ) {

                return res.status(400).json({
                    error: "Booking and subtotal are required"
                });

            }

            connection = await connectOracle();

            const bookingCheck = await connection.execute(
                `
                SELECT BOOKING_ID
                FROM SERVICE_BOOKING
                WHERE BOOKING_ID = :booking_id
                `,
                {
                    booking_id: Number(booking_id)
                }
            );

            if (bookingCheck.rows.length === 0) {

                return res.status(400).json({
                    error: "Booking ID does not exist"
                });

            }

            const result = await connection.execute(
                `BEGIN
                    ADD_INVOICE(
                        :booking_id, :invoice_date, :subtotal, :payment_status, :invoice_id
                    );
                 END;`,
                {
                    booking_id: Number(booking_id),
                    invoice_date: invoice_date || null,
                    subtotal: Number(subtotal),
                    payment_status:
                        payment_status || "Pending",
                    invoice_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const invoiceId = result.outBinds.invoice_id;

            res.status(201).json({
                message: "Invoice added successfully",
                invoice_id: invoiceId
            });

        } catch (error) {

            console.error("Oracle invoice insert error:", error);

            res.status(500).json({
                error: "Failed to add invoice"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // INVOICES - EDIT
    // =====================================================

    router.put("/invoices/:id", async (req, res) => {

        let connection;

        try {

            const invoiceId = Number(req.params.id);

            const {
                booking_id,
                invoice_date,
                subtotal,
                payment_status
            } = req.body;

            if (
                !isPositiveInteger(booking_id) ||
                !isNonNegativeNumber(subtotal) ||
                !isOptionalIsoDate(invoice_date)
            ) {

                return res.status(400).json({
                    error: "Booking and subtotal are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE INVOICE
                SET
                    BOOKING_ID = :booking_id,
                    INVOICE_DATE =
                        NVL(
                            TO_DATE(:invoice_date, 'YYYY-MM-DD'),
                            INVOICE_DATE
                        ),
                    SUBTOTAL = :subtotal,
                    TAX_AMOUNT = :tax_amount,
                    TOTAL_AMOUNT = :total_amount,
                    PAYMENT_STATUS = :payment_status
                WHERE INVOICE_ID = :invoice_id
                `,
                {
                    invoice_id: invoiceId,
                    booking_id: Number(booking_id),
                    invoice_date: invoice_date || null,
                    subtotal: Number(subtotal),
                    tax_amount: Number(subtotal) * 0.18,
                    total_amount: Number(subtotal) * 1.18,
                    payment_status:
                        payment_status || "Pending"
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Invoice not found"
                });

            }

            res.json({
                message: "Invoice updated successfully"
            });

        } catch (error) {

            console.error("Oracle invoice update error:", error);

            res.status(500).json({
                error: "Failed to update invoice"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // PAYMENTS - GET
    // =====================================================

    router.get("/payments", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    PAYMENT_ID,
                    INVOICE_ID,
                    PAYMENT_DATE,
                    AMOUNT,
                    PAYMENT_METHOD,
                    PAYMENT_STATUS
                FROM PAYMENT
                ORDER BY PAYMENT_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle payments error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve payments from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // PAYMENTS - ADD
    // =====================================================

    router.post("/payments", async (req, res) => {

        let connection;

        try {

            const {
                invoice_id,
                payment_date,
                amount,
                payment_method,
                payment_status
            } = req.body;

            if (
                !isPositiveInteger(invoice_id) ||
                !isNonNegativeNumber(amount) ||
                !isNonEmptyString(payment_method) ||
                !isOptionalIsoDate(payment_date)
            ) {

                return res.status(400).json({
                    error: "Invoice, amount and payment method are required"
                });

            }

            connection = await connectOracle();

            const invoiceCheck = await connection.execute(
                `
                SELECT INVOICE_ID
                FROM INVOICE
                WHERE INVOICE_ID = :invoice_id
                `,
                {
                    invoice_id: Number(invoice_id)
                }
            );

            if (invoiceCheck.rows.length === 0) {

                return res.status(400).json({
                    error: "Invoice ID does not exist"
                });

            }

            const result = await connection.execute(
                `BEGIN
                    ADD_PAYMENT(
                        :invoice_id, :payment_date, :amount, :payment_method,
                        :payment_status, :payment_id
                    );
                 END;`,
                {
                    invoice_id: Number(invoice_id),
                    payment_date: payment_date || null,
                    amount: Number(amount),
                    payment_method,
                    payment_status:
                        payment_status || "Completed",
                    payment_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const paymentId = result.outBinds.payment_id;

            res.status(201).json({
                message: "Payment added successfully",
                payment_id: paymentId
            });

        } catch (error) {

            console.error("Oracle payment insert error:", error);

            res.status(500).json({
                error: "Failed to add payment"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // PAYMENTS - EDIT
    // =====================================================

    router.put("/payments/:id", async (req, res) => {

        let connection;

        try {

            const paymentId = Number(req.params.id);

            const {
                invoice_id,
                payment_date,
                amount,
                payment_method,
                payment_status
            } = req.body;

            if (
                !isPositiveInteger(invoice_id) ||
                !isNonNegativeNumber(amount) ||
                !isNonEmptyString(payment_method) ||
                !isOptionalIsoDate(payment_date)
            ) {

                return res.status(400).json({
                    error: "Invoice, amount and payment method are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE PAYMENT
                SET
                    INVOICE_ID = :invoice_id,
                    PAYMENT_DATE =
                        NVL(
                            TO_DATE(:payment_date, 'YYYY-MM-DD'),
                            PAYMENT_DATE
                        ),
                    AMOUNT = :amount,
                    PAYMENT_METHOD = :payment_method,
                    PAYMENT_STATUS = :payment_status
                WHERE PAYMENT_ID = :payment_id
                `,
                {
                    payment_id: paymentId,
                    invoice_id: Number(invoice_id),
                    payment_date: payment_date || null,
                    amount: Number(amount),
                    payment_method,
                    payment_status:
                        payment_status || "Completed"
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Payment not found"
                });

            }

            res.json({
                message: "Payment updated successfully"
            });

        } catch (error) {

            console.error("Oracle payment update error:", error);

            res.status(500).json({
                error: "Failed to update payment"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SPARE PARTS - GET
    // =====================================================

    router.get("/spare-parts", async (req, res) => {

        let connection;

        try {

            connection = await connectOracle();

            const result = await connection.execute(`
                SELECT
                    PART_ID,
                    PART_NAME,
                    CATEGORY,
                    UNIT_PRICE,
                    QUANTITY_IN_STOCK,
                    REORDER_LEVEL,
                    SUPPLIER
                FROM SPARE_PART
                ORDER BY PART_ID
            `);

            res.json(result.rows);

        } catch (error) {

            console.error("Oracle spare parts error:", error.message);

            res.status(500).json({
                error: "Failed to retrieve spare parts from Oracle"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SPARE PARTS - ADD
    // =====================================================

    router.post("/spare-parts", async (req, res) => {

        let connection;

        try {

            const {
                part_name,
                category,
                unit_price,
                quantity_in_stock,
                reorder_level,
                supplier
            } = req.body;

            if (
                !isNonEmptyString(part_name) ||
                !isNonNegativeNumber(unit_price) ||
                !isOptionalNonNegativeInteger(quantity_in_stock) ||
                quantity_in_stock === "" ||
                quantity_in_stock === undefined ||
                quantity_in_stock === null ||
                !isOptionalNonNegativeInteger(reorder_level)
            ) {

                return res.status(400).json({
                    error: "Part name, unit price and stock quantity are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `BEGIN
                    ADD_SPARE_PART(
                        :part_name, :category, :unit_price, :quantity_in_stock,
                        :reorder_level, :supplier, :part_id
                    );
                 END;`,
                {
                    part_name,
                    category: category || null,
                    unit_price: Number(unit_price),
                    quantity_in_stock: Number(quantity_in_stock),
                    reorder_level:
                        reorder_level !== undefined &&
                        reorder_level !== ""
                            ? Number(reorder_level)
                            : null,
                    supplier: supplier || null,
                    part_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                {
                    autoCommit: true
                }
            );

            const partId = result.outBinds.part_id;

            res.status(201).json({
                message: "Spare part added successfully",
                part_id: partId
            });

        } catch (error) {

            console.error("Oracle spare part insert error:", error);

            res.status(500).json({
                error: "Failed to add spare part"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    // =====================================================
    // SPARE PARTS - EDIT
    // =====================================================

    router.put("/spare-parts/:id", async (req, res) => {

        let connection;

        try {

            const partId = Number(req.params.id);

            const {
                part_name,
                category,
                unit_price,
                quantity_in_stock,
                reorder_level,
                supplier
            } = req.body;

            if (
                !isNonEmptyString(part_name) ||
                !isNonNegativeNumber(unit_price) ||
                !isOptionalNonNegativeInteger(quantity_in_stock) ||
                quantity_in_stock === "" ||
                quantity_in_stock === undefined ||
                quantity_in_stock === null ||
                !isOptionalNonNegativeInteger(reorder_level)
            ) {

                return res.status(400).json({
                    error: "Part name, unit price and stock quantity are required"
                });

            }

            connection = await connectOracle();

            const result = await connection.execute(
                `
                UPDATE SPARE_PART
                SET
                    PART_NAME = :part_name,
                    CATEGORY = :category,
                    UNIT_PRICE = :unit_price,
                    QUANTITY_IN_STOCK = :quantity_in_stock,
                    REORDER_LEVEL = :reorder_level,
                    SUPPLIER = :supplier
                WHERE PART_ID = :part_id
                `,
                {
                    part_id: partId,
                    part_name,
                    category: category || null,
                    unit_price: Number(unit_price),
                    quantity_in_stock: Number(quantity_in_stock),
                    reorder_level:
                        reorder_level !== undefined &&
                        reorder_level !== ""
                            ? Number(reorder_level)
                            : null,
                    supplier: supplier || null
                },
                {
                    autoCommit: true
                }
            );

            if (result.rowsAffected === 0) {

                return res.status(404).json({
                    error: "Spare part not found"
                });

            }

            res.json({
                message: "Spare part updated successfully"
            });

        } catch (error) {

            console.error("Oracle spare part update error:", error);

            res.status(500).json({
                error: "Failed to update spare part"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });
    // =====================================================
// SPARE PARTS - ISSUE (REDUCE STOCK)
// =====================================================

router.post("/spare-parts/:id/issue", async (req, res) => {

    let connection;

    try {

        const partId = Number(req.params.id);
        const { quantity } = req.body;

        if (!isPositiveInteger(quantity)) {

            return res.status(400).json({
                error: "Quantity must be a positive number"
            });

        }

        connection = await connectOracle();

        // Atomic update: only succeeds if enough stock exists.
        // Guards against race conditions from concurrent issues.
        const result = await connection.execute(
            `
            UPDATE SPARE_PART
            SET QUANTITY_IN_STOCK = QUANTITY_IN_STOCK - :quantity
            WHERE PART_ID = :part_id
              AND QUANTITY_IN_STOCK >= :quantity
            `,
            {
                part_id: partId,
                quantity: Number(quantity)
            },
            {
                autoCommit: true
            }
        );

        if (result.rowsAffected === 0) {

            // Either part doesn't exist, or not enough stock.
            // Check which, to give a clear error message.
            const check = await connection.execute(
                `
                SELECT QUANTITY_IN_STOCK
                FROM SPARE_PART
                WHERE PART_ID = :part_id
                `,
                { part_id: partId }
            );

            if (check.rows.length === 0) {

                return res.status(404).json({
                    error: "Spare part not found"
                });

            }

            return res.status(400).json({
                error: `Insufficient stock. Only ${check.rows[0][0]} available.`
            });

        }

        res.json({
            message: "Stock issued successfully"
        });

    } catch (error) {

        console.error("Oracle issue spare part error:", error);

        res.status(500).json({
            error: "Failed to issue spare part"
        });

    } finally {

        if (connection) {
            await closeOracleConnection(connection);
        }

    }

});


    // =====================================================
    // SEARCH - CUSTOMERS
    // =====================================================

    router.get("/customers/search", async (req, res) => {

        let connection;

        try {

            const search = `%${req.query.q || ""}%`;

            connection = await connectOracle();

            const result = await connection.execute(
                `
                SELECT
                    CUSTOMER_ID,
                    FIRST_NAME,
                    LAST_NAME,
                    PHONE,
                    EMAIL
                FROM CUSTOMER
                WHERE
                    LOWER(FIRST_NAME) LIKE LOWER(:search)
                    OR LOWER(LAST_NAME) LIKE LOWER(:search)
                    OR PHONE LIKE :search
                    OR LOWER(EMAIL) LIKE LOWER(:search)
                ORDER BY CUSTOMER_ID
                `,
                {
                    search
                }
            );

            res.json(result.rows);

        } catch (error) {

            console.error("Customer search error:", error.message);

            res.status(500).json({
                error: "Failed to search customers"
            });

        } finally {

            if (connection) {
                await closeOracleConnection(connection);
            }

        }

    });


    module.exports = router;