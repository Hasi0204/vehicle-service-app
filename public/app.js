// =====================================================
// AUTOCARE - FRONTEND APPLICATION
// =====================================================


// =====================================================
// PAGE NAVIGATION
// =====================================================

function showPage(pageId, title, subtitle, clickedItem) {

    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.style.display = "block";
    }

    const pageTitle =
        document.getElementById("pageTitle");

    const pageSubtitle =
        document.getElementById("pageSubtitle");

    if (pageTitle) {
        pageTitle.textContent = title;
    }

    if (pageSubtitle) {
        pageSubtitle.textContent = subtitle;
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (clickedItem) {
        clickedItem.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function toInlineJavaScriptString(value) {
    return escapeHTML(JSON.stringify(value === null || value === undefined ? "" : String(value)));
}


// =====================================================
// TABLE SEARCH
// =====================================================

function filterTable(inputId, tableId) {

    const input =
        document.getElementById(inputId);

    const table =
        document.getElementById(tableId);

    if (!input || !table) {
        return;
    }

    const searchValue =
        input.value.toLowerCase().trim();

    const rows =
        table.querySelectorAll("tbody tr");

    let visibleRows = 0;

    rows.forEach(row => {

        const rowText =
            row.textContent.toLowerCase();

        if (rowText.includes(searchValue)) {

            row.style.display = "";
            visibleRows++;

        } else {

            row.style.display = "none";

        }

    });

    const noResults =
        table.parentElement.querySelector(".search-no-results");

    if (visibleRows === 0 && rows.length > 0) {

        if (!noResults) {

            const message =
                document.createElement("div");

            message.className =
                "search-no-results";

            message.innerHTML =
                "🔍 No matching records found.";

            table.parentElement.appendChild(message);

        }

    } else {

        if (noResults) {
            noResults.remove();
        }

    }

}


// =====================================================
// TABLE VALUE FORMATTER
// =====================================================

function formatTableValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const stringValue =
        String(value);

    const lowerValue =
        stringValue
            .toLowerCase()
            .trim();

    const statusValues = [

        "completed",
        "resolved",
        "pending",
        "open",
        "in progress",
        "in-progress",
        "under review",
        "under-review",
        "cancelled",
        "closed",
        "active",
        "inactive",
        "paid",
        "unpaid",
        "failed"

    ];

    if (statusValues.includes(lowerValue)) {

        const className =
            lowerValue.replace(/\s+/g, "-");

        return `
            <span class="status ${className}">
                ${escapeHTML(stringValue)}
            </span>
        `;

    }

    return escapeHTML(stringValue);

}


// =====================================================
// CREATE TABLE
// =====================================================

function createTable(
    headers,
    rows,
    tableId = "dataTable",
    searchPlaceholder = "Search records..."
) {

    if (!rows || rows.length === 0) {

        return `
            <div class="empty-state">

                <div class="empty-icon">
                    📂
                </div>

                <h3>
                    No records found
                </h3>

                <p>
                    There are currently no records available.
                </p>

            </div>
        `;

    }

    const searchId =
        `${tableId}Search`;

    let html = `

        <div class="table-toolbar">

            <div class="search-wrapper">

                <span class="search-icon">
                    🔍
                </span>

                <input
                    type="text"
                    id="${searchId}"
                    class="search-input"
                    placeholder="${escapeHTML(searchPlaceholder)}"
                    oninput="filterTable('${searchId}', '${tableId}')"
                >

            </div>

            <span class="record-count">
                ${rows.length} record${rows.length === 1 ? "" : "s"}
            </span>

        </div>

        <div class="table-container">

            <table id="${tableId}">

                <thead>

                    <tr>
    `;

    headers.forEach(header => {

        html += `
            <th>
                ${escapeHTML(header)}
            </th>
        `;

    });

    html += `
                    </tr>

                </thead>

                <tbody>
    `;

    rows.forEach(row => {

        html += `<tr>`;

        row.forEach(value => {

            html += `
                <td>
                    ${formatTableValue(value)}
                </td>
            `;

        });

        html += `</tr>`;

    });

    html += `

                </tbody>

            </table>

        </div>
    `;

    return html;

}


// =====================================================
// LOADING STATE
// =====================================================

function showLoading(
    elementId,
    message = "Loading data..."
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.innerHTML = `

        <div class="loading-state">

            <div class="loading-spinner"></div>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// =====================================================
// ERROR STATE
// =====================================================

function showError(
    elementId,
    message = "Unable to load data."
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.innerHTML = `

        <div class="error-state">

            <div class="error-icon">
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    await Promise.all([

        loadCustomerCount(),
        loadVehicleCount(),
        loadBookingCount(),
        loadJobCardCount(),
        loadRecentCustomers(),
        loadRecentJobCards()

    ]);

}


// =====================================================
// CUSTOMER COUNT
// =====================================================

async function loadCustomerCount() {

    try {

        const response =
            await fetch("/api/oracle/customers");

        if (!response.ok) {
            throw new Error(
                "Failed to retrieve customers"
            );
        }

        const customers =
            await response.json();

        const element =
            document.getElementById(
                "customerCount"
            );

        if (element) {
            element.textContent =
                customers.length;
        }

    } catch (error) {

        console.error(
            "Customer count error:",
            error
        );

        const element =
            document.getElementById(
                "customerCount"
            );

        if (element) {
            element.textContent = "—";
        }

    }

}


// =====================================================
// VEHICLE COUNT
// =====================================================

async function loadVehicleCount() {

    try {

        const response =
            await fetch("/api/oracle/vehicles");

        if (!response.ok) {
            throw new Error(
                "Failed to retrieve vehicles"
            );
        }

        const vehicles =
            await response.json();

        const element =
            document.getElementById(
                "vehicleCount"
            );

        if (element) {
            element.textContent =
                vehicles.length;
        }

    } catch (error) {

        console.error(
            "Vehicle count error:",
            error
        );

        const element =
            document.getElementById(
                "vehicleCount"
            );

        if (element) {
            element.textContent = "—";
        }

    }

}


// =====================================================
// BOOKING COUNT
// =====================================================

async function loadBookingCount() {

    try {

        const response =
            await fetch("/api/oracle/bookings");

        if (!response.ok) {
            throw new Error(
                "Failed to retrieve bookings"
            );
        }

        const bookings =
            await response.json();

        const element =
            document.getElementById(
                "bookingCount"
            );

        if (element) {
            element.textContent =
                bookings.length;
        }

    } catch (error) {

        console.error(
            "Booking count error:",
            error
        );

        const element =
            document.getElementById(
                "bookingCount"
            );

        if (element) {
            element.textContent = "—";
        }

    }

}


// =====================================================
// JOB CARD COUNT
// =====================================================

async function loadJobCardCount() {

    try {

        const response =
            await fetch(
                "/api/mongo/job-cards"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to retrieve job cards"
            );
        }

        const jobCards =
            await response.json();

        const element =
            document.getElementById(
                "jobCardCount"
            );

        if (element) {
            element.textContent =
                jobCards.length;
        }

    } catch (error) {

        console.error(
            "Job card count error:",
            error
        );

        const element =
            document.getElementById(
                "jobCardCount"
            );

        if (element) {
            element.textContent = "—";
        }

    }

}


// =====================================================
// RECENT CUSTOMERS
// =====================================================

async function loadRecentCustomers() {

    showLoading(
        "customersTable",
        "Loading recent customers..."
    );

    try {

        const response =
            await fetch(
                "/api/oracle/customers"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load customers"
            );
        }

        const customers =
            await response.json();

        const recent =
            customers.slice(-5).reverse();

        const rows =
            recent.map(customer => [

                customer[0],

                `${customer[1]} ${customer[2]}`,

                customer[3],

                customer[4]

            ]);

        document.getElementById(
            "customersTable"
        ).innerHTML = createTable(

            [
                "ID",
                "Name",
                "Phone",
                "Email"
            ],

            rows,

            "recentCustomersTable",
            "Search recent customers..."

        );

    } catch (error) {

        console.error(error);

        showError(
            "customersTable",
            "Unable to load customer records."
        );

    }

}


// =====================================================
// RECENT JOB CARDS
// =====================================================

async function loadRecentJobCards() {

    showLoading(
        "jobCardsTable",
        "Loading recent job cards..."
    );

    try {

        const response =
            await fetch(
                "/api/mongo/job-cards"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load job cards"
            );
        }

        const cards =
            await response.json();

        const recent =
            cards.slice(0, 5);

        const rows =
            recent.map(card => [

                card.job_card_id,

                card.vehicle?.registration_no || card.registration_no || "-",

                card.service_type || "-",

                card.technician?.name || "-",

                card.status || "-"

            ]);

        document.getElementById(
            "jobCardsTable"
        ).innerHTML = createTable(

            [
                "Job Card",
                "Vehicle",
                "Service",
                "Technician",
                "Status"
            ],

            rows,

            "recentJobCardsTable",
            "Search recent job cards..."

        );

    } catch (error) {

        console.error(error);

        showError(
            "jobCardsTable",
            "Unable to load job card records."
        );

    }

}


// =====================================================
// CUSTOMERS PAGE
// =====================================================

