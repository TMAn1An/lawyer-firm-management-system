<?php
// Home Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

// Set page title for header
$pageTitle = 'Home - Lawyer Firm Management System';

// Cancel expired bookings (bookings without payment after 10 minutes)
$cancelledBookings = cancelExpiredBookings($conn);
if (!empty($cancelledBookings)) {
    $messages = [];
    foreach ($cancelledBookings as $booking) {
        $messages[] = "Booking #{$booking['booking_id']} for {$booking['client_name']} with {$booking['lawyer_name']} has been cancelled due to non-payment within 10 minutes.";
    }
    $_SESSION['info_message'] = implode("<br>", $messages);
}

// Fetch statistics for dashboard
try {
    // Count total clients
    $clientQuery = "SELECT COUNT(*) as total_clients FROM clients";
    $clientStmt = $conn->prepare($clientQuery);
    $clientStmt->execute();
    $totalClients = $clientStmt->fetch()['total_clients'];
    
    // Count total lawyers
    $lawyerQuery = "SELECT COUNT(*) as total_lawyers FROM lawyers";
    $lawyerStmt = $conn->prepare($lawyerQuery);
    $lawyerStmt->execute();
    $totalLawyers = $lawyerStmt->fetch()['total_lawyers'];
    
    // Count total active cases
    $caseQuery = "SELECT COUNT(*) as total_cases FROM cases WHERE case_status = 'Active'";
    $caseStmt = $conn->prepare($caseQuery);
    $caseStmt->execute();
    $totalCases = $caseStmt->fetch()['total_cases'];
    
    // Count total bookings
    $bookingQuery = "SELECT COUNT(*) as total_bookings FROM bookings";
    $bookingStmt = $conn->prepare($bookingQuery);
    $bookingStmt->execute();
    $totalBookings = $bookingStmt->fetch()['total_bookings'];
    
    // Count pending payments
    $paymentQuery = "SELECT COUNT(*) as pending_payments FROM payments WHERE status = 'Pending'";
    $paymentStmt = $conn->prepare($paymentQuery);
    $paymentStmt->execute();
    $pendingPayments = $paymentStmt->fetch()['pending_payments'];
    
    // Get recent bookings for quick overview
    $recentBookingsQuery = "
        SELECT 
            b.booking_id,
            c.name as client_name,
            l.name as lawyer_name,
            cs.case_title,
            b.date,
            b.time_slot,
            b.status
        FROM bookings b
        JOIN clients c ON b.client_id = c.client_id
        JOIN lawyers l ON b.lawyer_id = l.lawyer_id
        JOIN cases cs ON b.case_id = cs.case_id
        ORDER BY b.created_at DESC
        LIMIT 5
    ";
    $recentStmt = $conn->prepare($recentBookingsQuery);
    $recentStmt->execute();
    $recentBookings = $recentStmt->fetchAll();
    
} catch(PDOException $e) {
    // Handle database errors
    $error_message = "Error fetching dashboard data: " . $e->getMessage();
}

include 'header.php';
?>

