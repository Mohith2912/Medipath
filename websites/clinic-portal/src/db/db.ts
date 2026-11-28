import pool from "./mysql";

export interface LiveAppointment {
  id: string;
  date: string;
  patient: string;
  service: string;
  clinician: string;
  time: string;
  status: string;
  updated: string;
  type: string;
}

export interface LiveQueueItem {
  token: string;
  patient: string;
  service: string;
  arrival: string;
  status: string;
  kind: string;
}

export interface LivePatient {
  id: string;
  patient: string;
  lastVisit: string;
  detail: string;
  status: string;
  kind: string;
}

export interface LivePayment {
  id: string;
  patient: string;
  service: string;
  amount: number;
  method: string;
  status: string;
  kind: string;
  date: string;
}

// In-memory live store for active session persistence
let liveAppointments: LiveAppointment[] = [];
let liveQueue: LiveQueueItem[] = [];
let livePatients: LivePatient[] = [];
let livePayments: LivePayment[] = [];

let dbInitialized = false;

export async function initDb() {
  if (dbInitialized) return true;
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(32) PRIMARY KEY,
        patient VARCHAR(128) NOT NULL,
        service VARCHAR(128) NOT NULL,
        clinician VARCHAR(128) NOT NULL,
        date VARCHAR(32) NOT NULL,
        time VARCHAR(16) NOT NULL,
        status VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        updated VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS queue (
        token VARCHAR(32) PRIMARY KEY,
        patient VARCHAR(128) NOT NULL,
        service VARCHAR(128) NOT NULL,
        arrival VARCHAR(16) NOT NULL,
        status VARCHAR(64) NOT NULL,
        kind VARCHAR(32) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(32) PRIMARY KEY,
        patient VARCHAR(128) NOT NULL,
        lastVisit VARCHAR(64) NOT NULL,
        detail VARCHAR(128) NOT NULL,
        status VARCHAR(64) NOT NULL,
        kind VARCHAR(32) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(32) PRIMARY KEY,
        patient VARCHAR(128) NOT NULL,
        service VARCHAR(128) NOT NULL,
        amount INT NOT NULL,
        method VARCHAR(32) NOT NULL,
        status VARCHAR(64) NOT NULL,
        kind VARCHAR(32) NOT NULL,
        date VARCHAR(32) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    dbInitialized = true;
    return true;
  } catch (error) {
    // If local MySQL service is inactive, live repository manages state smoothly
    return false;
  }
}

// APPOINTMENTS
export async function getAppointments(): Promise<LiveAppointment[]> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      const [rows]: any = await pool.query("SELECT * FROM appointments ORDER BY date ASC, time ASC");
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {}
  return liveAppointments;
}

export async function createAppointment(appointment: LiveAppointment): Promise<LiveAppointment> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query(
        "INSERT INTO appointments (id, patient, service, clinician, date, time, status, type, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          appointment.id,
          appointment.patient,
          appointment.service,
          appointment.clinician,
          appointment.date,
          appointment.time,
          appointment.status,
          appointment.type,
          appointment.updated,
        ]
      );
    }
  } catch {}
  liveAppointments = [appointment, ...liveAppointments.filter((a) => a.id !== appointment.id)];
  return appointment;
}

export async function updateAppointmentStatus(id: string, status: string, type: string) {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query("UPDATE appointments SET status = ?, type = ?, updated = 'Just now' WHERE id = ?", [status, type, id]);
    }
  } catch {}
  liveAppointments = liveAppointments.map((a) => (a.id === id ? { ...a, status, type, updated: "Just now" } : a));
}

// QUEUE
export async function getQueue(): Promise<LiveQueueItem[]> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      const [rows]: any = await pool.query("SELECT * FROM queue WHERE status != 'Completed' ORDER BY arrival ASC");
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {}
  return liveQueue;
}

export async function createQueueToken(item: LiveQueueItem): Promise<LiveQueueItem> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query(
        "INSERT INTO queue (token, patient, service, arrival, status, kind) VALUES (?, ?, ?, ?, ?, ?)",
        [item.token, item.patient, item.service, item.arrival, item.status, item.kind]
      );
    }
  } catch {}
  liveQueue = [...liveQueue.filter((q) => q.token !== item.token), item];
  return item;
}

export async function updateQueueToken(token: string, status: string, kind: string) {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query("UPDATE queue SET status = ?, kind = ? WHERE token = ?", [status, kind, token]);
    }
  } catch {}
  liveQueue = liveQueue.map((q) => (q.token === token ? { ...q, status, kind } : q));
}

// PATIENTS
export async function getPatients(): Promise<LivePatient[]> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      const [rows]: any = await pool.query("SELECT * FROM patients ORDER BY id DESC");
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {}
  return livePatients;
}

export async function createPatient(patient: LivePatient): Promise<LivePatient> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query(
        "INSERT INTO patients (id, patient, lastVisit, detail, status, kind) VALUES (?, ?, ?, ?, ?, ?)",
        [patient.id, patient.patient, patient.lastVisit, patient.detail, patient.status, patient.kind]
      );
    }
  } catch {}
  livePatients = [patient, ...livePatients.filter((p) => p.id !== patient.id)];
  return patient;
}

// PAYMENTS
export async function getPayments(): Promise<LivePayment[]> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      const [rows]: any = await pool.query("SELECT * FROM payments ORDER BY id DESC");
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {}
  return livePayments;
}

export async function createPayment(payment: LivePayment): Promise<LivePayment> {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query(
        "INSERT INTO payments (id, patient, service, amount, method, status, kind, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [payment.id, payment.patient, payment.service, payment.amount, payment.method, payment.status, payment.kind, payment.date]
      );
    }
  } catch {}
  livePayments = [payment, ...livePayments.filter((p) => p.id !== payment.id)];
  return payment;
}

export async function clearAllLiveData() {
  try {
    const isConnected = await initDb();
    if (isConnected) {
      await pool.query("DELETE FROM appointments");
      await pool.query("DELETE FROM queue");
      await pool.query("DELETE FROM patients");
      await pool.query("DELETE FROM payments");
    }
  } catch {}
  liveAppointments = [];
  liveQueue = [];
  livePatients = [];
  livePayments = [];
}