async function loadCustomersPage() {

    showLoading(
        "allCustomersTable",
        "Loading customer records..."
    );

    try {

        const response =
            await fetch(
                "/api/oracle/customers"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load customers"
            );
        }

        const customers =
            await response.json();

        const container =
            document.getElementById(
                "allCustomersTable"
            );

        let html = `

            <div class="customer-actions">

                <button
                    class="add-button"
                    onclick="showAddCustomerForm()"
                >
                    <span>+</span>
                    Add Customer
                </button>

            </div>


            <div
                id="addCustomerForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW RECORD
                        </span>

                        <h3>
                            Add New Customer
                        </h3>

                        <p>
                            Enter the customer's information below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addCustomer(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                First Name
                            </label>

                            <input
                                type="text"
                                id="customerFirstName"
                                placeholder="Enter first name"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Last Name
                            </label>

                            <input
                                type="text"
                                id="customerLastName"
                                placeholder="Enter last name"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                id="customerPhone"
                                placeholder="0712345678"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                id="customerEmail"
                                placeholder="customer@email.com"
                                required
                            >

                        </div>

                    </div>


                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Customer
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddCustomerForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        `;


        // Search bar

        html += `

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="customerSearch"
                        class="search-input"
                        placeholder="Search customers..."
                        oninput="searchCustomers()"
                    >

                </div>

                <span class="record-count">
                    ${customers.length} records
                </span>

            </div>

        `;


        // Table

        html += `

            <div class="table-container">

                <table id="customersDataTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        customers.forEach(customer => {

            html += `

                <tr id="customer-row-${customer[0]}">

                    <td>
                        ${escapeHTML(customer[0])}
                    </td>

                    <td>
                        ${escapeHTML(customer[1])}
                    </td>

                    <td>
                        ${escapeHTML(customer[2])}
                    </td>

                    <td>
                        ${escapeHTML(customer[3])}
                    </td>

                    <td>
                        ${escapeHTML(customer[4])}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="editCustomer(
                                ${customer[0]},
                                ${toInlineJavaScriptString(customer[1])},
                                ${toInlineJavaScriptString(customer[2])},
                                ${toInlineJavaScriptString(customer[3])},
                                ${toInlineJavaScriptString(customer[4])}
                            )"
                        >
                            ✏️ Edit
                        </button>

                    </td>

                </tr>

            `;

        });


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        showError(
            "allCustomersTable",
            "Unable to load customer records."
        );

    }

}


// =====================================================
// CUSTOMER SEARCH
// =====================================================

function searchCustomers() {

    const input =
        document.getElementById(
            "customerSearch"
        );

    const table =
        document.getElementById(
            "customersDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value.toLowerCase().trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";

        });

}


// =====================================================
// EDIT CUSTOMER
// =====================================================

function editCustomer(
    id,
    firstName,
    lastName,
    phone,
    email
) {

    const row =
        document.getElementById(
            `customer-row-${id}`
        );

    if (!row) {
        return;
    }

    row.innerHTML = `

        <td>
            ${escapeHTML(id)}
        </td>

        <td>
            <input
                class="edit-input"
                id="edit-first-${id}"
                value="${escapeHTML(firstName)}"
            >
        </td>

        <td>
            <input
                class="edit-input"
                id="edit-last-${id}"
                value="${escapeHTML(lastName)}"
            >
        </td>

        <td>
            <input
                class="edit-input"
                id="edit-phone-${id}"
                value="${escapeHTML(phone)}"
            >
        </td>

        <td>
            <input
                class="edit-input"
                id="edit-email-${id}"
                value="${escapeHTML(email)}"
            >
        </td>

        <td>

            <button
                class="save-edit-button"
                onclick="saveCustomer(${id})"
            >
                ✓ Save
            </button>

            <button
                class="cancel-edit-button"
                onclick="loadCustomersPage()"
            >
                Cancel
            </button>

        </td>

    `;

}


// =====================================================
// SAVE CUSTOMER EDIT
// =====================================================

async function saveCustomer(id) {

    const firstName =
        document.getElementById(
            `edit-first-${id}`
        ).value.trim();

    const lastName =
        document.getElementById(
            `edit-last-${id}`
        ).value.trim();

    const phone =
        document.getElementById(
            `edit-phone-${id}`
        ).value.trim();

    const email =
        document.getElementById(
            `edit-email-${id}`
        ).value.trim();


    if (
        !firstName ||
        !lastName ||
        !phone ||
        !email
    ) {

        showToast(
            "Please fill in all customer fields.",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `/api/oracle/customers/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        phone:
                            phone,

                        email:
                            email

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to update customer"
            );

        }


        showToast(
            "Customer updated successfully.",
            "success"
        );


        await loadCustomersPage();


        await Promise.all([

            loadCustomerCount(),

            loadRecentCustomers()

        ]);

    } catch (error) {

        console.error(
            "Update customer error:",
            error
        );

        showToast(
            error.message ||
            "Failed to update customer.",
            "error"
        );

    }

}


// =====================================================
// SHOW ADD CUSTOMER FORM
// =====================================================

function showAddCustomerForm() {

    const form =
        document.getElementById(
            "addCustomerForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD CUSTOMER FORM
// =====================================================

function hideAddCustomerForm() {

    const form =
        document.getElementById(
            "addCustomerForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}


// =====================================================
// ADD CUSTOMER
// =====================================================

async function addCustomer(event) {

    event.preventDefault();

    const firstName =
        document.getElementById(
            "customerFirstName"
        ).value.trim();

    const lastName =
        document.getElementById(
            "customerLastName"
        ).value.trim();

    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();

    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Adding Customer...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/customers",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        phone:
                            phone,

                        email:
                            email

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add customer"
            );

        }


        showToast(
            `Customer added successfully. ID: ${result.customer_id}`,
            "success"
        );


        await loadCustomersPage();


        await Promise.all([

            loadCustomerCount(),

            loadRecentCustomers()

        ]);

    } catch (error) {

        console.error(
            "Add customer error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add customer.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Customer";

        }

    }

}

// =====================================================
// VEHICLES PAGE
// =====================================================

async function loadVehiclesPage() {

    showLoading(
        "vehiclesTable",
        "Loading vehicle records..."
    );

    try {

        const response =
            await fetch(
                "/api/oracle/vehicles"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load vehicles"
            );
        }

        const vehicles =
            await response.json();

        const container =
            document.getElementById(
                "vehiclesTable"
            );

        let html = `

            <!-- VEHICLE ACTION -->

            <div class="customer-actions">

                <button
                    class="add-button"
                    onclick="showAddVehicleForm()"
                >
                    <span>+</span>
                    Add Vehicle
                </button>

            </div>


            <!-- ADD VEHICLE FORM -->

            <div
                id="addVehicleForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW RECORD
                        </span>

                        <h3>
                            Add New Vehicle
                        </h3>

                        <p>
                            Enter the vehicle information below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addVehicle(event)">

                    <div class="form-grid">


                        <!-- CUSTOMER ID -->

                        <div class="form-group">

                            <label>
                                Customer ID
                            </label>

                            <input
                                type="number"
                                id="vehicleCustomerId"
                                placeholder="Enter customer ID"
                                min="1"
                                required
                            >

                        </div>


                        <!-- REGISTRATION -->

                        <div class="form-group">

                            <label>
                                Registration Number
                            </label>

                            <input
                                type="text"
                                id="vehicleRegistration"
                                placeholder="WP CAB-1234"
                                required
                            >

                        </div>


                        <!-- MAKE -->

                        <div class="form-group">

                            <label>
                                Make
                            </label>

                            <input
                                type="text"
                                id="vehicleMake"
                                placeholder="Toyota"
                                required
                            >

                        </div>


                        <!-- MODEL -->

                        <div class="form-group">

                            <label>
                                Model
                            </label>

                            <input
                                type="text"
                                id="vehicleModel"
                                placeholder="Corolla"
                                required
                            >

                        </div>


                        <!-- YEAR -->

                        <div class="form-group">

                            <label>
                                Year
                            </label>

                            <input
                                type="number"
                                id="vehicleYear"
                                placeholder="2024"
                                min="1900"
                                max="2100"
                                required
                            >

                        </div>


                        <!-- VEHICLE TYPE -->

                        <div class="form-group">

                            <label>
                                Vehicle Type
                            </label>

                            <input
                                type="text"
                                id="vehicleType"
                                placeholder="Sedan"
                                required
                            >

                        </div>


                        <!-- MILEAGE -->

                        <div class="form-group">

                            <label>
                                Mileage
                            </label>

                            <input
                                type="number"
                                id="vehicleMileage"
                                placeholder="25000"
                                min="0"
                                required
                            >

                        </div>

                    </div>


                    <!-- FORM BUTTONS -->

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Vehicle
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddVehicleForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            <!-- SEARCH -->

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="vehicleSearch"
                        class="search-input"
                        placeholder="Search vehicles..."
                        oninput="searchVehicles()"
                    >

                </div>

            </div>


            <!-- VEHICLE TABLE -->

            <div class="table-container">

                <table id="vehiclesDataTable">

                    <thead>

                        <tr>

                            <th>Vehicle ID</th>
                            <th>Customer ID</th>
                            <th>Registration</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Vehicle Type</th>
                            <th>Mileage</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        vehicles.forEach(vehicle => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(vehicle[0])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[1])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[2])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[3])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[4])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[5])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[6])}
                    </td>

                    <td>
                        ${escapeHTML(vehicle[7])}
                    </td>

                </tr>

            `;

        });


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Vehicle page error:",
            error
        );

        showError(
            "vehiclesTable",
            "Unable to load vehicle records."
        );

    }

}

// =====================================================
// SHOW ADD VEHICLE FORM
// =====================================================

function showAddVehicleForm() {

    const form =
        document.getElementById(
            "addVehicleForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD VEHICLE FORM
// =====================================================

function hideAddVehicleForm() {

    const form =
        document.getElementById(
            "addVehicleForm"
        );

    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================================
// VEHICLE SEARCH
// =====================================================

function searchVehicles() {

    const input =
        document.getElementById(
            "vehicleSearch"
        );

    const table =
        document.getElementById(
            "vehiclesDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();


    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";

        });

}


// =====================================================
// ADD VEHICLE
// =====================================================

async function addVehicle(event) {

    event.preventDefault();


    const registration =
        document.getElementById(
            "vehicleRegistration"
        ).value.trim();


    const make =
        document.getElementById(
            "vehicleMake"
        ).value.trim();


    const model =
        document.getElementById(
            "vehicleModel"
        ).value.trim();


    const customerId =
        document.getElementById(
            "vehicleCustomerId"
        ).value.trim();


    const manufacturingYear =
        document.getElementById(
            "vehicleYear"
        ).value.trim();


    const vehicleType =
        document.getElementById(
            "vehicleType"
        ).value.trim();


    const currentMileage =
        document.getElementById(
            "vehicleMileage"
        ).value.trim();


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (
        !registration ||
        !make ||
        !model ||
        !customerId ||
        !manufacturingYear ||
        !vehicleType ||
        !currentMileage
    ) {

        showToast(
            "Please fill in all vehicle fields.",
            "error"
        );

        return;

    }


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Adding Vehicle...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/vehicles",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        registration_no:
                            registration,

                        make:
                            make,

                        model:
                            model,

                        customer_id:
                            Number(customerId),

                        manufacturing_year:
                            Number(manufacturingYear),

                        vehicle_type:
                            vehicleType,

                        current_mileage:
                            Number(currentMileage)

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add vehicle"
            );

        }


        showToast(
            `Vehicle added successfully. ID: ${result.vehicle_id}`,
            "success"
        );


        // Reload vehicle table

        await loadVehiclesPage();


        // Update dashboard vehicle count

        await loadVehicleCount();


    } catch (error) {

        console.error(
            "Add vehicle error:",
            error
        );


        showToast(
            error.message ||
            "Failed to add vehicle.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Vehicle";

        }

    }

}

// =====================================================
// BOOKINGS PAGE
// =====================================================

async function loadBookingsPage() {

    showLoading(
        "bookingsTable",
        "Loading service booking records..."
    );

    try {

        const response =
            await fetch(
                "/api/oracle/bookings"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load service bookings"
            );
        }

        const bookings =
            await response.json();

        const container =
            document.getElementById(
                "bookingsTable"
            );

        let html = `

            <!-- BOOKING ACTION -->

            <div class="customer-actions">

                <button
                    class="add-button"
                    onclick="showAddBookingForm()"
                >
                    <span>+</span>
                    Add Service Booking
                </button>

            </div>


            <!-- ADD BOOKING FORM -->

            <div
                id="addBookingForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW RECORD
                        </span>

                        <h3>
                            Add New Service Booking
                        </h3>

                        <p>
                            Enter the service booking information below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addBooking(event)">

                    <div class="form-grid">


                        <!-- VEHICLE ID -->

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="bookingVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>


                        <!-- BOOKING DATE -->

                        <div class="form-group">

                            <label>
                                Booking Date
                            </label>

                            <input
                                type="date"
                                id="bookingDate"
                                required
                            >

                        </div>


                        <!-- SERVICE DATE -->

                        <div class="form-group">

                            <label>
                                Service Date
                            </label>

                            <input
                                type="date"
                                id="serviceDate"
                                required
                            >

                        </div>


                        <!-- SERVICE TYPE -->

                        <div class="form-group">

                            <label>
                                Service Type
                            </label>

                            <input
                                type="text"
                                id="bookingServiceType"
                                placeholder="e.g. Oil Change"
                                required
                            >

                        </div>


                        <!-- DESCRIPTION -->

                        <div class="form-group form-full">

                            <label>
                                Description
                            </label>

                            <textarea
                                id="bookingDescription"
                                placeholder="Enter service description..."
                                rows="4"
                                required
                            ></textarea>

                        </div>


                        <!-- BOOKING STATUS -->

                        <div class="form-group">

                            <label>
                                Booking Status
                            </label>

                            <select
                                id="bookingStatus"
                                required
                            >

                                <option value="">
                                    Select status
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Confirmed">
                                    Confirmed
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>


                    <!-- FORM BUTTONS -->

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Booking
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddBookingForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            <!-- SEARCH -->

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="bookingSearch"
                        class="search-input"
                        placeholder="Search service bookings..."
                        oninput="searchBookings()"
                    >

                </div>

            </div>


            <!-- BOOKINGS TABLE -->

            <div class="table-container">

                <table id="bookingsDataTable">

                    <thead>

                        <tr>

                            <th>Booking ID</th>
                            <th>Vehicle ID</th>
                            <th>Booking Date</th>
                            <th>Service Date</th>
                            <th>Service Type</th>
                            <th>Description</th>
                            <th>Booking Status</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        bookings.forEach(booking => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(booking[0])}
                    </td>

                    <td>
                        ${escapeHTML(booking[1])}
                    </td>

                    <td>
                        ${formatDate(booking[2])}
                    </td>

                    <td>
                        ${formatDate(booking[3])}
                    </td>

                    <td>
                        ${escapeHTML(booking[4] || "-")}
                    </td>

                    <td>
                        ${escapeHTML(booking[5] || "-")}
                    </td>

                    <td>
                        ${formatTableValue(
                            booking[6] || "-"
                        )}
                    </td>

                </tr>

            `;

        });


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );

        showError(
            "bookingsTable",
            "Unable to load service booking records."
        );

    }

}