<!-- Welcome Hero Section -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-body text-center py-5">
                <h1 class="display-4 mb-3">
                    <i class="fas fa-balance-scale text-primary me-3"></i>
                    Welcome to Lawyer Firm Management System
                </h1>
                <p class="lead text-muted">
                    Streamline your law practice with our comprehensive management solution. 
                    Manage clients, lawyers, cases, bookings, and payments all in one place.
                </p>
                <div class="mt-4">
                    <a href="bookings.php" class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-calendar-plus me-2"></i>Book Appointment
                    </a>
                    <a href="clients.php" class="btn btn-outline-primary btn-lg">
                        <i class="fas fa-user-plus me-2"></i>Add Client
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Statistics Dashboard -->
<div class="row mb-4">
    <div class="col-md-12 mb-3">
        <h2><i class="fas fa-chart-bar me-2"></i>System Overview</h2>
    </div>
    
    <!-- Total Clients Card -->
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="stats-number"><?php echo $totalClients; ?></div>
            <div class="stats-label">
                <i class="fas fa-users me-2"></i>Total Clients
            </div>
        </div>
    </div>
    
    <!-- Total Lawyers Card -->
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="stats-card" style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);">
            <div class="stats-number"><?php echo $totalLawyers; ?></div>
            <div class="stats-label">
                <i class="fas fa-user-tie me-2"></i>Total Lawyers
            </div>
        </div>
    </div>
    
    <!-- Active Cases Card -->
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="stats-card" style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);">
            <div class="stats-number"><?php echo $totalCases; ?></div>
            <div class="stats-label">
                <i class="fas fa-folder-open me-2"></i>Active Cases
            </div>
        </div>
    </div>
    
    <!-- Total Bookings Card -->
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="stats-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <div class="stats-number"><?php echo $totalBookings; ?></div>
            <div class="stats-label">
                <i class="fas fa-calendar-check me-2"></i>Total Bookings
            </div>
        </div>
    </div>
    
    <!-- Pending Payments Card -->
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="stats-card" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);">
            <div class="stats-number"><?php echo $pendingPayments; ?></div>
            <div class="stats-label">
                <i class="fas fa-clock me-2"></i>Pending Payments
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions Section -->
<div class="row mb-4">
    <div class="col-md-12 mb-3">
        <h3><i class="fas fa-rocket me-2"></i>Quick Actions</h3>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                <h5>Manage Clients</h5>
                <p class="text-muted">Add new clients, view existing ones, and manage client information.</p>
                <a href="clients.php" class="btn btn-primary">
                    <i class="fas fa-arrow-right me-1"></i>Go to Clients
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-calendar-plus fa-3x text-success mb-3"></i>
                <h5>Book Appointments</h5>
                <p class="text-muted">Schedule appointments between clients and lawyers for various cases.</p>
                <a href="bookings.php" class="btn btn-success">
                    <i class="fas fa-arrow-right me-1"></i>Book Now
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-credit-card fa-3x text-warning mb-3"></i>
                <h5>Process Payments</h5>
                <p class="text-muted">Handle payments for legal services and track payment status.</p>
                <a href="payments.php" class="btn btn-warning">
                    <i class="fas fa-arrow-right me-1"></i>View Payments
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Recent Bookings Section -->
<?php if (!empty($recentBookings)): ?>
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-clock me-2"></i>Recent Bookings
                </h4>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Client</th>
                                <th>Lawyer</th>
                                <th>Case</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentBookings as $booking): ?>
                            <tr>
                                <td><strong>#<?php echo $booking['booking_id']; ?></strong></td>
                                <td><?php echo htmlspecialchars($booking['client_name']); ?></td>
                                <td><?php echo htmlspecialchars($booking['lawyer_name']); ?></td>
                                <td><?php echo htmlspecialchars($booking['case_title']); ?></td>
                                <td><?php echo date('M j, Y', strtotime($booking['date'])); ?></td>
                                <td><?php echo date('g:i A', strtotime($booking['time_slot'])); ?></td>
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
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <div class="text-center mt-3">
                    <a href="bookings.php" class="btn btn-outline-primary">
                        <i class="fas fa-eye me-1"></i>View All Bookings
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<!-- Features Section -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-star me-2"></i>System Features
                </h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Client Management</h6>
                                <small class="text-muted">Complete client registration with unique email validation</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Lawyer Profiles</h6>
                                <small class="text-muted">Manage lawyer information and specializations</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Case Management</h6>
                                <small class="text-muted">Track cases with fees and status updates</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Smart Booking</h6>
                                <small class="text-muted">Prevent conflicts with intelligent scheduling</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Payment Processing</h6>
                                <small class="text-muted">Track payments with multiple status options</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-success me-3 fa-2x"></i>
                            <div>
                                <h6 class="mb-1">Comprehensive Reports</h6>
                                <small class="text-muted">Generate detailed reports and printable documents</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
