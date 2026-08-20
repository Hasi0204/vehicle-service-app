use('VehicleServiceDB');

// Create Collections
db.createCollection('job_cards');
db.createCollection('customer_feedback');

// Seed Sample Data (linking to Oracle IDs)
db.job_cards.insertOne({
  oracle_booking_id: 1,
  oracle_vehicle_id: 1,
  technician_name: "Saman Perera",
  status: "In Progress",
  technician_notes: [
    { timestamp: new Date(), note: "Brake pads worn. Scheduled replacement." }
  ],
  diagnostic_summary: {
    battery_health: "88%",
    tire_pressure_psi: { FL: 32, FR: 32, RL: 30, RR: 30 }
  }
});

db.customer_feedback.insertOne({
  oracle_booking_id: 1,
  oracle_customer_id: 1,
  rating: 5,
  comments: "Fast service and clean workspace!",
  created_at: new Date()
});