// =====================================================
// SHOW ADD BOOKING FORM
// =====================================================

function showAddBookingForm() {

    const form =
        document.getElementById(
            "addBookingForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD BOOKING FORM
// =====================================================

function hideAddBookingForm() {

    const form =
        document.getElementById(
            "addBookingForm"
        );

    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================================
// BOOKING SEARCH
// =====================================================

function searchBookings() {

    const input =
        document.getElementById(
            "bookingSearch"
        );

    const table =
        document.getElementById(
            "bookingsDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();


    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";

        });

}


// =====================================================
// ADD BOOKING
// =====================================================

async function addBooking(event) {

    event.preventDefault();


    const vehicleId =
        document.getElementById(
            "bookingVehicleId"
        ).value.trim();


    const bookingDate =
        document.getElementById(
            "bookingDate"
        ).value;


    const serviceDate =
        document.getElementById(
            "serviceDate"
        ).value;


    const serviceType =
        document.getElementById(
            "bookingServiceType"
        ).value.trim();


    const description =
        document.getElementById(
            "bookingDescription"
        ).value.trim();


    const bookingStatus =
        document.getElementById(
            "bookingStatus"
        ).value;


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (
        !vehicleId ||
        !bookingDate ||
        !serviceDate ||
        !serviceType ||
        !description ||
        !bookingStatus
    ) {

        showToast(
            "Please fill in all booking fields.",
            "error"
        );

        return;

    }


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Adding Booking...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/bookings",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        vehicle_id:
                            Number(vehicleId),

                        booking_date:
                            bookingDate,

                        service_date:
                            serviceDate,

                        service_type:
                            serviceType,

                        description:
                            description,

                        booking_status:
                            bookingStatus

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add service booking"
            );

        }


        showToast(
            `Service booking added successfully. ID: ${result.booking_id}`,
            "success"
        );


        // Reload booking table

        await loadBookingsPage();


        // Update dashboard booking count

        await loadBookingCount();


    } catch (error) {

        console.error(
            "Add booking error:",
            error
        );


        showToast(
            error.message ||
            "Failed to add service booking.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Booking";

        }

    }

}
// =====================================================
// INVOICES & PAYMENTS
// =====================================================

