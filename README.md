# Lawyer Firm Management System

A comprehensive web-based management system for law firms built with PHP and MySQL. This system allows efficient management of clients, lawyers, cases, bookings, and payments with a modern, responsive interface.

**Created by:** lawyer_firm BINTE MUHAMMAD | ID: 2320315  
**Course:** Database Management System (DBMS) Project

## 🚀 Features

### Core Functionality
- **Client Management**: Register clients with unique email validation
- **Lawyer Management**: Manage lawyer profiles and specializations
- **Case Management**: Track legal cases with fees and status updates
- **Booking System**: Smart appointment scheduling with conflict prevention
- **Payment Processing**: Handle payments with multiple status tracking
- **Report Generation**: Generate printable appointment slips and payment invoices

### Advanced Features
- **Smart Booking Rules**: 
  - Maximum 8 appointments per lawyer per day
  - No time slot conflicts
  - Automatic case activation on booking
- **Email Verification**: Client verification before booking/payment
- **JOIN Queries**: Complex database queries for comprehensive reports
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Real-time Statistics**: Dashboard with live data visualization

## 📋 System Requirements

- **Web Server**: Apache (XAMPP recommended)
- **PHP**: Version 7.4 or higher
- **MySQL**: Version 5.7 or higher
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠 Installation Instructions

### Step 1: Setup XAMPP
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache and MySQL services from XAMPP Control Panel

### Step 2: Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import the database:
   - Create a new database named `lawyer_firm`
   - Import `database.sql` file or run the SQL commands manually

### Step 3: File Setup
1. Copy all project files to `c:\xampp\htdocs\lawyer_firm\`
2. Ensure the following file structure:
```
lawyer_firm/
├── config.php          # Database configuration
├── header.php          # Common header template
├── footer.php          # Common footer template
├── index.php           # Home page
├── clients.php         # Client management
├── lawyers.php         # Lawyer management  
├── cases.php           # Case management
├── bookings.php        # Booking management
├── payments.php        # Payment management
├── report.php          # Report generation
├── report_template.php # Printable report template
├── database.sql        # Database structure and sample data
└── README.md          # This file
```

### Step 4: Access the System
1. Open your web browser
2. Navigate to: `http://localhost/lawyer_firm/`
3. The system is ready to use!

## 📊 Database Schema

### Tables Structure

#### clients
- `client_id` (PK, AUTO_INCREMENT)
- `name` (VARCHAR)
- `phone` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `case_type` (VARCHAR)
- `created_at` (TIMESTAMP)

#### lawyers
- `lawyer_id` (PK, AUTO_INCREMENT)
- `name` (VARCHAR)
- `specialization` (VARCHAR)
- `phone` (VARCHAR)
- `email` (VARCHAR)
- `availability` (ENUM: Available, Busy, On Leave)
- `created_at` (TIMESTAMP)

#### cases
- `case_id` (PK, AUTO_INCREMENT)
- `case_title` (VARCHAR)
- `case_description` (TEXT)
- `case_fee` (DECIMAL)
- `case_status` (ENUM: Active, Closed)
- `created_at` (TIMESTAMP)

#### bookings
- `booking_id` (PK, AUTO_INCREMENT)
- `client_id` (FK → clients)
- `lawyer_id` (FK → lawyers)
- `case_id` (FK → cases)
- `date` (DATE)
- `time_slot` (TIME)
- `status` (ENUM: Pending, Confirmed, Completed, Cancelled)
- `created_at` (TIMESTAMP)

#### payments
- `payment_id` (PK, AUTO_INCREMENT)
- `booking_id` (FK → bookings)
- `amount` (DECIMAL)
- `method` (ENUM: Cash, Credit Card, Bank Transfer, Online)
- `status` (ENUM: Pending, Complete, Failed)
- `date` (TIMESTAMP)

## 🎯 Usage Guide

