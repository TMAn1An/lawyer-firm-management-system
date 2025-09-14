<?php
// Reports Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Reports & Documents - Lawyer Firm Management System';

// Cancel expired bookings (bookings without payment after 10 minutes)
$cancelledBookings = cancelExpiredBookings($conn);
if (!empty($cancelledBookings)) {
    $messages = [];
    foreach ($cancelledBookings as $booking) {
        $messages[] = "Booking #{$booking['booking_id']} for {$booking['client_name']} with {$booking['lawyer_name']} has been cancelled due to non-payment within 10 minutes.";
    }
    $_SESSION['info_message'] = implode("<br>", $messages);
}

// Handle client search for reports
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'search_client_reports') {
    $client_email = sanitizeInput($_POST['client_email']);
    
    try {
        // Fetch all bookings and payments for this client
        $clientReportsQuery = "
            SELECT 
                b.*,
                c.name as client_name,
                c.email as client_email,
                l.name as lawyer_name,
                cs.case_title,
                cs.case_fee,
                p.payment_id,
                p.status as payment_status,
                p.method as payment_method,
                p.date as payment_date
            FROM bookings b
            JOIN clients c ON b.client_id = c.client_id
            JOIN lawyers l ON b.lawyer_id = l.lawyer_id
            JOIN cases cs ON b.case_id = cs.case_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE c.email = :email
            ORDER BY b.date DESC
        ";
        $clientStmt = $conn->prepare($clientReportsQuery);
        $clientStmt->bindParam(':email', $client_email);
        $clientStmt->execute();
        $clientReportData = $clientStmt->fetchAll();
        
        if (empty($clientReportData)) {
            $_SESSION['error_message'] = "No bookings found for this client email address.";
        } else {
            $_SESSION['client_report_data'] = $clientReportData;
            $_SESSION['client_report_email'] = $client_email;
            $_SESSION['success_message'] = "Client reports found! You can download available documents below.";
        }
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Database error: " . $e->getMessage();
    }
}

// Handle clearing client search
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'clear_client_search') {
    unset($_SESSION['client_report_data']);
    unset($_SESSION['client_report_email']);
    $_SESSION['success_message'] = "Search cleared. You can search for a different client.";
}

// Handle delete booking request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_booking') {
    $booking_id = (int)$_POST['booking_id'];
    
    try {
        $deleteQuery = "DELETE FROM bookings WHERE booking_id = :booking_id";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':booking_id', $booking_id);
        
        if ($deleteStmt->execute()) {
            $_SESSION['success_message'] = "Booking deleted successfully!";
        } else {
            $_SESSION['error_message'] = "Failed to delete booking.";
        }
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Database error: " . $e->getMessage();
    }
}

// Handle delete payment request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_payment') {
    $payment_id = (int)$_POST['payment_id'];
    
    try {
        $deleteQuery = "DELETE FROM payments WHERE payment_id = :payment_id";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':payment_id', $payment_id);
        
        if ($deleteStmt->execute()) {
            $_SESSION['success_message'] = "Payment record deleted successfully!";
        } else {
            $_SESSION['error_message'] = "Failed to delete payment record.";
        }
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Database error: " . $e->getMessage();
    }
}

// Handle report generation requests
$reportType = isset($_GET['type']) ? $_GET['type'] : '';
$reportData = [];