async function loadInvoicesPage() {

    showLoading(
        "invoicesTable",
        "Loading invoice records..."
    );

    showLoading(
        "paymentsTable",
        "Loading payment records..."
    );

    try {

        const [
            invoiceResponse,
            paymentResponse
        ] = await Promise.all([

            fetch("/api/oracle/invoices"),
            fetch("/api/oracle/payments")

        ]);

        if (!invoiceResponse.ok) {
            throw new Error("Failed to load invoices");
        }

        if (!paymentResponse.ok) {
            throw new Error("Failed to load payments");
        }

        const invoices =
            await invoiceResponse.json();

        const payments =
            await paymentResponse.json();


        // =================================================
        // INVOICE SECTION
        // =================================================

        const invoiceContainer =
            document.getElementById("invoicesTable");

        let invoiceHTML = `

            <!-- ADD INVOICE BUTTON -->

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddInvoiceForm()"
                >
                    <span>+</span>
                    Add Invoice
                </button>

            </div>


            <!-- ADD INVOICE FORM -->

            <div
                id="addInvoiceForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW INVOICE
                        </span>

                        <h3>
                            Create New Invoice
                        </h3>

                        <p>
                            Enter the invoice details below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addInvoice(event)">

                    <div class="form-grid">


                        <!-- BOOKING ID -->

                        <div class="form-group">

                            <label>
                                Booking ID
                            </label>

                            <input
                                type="number"
                                id="invoiceBookingId"
                                placeholder="Enter booking ID"
                                min="1"
                                required
                            >

                        </div>


                        <!-- INVOICE DATE -->

                        <div class="form-group">

                            <label>
                                Invoice Date
                            </label>

                            <input
                                type="date"
                                id="invoiceDate"
                                required
                            >

                        </div>


                        <!-- SUBTOTAL -->

                        <div class="form-group">

                            <label>
                                Subtotal (LKR)
                            </label>

                            <input
                                type="number"
                                id="invoiceSubtotal"
                                placeholder="Enter subtotal"
                                min="0"
                                step="0.01"
                                oninput="calculateInvoiceTotal()"
                                required
                            >

                        </div>


                        <!-- TAX -->

                        <div class="form-group">

                            <label>
                                Tax (18%)
                            </label>

                            <input
                                type="text"
                                id="invoiceTax"
                                value="LKR 0.00"
                                readonly
                            >

                        </div>


                        <!-- TOTAL -->

                        <div class="form-group">

                            <label>
                                Total Amount
                            </label>

                            <input
                                type="text"
                                id="invoiceTotal"
                                value="LKR 0.00"
                                readonly
                            >

                        </div>


                        <!-- PAYMENT STATUS -->

                        <div class="form-group">

                            <label>
                                Payment Status
                            </label>

                            <select
                                id="invoicePaymentStatus"
                                required
                            >

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Unpaid">
                                    Unpaid
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Create Invoice
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddInvoiceForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            <!-- INVOICE SEARCH -->

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="invoiceSearch"
                        class="search-input"
                        placeholder="Search invoices..."
                        oninput="searchInvoices()"
                    >

                </div>

            </div>


            <!-- INVOICE TABLE -->

            <div class="table-container">

                <table id="invoicesDataTable">

                    <thead>

                        <tr>

                            <th>Invoice ID</th>
                            <th>Booking ID</th>
                            <th>Invoice Date</th>
                            <th>Subtotal</th>
                            <th>Tax</th>
                            <th>Total</th>
                            <th>Payment Status</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        invoices.forEach(invoice => {

            invoiceHTML += `

                <tr id="invoice-row-${invoice[0]}">

                    <td>
                        ${escapeHTML(invoice[0])}
                    </td>

                    <td>
                        ${escapeHTML(invoice[1])}
                    </td>

                    <td>
                        ${formatDate(invoice[2])}
                    </td>

                    <td>
                        ${formatMoney(invoice[3])}
                    </td>

                    <td>
                        ${formatMoney(invoice[4])}
                    </td>

                    <td>
                        ${formatMoney(invoice[5])}
                    </td>

                    <td>
                        ${formatTableValue(invoice[6])}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="edit-button"
                            onclick="printInvoiceById(${invoice[0]})"
                        >
                            🖨 Print
                        </button>

                    </td>

                </tr>

            `;

        });


        invoiceHTML += `

                    </tbody>

                </table>

            </div>

        `;


        invoiceContainer.innerHTML =
            invoiceHTML;


        // Set today's date

        const invoiceDate =
            document.getElementById(
                "invoiceDate"
            );

        if (invoiceDate) {

            invoiceDate.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }


        // =================================================
        // PAYMENT SECTION
        // =================================================

        const paymentContainer =
            document.getElementById("paymentsTable");

        const paymentRows =
            payments.map(payment => [

                payment[0],
                payment[1],
                formatDate(payment[2]),
                formatMoney(payment[3]),
                payment[4],
                payment[5]

            ]);

        const paymentTableHTML =
            createTable(

                [
                    "Payment ID",
                    "Invoice ID",
                    "Payment Date",
                    "Amount",
                    "Method",
                    "Status"
                ],

                paymentRows,

                "paymentsDataTable",
                "Search payments..."

            );

        paymentContainer.innerHTML = `

            <!-- ADD PAYMENT BUTTON -->

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddPaymentForm()"
                >
                    <span>+</span>
                    Add Payment
                </button>

            </div>


            <!-- ADD PAYMENT FORM -->

            <div
                id="addPaymentForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW PAYMENT
                        </span>

                        <h3>
                            Record New Payment
                        </h3>

                        <p>
                            Enter the payment details below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addPayment(event)">

                    <div class="form-grid">


                        <!-- INVOICE ID -->

                        <div class="form-group">

                            <label>
                                Invoice ID
                            </label>

                            <input
                                type="number"
                                id="paymentInvoiceId"
                                placeholder="Enter invoice ID"
                                min="1"
                                required
                            >

                        </div>


                        <!-- PAYMENT DATE -->

                        <div class="form-group">

                            <label>
                                Payment Date
                            </label>

                            <input
                                type="date"
                                id="paymentDate"
                                required
                            >

                        </div>


                        <!-- AMOUNT -->

                        <div class="form-group">

                            <label>
                                Amount (LKR)
                            </label>

                            <input
                                type="number"
                                id="paymentAmount"
                                placeholder="Enter amount"
                                min="0"
                                step="0.01"
                                required
                            >

                        </div>


                        <!-- PAYMENT METHOD -->

                        <div class="form-group">

                            <label>
                                Payment Method
                            </label>

                            <select
                                id="paymentMethod"
                                required
                            >

                                <option value="">
                                    Select method
                                </option>

                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="Card">
                                    Card
                                </option>

                                <option value="Bank Transfer">
                                    Bank Transfer
                                </option>

                                <option value="Online">
                                    Online
                                </option>

                            </select>

                        </div>


                        <!-- PAYMENT STATUS -->

                        <div class="form-group">

                            <label>
                                Payment Status
                            </label>

                            <select
                                id="paymentStatus"
                                required
                            >

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Failed">
                                    Failed
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Payment
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddPaymentForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            ${paymentTableHTML}

        `;


        // Set today's date for payment form

        const paymentDateInput =
            document.getElementById(
                "paymentDate"
            );

        if (paymentDateInput) {

            paymentDateInput.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }


    } catch (error) {

        console.error(
            "Invoice/payment loading error:",
            error
        );

        showError(
            "invoicesTable",
            "Unable to load invoice records."
        );

        showError(
            "paymentsTable",
            "Unable to load payment records."
        );

    }

}


// =====================================================
// SHOW ADD INVOICE FORM
// =====================================================

function showAddInvoiceForm() {

    const form =
        document.getElementById(
            "addInvoiceForm"
        );

    if (!form) {

        console.error(
            "addInvoiceForm was not found."
        );

        return;

    }

    form.style.display = "block";


    // Set today's date

    const dateInput =
        document.getElementById(
            "invoiceDate"
        );

    if (dateInput && !dateInput.value) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD INVOICE FORM
// =====================================================

function hideAddInvoiceForm() {

    const form =
        document.getElementById(
            "addInvoiceForm"
        );

    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================================
// CALCULATE INVOICE TOTAL
// =====================================================

function calculateInvoiceTotal() {

    const subtotalInput =
        document.getElementById(
            "invoiceSubtotal"
        );

    const taxInput =
        document.getElementById(
            "invoiceTax"
        );

    const totalInput =
        document.getElementById(
            "invoiceTotal"
        );


    if (
        !subtotalInput ||
        !taxInput ||
        !totalInput
    ) {

        return;

    }


    const subtotal =
        Number(subtotalInput.value) || 0;


    const tax =
        subtotal * 0.18;


    const total =
        subtotal + tax;


    taxInput.value =
        "LKR " +
        tax.toLocaleString(
            "en-LK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    totalInput.value =
        "LKR " +
        total.toLocaleString(
            "en-LK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// ADD INVOICE
// =====================================================

async function addInvoice(event) {

    event.preventDefault();


    const bookingId =
        document.getElementById(
            "invoiceBookingId"
        ).value.trim();


    const invoiceDate =
        document.getElementById(
            "invoiceDate"
        ).value;


    const subtotal =
        document.getElementById(
            "invoiceSubtotal"
        ).value;


    const paymentStatus =
        document.getElementById(
            "invoicePaymentStatus"
        ).value;


    if (
        !bookingId ||
        !invoiceDate ||
        subtotal === ""
    ) {

        showToast(
            "Please fill in all required invoice fields.",
            "error"
        );

        return;

    }


    if (Number(subtotal) < 0) {

        showToast(
            "Subtotal cannot be negative.",
            "error"
        );

        return;

    }


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Creating Invoice...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/invoices",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        booking_id:
                            Number(bookingId),

                        invoice_date:
                            invoiceDate,

                        subtotal:
                            Number(subtotal),

                        payment_status:
                            paymentStatus

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to create invoice"
            );

        }


        showToast(
            `Invoice added successfully. Invoice ID: ${result.invoice_id}`,
            "success"
        );


        await loadInvoicesPage();


        // Refresh dashboard counts

        await Promise.all([

            loadBookingCount(),

            loadDashboard()

        ]);


    } catch (error) {

        console.error(
            "Add invoice error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add invoice.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Create Invoice";

        }

    }

}


// =====================================================
// SEARCH INVOICES
// =====================================================

function searchInvoices() {

    const input =
        document.getElementById(
            "invoiceSearch"
        );

    const table =
        document.getElementById(
            "invoicesDataTable"
        );


    if (!input || !table) {
        return;
    }


    const value =
        input.value
            .toLowerCase()
            .trim();


    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";

        });

}


// =====================================================
// SHOW ADD PAYMENT FORM
// =====================================================

function showAddPaymentForm() {

    const form =
        document.getElementById(
            "addPaymentForm"
        );

    if (!form) {
        return;
    }

    form.style.display = "block";


    // Set today's date

    const dateInput =
        document.getElementById(
            "paymentDate"
        );

    if (dateInput && !dateInput.value) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD PAYMENT FORM
// =====================================================

function hideAddPaymentForm() {

    const form =
        document.getElementById(
            "addPaymentForm"
        );

    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================================
// ADD PAYMENT
// =====================================================

async function addPayment(event) {

    event.preventDefault();


    const invoiceId =
        document.getElementById(
            "paymentInvoiceId"
        ).value.trim();


    const paymentDate =
        document.getElementById(
            "paymentDate"
        ).value;


    const amount =
        document.getElementById(
            "paymentAmount"
        ).value;


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        ).value;


    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        ).value;


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (
        !invoiceId ||
        !paymentDate ||
        amount === "" ||
        !paymentMethod
    ) {

        showToast(
            "Please fill in all required payment fields.",
            "error"
        );

        return;

    }


    if (Number(amount) < 0) {

        showToast(
            "Amount cannot be negative.",
            "error"
        );

        return;

    }


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Adding Payment...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/payments",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        invoice_id:
                            Number(invoiceId),

                        payment_date:
                            paymentDate,

                        amount:
                            Number(amount),

                        payment_method:
                            paymentMethod,

                        payment_status:
                            paymentStatus

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add payment"
            );

        }


        showToast(
            `Payment added successfully. Payment ID: ${result.payment_id}`,
            "success"
        );


        await loadInvoicesPage();


    } catch (error) {

        console.error(
            "Add payment error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add payment.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Add Payment";

        }

    }

}


// =====================================================
// PRINT INVOICE - FIND INVOICE
// =====================================================

async function printInvoiceById(invoiceId) {

    try {

        const response =
            await fetch(
                "/api/oracle/invoices"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to retrieve invoice"
            );

        }


        const invoices =
            await response.json();


        const invoice =
            invoices.find(
                item =>
                    Number(item[0]) ===
                    Number(invoiceId)
            );


        if (!invoice) {

            showToast(
                "Invoice could not be found.",
                "error"
            );

            return;

        }


        printInvoice(

            invoice[0],
            invoice[1],
            invoice[2],
            invoice[3],
            invoice[4],
            invoice[5],
            invoice[6]

        );


    } catch (error) {

        console.error(
            "Print invoice error:",
            error
        );

        showToast(
            "Unable to print invoice.",
            "error"
        );

    }

}


// =====================================================
// PRINT INVOICE
// =====================================================

function printInvoice(
    invoiceId,
    bookingId,
    invoiceDate,
    subtotal,
    tax,
    total,
    paymentStatus
) {

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        showToast(
            "Please allow pop-ups to print the invoice.",
            "error"
        );

        return;

    }


    const formattedDate =
        formatDate(invoiceDate);


    const formattedSubtotal =
        formatMoney(subtotal);


    const formattedTax =
        formatMoney(tax);


    const formattedTotal =
        formatMoney(total);


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                AutoCare Invoice #${escapeHTML(invoiceId)}
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    margin: 0;

                    padding: 40px;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #1e293b;

                    background: white;

                }


                .invoice {

                    max-width: 800px;

                    margin: 0 auto;

                    border:
                        1px solid #dbe3ef;

                    padding: 45px;

                }


                .header {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        flex-start;

                    border-bottom:
                        3px solid #123b68;

                    padding-bottom: 25px;

                    margin-bottom: 30px;

                }


                .brand h1 {

                    margin: 0;

                    font-size: 32px;

                    color: #123b68;

                    letter-spacing: 1px;

                }


                .brand p {

                    margin-top: 6px;

                    color: #64748b;

                }


                .invoice-title {

                    text-align: right;

                }


                .invoice-title h2 {

                    margin: 0;

                    font-size: 26px;

                    color: #123b68;

                }


                .invoice-title p {

                    margin: 6px 0;

                }


                .details {

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 20px;

                    margin-bottom: 30px;

                }


                .detail-box {

                    background: #f8fafc;

                    padding: 18px;

                    border-radius: 8px;

                }


                .detail-box strong {

                    display: block;

                    color: #64748b;

                    font-size: 12px;

                    text-transform:
                        uppercase;

                    margin-bottom: 6px;

                }


                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 20px;

                }


                th {

                    text-align: left;

                    background: #123b68;

                    color: white;

                    padding: 13px;

                }


                td {

                    padding: 13px;

                    border-bottom:
                        1px solid #e2e8f0;

                }


                .amount {

                    text-align: right;

                }


                .totals {

                    width: 300px;

                    margin-left: auto;

                    margin-top: 25px;

                }


                .total-row {

                    display: flex;

                    justify-content:
                        space-between;

                    padding: 8px 0;

                }


                .grand-total {

                    border-top:
                        2px solid #123b68;

                    margin-top: 8px;

                    padding-top: 12px;

                    font-size: 20px;

                    font-weight: bold;

                    color: #123b68;

                }


                .status {

                    display: inline-block;

                    padding: 6px 12px;

                    border-radius: 20px;

                    background: #e2e8f0;

                }


                .footer {

                    margin-top: 50px;

                    padding-top: 20px;

                    border-top:
                        1px solid #e2e8f0;

                    text-align: center;

                    color: #64748b;

                    font-size: 13px;

                }


                @media print {

                    body {
                        padding: 0;
                    }

                    .invoice {
                        border: none;
                    }

                }

            </style>

        </head>


        <body>

            <div class="invoice">


                <div class="header">

                    <div class="brand">

                        <h1>
                            AUTOCARE
                        </h1>

                        <p>
                            Vehicle Service Management
                        </p>

                    </div>


                    <div class="invoice-title">

                        <h2>
                            INVOICE
                        </h2>

                        <p>
                            #${escapeHTML(invoiceId)}
                        </p>

                    </div>

                </div>


                <div class="details">


                    <div class="detail-box">

                        <strong>
                            Invoice Date
                        </strong>

                        ${escapeHTML(formattedDate)}

                    </div>


                    <div class="detail-box">

                        <strong>
                            Booking ID
                        </strong>

                        ${escapeHTML(bookingId)}

                    </div>


                    <div class="detail-box">

                        <strong>
                            Payment Status
                        </strong>

                        <span class="status">

                            ${escapeHTML(
                                paymentStatus
                            )}

                        </span>

                    </div>


                    <div class="detail-box">

                        <strong>
                            Invoice ID
                        </strong>

                        #${escapeHTML(invoiceId)}

                    </div>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                Description
                            </th>

                            <th class="amount">
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr>

                            <td>
                                Vehicle Service
                            </td>

                            <td class="amount">
                                ${escapeHTML(
                                    formattedSubtotal
                                )}
                            </td>

                        </tr>

                    </tbody>

                </table>


                <div class="totals">


                    <div class="total-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${escapeHTML(
                                formattedSubtotal
                            )}
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            Tax (18%)
                        </span>

                        <strong>
                            ${escapeHTML(
                                formattedTax
                            )}
                        </strong>

                    </div>


                    <div class="total-row grand-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${escapeHTML(
                                formattedTotal
                            )}
                        </strong>

                    </div>

                </div>


                <div class="footer">

                    <strong>
                        Thank you for choosing AutoCare.
                    </strong>

                    <br>

                    We appreciate your business.

                </div>


            </div>


            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>


        </body>

        </html>

    `);


    printWindow.document.close();

}
// =====================================================
// SPARE PARTS PAGE
// =====================================================

