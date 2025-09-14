<?php
// Bookings Management Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Booking Management - Lawyer Firm Management System';

// Cancel expired bookings (bookings without payment after 10 minutes)
$cancelledBookings = cancelExpiredBookings($conn);
if (!empty($cancelledBookings)) {
    $messages = [];
    foreach ($cancelledBookings as $booking) {
        $messages[] = "Booking #{$booking['booking_id']} for {$booking['client_name']} with {$booking['lawyer_name']} has been cancelled due to non-payment within 10 minutes. The time slot is now available.";
    }
    $_SESSION['info_message'] = implode("<br>", $messages);
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        
        // VERIFY CLIENT EMAIL
        if ($_POST['action'] === 'verify_client') {
            $client_email = sanitizeInput($_POST['client_email']);
            
            try {
                // Check if client exists
                $clientQuery = "SELECT * FROM clients WHERE email = :email";
                $clientStmt = $conn->prepare($clientQuery);
                $clientStmt->bindParam(':email', $client_email);
                $clientStmt->execute();
                $verifiedClient = $clientStmt->fetch();
                
                if (!$verifiedClient) {
                    $_SESSION['error_message'] = "Client not found with this email address. Please register first.";
                } else {
                    $_SESSION['verified_client'] = $verifiedClient;
                    $_SESSION['success_message'] = "Client verified successfully! You can now book an appointment.";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // CHANGE CLIENT
        elseif ($_POST['action'] === 'change_client') {
            unset($_SESSION['verified_client']);
            $_SESSION['success_message'] = "Client cleared. Please verify a different client email.";
        }
        
        // CREATE BOOKING
        elseif ($_POST['action'] === 'create_booking') {
            if (!isset($_SESSION['verified_client'])) {
                $_SESSION['error_message'] = "Please verify client email first.";
            } else {
                $client_id = $_SESSION['verified_client']['client_id'];
                $lawyer_id = (int)$_POST['lawyer_id'];
                $case_id = (int)$_POST['case_id'];
                $date = $_POST['date'];
                $time_slot = $_POST['time_slot'];
                
                try {
                    // Check if lawyer is available at that date and time (exclude cancelled bookings)
                    $conflictQuery = "SELECT COUNT(*) as conflict_count FROM bookings WHERE lawyer_id = :lawyer_id AND date = :date AND time_slot = :time_slot AND status != 'Cancelled'";
                    $conflictStmt = $conn->prepare($conflictQuery);
                    $conflictStmt->bindParam(':lawyer_id', $lawyer_id);
                    $conflictStmt->bindParam(':date', $date);
                    $conflictStmt->bindParam(':time_slot', $time_slot);
                    $conflictStmt->execute();
                    
                    if ($conflictStmt->fetch()['conflict_count'] > 0) {
                        $_SESSION['error_message'] = "Time slot already booked! Please select a different time.";
                    } else {
                        // Check if client already has an appointment at the same date and time (with any lawyer)
                        $clientConflictQuery = "SELECT l.name as lawyer_name FROM bookings b 
                                              JOIN lawyers l ON b.lawyer_id = l.lawyer_id 
                                              WHERE b.client_id = :client_id AND b.date = :date AND b.time_slot = :time_slot AND b.status != 'Cancelled'";
                        $clientConflictStmt = $conn->prepare($clientConflictQuery);
                        $clientConflictStmt->bindParam(':client_id', $client_id);
                        $clientConflictStmt->bindParam(':date', $date);
                        $clientConflictStmt->bindParam(':time_slot', $time_slot);
                        $clientConflictStmt->execute();
                        $existingAppointment = $clientConflictStmt->fetch();
                        
                        if ($existingAppointment) {
                            $_SESSION['error_message'] = "You already have an appointment with " . $existingAppointment['lawyer_name'] . " on " . date('M d, Y', strtotime($date)) . " at " . date('g:i A', strtotime($time_slot)) . ". You cannot book multiple lawyers at the same time.";
                        } else {
                            // Check if client has any pending (unpaid) bookings
                            $pendingBookingQuery = "SELECT b.booking_id, l.name as lawyer_name, b.date, b.time_slot, b.created_at 
                                                  FROM bookings b 
                                                  JOIN lawyers l ON b.lawyer_id = l.lawyer_id 
                                                  WHERE b.client_id = :client_id AND b.status = 'Pending'";
                            $pendingStmt = $conn->prepare($pendingBookingQuery);
                            $pendingStmt->bindParam(':client_id', $client_id);
                            $pendingStmt->execute();
                            $pendingBooking = $pendingStmt->fetch();
                            
                            if ($pendingBooking) {
                                $pendingDate = date('M d, Y', strtotime($pendingBooking['date']));
                                $pendingTime = date('g:i A', strtotime($pendingBooking['time_slot']));
                                $_SESSION['error_message'] = "You have an unpaid booking with " . $pendingBooking['lawyer_name'] . " on $pendingDate at $pendingTime. Please complete the payment, cancel this booking, or wait for auto-cancellation (10 minutes) before making a new booking.";
                            } else {
                                // Check daily booking limit (max 8 appointments per day per lawyer)
                        $dailyCountQuery = "SELECT COUNT(*) as daily_count FROM bookings WHERE lawyer_id = :lawyer_id AND date = :date";
                        $dailyStmt = $conn->prepare($dailyCountQuery);
                        $dailyStmt->bindParam(':lawyer_id', $lawyer_id);
                        $dailyStmt->bindParam(':date', $date);
                        $dailyStmt->execute();
                        
                        if ($dailyStmt->fetch()['daily_count'] >= 8) {
                            $_SESSION['error_message'] = "Lawyer has reached maximum appointments (8) for this day. Please select a different date.";
                        } else {
                            // Check if there's a cancelled booking for the same slot
                            $cancelledQuery = "SELECT booking_id FROM bookings WHERE lawyer_id = :lawyer_id AND date = :date AND time_slot = :time_slot AND status = 'Cancelled'";
                            $cancelledStmt = $conn->prepare($cancelledQuery);
                            $cancelledStmt->bindParam(':lawyer_id', $lawyer_id);
                            $cancelledStmt->bindParam(':date', $date);
                            $cancelledStmt->bindParam(':time_slot', $time_slot);
                            $cancelledStmt->execute();
                            $cancelledBooking = $cancelledStmt->fetch();
                            
                            if ($cancelledBooking) {
                                // Reuse the cancelled booking by updating it
                                $updateQuery = "UPDATE bookings SET client_id = :client_id, case_id = :case_id, status = 'Pending', created_at = NOW() WHERE booking_id = :booking_id";
                                $updateStmt = $conn->prepare($updateQuery);
                                $updateStmt->bindParam(':client_id', $client_id);
                                $updateStmt->bindParam(':case_id', $case_id);
                                $updateStmt->bindParam(':booking_id', $cancelledBooking['booking_id']);
                                
                                if ($updateStmt->execute()) {
                                    $bookingId = $cancelledBooking['booking_id'];
                                    $_SESSION['success_message'] = "Booking created successfully! Please complete your payment within 10 minutes to confirm your slot.";
                                    
                                    // Auto-activate the case if it's not already active
                                    $updateCaseQuery = "UPDATE cases SET case_status = 'Active' WHERE case_id = :case_id AND case_status != 'Active'";
                                    $updateCaseStmt = $conn->prepare($updateCaseQuery);
                                    $updateCaseStmt->bindParam(':case_id', $case_id);
                                    $updateCaseStmt->execute();
                                    
                                    // Clear verified client after successful booking
                                    unset($_SESSION['verified_client']);
                                }
                            } else {
                                // Create new booking
                                $bookingQuery = "INSERT INTO bookings (client_id, lawyer_id, case_id, date, time_slot, status) VALUES (:client_id, :lawyer_id, :case_id, :date, :time_slot, 'Pending')";
                                $bookingStmt = $conn->prepare($bookingQuery);
                                $bookingStmt->bindParam(':client_id', $client_id);
                                $bookingStmt->bindParam(':lawyer_id', $lawyer_id);
                                $bookingStmt->bindParam(':case_id', $case_id);
                                $bookingStmt->bindParam(':date', $date);
                                $bookingStmt->bindParam(':time_slot', $time_slot);
                                
                                if ($bookingStmt->execute()) {
                                    $bookingId = $conn->lastInsertId();
                                    $_SESSION['success_message'] = "Booking created successfully! Please complete your payment within 10 minutes to confirm your slot.";
                                    
                                    // Auto-activate the case if it's not already active
                                    $updateCaseQuery = "UPDATE cases SET case_status = 'Active' WHERE case_id = :case_id AND case_status != 'Active'";
                                    $updateCaseStmt = $conn->prepare($updateCaseQuery);
                                    $updateCaseStmt->bindParam(':case_id', $case_id);
                                    $updateCaseStmt->execute();
                                    
                                    // Clear verified client after successful booking
                                    unset($_SESSION['verified_client']);
                                }
                            }
                            }
                        }
                        }
                    }
                } catch(PDOException $e) {
                    // Check if it's a duplicate entry error (constraint violation)
                    if ($e->getCode() == 23000 && strpos($e->getMessage(), 'unique_booking') !== false) {
                        // Get lawyer name for better error message
                        $lawyerQuery = "SELECT name FROM lawyers WHERE lawyer_id = :lawyer_id";
                        $lawyerStmt = $conn->prepare($lawyerQuery);
                        $lawyerStmt->bindParam(':lawyer_id', $lawyer_id);
                        $lawyerStmt->execute();
                        $lawyerName = $lawyerStmt->fetchColumn();
                        
                        $_SESSION['error_message'] = "This time slot for " . ($lawyerName ?: "the selected lawyer") . " on " . date('M d, Y', strtotime($date)) . " at " . date('g:i A', strtotime($time_slot)) . " is already booked. Please select a different date or time slot.";
                    } else {
                        $_SESSION['error_message'] = "Booking could not be created. Please try again or contact support if the problem persists.";
                    }
                }
            }
        }
        
        // UPDATE BOOKING STATUS
        elseif ($_POST['action'] === 'update_booking_status') {
            $booking_id = (int)$_POST['booking_id'];
            $status = sanitizeInput($_POST['status']);
            
            try {
                $updateQuery = "UPDATE bookings SET status = :status WHERE booking_id = :booking_id";
                $updateStmt = $conn->prepare($updateQuery);
                $updateStmt->bindParam(':status', $status);
                $updateStmt->bindParam(':booking_id', $booking_id);
                
                if ($updateStmt->execute()) {
                    $_SESSION['success_message'] = "Booking status updated successfully!";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // DELETE BOOKING
        elseif ($_POST['action'] === 'delete_booking') {
            $booking_id = (int)$_POST['booking_id'];
            
            try {
                $deleteQuery = "DELETE FROM bookings WHERE booking_id = :booking_id";
                $deleteStmt = $conn->prepare($deleteQuery);
                $deleteStmt->bindParam(':booking_id', $booking_id);
                
                if ($deleteStmt->execute()) {
                    $_SESSION['success_message'] = "Booking deleted successfully!";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
    }
}

// Fetch available lawyers
try {
    $lawyerQuery = "SELECT * FROM lawyers WHERE availability = 'Available' ORDER BY name";
    $lawyerStmt = $conn->prepare($lawyerQuery);
    $lawyerStmt->execute();
    $availableLawyers = $lawyerStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching lawyers: " . $e->getMessage();
}

// Fetch active cases
try {
    $caseQuery = "SELECT * FROM cases WHERE case_status = 'Active' ORDER BY case_title";
    $caseStmt = $conn->prepare($caseQuery);
    $caseStmt->execute();
    $activeCases = $caseStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching cases: " . $e->getMessage();
}

// Fetch all bookings with related information
try {
    $bookingQuery = "
        SELECT 
            b.*,
            c.name as client_name,
            c.email as client_email,
            c.phone as client_phone,
            l.name as lawyer_name,
            l.specialization as lawyer_specialization,
            cs.case_title,
            cs.case_fee
        FROM bookings b
        JOIN clients c ON b.client_id = c.client_id
        JOIN lawyers l ON b.lawyer_id = l.lawyer_id
        JOIN cases cs ON b.case_id = cs.case_id
        ORDER BY b.date DESC, b.time_slot ASC
    ";
    $bookingStmt = $conn->prepare($bookingQuery);
    $bookingStmt->execute();
    $allBookings = $bookingStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching bookings: " . $e->getMessage();
}

include 'header.php';
?>

<!-- Page Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h2 class="mb-0">
                    <i class="fas fa-calendar-check me-2"></i>Booking Management
                </h2>
                <p class="mb-0 text-white-50">Schedule appointments between clients and lawyers</p>
            </div>
        </div>
    </div>
</div>

<!-- Client Verification and Booking Form -->
<div class="row mb-4">
    <div class="col-md-8">
        <?php if (!isset($_SESSION['verified_client'])): ?>
            <!-- Client Email Verification -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">
                        <i class="fas fa-user-check me-2"></i>Step 1: Verify Client
                    </h4>
                </div>
                <div class="card-body">
                    <form method="POST" action="">
                        <input type="hidden" name="action" value="verify_client">
                        <div class="mb-3">
                            <label for="client_email" class="form-label">
                                <i class="fas fa-envelope me-1"></i>Client Email Address *
                            </label>
                            <input type="email" 
                                   class="form-control" 
                                   id="client_email" 
                                   name="client_email" 
                                   required 
                                   placeholder="Enter registered client email">
                            <div class="form-text">
                                <i class="fas fa-info-circle me-1"></i>
                                Client must be registered first. <a href="clients.php">Register new client</a>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-check me-2"></i>Verify Client
                        </button>
                    </form>
                </div>
            </div>
        <?php else: ?>
            <!-- Booking Form -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">
                        <i class="fas fa-calendar-plus me-2"></i>Step 2: Book Appointment
                    </h4>
                    <div class="text-white-50 mt-2">
                        <i class="fas fa-user me-2"></i>
                        Client: <strong><?php echo htmlspecialchars($_SESSION['verified_client']['name']); ?></strong>
                        (<?php echo htmlspecialchars($_SESSION['verified_client']['email']); ?>)
                        
                        <form method="POST" style="display: inline; margin-left: 15px;">
                            <input type="hidden" name="action" value="change_client">
                            <button type="submit" class="btn btn-sm btn-outline-light">
                                <i class="fas fa-user-edit me-1"></i>Change Client
                            </button>
                        </form>
                    </div>
                </div>
                <div class="card-body">
                    <form method="POST" action="" onsubmit="return validateBookingForm()">
                        <input type="hidden" name="action" value="create_booking">
                        
                        <div class="row">
                            <!-- Select Lawyer -->
                            <div class="col-md-6 mb-3">
                                <label for="lawyer_id" class="form-label">
                                    <i class="fas fa-user-tie me-1"></i>Select Lawyer *
                                </label>
                                <select class="form-select" id="lawyer_id" name="lawyer_id" required>
                                    <option value="">Choose a lawyer...</option>
                                    <?php foreach ($availableLawyers as $lawyer): ?>
                                    <option value="<?php echo $lawyer['lawyer_id']; ?>">
                                        <?php echo htmlspecialchars($lawyer['name']); ?> 
                                        (<?php echo htmlspecialchars($lawyer['specialization']); ?>)
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                                <?php if (empty($availableLawyers)): ?>
                                    <div class="form-text text-danger">
                                        <i class="fas fa-exclamation-triangle me-1"></i>
                                        No lawyers available. <a href="lawyers.php">Add lawyers</a>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <!-- Select Case -->
                            <div class="col-md-6 mb-3">
                                <label for="case_id" class="form-label">
                                    <i class="fas fa-folder-open me-1"></i>Select Case *
                                </label>
                                <select class="form-select" id="case_id" name="case_id" required>
                                    <option value="">Choose a case...</option>
                                    <?php foreach ($activeCases as $case): ?>
                                    <option value="<?php echo $case['case_id']; ?>">
                                        <?php echo htmlspecialchars($case['case_title']); ?>
                                        (Fee: $<?php echo number_format($case['case_fee'], 2); ?>)
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                                <?php if (empty($activeCases)): ?>
                                    <div class="form-text text-danger">
                                        <i class="fas fa-exclamation-triangle me-1"></i>
                                        No active cases. <a href="cases.php">Add cases</a>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <div class="row">
                            <!-- Appointment Date -->
                            <div class="col-md-6 mb-3">
                                <label for="date" class="form-label">
                                    <i class="fas fa-calendar-alt me-1"></i>Appointment Date *
                                </label>
                                <input type="date" 
                                       class="form-control" 
                                       id="date" 
                                       name="date" 
                                       min="<?php echo date('Y-m-d'); ?>"
                                       required>
                            </div>
                            
                            <!-- Time Slot -->
                            <div class="col-md-6 mb-3">
                                <label for="time_slot" class="form-label">
                                    <i class="fas fa-clock me-1"></i>Time Slot *
                                </label>
                                <select class="form-select" id="time_slot" name="time_slot" required>
                                    <option value="">Select time...</option>
                                    <option value="09:00">9:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="14:00">2:00 PM</option>
                                    <option value="15:00">3:00 PM</option>
                                    <option value="16:00">4:00 PM</option>
                                    <option value="17:00">5:00 PM</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Booking Rules:</strong>
                            <ul class="mb-0 mt-2">
                                <li>Each lawyer can have maximum 8 appointments per day</li>
                                <li>No two clients can book the same lawyer at the same time</li>
                                <li>Booking status will be set to "Pending" initially</li>
                                <li>The selected case will be automatically activated</li>
                            </ul>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success" <?php echo (empty($availableLawyers) || empty($activeCases)) ? 'disabled' : ''; ?>>
                                <i class="fas fa-calendar-check me-2"></i>Create Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
    
    <!-- Booking Statistics -->
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>Booking Statistics
                </h4>
            </div>
            <div class="card-body">
                <?php
                // Calculate booking statistics
                $totalBookings = count($allBookings);
                $bookingStatuses = array_count_values(array_column($allBookings, 'status'));
                $todayBookings = count(array_filter($allBookings, function($booking) {
                    return $booking['date'] === date('Y-m-d');
                }));
                ?>
                
                <div class="text-center mb-4">
                    <h3 class="text-primary"><?php echo $totalBookings; ?></h3>
                    <p class="text-muted">Total Bookings</p>
                </div>
                
                <div class="text-center mb-4">
                    <h4 class="text-warning"><?php echo $todayBookings; ?></h4>
                    <p class="text-muted">Today's Appointments</p>
                </div>
                
                <h6 class="mb-3">By Status:</h6>
                <?php foreach (['Pending', 'Confirmed', 'Completed', 'Cancelled'] as $status): ?>
                    <?php $count = isset($bookingStatuses[$status]) ? $bookingStatuses[$status] : 0; ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <?php
                            $statusIcon = '';
                            switch($status) {
                                case 'Pending': $statusIcon = 'fas fa-clock text-warning'; break;
                                case 'Confirmed': $statusIcon = 'fas fa-check-circle text-success'; break;
                                case 'Completed': $statusIcon = 'fas fa-flag-checkered text-info'; break;
                                case 'Cancelled': $statusIcon = 'fas fa-times-circle text-danger'; break;
                            }
                            ?>
                            <i class="<?php echo $statusIcon; ?> me-1"></i>
                            <?php echo $status; ?>
                        </span>
                        <span class="badge bg-secondary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- All Bookings List -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-list me-2"></i>All Bookings
                </h4>
                <span class="badge bg-white text-dark"><?php echo count($allBookings); ?> bookings</span>
            </div>
            <div class="card-body">
                <?php if (!empty($allBookings)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Lawyer</th>
                                    <th>Case</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($allBookings as $booking): ?>
                                <tr>
                                    <td><strong>#<?php echo $booking['booking_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user text-primary me-1"></i>
                                        <strong><?php echo htmlspecialchars($booking['client_name']); ?></strong><br>
                                        <small class="text-muted"><?php echo htmlspecialchars($booking['client_email']); ?></small>
                                    </td>
                                    <td>
                                        <i class="fas fa-user-tie text-success me-1"></i>
                                        <strong><?php echo htmlspecialchars($booking['lawyer_name']); ?></strong><br>
                                        <small class="text-muted"><?php echo htmlspecialchars($booking['lawyer_specialization']); ?></small>
                                    </td>
                                    <td>
                                        <i class="fas fa-folder-open text-info me-1"></i>
                                        <strong><?php echo htmlspecialchars($booking['case_title']); ?></strong><br>
                                        <small class="text-success">Fee: $<?php echo number_format($booking['case_fee'], 2); ?></small>
                                    </td>
                                    <td>
                                        <i class="fas fa-calendar text-dark me-1"></i>
                                        <?php echo date('M j, Y', strtotime($booking['date'])); ?>
                                        <?php if ($booking['date'] === date('Y-m-d')): ?>
                                            <span class="badge bg-warning text-dark ms-1">Today</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-clock text-dark me-1"></i>
                                        <?php echo date('g:i A', strtotime($booking['time_slot'])); ?>
                                    </td>
                                    <td>
                                        <?php
                                        $statusClass = '';
                                        $statusIcon = '';
                                        switch($booking['status']) {
                                            case 'Pending': $statusClass = 'warning'; $statusIcon = 'clock'; break;
                                            case 'Confirmed': $statusClass = 'success'; $statusIcon = 'check-circle'; break;
                                            case 'Completed': $statusClass = 'info'; $statusIcon = 'flag-checkered'; break;
                                            case 'Cancelled': $statusClass = 'danger'; $statusIcon = 'times-circle'; break;
                                        }
                                        ?>
                                        <form method="POST" style="display: inline;">
                                            <input type="hidden" name="action" value="update_booking_status">
                                            <input type="hidden" name="booking_id" value="<?php echo $booking['booking_id']; ?>">
                                            <select name="status" class="form-select form-select-sm" onchange="this.form.submit()">
                                                <option value="Pending" <?php echo $booking['status'] === 'Pending' ? 'selected' : ''; ?>>Pending</option>
                                                <option value="Confirmed" <?php echo $booking['status'] === 'Confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                                <option value="Completed" <?php echo $booking['status'] === 'Completed' ? 'selected' : ''; ?>>Completed</option>
                                                <option value="Cancelled" <?php echo $booking['status'] === 'Cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                            </select>
                                        </form>
                                    </td>
                                    <td>
                                        <!-- Delete Button -->
                                        <form method="POST" 
                                              style="display: inline-block;" 
                                              onsubmit="return confirmDelete('booking', '#<?php echo $booking['booking_id']; ?>')">
                                            <input type="hidden" name="action" value="delete_booking">
                                            <input type="hidden" name="booking_id" value="<?php echo $booking['booking_id']; ?>">
                                            <button type="submit" 
                                                    class="btn btn-sm btn-danger" 
                                                    title="Delete Booking">
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
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Bookings Found</h5>
                        <p class="text-muted">Start by verifying a client email and creating your first booking.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
// Booking form validation
function validateBookingForm() {
    const lawyerId = document.getElementById('lawyer_id').value;
    const caseId = document.getElementById('case_id').value;
    const date = document.getElementById('date').value;
    const timeSlot = document.getElementById('time_slot').value;
    
    // Check if all fields are selected
    if (!lawyerId || !caseId || !date || !timeSlot) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Check if date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Please select a future date for the appointment.');
        return false;
    }
    
    return true;
}

// Auto-submit status change
document.querySelectorAll('select[name="status"]').forEach(function(select) {
    select.addEventListener('change', function() {
        if (confirm('Are you sure you want to update the booking status?')) {
            this.form.submit();
        }
    });
});
</script>

<?php include 'footer.php'; ?>