if (!empty($reportType)) {
    try {
        switch ($reportType) {
            case 'appointment_slip':
                $booking_id = (int)$_GET['booking_id'];
                // Fetch appointment details using JOIN query
                $appointmentQuery = "
                    SELECT 
                        b.*,
                        c.name as client_name,
                        c.email as client_email,
                        c.phone as client_phone,
                        c.case_type as client_case_type,
                        l.name as lawyer_name,
                        l.specialization as lawyer_specialization,
                        l.phone as lawyer_phone,
                        l.email as lawyer_email,
                        cs.case_title,
                        cs.case_description,
                        cs.case_fee,
                        p.payment_id,
                        p.status as payment_status,
                        p.method as payment_method,
                        p.date as payment_date
                    FROM bookings b
                    JOIN clients c ON b.client_id = c.client_id
                    JOIN lawyers l ON b.lawyer_id = l.lawyer_id
                    JOIN cases cs ON b.case_id = cs.case_id
                    LEFT JOIN payments p ON b.booking_id = p.booking_id
                    WHERE b.booking_id = :booking_id
                ";
                $appointmentStmt = $conn->prepare($appointmentQuery);
                $appointmentStmt->bindParam(':booking_id', $booking_id);
                $appointmentStmt->execute();
                $reportData = $appointmentStmt->fetch();
                break;
                
            case 'payment_invoice':
                $payment_id = (int)$_GET['payment_id'];
                // Fetch payment details using JOIN query
                $paymentQuery = "
                    SELECT 
                        p.*,
                        b.date as booking_date,
                        b.time_slot,
                        b.status as booking_status,
                        c.name as client_name,
                        c.email as client_email,
                        c.phone as client_phone,
                        l.name as lawyer_name,
                        l.specialization as lawyer_specialization,
                        l.phone as lawyer_phone,
                        cs.case_title,
                        cs.case_description,
                        cs.case_fee
                    FROM payments p
                    JOIN bookings b ON p.booking_id = b.booking_id
                    JOIN clients c ON b.client_id = c.client_id
                    JOIN lawyers l ON b.lawyer_id = l.lawyer_id
                    JOIN cases cs ON b.case_id = cs.case_id
                    WHERE p.payment_id = :payment_id
                ";
                $paymentStmt = $conn->prepare($paymentQuery);
                $paymentStmt->bindParam(':payment_id', $payment_id);
                $paymentStmt->execute();
                $reportData = $paymentStmt->fetch();
                break;
        }
    } catch(PDOException $e) {
        $error_message = "Error generating report: " . $e->getMessage();
    }
}

// Fetch data for report selection
try {
    // Get all bookings for appointment slip generation
    $bookingsQuery = "
        SELECT 
            b.booking_id,
            b.date,
            b.time_slot,
            b.status,
            c.name as client_name,
            l.name as lawyer_name,
            cs.case_title
        FROM bookings b
        JOIN clients c ON b.client_id = c.client_id
        JOIN lawyers l ON b.lawyer_id = l.lawyer_id
        JOIN cases cs ON b.case_id = cs.case_id
        ORDER BY b.date DESC, b.time_slot ASC
    ";
    $bookingsStmt = $conn->prepare($bookingsQuery);
    $bookingsStmt->execute();
    $allBookings = $bookingsStmt->fetchAll();
    
    // Get all payments for invoice generation
    $paymentsQuery = "
        SELECT 
            p.payment_id,
            p.amount,
            p.status,
            p.date,
            c.name as client_name,
            cs.case_title
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN clients c ON b.client_id = c.client_id
        JOIN cases cs ON b.case_id = cs.case_id
        ORDER BY p.date DESC
    ";
    $paymentsStmt = $conn->prepare($paymentsQuery);
    $paymentsStmt->execute();
    $allPayments = $paymentsStmt->fetchAll();
    
} catch(PDOException $e) {
    $error_message = "Error fetching report data: " . $e->getMessage();
}

// If we're showing a report, use a clean layout
if (!empty($reportType) && !empty($reportData)) {
    include 'report_template.php';
    exit;
}

include 'header.php';
?>

<!-- Page Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h2 class="mb-0">
                    <i class="fas fa-file-alt me-2"></i>Reports & Documents
                </h2>
                <p class="mb-0 text-white-50">Generate printable appointment slips and payment invoices</p>
            </div>
        </div>
    </div>
</div>