async function loadSparePartsPage() {

    showLoading(
        "sparePartsTable",
        "Loading inventory..."
    );

    try {

        const response =
            await fetch(
                "/api/oracle/spare-parts"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load spare parts"
            );
        }

        const parts =
            await response.json();

        const container =
            document.getElementById(
                "sparePartsTable"
            );

        let html = `

            <!-- SPARE PART ACTION -->

            <div class="customer-actions">

                <button
                    class="add-button"
                    onclick="showAddSparePartForm()"
                >
                    <span>+</span>
                    Add Spare Part
                </button>

            </div>


            <!-- ADD SPARE PART FORM -->

            <div
                id="addSparePartForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW RECORD
                        </span>

                        <h3>
                            Add New Spare Part
                        </h3>

                        <p>
                            Enter the spare part information below.
                        </p>

                    </div>

                </div>


                <form onsubmit="addSparePart(event)">

                    <div class="form-grid">


                        <!-- PART NAME -->

                        <div class="form-group">

                            <label>
                                Part Name
                            </label>

                            <input
                                type="text"
                                id="partName"
                                placeholder="e.g. Brake Pad"
                                required
                            >

                        </div>


                        <!-- CATEGORY -->

                        <div class="form-group">

                            <label>
                                Category
                            </label>

                            <input
                                type="text"
                                id="partCategory"
                                placeholder="e.g. Brakes"
                            >

                        </div>


                        <!-- UNIT PRICE -->

                        <div class="form-group">

                            <label>
                                Unit Price (LKR)
                            </label>

                            <input
                                type="number"
                                id="partUnitPrice"
                                placeholder="Enter unit price"
                                min="0"
                                step="0.01"
                                required
                            >

                        </div>


                        <!-- QUANTITY IN STOCK -->

                        <div class="form-group">

                            <label>
                                Quantity In Stock
                            </label>

                            <input
                                type="number"
                                id="partQuantityInStock"
                                placeholder="Enter stock quantity"
                                min="0"
                                required
                            >

                        </div>


                        <!-- REORDER LEVEL -->

                        <div class="form-group">

                            <label>
                                Reorder Level
                            </label>

                            <input
                                type="number"
                                id="partReorderLevel"
                                placeholder="Enter reorder level"
                                min="0"
                            >

                        </div>


                        <!-- SUPPLIER -->

                        <div class="form-group">

                            <label>
                                Supplier
                            </label>

                            <input
                                type="text"
                                id="partSupplier"
                                placeholder="Enter supplier name"
                            >

                        </div>

                    </div>


                    <!-- FORM BUTTONS -->

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Spare Part
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddSparePartForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            <!-- SEARCH -->

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="sparePartSearch"
                        class="search-input"
                        placeholder="Search spare parts..."
                        oninput="searchSpareParts()"
                    >

                </div>

            </div>


            <!-- SPARE PARTS TABLE -->

            <div class="table-container">

                <table id="sparePartsDataTable">

                    <thead>

                        <tr>

                            <th>Part ID</th>
                            <th>Part Name</th>
                            <th>Category</th>
                            <th>Unit Price</th>
                            <th>Stock</th>
                            <th>Reorder Level</th>
                            <th>Supplier</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        parts.forEach(part => {

            html += `

                <tr id="part-row-${part[0]}">

                    <td>
                        ${escapeHTML(part[0])}
                    </td>

                    <td>
                        ${escapeHTML(part[1])}
                    </td>

                    <td>
                        ${escapeHTML(part[2] || "-")}
                    </td>

                    <td>
                        ${formatMoney(part[3])}
                    </td>

                    <td id="part-stock-${part[0]}">
                        ${escapeHTML(part[4])}
                    </td>

                    <td>
                        ${escapeHTML(part[5] ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(part[6] || "-")}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="showIssueForm(${part[0]}, ${toInlineJavaScriptString(part[1])}, ${Number(part[4])})"
                        >
                            📤 Issue
                        </button>

                    </td>

                </tr>

            `;

        });


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Spare parts page error:",
            error
        );

        showError(
            "sparePartsTable",
            "Unable to load spare parts."
        );

    }

}


// =====================================================
// SHOW ADD SPARE PART FORM
// =====================================================

function showAddSparePartForm() {

    const form =
        document.getElementById(
            "addSparePartForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}


// =====================================================
// HIDE ADD SPARE PART FORM
// =====================================================

function hideAddSparePartForm() {

    const form =
        document.getElementById(
            "addSparePartForm"
        );

    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================================
// SPARE PART SEARCH
// =====================================================

function searchSpareParts() {

    const input =
        document.getElementById(
            "sparePartSearch"
        );

    const table =
        document.getElementById(
            "sparePartsDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();


    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";

        });

}


// =====================================================
// ADD SPARE PART
// =====================================================

async function addSparePart(event) {

    event.preventDefault();


    const partName =
        document.getElementById(
            "partName"
        ).value.trim();


    const category =
        document.getElementById(
            "partCategory"
        ).value.trim();


    const unitPrice =
        document.getElementById(
            "partUnitPrice"
        ).value;


    const quantityInStock =
        document.getElementById(
            "partQuantityInStock"
        ).value;


    const reorderLevel =
        document.getElementById(
            "partReorderLevel"
        ).value.trim();


    const supplier =
        document.getElementById(
            "partSupplier"
        ).value.trim();


    const submitButton =
        event.target.querySelector(
            ".save-button"
        );


    if (
        !partName ||
        unitPrice === "" ||
        quantityInStock === ""
    ) {

        showToast(
            "Please fill in part name, unit price and stock quantity.",
            "error"
        );

        return;

    }


    if (
        Number(unitPrice) < 0 ||
        Number(quantityInStock) < 0
    ) {

        showToast(
            "Unit price and stock cannot be negative.",
            "error"
        );

        return;

    }


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Adding Spare Part...";

    }


    try {

        const response =
            await fetch(
                "/api/oracle/spare-parts",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        part_name:
                            partName,

                        category:
                            category || null,

                        unit_price:
                            Number(unitPrice),

                        quantity_in_stock:
                            Number(quantityInStock),

                        reorder_level:
                            reorderLevel !== ""
                                ? Number(reorderLevel)
                                : null,

                        supplier:
                            supplier || null

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to add spare part"
            );

        }


        showToast(
            `Spare part added successfully. ID: ${result.part_id}`,
            "success"
        );


        // Reload spare parts table

        await loadSparePartsPage();


    } catch (error) {

        console.error(
            "Add spare part error:",
            error
        );


        showToast(
            error.message ||
            "Failed to add spare part.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Spare Part";

        }

    }

}


// =====================================================
// SHOW ISSUE FORM
// =====================================================

function showIssueForm(partId, partName, currentStock) {

    const row =
        document.getElementById(
            `part-row-${partId}`
        );

    if (!row) {
        return;
    }

    const actionCell =
        row.querySelector("td:last-child");

    actionCell.innerHTML = `

        <div class="issue-inline">

            <input
                type="number"
                id="issue-qty-${partId}"
                min="1"
                max="${currentStock}"
                placeholder="Qty"
                style="width:70px; padding:6px; border:1px solid #d1d5db; border-radius:6px; margin-right:6px;"
            >

            <button
                class="save-edit-button"
                onclick="confirmIssue(${partId}, ${currentStock})"
            >
                ✓
            </button>

            <button
                class="cancel-edit-button"
                onclick="loadSparePartsPage()"
            >
                ✕
            </button>

        </div>

    `;

}


// =====================================================
// CONFIRM ISSUE (REDUCE STOCK)
// =====================================================

async function confirmIssue(partId, currentStock) {

    const input =
        document.getElementById(
            `issue-qty-${partId}`
        );

    if (!input) {
        return;
    }

    const quantity =
        Number(input.value);

    if (!quantity || quantity <= 0) {

        showToast(
            "Enter a valid quantity.",
            "error"
        );

        return;

    }

    if (quantity > currentStock) {

        showToast(
            `Only ${currentStock} in stock.`,
            "error"
        );

        return;

    }

    const remainingStock =
        currentStock - quantity;

    try {

        const response =
            await fetch(
                `/api/oracle/spare-parts/${partId}/issue`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        quantity
                    })

                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to issue spare part"
            );

        }

        const stockCell =
            document.getElementById(
                `part-stock-${partId}`
            );

        if (stockCell) {
            stockCell.textContent =
                String(remainingStock);
        }

        const row =
            document.getElementById(
                `part-row-${partId}`
            );

        if (row) {
            const actionCell =
                row.querySelector(
                    "td:last-child"
                );

            if (actionCell) {
                actionCell.innerHTML = `
                    <button
                        class="edit-button"
                        onclick="showIssueForm(${partId}, ${toInlineJavaScriptString(partName)}, ${remainingStock})"
                    >
                        📤 Issue
                    </button>
                `;
            }
        }

        showToast(
            `${quantity} unit(s) issued successfully.`,
            "success"
        );

        await loadSparePartsPage();

    } catch (error) {

        console.error(
            "Issue spare part error:",
            error
        );

        showToast(
            error.message ||
            "Failed to issue spare part.",
            "error"
        );

    }

}


// =====================================================
// JOB CARDS
// =====================================================

async function loadJobCardsPage() {

    showLoading(
        "jobCardsFullTable",
        "Loading job cards..."
    );

    try {

        const response =
            await fetch(
                "/api/mongo/job-cards"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load job cards"
            );
        }

        const cards =
            await response.json();

        const container =
            document.getElementById(
                "jobCardsFullTable"
            );

        let html = `

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddJobCardForm()"
                >
                    <span>+</span>
                    Add Job Card
                </button>

            </div>

            <div
                id="addJobCardForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW JOB CARD
                        </span>

                        <h3>
                            Add New Job Card
                        </h3>

                        <p>
                            Enter the service details below.
                        </p>

                    </div>

                </div>

                <form onsubmit="addJobCard(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                Customer ID
                            </label>

                            <input
                                type="number"
                                id="jobCardCustomerId"
                                placeholder="Enter customer ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="jobCardVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Registration Number
                            </label>

                            <input
                                type="text"
                                id="jobCardRegistration"
                                placeholder="WP CAB-1234"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Service Type
                            </label>

                            <input
                                type="text"
                                id="jobCardServiceType"
                                placeholder="e.g. Oil Change"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Technician Name
                            </label>

                            <input
                                type="text"
                                id="jobCardTechnicianName"
                                placeholder="Enter technician name"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Status
                            </label>

                            <select id="jobCardStatus" required>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="On Hold">On Hold</option>
                            </select>

                        </div>

                        <div class="form-group form-full">

                            <label>
                                Service Notes
                            </label>

                            <textarea
                                id="jobCardNotes"
                                rows="4"
                                placeholder="Enter job card details or service notes..."
                            ></textarea>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Job Card
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddJobCardForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="jobCardsSearch"
                        class="search-input"
                        placeholder="Search job cards..."
                        oninput="searchJobCards()"
                    >

                </div>

            </div>

            <div class="table-container">

                <table id="jobCardsDataTable">

                    <thead>

                        <tr>
                            <th>Job Card</th>
                            <th>Customer ID</th>
                            <th>Vehicle ID</th>
                            <th>Registration</th>
                            <th>Service</th>
                            <th>Technician</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        cards.forEach(card => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(card.job_card_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(card.customer_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(card.vehicle_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(card.vehicle?.registration_no || card.registration_no || "-")}
                    </td>

                    <td>
                        ${escapeHTML(card.service_type || "-")}
                    </td>

                    <td>
                        ${escapeHTML(card.technician?.name || card.technician_name || "-")}
                    </td>

                    <td>
                        ${formatTableValue(card.status || "-")}
                    </td>

                    <td>
                        <button
                            class="edit-button"
                            onclick="openTechnicianNoteFormForJobCard(${Number(card.job_card_id) || 0}, ${Number(card.vehicle_id) || 0}, ${toInlineJavaScriptString(card.technician?.name || card.technician_name || '')})"
                        >
                            📝 Add Note
                        </button>
                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        showError(
            "jobCardsFullTable",
            "Unable to load job cards."
        );

    }

}

function showAddJobCardForm() {

    const form =
        document.getElementById(
            "addJobCardForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}

function hideAddJobCardForm() {

    const form =
        document.getElementById(
            "addJobCardForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}

function searchJobCards() {

    const input =
        document.getElementById(
            "jobCardsSearch"
        );

    const table =
        document.getElementById(
            "jobCardsDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {
            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";
        });

}

async function addJobCard(event) {

    event.preventDefault();

    const customerId =
        document.getElementById(
            "jobCardCustomerId"
        ).value.trim();

    const vehicleId =
        document.getElementById(
            "jobCardVehicleId"
        ).value.trim();

    const registrationNo =
        document.getElementById(
            "jobCardRegistration"
        ).value.trim();

    const serviceType =
        document.getElementById(
            "jobCardServiceType"
        ).value.trim();

    const technicianName =
        document.getElementById(
            "jobCardTechnicianName"
        ).value.trim();

    const status =
        document.getElementById(
            "jobCardStatus"
        ).value;

    const notes =
        document.getElementById(
            "jobCardNotes"
        ).value.trim();

    if (
        !customerId ||
        !vehicleId ||
        !serviceType ||
        !technicianName
    ) {

        showToast(
            "Please fill in all required job card fields.",
            "error"
        );

        return;

    }

    const submitButton =
        event.target.querySelector(
            ".save-button"
        );

    if (submitButton) {
        submitButton.disabled =
            true;
        submitButton.textContent =
            "Adding Job Card...";
    }

    try {

        const response =
            await fetch(
                "/api/mongo/job-cards",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        customer_id:
                            Number(customerId),
                        vehicle_id:
                            Number(vehicleId),
                        registration_no:
                            registrationNo || null,
                        service_type:
                            serviceType,
                        technician_name:
                            technicianName,
                        status:
                            status || "Open",
                        notes:
                            notes || ""
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to add job card"
            );
        }

        showToast(
            `Job card added successfully. ID: ${result.job_card_id}`,
            "success"
        );

        hideAddJobCardForm();
        await loadJobCardsPage();
        await loadJobCardCount();

    } catch (error) {

        console.error(
            "Add job card error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add job card.",
            "error"
        );

    } finally {

        const submitButton =
            document.querySelector(
                "#addJobCardForm .save-button"
            );

        if (submitButton) {
            submitButton.disabled =
                false;
            submitButton.textContent =
                "Add Job Card";
        }

    }

}


function syncTechnicianNoteFields(selectedJobCardId) {

    const jobCardSelect =
        document.getElementById(
            "technicianNoteJobCardId"
        );

    const vehicleInput =
        document.getElementById(
            "technicianNoteVehicleId"
        );

    const technicianInput =
        document.getElementById(
            "technicianNoteName"
        );

    if (!jobCardSelect || !vehicleInput || !technicianInput) {
        return;
    }

    const selectedId =
        selectedJobCardId !== undefined
            ? selectedJobCardId
            : jobCardSelect.value;

    const jobCards =
        window.__jobCardsCatalog || [];

    const matchingCard =
        jobCards.find(card =>
            String(card.job_card_id) === String(selectedId)
        );

    if (matchingCard) {

        vehicleInput.value =
            matchingCard.vehicle_id ?? "";

        technicianInput.value =
            matchingCard.technician?.name ||
            matchingCard.technician_name ||
            "";

    } else if (!selectedId) {

        vehicleInput.value = "";
        technicianInput.value = "";

    }

}

async function openTechnicianNoteFormForJobCard(jobCardId, vehicleId, technicianName) {

    if (!jobCardId) {
        return;
    }

    showPage(
        "technicianNotesPage",
        "Technician Notes",
        "Manage technician notes",
        document.querySelector(
            '.nav-item[onclick*="technicianNotesPage"]'
        )
    );

    await loadTechnicianNotesPage();

    setTimeout(() => {

        const jobCardSelect =
            document.getElementById(
                "technicianNoteJobCardId"
            );

        if (jobCardSelect) {
            jobCardSelect.value =
                String(jobCardId);
        }

        syncTechnicianNoteFields(jobCardId);

        if (vehicleId) {
            const vehicleInput =
                document.getElementById(
                    "technicianNoteVehicleId"
                );

            if (vehicleInput) {
                vehicleInput.value =
                    String(vehicleId);
            }
        }

        if (technicianName) {
            const technicianInput =
                document.getElementById(
                    "technicianNoteName"
                );

            if (technicianInput) {
                technicianInput.value =
                    String(technicianName);
            }
        }

        showAddTechnicianNoteForm();

    }, 150);

}

// =====================================================
// TECHNICIAN NOTES
// =====================================================

async function loadTechnicianNotesPage() {

    showLoading(
        "technicianNotesTable",
        "Loading technician notes..."
    );

    try {

        const [notesResponse, jobCardsResponse] =
            await Promise.all([
                fetch("/api/mongo/technician-notes"),
                fetch("/api/mongo/job-cards")
            ]);

        if (!notesResponse.ok) {
            throw new Error(
                "Failed to load technician notes"
            );
        }

        const notes =
            await notesResponse.json();

        const jobCards =
            jobCardsResponse.ok
                ? await jobCardsResponse.json()
                : [];

        window.__jobCardsCatalog =
            jobCards;

        const container =
            document.getElementById(
                "technicianNotesTable"
            );

        const jobCardOptions =
            jobCards.length > 0
                ? jobCards.map(card => `
                    <option value="${card.job_card_id}">
                        #${card.job_card_id} - ${escapeHTML(card.service_type || "Service")} (${escapeHTML(card.vehicle_id ?? "-")})
                    </option>
                `).join("")
                : `
                    <option value="">
                        No job cards available
                    </option>
                `;

        let html = `

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddTechnicianNoteForm()"
                >
                    <span>+</span>
                    Add Technician Note
                </button>

            </div>

            <div
                id="addTechnicianNoteForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW NOTE
                        </span>

                        <h3>
                            Add Technician Note
                        </h3>

                        <p>
                            Enter service observations and recommendations.
                        </p>

                    </div>

                </div>

                <form onsubmit="addTechnicianNote(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                Job Card ID
                            </label>

                            <select
                                id="technicianNoteJobCardId"
                                onchange="syncTechnicianNoteFields()"
                                required
                            >
                                <option value="">
                                    Select job card
                                </option>
                                ${jobCardOptions}
                            </select>

                        </div>

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="technicianNoteVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Technician Name
                            </label>

                            <input
                                type="text"
                                id="technicianNoteName"
                                placeholder="Enter technician name"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Note Type
                            </label>

                            <input
                                type="text"
                                id="technicianNoteType"
                                placeholder="Inspection Observation"
                                required
                            >

                        </div>

                        <div class="form-group form-full">

                            <label>
                                Notes
                            </label>

                            <textarea
                                id="technicianNoteText"
                                rows="4"
                                placeholder="Describe the issue, repair, or observation..."
                                required
                            ></textarea>

                        </div>

                        <div class="form-group form-full">

                            <label>
                                Recommendations
                            </label>

                            <input
                                type="text"
                                id="technicianNoteRecommendations"
                                placeholder="e.g. Replace rotor, check brake fluid"
                            >

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Note
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddTechnicianNoteForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="technicianNotesSearch"
                        class="search-input"
                        placeholder="Search technician notes..."
                        oninput="searchTechnicianNotes()"
                    >

                </div>

            </div>

            <div class="table-container">

                <table id="technicianNotesDataTable">

                    <thead>

                        <tr>
                            <th>Note ID</th>
                            <th>Job Card</th>
                            <th>Vehicle</th>
                            <th>Technician</th>
                            <th>Type</th>
                            <th>Notes</th>
                            <th>Recommendations</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        notes.forEach(note => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(note.note_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(note.job_card_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(note.vehicle_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(note.technician?.name || note.technician_name || "-")}
                    </td>

                    <td>
                        ${escapeHTML(note.note_type || "-")}
                    </td>

                    <td>
                        ${escapeHTML(note.notes || note.note_text || "-")}
                    </td>

                    <td>
                        ${escapeHTML(
                            Array.isArray(note.recommendations)
                                ? note.recommendations.join(", ")
                                : note.recommendations || "-"
                        )}
                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        showError(
            "technicianNotesTable",
            "Unable to load technician notes."
        );

    }

}

function showAddTechnicianNoteForm() {

    const form =
        document.getElementById(
            "addTechnicianNoteForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}

function hideAddTechnicianNoteForm() {

    const form =
        document.getElementById(
            "addTechnicianNoteForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}

function searchTechnicianNotes() {

    const input =
        document.getElementById(
            "technicianNotesSearch"
        );

    const table =
        document.getElementById(
            "technicianNotesDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {
            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";
        });

}

async function addTechnicianNote(event) {

    event.preventDefault();

    const jobCardId =
        document.getElementById(
            "technicianNoteJobCardId"
        ).value.trim();

    const vehicleId =
        document.getElementById(
            "technicianNoteVehicleId"
        ).value.trim();

    const technicianName =
        document.getElementById(
            "technicianNoteName"
        ).value.trim();

    const noteType =
        document.getElementById(
            "technicianNoteType"
        ).value.trim();

    const noteText =
        document.getElementById(
            "technicianNoteText"
        ).value.trim();

    const recommendations =
        document.getElementById(
            "technicianNoteRecommendations"
        ).value.trim();

    if (
        !jobCardId ||
        !vehicleId ||
        !technicianName ||
        !noteType ||
        !noteText
    ) {

        showToast(
            "Please fill in all required technician note fields.",
            "error"
        );

        return;

    }

    const submitButton =
        event.target.querySelector(
            ".save-button"
        );

    if (submitButton) {
        submitButton.disabled =
            true;
        submitButton.textContent =
            "Adding Note...";
    }

    try {

        const response =
            await fetch(
                "/api/mongo/technician-notes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        job_card_id:
                            Number(jobCardId),
                        vehicle_id:
                            Number(vehicleId),
                        technician_name:
                            technicianName,
                        note_type:
                            noteType,
                        note_text:
                            noteText,
                        recommendations:
                            recommendations
                                ? recommendations
                                    .split(",")
                                    .map(item => item.trim())
                                    .filter(Boolean)
                                : []
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to add technician note"
            );
        }

        showToast(
            `Technician note added successfully. ID: ${result.note_id}`,
            "success"
        );

        hideAddTechnicianNoteForm();
        await loadTechnicianNotesPage();

    } catch (error) {

        console.error(
            "Add technician note error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add technician note.",
            "error"
        );

    } finally {

        const submitButton =
            document.querySelector(
                "#addTechnicianNoteForm .save-button"
            );

        if (submitButton) {
            submitButton.disabled =
                false;
            submitButton.textContent =
                "Add Note";
        }

    }

}


// =====================================================
// SERVICE HISTORY
// =====================================================

async function loadServiceHistoryPage() {

    showLoading(
        "serviceHistoryTable",
        "Loading service history..."
    );

    try {

        const response =
            await fetch(
                "/api/mongo/service-history"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load service history"
            );
        }

        const history =
            await response.json();

        const container =
            document.getElementById(
                "serviceHistoryTable"
            );

        let html = `

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddServiceHistoryForm()"
                >
                    <span>+</span>
                    Add Service History
                </button>

            </div>

            <div
                id="addServiceHistoryForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW SERVICE HISTORY
                        </span>

                        <h3>
                            Add Service History Record
                        </h3>

                        <p>
                            Enter the completed service record below.
                        </p>

                    </div>

                </div>

                <form onsubmit="addServiceHistory(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="serviceHistoryVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Booking ID
                            </label>

                            <input
                                type="number"
                                id="serviceHistoryBookingId"
                                placeholder="Enter booking ID"
                                min="1"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Service Date
                            </label>

                            <input
                                type="date"
                                id="serviceHistoryDate"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Service Type
                            </label>

                            <input
                                type="text"
                                id="serviceHistoryServiceType"
                                placeholder="e.g. Oil Change"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Technician Name
                            </label>

                            <input
                                type="text"
                                id="serviceHistoryTechnician"
                                placeholder="Enter technician name"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Mileage
                            </label>

                            <input
                                type="number"
                                id="serviceHistoryMileage"
                                placeholder="Enter mileage"
                                min="0"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Status
                            </label>

                            <select id="serviceHistoryStatus" required>
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Service History
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddServiceHistoryForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="serviceHistorySearch"
                        class="search-input"
                        placeholder="Search service history..."
                        oninput="searchServiceHistory()"
                    >

                </div>

            </div>

            <div class="table-container">

                <table id="serviceHistoryDataTable">

                    <thead>

                        <tr>
                            <th>History ID</th>
                            <th>Vehicle</th>
                            <th>Booking</th>
                            <th>Service Date</th>
                            <th>Service Type</th>
                            <th>Status</th>
                            <th>Mileage</th>
                            <th>Technician</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        history.forEach(item => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(item.history_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.vehicle_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.booking_id ?? "-")}
                    </td>

                    <td>
                        ${formatDate(item.service_date)}
                    </td>

                    <td>
                        ${escapeHTML(item.service_type || "-")}
                    </td>

                    <td>
                        ${formatTableValue(item.status || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.mileage ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.technician?.name || item.technician_name || "-")}
                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML = html;

        const dateInput =
            document.getElementById(
                "serviceHistoryDate"
            );

        if (dateInput && !dateInput.value) {
            dateInput.value =
                new Date()
                    .toISOString()
                    .split("T")[0];
        }

    } catch (error) {

        console.error(error);

        showError(
            "serviceHistoryTable",
            "Unable to load service history."
        );

    }

}

function showAddServiceHistoryForm() {

    const form =
        document.getElementById(
            "addServiceHistoryForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);

}

function hideAddServiceHistoryForm() {

    const form =
        document.getElementById(
            "addServiceHistoryForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}

function searchServiceHistory() {

    const input =
        document.getElementById(
            "serviceHistorySearch"
        );

    const table =
        document.getElementById(
            "serviceHistoryDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {
            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";
        });

}

async function addServiceHistory(event) {

    event.preventDefault();

    const vehicleId =
        document.getElementById(
            "serviceHistoryVehicleId"
        ).value.trim();

    const bookingId =
        document.getElementById(
            "serviceHistoryBookingId"
        ).value.trim();

    const serviceDate =
        document.getElementById(
            "serviceHistoryDate"
        ).value;

    const serviceType =
        document.getElementById(
            "serviceHistoryServiceType"
        ).value.trim();

    const technicianName =
        document.getElementById(
            "serviceHistoryTechnician"
        ).value.trim();

    const mileage =
        document.getElementById(
            "serviceHistoryMileage"
        ).value.trim();

    const status =
        document.getElementById(
            "serviceHistoryStatus"
        ).value;

    if (
        !vehicleId ||
        !serviceDate ||
        !serviceType ||
        !technicianName
    ) {

        showToast(
            "Please fill in all required service history fields.",
            "error"
        );

        return;

    }

    const submitButton =
        event.target.querySelector(
            ".save-button"
        );

    if (submitButton) {
        submitButton.disabled =
            true;
        submitButton.textContent =
            "Adding Record...";
    }

    try {

        const response =
            await fetch(
                "/api/mongo/service-history",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        vehicle_id:
                            Number(vehicleId),
                        booking_id:
                            bookingId ? Number(bookingId) : null,
                        service_date:
                            serviceDate,
                        service_type:
                            serviceType,
                        status:
                            status || "Completed",
                        mileage:
                            mileage !== ""
                                ? Number(mileage)
                                : null,
                        technician_name:
                            technicianName
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to add service history"
            );
        }

        showToast(
            `Service history added successfully. ID: ${result.history_id}`,
            "success"
        );

        hideAddServiceHistoryForm();
        await loadServiceHistoryPage();

    } catch (error) {

        console.error(
            "Add service history error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add service history.",
            "error"
        );

    } finally {

        const submitButton =
            document.querySelector(
                "#addServiceHistoryForm .save-button"
            );

        if (submitButton) {
            submitButton.disabled =
                false;
            submitButton.textContent =
                "Add Service History";
        }

    }

}


// =====================================================
// COMPLAINTS
// =====================================================

async function loadComplaintsPage() {

    showLoading(
        "complaintsTable",
        "Loading customer feedback..."
    );

    try {

        const response =
            await fetch(
                "/api/mongo/complaints"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load complaints"
            );
        }

        const complaints =
            await response.json();

        const container =
            document.getElementById(
                "complaintsTable"
            );

        let html = `

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddComplaintForm()"
                >
                    <span>+</span>
                    Add Complaint
                </button>

            </div>

            <div
                id="addComplaintForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW COMPLAINT
                        </span>

                        <h3>
                            Add Customer Complaint
                        </h3>

                        <p>
                            Enter the complaint details below.
                        </p>

                    </div>

                </div>

                <form onsubmit="addComplaint(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                Customer ID
                            </label>

                            <input
                                type="number"
                                id="complaintCustomerId"
                                placeholder="Enter customer ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="complaintVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Complaint Type
                            </label>

                            <select id="complaintType" required>
                                <option value="">Select type</option>
                                <option value="Service">Service</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Quality">Quality</option>
                                <option value="Safety">Safety</option>
                                <option value="Other">Other</option>
                            </select>

                        </div>

                        <div class="form-group">

                            <label>
                                Priority
                            </label>

                            <select id="complaintPriority" required>
                                <option value="Low">Low</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>

                        </div>

                        <div class="form-group">

                            <label>
                                Rating
                            </label>

                            <input
                                type="number"
                                id="complaintRating"
                                placeholder="1-5"
                                min="1"
                                max="5"
                                step="1"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Status
                            </label>

                            <select id="complaintStatus" required>
                                <option value="Open" selected>Open</option>
                                <option value="In Review">In Review</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>

                        </div>

                        <div class="form-group form-group-full">

                            <label>
                                Description
                            </label>

                            <textarea
                                id="complaintDescription"
                                rows="4"
                                placeholder="Describe the issue or concern"
                                required
                            ></textarea>

                        </div>

                        <div class="form-group form-group-full">

                            <label>
                                Resolution / Notes
                            </label>

                            <textarea
                                id="complaintResolution"
                                rows="3"
                                placeholder="Add resolution notes if available"
                            ></textarea>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Complaint
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddComplaintForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="complaintSearch"
                        class="search-input"
                        placeholder="Search complaints..."
                        oninput="searchComplaints()"
                    >

                </div>

            </div>

            <div class="table-container">

                <table id="complaintsDataTable">

                    <thead>

                        <tr>
                            <th>Feedback ID</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Rating</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Resolution</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        complaints.forEach(item => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(item.feedback_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.customer_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.vehicle_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.feedback_type || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.description || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.rating ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.priority || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.status || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.resolution || "-")}
                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        showError(
            "complaintsTable",
            "Unable to load complaints."
        );

    }

}

function showAddComplaintForm() {

    const form =
        document.getElementById(
            "addComplaintForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 50);

}

function hideAddComplaintForm() {

    const form =
        document.getElementById(
            "addComplaintForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}

function searchComplaints() {

    const input =
        document.getElementById(
            "complaintSearch"
        );

    const table =
        document.getElementById(
            "complaintsDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {
            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";
        });

}

async function addComplaint(event) {

    event.preventDefault();

    const customerId =
        document.getElementById(
            "complaintCustomerId"
        ).value.trim();

    const vehicleId =
        document.getElementById(
            "complaintVehicleId"
        ).value.trim();

    const feedbackType =
        document.getElementById(
            "complaintType"
        ).value;

    const priority =
        document.getElementById(
            "complaintPriority"
        ).value;

    const rating =
        document.getElementById(
            "complaintRating"
        ).value.trim();

    const status =
        document.getElementById(
            "complaintStatus"
        ).value;

    const description =
        document.getElementById(
            "complaintDescription"
        ).value.trim();

    const resolution =
        document.getElementById(
            "complaintResolution"
        ).value.trim();

    if (
        !customerId ||
        !vehicleId ||
        !feedbackType ||
        !description
    ) {

        showToast(
            "Please fill in the required complaint fields.",
            "error"
        );

        return;

    }

    const submitButton =
        event.target.querySelector(
            ".save-button"
        );

    if (submitButton) {
        submitButton.disabled =
            true;
        submitButton.textContent =
            "Adding Complaint...";
    }

    try {

        const response =
            await fetch(
                "/api/mongo/complaints",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        customer_id:
                            Number(customerId),
                        vehicle_id:
                            Number(vehicleId),
                        feedback_type:
                            feedbackType,
                        description,
                        rating:
                            rating !== "" ? Number(rating) : null,
                        priority,
                        status,
                        resolution: resolution || ""
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to add complaint"
            );
        }

        showToast(
            `Complaint added successfully. ID: ${result.feedback_id}`,
            "success"
        );

        hideAddComplaintForm();
        await loadComplaintsPage();

    } catch (error) {

        console.error(
            "Add complaint error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add complaint.",
            "error"
        );

    } finally {

        const submitButton =
            document.querySelector(
                "#addComplaintForm .save-button"
            );

        if (submitButton) {
            submitButton.disabled =
                false;
            submitButton.textContent =
                "Add Complaint";
        }

    }

}


// =====================================================
// DIAGNOSTICS
// =====================================================

async function loadDiagnosticsPage() {

    showLoading(
        "diagnosticsTable",
        "Loading diagnostic records..."
    );

    try {

        const response =
            await fetch(
                "/api/mongo/diagnostics"
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load diagnostics"
            );
        }

        const diagnostics =
            await response.json();

        const container =
            document.getElementById(
                "diagnosticsTable"
            );

        let html = `

            <div class="customer-actions">

                <button
                    type="button"
                    class="add-button"
                    onclick="showAddDiagnosticForm()"
                >
                    <span>+</span>
                    Add Diagnostic
                </button>

            </div>

            <div
                id="addDiagnosticForm"
                class="add-form"
                style="display:none;"
            >

                <div class="form-header">

                    <div>

                        <span class="eyebrow">
                            NEW DIAGNOSTIC
                        </span>

                        <h3>
                            Add Diagnostic Record
                        </h3>

                        <p>
                            Enter the diagnostic scan details below.
                        </p>

                    </div>

                </div>

                <form onsubmit="addDiagnostic(event)">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>
                                Vehicle ID
                            </label>

                            <input
                                type="number"
                                id="diagnosticVehicleId"
                                placeholder="Enter vehicle ID"
                                min="1"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Booking ID
                            </label>

                            <input
                                type="number"
                                id="diagnosticBookingId"
                                placeholder="Enter booking ID"
                                min="1"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Diagnostic Date
                            </label>

                            <input
                                type="date"
                                id="diagnosticDate"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Diagnostic Tool
                            </label>

                            <input
                                type="text"
                                id="diagnosticTool"
                                placeholder="e.g. OBD-II Scanner"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Overall Result
                            </label>

                            <select id="diagnosticResult" required>
                                <option value="Normal">Normal</option>
                                <option value="Warning">Warning</option>
                                <option value="Error">Error</option>
                                <option value="Critical">Critical</option>
                            </select>

                        </div>

                        <div class="form-group">

                            <label>
                                Mileage
                            </label>

                            <input
                                type="number"
                                id="diagnosticMileage"
                                placeholder="Enter mileage"
                                min="0"
                            >

                        </div>

                        <div class="form-group form-group-full">

                            <label>
                                Fault Codes
                            </label>

                            <textarea
                                id="diagnosticFaultCodes"
                                rows="3"
                                placeholder="Enter fault codes (comma-separated or one per line)"
                            ></textarea>

                        </div>

                        <div class="form-group form-group-full">

                            <label>
                                Recommendations
                            </label>

                            <textarea
                                id="diagnosticRecommendations"
                                rows="3"
                                placeholder="Enter recommendations for repairs or maintenance"
                            ></textarea>

                        </div>

                    </div>

                    <div class="form-actions">

                        <button
                            type="submit"
                            class="save-button"
                        >
                            Add Diagnostic
                        </button>

                        <button
                            type="button"
                            class="cancel-button"
                            onclick="hideAddDiagnosticForm()"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

            <div class="table-toolbar">

                <div class="search-wrapper">

                    <span class="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="diagnosticSearch"
                        class="search-input"
                        placeholder="Search diagnostics..."
                        oninput="searchDiagnostics()"
                    >

                </div>

            </div>

            <div class="table-container">

                <table id="diagnosticsDataTable">

                    <thead>

                        <tr>
                            <th>Diagnostic ID</th>
                            <th>Vehicle</th>
                            <th>Booking</th>
                            <th>Date</th>
                            <th>Tool</th>
                            <th>Result</th>
                            <th>Fault Codes</th>
                            <th>Recommendations</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        diagnostics.forEach(item => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(item.diagnostic_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.vehicle_id ?? "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.booking_id ?? "-")}
                    </td>

                    <td>
                        ${formatDate(item.diagnostic_date)}
                    </td>

                    <td>
                        ${escapeHTML(item.diagnostic_tool || "-")}
                    </td>

                    <td>
                        ${formatTableValue(item.overall_result || "-")}
                    </td>

                    <td>
                        ${escapeHTML((item.fault_codes || []).map(f => f.code || f).join(", ") || "-")}
                    </td>

                    <td>
                        ${escapeHTML((item.recommendations || []).join(", ") || "-")}
                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML = html;

        const dateInput =
            document.getElementById(
                "diagnosticDate"
            );

        if (dateInput && !dateInput.value) {
            dateInput.value =
                new Date()
                    .toISOString()
                    .split("T")[0];
        }

    } catch (error) {

        console.error(error);

        showError(
            "diagnosticsTable",
            "Unable to load diagnostic records."
        );

    }

}

function showAddDiagnosticForm() {

    const form =
        document.getElementById(
            "addDiagnosticForm"
        );

    if (!form) {
        return;
    }

    form.style.display =
        "block";

    setTimeout(() => {
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 50);

}

function hideAddDiagnosticForm() {

    const form =
        document.getElementById(
            "addDiagnosticForm"
        );

    if (form) {
        form.style.display =
            "none";
    }

}

function searchDiagnostics() {

    const input =
        document.getElementById(
            "diagnosticSearch"
        );

    const table =
        document.getElementById(
            "diagnosticsDataTable"
        );

    if (!input || !table) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    table
        .querySelectorAll("tbody tr")
        .forEach(row => {
            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                        ? ""
                        : "none";
        });

}

async function addDiagnostic(event) {

    event.preventDefault();

    const vehicleId =
        document.getElementById(
            "diagnosticVehicleId"
        ).value.trim();

    const bookingId =
        document.getElementById(
            "diagnosticBookingId"
        ).value.trim();

    const diagnosticDate =
        document.getElementById(
            "diagnosticDate"
        ).value;

    const diagnosticTool =
        document.getElementById(
            "diagnosticTool"
        ).value.trim();

    const overallResult =
        document.getElementById(
            "diagnosticResult"
        ).value;

    const mileage =
        document.getElementById(
            "diagnosticMileage"
        ).value.trim();

    const faultCodesInput =
        document.getElementById(
            "diagnosticFaultCodes"
        ).value.trim();

    const recommendationsInput =
        document.getElementById(
            "diagnosticRecommendations"
        ).value.trim();

    if (
        !vehicleId ||
        !diagnosticDate ||
        !diagnosticTool
    ) {

        showToast(
            "Please fill in all required diagnostic fields.",
            "error"
        );

        return;

    }

    const faultCodes = faultCodesInput
        .split(/[,\n]/)
        .map(code => code.trim())
        .filter(code => code.length > 0)
        .map(code => ({ code }));

    const recommendations =
        recommendationsInput
            .split(/\n/)
            .map(rec => rec.trim())
            .filter(rec => rec.length > 0);

    const submitButton =
        event.target.querySelector(
            ".save-button"
        );

    if (submitButton) {
        submitButton.disabled =
            true;
        submitButton.textContent =
            "Adding Diagnostic...";
    }

    try {

        const response =
            await fetch(
                "/api/mongo/diagnostics",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        vehicle_id:
                            Number(vehicleId),
                        booking_id:
                            bookingId ? Number(bookingId) : null,
                        diagnostic_date:
                            diagnosticDate,
                        diagnostic_tool:
                            diagnosticTool,
                        overall_result:
                            overallResult,
                        mileage:
                            mileage !== ""
                                ? Number(mileage)
                                : null,
                        fault_codes:
                            faultCodes,
                        recommendations:
                            recommendations
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to add diagnostic"
            );
        }

        showToast(
            `Diagnostic added successfully. ID: ${result.diagnostic_id}`,
            "success"
        );

        hideAddDiagnosticForm();
        await loadDiagnosticsPage();

    } catch (error) {

        console.error(
            "Add diagnostic error:",
            error
        );

        showToast(
            error.message ||
            "Failed to add diagnostic.",
            "error"
        );

    } finally {

        const submitButton =
            document.querySelector(
                "#addDiagnosticForm .save-button"
            );

        if (submitButton) {
            submitButton.disabled =
                false;
            submitButton.textContent =
                "Add Diagnostic";
        }

    }

}


// =====================================================
// DATE FORMATTER
// =====================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    try {

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-LK",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch {

        return String(value);

    }

}


// =====================================================
// MONEY FORMATTER
// =====================================================

function formatMoney(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const number =
        Number(value);

    if (isNaN(number)) {
        return String(value);
    }

    return "LKR " +
        number.toLocaleString(
            "en-LK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// TOAST NOTIFICATION
// =====================================================

function showToast(
    message,
    type = "success"
) {

    const existingToast =
        document.querySelector(
            ".autocare-toast"
        );

    if (existingToast) {
        existingToast.remove();
    }

    const toast =
        document.createElement("div");

    toast.className =
        `autocare-toast ${type}`;

    toast.innerHTML = `

        <div class="toast-icon">
            ${type === "success" ? "✓" : "!"}
        </div>

        <div class="toast-content">

            <strong>
                ${type === "success"
                    ? "Success"
                    : "Error"}
            </strong>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>

        <button
            class="toast-close"
            onclick="this.parentElement.remove()"
        >
            ×
        </button>

    `;

    document.body.appendChild(toast);


    setTimeout(() => {

        toast.classList.add("show");

    }, 20);


    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            if (toast.parentElement) {
                toast.remove();
            }

        }, 300);

    }, 4000);

}


// =====================================================
// MOBILE SIDEBAR
// =====================================================

function setupMobileMenu() {

    const mobileMenu =
        document.querySelector(
            ".mobile-menu"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!mobileMenu || !sidebar) {
        return;
    }

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    document.querySelectorAll(
        ".nav-item"
    ).forEach(item => {

        item.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 750
                ) {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                }

            }
        );

    });

}