### 1. Client Management
- Add new clients with unique email addresses
- View, edit, and delete client records
- Email uniqueness validation prevents duplicates

### 2. Lawyer Management
- Register lawyers with specializations
- Manage availability status
- Track lawyer performance

### 3. Case Management
- Create cases with titles, descriptions, and fees
- Cases automatically become "Active" when booked
- Update case status to "Closed" when completed

### 4. Booking Process
1. **Verify Client**: Enter registered client email
2. **Select Lawyer**: Choose from available lawyers
3. **Select Case**: Pick case (shows fee)
4. **Choose Date/Time**: Select appointment slot
5. **Confirm Booking**: System checks conflicts and limits

### 5. Payment Processing
1. **Verify Client**: Enter client email to find bookings
2. **Select Booking**: Choose which appointment to pay for
3. **Choose Method**: Select payment method
4. **Process Payment**: System simulates payment (80% success rate)

### 6. Report Generation
- **Appointment Slips**: Printable confirmation with all details
- **Payment Invoices**: Professional invoices with transaction details
- Both reports use JOIN queries for comprehensive data

## 🔧 Code Features

### Security Features
- **Input Sanitization**: All user inputs are sanitized
- **SQL Injection Prevention**: PDO prepared statements
- **Email Validation**: Server-side and client-side validation
- **XSS Protection**: HTML special characters encoding

### Database Design
- **Foreign Key Constraints**: Maintain referential integrity
- **CASCADE Deletes**: Automatic cleanup of related records
- **UNIQUE Constraints**: Prevent duplicate emails
- **Proper Indexing**: Optimized query performance

### User Experience
- **Responsive Design**: Works on all device sizes
- **Real-time Feedback**: Success/error messages
- **Form Validation**: Client-side and server-side validation
- **Intuitive Navigation**: Clean, modern interface

## 📝 Sample Data

The system comes with pre-loaded sample data:
- 4 Sample lawyers with different specializations
- 5 Sample cases with various fees
- 3 Sample clients for testing

## 🚨 Important Business Rules

1. **Client Email Uniqueness**: Each client must have a unique email
2. **Booking Limits**: Maximum 8 bookings per lawyer per day
3. **Time Conflict Prevention**: No overlapping appointments
4. **Case Activation**: Cases become active when first booked
5. **Payment Verification**: Only verified clients can make payments
6. **Status Automation**: Payment success updates booking status

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Color Coding**: Status indicators with appropriate colors
- **Icons**: Font Awesome icons for visual clarity
- **Responsive Tables**: Mobile-friendly data display
- **Print-Ready Reports**: Professional document formatting

## 🔍 Technical Implementation

### PHP Features Used
- Object-Oriented Programming concepts
- PDO for database connectivity
- Session management for user workflow
- Form handling and validation
- Error handling and logging

### MySQL Features Used
- Complex JOIN queries
- Foreign key relationships
- ENUM data types for controlled values
- AUTO_INCREMENT for primary keys
- UNIQUE constraints for data integrity

### Frontend Technologies
- Bootstrap 5 for responsive design
- Font Awesome for icons
- Custom CSS for enhanced styling
- JavaScript for client-side validation
- Print-friendly CSS for reports

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check XAMPP MySQL service is running
   - Verify database credentials in `config.php`
   - Ensure `lawyer_firm` database exists

2. **Page Not Loading**
   - Verify Apache service is running
   - Check file paths and permissions
   - Ensure all files are in correct directory

3. **Foreign Key Errors**
   - Import database schema in correct order
   - Check referential integrity
   - Verify sample data relationships

## 📧 Support

For technical support or questions about this project:
- **Developer**: lawyer_firm BINTE MUHAMMAD
- **Student ID**: 2320315
- **Course**: Database Management System

## 📄 License

This project is created for educational purposes as part of a DBMS course. All rights reserved by the developer.

---

**Note**: This is a demonstration system created for academic purposes. In a production environment, additional security measures and error handling would be implemented.
