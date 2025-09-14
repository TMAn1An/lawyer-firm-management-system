<?php
// Database connection configuration
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

// Database credentials
$servername = "localhost";
$username = "root";  // Default XAMPP MySQL username
$password = "";      // Default XAMPP MySQL password (empty)
$dbname = "lawyer_firm";

try {
    // Create connection using PDO for better security
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set charset to UTF8 to handle special characters
    $conn->exec("set names utf8");
    
} catch(PDOException $e) {
    // If connection fails, show error message
    die("Connection failed: " . $e->getMessage());
}

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);           // Remove whitespace
    $data = stripslashes($data);   // Remove backslashes
    $data = htmlspecialchars($data); // Convert special characters
    return $data;
}

// Function to validate email format
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to automatically cancel unpaid bookings after 10 minutes
function cancelExpiredBookings($connection) {
    try {
        // Find bookings that are still pending and created more than 10 minutes ago without payment
        $expiredBookingsQuery = "
            SELECT b.booking_id, c.name as client_name, l.name as lawyer_name
            FROM bookings b 
            LEFT JOIN payments p ON b.booking_id = p.booking_id 
            LEFT JOIN clients c ON b.client_id = c.client_id
            LEFT JOIN lawyers l ON b.lawyer_id = l.lawyer_id
            WHERE b.status = 'Pending' 
            AND b.created_at <= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            AND p.payment_id IS NULL
        ";
        
        $stmt = $connection->prepare($expiredBookingsQuery);
        $stmt->execute();
        $expiredBookings = $stmt->fetchAll();
        
        if (!empty($expiredBookings)) {
            // Cancel expired bookings
            $bookingIds = array_column($expiredBookings, 'booking_id');
            $cancelQuery = "
                UPDATE bookings 
                SET status = 'Cancelled' 
                WHERE booking_id IN (" . implode(',', array_fill(0, count($bookingIds), '?')) . ")
            ";
            
            $cancelStmt = $connection->prepare($cancelQuery);
            $cancelStmt->execute($bookingIds);
            
            return $expiredBookings; // Return details of cancelled bookings
        }
        
        return [];
    } catch(PDOException $e) {
        error_log("Error cancelling expired bookings: " . $e->getMessage());
        return [];
    }
}
?>