<!-- Client Report Search Section -->
<div class="row mb-4">
    <div class="col-12">
        <?php if (!isset($_SESSION['client_report_data'])): ?>
            <!-- Client Email Search for Reports -->
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h4 class="mb-0">
                        <i class="fas fa-user-search me-2"></i>Search Client Reports
                    </h4>
                    <p class="mb-0 text-white-50 mt-2">Enter client email to view and download their appointment slips and payment invoices</p>
                </div>
                <div class="card-body">
                    <form method="POST" action="">
                        <input type="hidden" name="action" value="search_client_reports">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="client_email" class="form-label">
                                        <i class="fas fa-envelope me-1"></i>Client Email Address *
                                    </label>
                                    <input type="email" 
                                           class="form-control" 
                                           id="client_email" 
                                           name="client_email" 
                                           required 
                                           placeholder="Enter client's registered email to find their reports">
                                    <div class="form-text">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Client must have existing bookings to view reports
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 d-flex align-items-end">
                                <div class="mb-3 w-100">
                                    <button type="submit" class="btn btn-info w-100">
                                        <i class="fas fa-search me-2"></i>Search Reports
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        <?php else: ?>
            <!-- Client Reports Display -->
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0">
                        <i class="fas fa-file-download me-2"></i>Available Reports
                    </h4>
                    <div class="text-white-50 mt-2">
                        <i class="fas fa-envelope me-2"></i>
                        Client: <strong><?php echo htmlspecialchars($_SESSION['client_report_email']); ?></strong>
                        
                        <form method="POST" style="display: inline; margin-left: 15px;">
                            <input type="hidden" name="action" value="clear_client_search">
                            <button type="submit" class="btn btn-sm btn-outline-light">
                                <i class="fas fa-search me-1"></i>Search Different Client
                            </button>
                        </form>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <?php foreach ($_SESSION['client_report_data'] as $report): ?>
                        <div class="col-md-6 mb-3">
                            <div class="card border-primary">
                                <div class="card-header bg-light">
                                    <h6 class="mb-0">
                                        <i class="fas fa-calendar-check me-2"></i>
                                        Booking #<?php echo $report['booking_id']; ?>
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <p class="mb-1">
                                        <i class="fas fa-user-tie text-primary me-1"></i>
                                        <strong>Lawyer:</strong> <?php echo htmlspecialchars($report['lawyer_name']); ?>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-folder-open text-info me-1"></i>
                                        <strong>Case:</strong> <?php echo htmlspecialchars($report['case_title']); ?>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-calendar text-secondary me-1"></i>
                                        <strong>Date:</strong> <?php echo date('M j, Y', strtotime($report['date'])); ?>
                                    </p>
                                    <p class="mb-3">
                                        <i class="fas fa-dollar-sign text-success me-1"></i>
                                        <strong>Fee:</strong> $<?php echo number_format($report['case_fee'], 2); ?>
                                    </p>
                                    
                                    <!-- Document Downloads - Only show after payment complete -->
                                    <?php if ($report['payment_id'] && $report['payment_status'] === 'Complete'): ?>
                                        <div class="alert alert-success py-2 mb-2">
                                            <i class="fas fa-check-circle me-2"></i>
                                            <strong>Payment Complete</strong> - Documents Available
                                        </div>
                                        <div class="d-grid gap-2 mb-2">
                                            <a href="?type=appointment_slip&booking_id=<?php echo $report['booking_id']; ?>" 
                                               class="btn btn-primary btn-sm" 
                                               target="_blank">
                                                <i class="fas fa-file-alt me-1"></i>Download Appointment Slip
                                            </a>
                                        </div>
                                        <div class="d-grid">
                                            <a href="?type=payment_invoice&payment_id=<?php echo $report['payment_id']; ?>" 
                                               class="btn btn-success btn-sm" 
                                               target="_blank">
                                                <i class="fas fa-file-invoice-dollar me-1"></i>Download Payment Invoice
                                            </a>
                                        </div>
                                    <?php else: ?>
                                        <div class="alert alert-warning py-2">
                                            <i class="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Documents Not Available</strong><br>
                                            <small>Complete your payment first to download appointment slip and invoice</small>
                                        </div>
                                        <div class="d-grid">
                                            <a href="payments.php?client_email=<?php echo urlencode($report['client_email']); ?>" class="btn btn-warning btn-sm">
                                                <i class="fas fa-credit-card me-1"></i>Complete Payment Now
                                            </a>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Report Generation Options -->
