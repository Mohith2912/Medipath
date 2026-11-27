-- ====================================================================
-- MediPath Healthcare ERP - MySQL Production Database Schema
-- Version: 1.0.0
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `medipath` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medipath`;

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS `patients` (
  `id` VARCHAR(32) NOT NULL,
  `mrn` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(128) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other',
  `date_of_birth` DATE NULL,
  `phone` VARCHAR(32) NULL,
  `email` VARCHAR(128) NULL,
  `blood_group` VARCHAR(8) NULL,
  `allergies` TEXT NULL,
  `status` ENUM('Active', 'In Consultation', 'Pending Review', 'Discharged') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Clinicians / Doctors & Staff Table
CREATE TABLE IF NOT EXISTS `clinicians` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `specialty` VARCHAR(128) NOT NULL,
  `initials` VARCHAR(8) NOT NULL,
  `role` ENUM('Doctor', 'Nurse', 'Admin', 'Receptionist', 'Specialist') NOT NULL DEFAULT 'Doctor',
  `department` VARCHAR(64) NOT NULL DEFAULT 'Outpatient',
  `email` VARCHAR(128) NULL,
  `phone` VARCHAR(32) NULL,
  `status` ENUM('On Duty', 'Available', 'In Session', 'Off Duty') NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(32) NOT NULL,
  `patient_id` VARCHAR(32) NOT NULL,
  `patient_name` VARCHAR(128) NOT NULL,
  `clinician_id` VARCHAR(32) NOT NULL,
  `clinician_name` VARCHAR(128) NOT NULL,
  `service` VARCHAR(128) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` VARCHAR(16) NOT NULL,
  `status` ENUM('Awaiting confirmation', 'Confirmed', 'Checked in', 'In consultation', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Awaiting confirmation',
  `type` ENUM('pending', 'confirmed', 'arrived', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_clinician` (`clinician_id`),
  KEY `idx_date` (`appointment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Consultation Queue Table
CREATE TABLE IF NOT EXISTS `queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(32) NOT NULL UNIQUE,
  `patient_id` VARCHAR(32) NOT NULL,
  `patient_name` VARCHAR(128) NOT NULL,
  `service` VARCHAR(128) NOT NULL,
  `arrival_time` VARCHAR(16) NOT NULL,
  `status` ENUM('Waiting', 'In consultation', 'Completed') NOT NULL DEFAULT 'Waiting',
  `kind` ENUM('pending', 'confirmed', 'completed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Payments & Billing Ledger Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(32) NOT NULL,
  `patient_id` VARCHAR(32) NOT NULL,
  `patient_name` VARCHAR(128) NOT NULL,
  `service` VARCHAR(128) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `method` ENUM('Cash', 'Card', 'UPI', 'Insurance', 'Pending') NOT NULL DEFAULT 'Pending',
  `status` ENUM('Due', 'Paid', 'Refunded', 'Cancelled') NOT NULL DEFAULT 'Due',
  `kind` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  `payment_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patient_pmt` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Clinic Services Table
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'Available',
  `kind` ENUM('current', 'stale', 'unavailable', 'not-offered') NOT NULL DEFAULT 'current',
  `responsible_owner` VARCHAR(128) NOT NULL DEFAULT 'Clinical Staff',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Follow-up Tasks Table
CREATE TABLE IF NOT EXISTS `followups` (
  `id` VARCHAR(32) NOT NULL,
  `patient_id` VARCHAR(32) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `detail` TEXT NOT NULL,
  `due_date` VARCHAR(64) NOT NULL,
  `status` ENUM('Open', 'In Review', 'Completed') NOT NULL DEFAULT 'Open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- Initial Seed Records for Production Setup
-- ====================================================================

INSERT IGNORE INTO `clinicians` (`id`, `name`, `specialty`, `initials`, `role`, `department`, `status`) VALUES
('DOC-01', 'Dr. Maya Chen', 'General Medicine', 'MC', 'Doctor', 'Outpatient', 'Available'),
('DOC-02', 'Dr. Arjun Rao', 'Family Medicine', 'AR', 'Doctor', 'Outpatient', 'Available'),
('DOC-03', 'Dr. Leena Patel', 'Cardiology', 'LP', 'Doctor', 'Cardiology Clinic', 'Available');

INSERT IGNORE INTO `patients` (`id`, `mrn`, `full_name`, `gender`, `blood_group`, `allergies`, `status`) VALUES
('PT-1001', 'MRN-92041', 'Elena Rostova', 'Female', 'O+', 'Penicillin (Moderate rash)', 'Active'),
('PT-1002', 'MRN-84102', 'Marcus Vance', 'Male', 'A+', 'No known drug allergies (NKDA)', 'Active'),
('PT-1003', 'MRN-77319', 'Aaliyah Khan', 'Female', 'B+', 'Sulfa antibiotics', 'Active'),
('PT-1004', 'MRN-62184', 'David Kim', 'Male', 'O-', 'Latex sensitivity', 'Active'),
('PT-1005', 'MRN-51092', 'Samantha Ward', 'Female', 'AB+', 'No known allergies', 'Active');

INSERT IGNORE INTO `services` (`name`, `category`, `status`, `kind`, `responsible_owner`) VALUES
('General consultation', 'Primary Care', 'Active', 'current', 'Clinical staff'),
('Nursing vitals & review', 'Nursing Desk', 'Active', 'current', 'Nursing desk'),
('Cardiology evaluation', 'Specialist', 'Active', 'current', 'Cardiology team'),
('Blood pressure review', 'Routine Care', 'Active', 'current', 'Nursing desk');