// =====================================================
// LOGIN / AUTH
// =====================================================

const AUTH_STORAGE_KEY =
    "autocare-authenticated";

function isAuthenticated() {

    return (
        localStorage.getItem(
            AUTH_STORAGE_KEY
        ) === "true" ||
        sessionStorage.getItem(
            AUTH_STORAGE_KEY
        ) === "true"
    );

}

function showLoginScreen() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const appShell =
        document.getElementById(
            "appShell"
        );

    if (loginScreen) {
        loginScreen.style.display =
            "flex";
    }

    if (appShell) {
        appShell.style.display =
            "none";
    }

}

function showApplicationScreen() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const appShell =
        document.getElementById(
            "appShell"
        );

    if (loginScreen) {
        loginScreen.style.display =
            "none";
    }

    if (appShell) {
        appShell.style.display =
            "flex";
    }

}

function handleLoginSubmit(event) {

    event.preventDefault();

    const usernameInput =
        document.getElementById(
            "username"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    const rememberInput =
        document.getElementById(
            "rememberMe"
        );

    if (!usernameInput || !passwordInput) {
        return;
    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();

    const validUsername =
        username === "admin";

    const validPassword =
        password === "admin123";

    if (!validUsername || !validPassword) {

        showToast(
            "Invalid username or password.",
            "error"
        );

        return;

    }

    const authStorage = rememberInput?.checked
        ? localStorage
        : sessionStorage;
    const otherStorage = rememberInput?.checked
        ? sessionStorage
        : localStorage;

    otherStorage.removeItem(AUTH_STORAGE_KEY);
    authStorage.setItem(
        AUTH_STORAGE_KEY,
        "true"
    );

    showApplicationScreen();

    document.querySelectorAll(
        ".page"
    ).forEach(page => {
        page.style.display = "none";
    });

    const dashboard =
        document.getElementById(
            "dashboardPage"
        );

    if (dashboard) {
        dashboard.style.display =
            "block";
    }

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    const pageSubtitle =
        document.getElementById(
            "pageSubtitle"
        );

    if (pageTitle) {
        pageTitle.textContent =
            "Dashboard";
    }

    if (pageSubtitle) {
        pageSubtitle.textContent =
            "Vehicle Service Management System";
    }

    document.querySelectorAll(
        ".nav-item"
    ).forEach(item => {
        item.classList.remove(
            "active"
        );
    });

    const activeNavItem =
        document.querySelector(
            '.nav-item[onclick*="dashboardPage"]'
        );

    if (activeNavItem) {
        activeNavItem.classList.add(
            "active"
        );
    }

    setupMobileMenu();
    loadDashboard();

    showToast(
        "Login successful.",
        "success"
    );

}

function handleLogout() {

    localStorage.removeItem(
        AUTH_STORAGE_KEY
    );

    sessionStorage.removeItem(
        AUTH_STORAGE_KEY
    );

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    if (loginForm) {
        loginForm.reset();
    }

    showLoginScreen();

}

// =====================================================
// INITIALIZE APPLICATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                handleLoginSubmit
            );
        }

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                handleLogout
            );
        }

        document.querySelectorAll(
            ".page"
        ).forEach(page => {

            page.style.display =
                "none";

        });

        if (isAuthenticated()) {
            showApplicationScreen();

            const dashboard =
                document.getElementById(
                    "dashboardPage"
                );

            if (dashboard) {
                dashboard.style.display =
                    "block";
            }

            loadDashboard();
            return;
        }

        showLoginScreen();

    }
);