<div class="row mb-4">
    <!-- Appointment Slip Generator -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0">
                    <i class="fas fa-calendar-check me-2"></i>Appointment Slip
                </h4>
            </div>
            <div class="card-body">
                <p class="text-muted mb-3">
                    Generate printable appointment confirmation slips with complete booking details.
                </p>
                
                <form method="GET" action="">
                    <input type="hidden" name="type" value="appointment_slip">
                    
                    <div class="mb-3">
                        <label for="booking_id" class="form-label">
                            <i class="fas fa-search me-1"></i>Select Booking
                        </label>
                        <select class="form-select" id="booking_id" name="booking_id" required>
                            <option value="">Choose a booking...</option>
                            <?php foreach ($allBookings as $booking): ?>
                            <option value="<?php echo $booking['booking_id']; ?>">
                                #<?php echo $booking['booking_id']; ?> - 
                                <?php echo htmlspecialchars($booking['client_name']); ?> with 
                                <?php echo htmlspecialchars($booking['lawyer_name']); ?> 
                                (<?php echo date('M j, Y', strtotime($booking['date'])); ?> at 
                                <?php echo date('g:i A', strtotime($booking['time_slot'])); ?>)
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary" <?php echo empty($allBookings) ? 'disabled' : ''; ?>>
                            <i class="fas fa-print me-2"></i>Generate Appointment Slip
                        </button>
                    </div>
                </form>
                
                <?php if (empty($allBookings)): ?>
                    <div class="alert alert-warning mt-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No bookings available. <a href="bookings.php">Create a booking</a> first.
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Payment Invoice Generator -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header bg-success text-white">
                <h4 class="mb-0">
                    <i class="fas fa-receipt me-2"></i>Payment Invoice
                </h4>
            </div>
            <div class="card-body">
                <p class="text-muted mb-3">
                    Generate printable payment invoices with transaction details and case information.
                </p>
                
                <form method="GET" action="">
                    <input type="hidden" name="type" value="payment_invoice">
                    
                    <div class="mb-3">
                        <label for="payment_id" class="form-label">
                            <i class="fas fa-search me-1"></i>Select Payment
                        </label>
                        <select class="form-select" id="payment_id" name="payment_id" required>
                            <option value="">Choose a payment...</option>
                            <?php foreach ($allPayments as $payment): ?>
                            <option value="<?php echo $payment['payment_id']; ?>">
                                #<?php echo $payment['payment_id']; ?> - 
                                $<?php echo number_format($payment['amount'], 2); ?> from 
                                <?php echo htmlspecialchars($payment['client_name']); ?> for 
                                <?php echo htmlspecialchars($payment['case_title']); ?>
                                (<?php echo ucfirst($payment['status']); ?>)
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-success" <?php echo empty($allPayments) ? 'disabled' : ''; ?>>
                            <i class="fas fa-file-invoice-dollar me-2"></i>Generate Payment Invoice
                        </button>
                    </div>
                </form>
                
                <?php if (empty($allPayments)): ?>
                    <div class="alert alert-warning mt-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No payments available. <a href="payments.php">Process a payment</a> first.
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Recent Documents Quick Access -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-clock me-2"></i>Recent Bookings - Quick Access
                </h4>
            </div>
            <div class="card-body">
                <?php if (!empty($allBookings)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Client</th>
                                    <th>Lawyer</th>
                                    <th>Case</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_slice($allBookings, 0, 10) as $booking): ?>
                                <tr>
                                    <td><strong>#<?php echo $booking['booking_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user text-primary me-1"></i>
                                        <?php echo htmlspecialchars($booking['client_name']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-user-tie text-success me-1"></i>
                                        <?php echo htmlspecialchars($booking['lawyer_name']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-folder-open text-info me-1"></i>
                                        <?php echo htmlspecialchars($booking['case_title']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-calendar text-secondary me-1"></i>
                                        <?php echo date('M j, Y', strtotime($booking['date'])); ?><br>
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            <?php echo date('g:i A', strtotime($booking['time_slot'])); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <?php
                                        $statusClass = '';
                                        switch($booking['status']) {
                                            case 'Pending': $statusClass = 'warning'; break;
                                            case 'Confirmed': $statusClass = 'success'; break;
                                            case 'Completed': $statusClass = 'info'; break;
                                            case 'Cancelled': $statusClass = 'danger'; break;
                                        }
                                        ?>
                                        <span class="badge bg-<?php echo $statusClass; ?>">
                                            <?php echo $booking['status']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="?type=appointment_slip&booking_id=<?php echo $booking['booking_id']; ?>" 
                                           class="btn btn-sm btn-primary me-1" 
                                           title="Generate Appointment Slip" 
                                           target="_blank">
                                            <i class="fas fa-print"></i>
                                        </a>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this booking? This will also delete any associated payments.')">
                                            <input type="hidden" name="action" value="delete_booking">
                                            <input type="hidden" name="booking_id" value="<?php echo $booking['booking_id']; ?>">
                                            <button type="submit" class="btn btn-sm btn-danger" title="Delete Booking">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Bookings Found</h5>
                        <p class="text-muted">Create some bookings to access quick report generation.</p>
                        <a href="bookings.php" class="btn btn-primary">
                            <i class="fas fa-calendar-plus me-2"></i>Create First Booking
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Recent Payments Quick Access -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-credit-card me-2"></i>Recent Payments - Quick Access
                </h4>
            </div>
            <div class="card-body">
                <?php if (!empty($allPayments)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Client</th>
                                    <th>Case</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_slice($allPayments, 0, 10) as $payment): ?>
                                <tr>
                                    <td><strong>#<?php echo $payment['payment_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user text-primary me-1"></i>
                                        <?php echo htmlspecialchars($payment['client_name']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-folder-open text-info me-1"></i>
                                        <?php echo htmlspecialchars($payment['case_title']); ?>
                                    </td>
                                    <td>
                                        <strong class="text-success">
                                            <i class="fas fa-dollar-sign me-1"></i>
                                            <?php echo number_format($payment['amount'], 2); ?>
                                        </strong>
                                    </td>
                                    <td>
                                        <?php
                                        $statusClass = '';
                                        switch($payment['status']) {
                                            case 'Pending': $statusClass = 'warning'; break;
                                            case 'Complete': $statusClass = 'success'; break;
                                            case 'Failed': $statusClass = 'danger'; break;
                                        }
                                        ?>
                                        <span class="badge bg-<?php echo $statusClass; ?>">
                                            <?php echo $payment['status']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <i class="fas fa-calendar text-secondary me-1"></i>
                                        <?php echo date('M j, Y', strtotime($payment['date'])); ?>
                                    </td>
                                    <td>
                                        <a href="?type=payment_invoice&payment_id=<?php echo $payment['payment_id']; ?>" 
                                           class="btn btn-sm btn-success me-1" 
                                           title="Generate Payment Invoice" 
                                           target="_blank">
                                            <i class="fas fa-file-invoice-dollar"></i>
                                        </a>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this payment record? This action cannot be undone.')">
                                            <input type="hidden" name="action" value="delete_payment">
                                            <input type="hidden" name="payment_id" value="<?php echo $payment['payment_id']; ?>">
                                            <button type="submit" class="btn btn-sm btn-danger" title="Delete Payment">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="text-center py-4">
                        <i class="fas fa-credit-card fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Payments Found</h5>
                        <p class="text-muted">Process some payments to access invoice generation.</p>
                        <a href="payments.php" class="btn btn-success">
                            <i class="fas fa-credit-card me-2"></i>Process First Payment
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
