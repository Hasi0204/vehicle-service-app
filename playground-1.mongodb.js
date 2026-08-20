use('VehicleServiceDB');

// 1. Create Job Cards Collection
db.createCollection('job_cards');
db.job_cards.insertMany([
  {
    oracle_booking_id: 1,
    oracle_vehicle_id: 1,
    technician_name: "Saman Perera",
    status: "In Progress",
    assigned_tasks: ["Brake Replacement", "Oil Change"],
    diagnostic_summary: {
      battery_health: "88%",
      dtc_codes: ["P0300"],
      tire_pressure_psi: { FL: 32, FR: 32, RL: 30, RR: 30 }
    },
    created_at: new Date()
  }
]);

// 2. Create Service Technician Notes Collection
db.createCollection('service_technician_notes');
db.service_technician_notes.insertMany([
  {
    oracle_booking_id: 1,
    technician_id: "TECH_102",
    note_type: "Inspection Observation",
    note_text: "Front left brake pad worn down to 15%. Replaced pad and resurfaced rotor.",
    timestamp: new Date()
  }
]);

// 3. Create Vehicle Service History Logs Collection
db.createCollection('vehicle_service_history_logs');
db.vehicle_service_history_logs.insertMany([
  {
    oracle_vehicle_id: 1,
    vin: "1HGCR2F83HA123456",
    mileage_km: 45200,
    services_performed: [
      { service_name: "Full Synthetic Oil Change", cost: 8500.00 },
      { service_name: "Brake Pad Set", cost: 4500.00 }
    ],
    service_date: new Date()
  }
]);

// 4. Create Customer Complaints & Feedback Collection
db.createCollection('customer_complaints_feedback');
db.customer_complaints_feedback.insertMany([
  {
    oracle_booking_id: 1,
    oracle_customer_id: 1,
    complaint_category: "Noise Issue",
    description: "Squeaking noise when applying brakes at low speeds.",
    feedback_rating: 5,
    customer_comments: "Service resolved the brake noise completely!",
    created_at: new Date()
  }
]);

