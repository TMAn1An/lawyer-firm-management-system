-- LAWYER FIRM MANAGEMENT SYSTEM DATABASE
-- lawyer_firm BINTE MUHAMMAD | ID: 2320315

-- Create Database
CREATE DATABASE IF NOT EXISTS lawyer_firm;
USE lawyer_firm;

-- Create Clients Table
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Lawyers Table
CREATE TABLE lawyers (
    lawyer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    availability ENUM('Available', 'Busy', 'On Leave') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cases Table
CREATE TABLE cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    case_title VARCHAR(200) NOT NULL,
    case_description TEXT NOT NULL,
    case_fee DECIMAL(10,2) NOT NULL,
    case_status ENUM('Active', 'Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bookings Table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    case_id INT NOT NULL,
    date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (lawyer_id, date, time_slot)
);

-- Create Payments Table
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('Cash', 'Credit Card', 'Bank Transfer', 'Online') NOT NULL,
    status ENUM('Pending', 'Complete', 'Failed') DEFAULT 'Pending',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Insert Sample Data for Testing

-- Sample Lawyers
INSERT INTO lawyers (name, specialization, phone, email, availability) VALUES
('John Smith', 'Criminal Law', '555-0101', 'john.smith@lawfirm.com', 'Available'),
('Sarah Johnson', 'Family Law', '555-0102', 'sarah.johnson@lawfirm.com', 'Available'),
('Michael Brown', 'Corporate Law', '555-0103', 'michael.brown@lawfirm.com', 'Available'),
('Emily Davis', 'Civil Rights', '555-0104', 'emily.davis@lawfirm.com', 'Available');

-- Sample Cases
INSERT INTO cases (case_title, case_description, case_fee, case_status) VALUES
('Divorce Consultation', 'Initial consultation for divorce proceedings', 150.00, 'Active'),
('Criminal Defense', 'Defense against criminal charges', 500.00, 'Active'),
('Business Contract Review', 'Review and analysis of business contracts', 300.00, 'Active'),
('Personal Injury Claim', 'Compensation claim for personal injury', 400.00, 'Active'),
('Property Dispute', 'Resolution of property ownership disputes', 350.00, 'Active');

-- Sample Clients
INSERT INTO clients (name, phone, email, case_type) VALUES
('Alice Wilson', '555-1001', 'alice.wilson@email.com', 'Family Law'),
('Bob Thompson', '555-1002', 'bob.thompson@email.com', 'Criminal Law'),
('Carol Martinez', '555-1003', 'carol.martinez@email.com', 'Corporate Law');
