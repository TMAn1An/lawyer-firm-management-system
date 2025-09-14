<?php
// Payments Management Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Payment Management - Lawyer Firm Management System';

// Cancel expired bookings (bookings without payment after 10 minutes)
$cancelledBookings = cancelExpiredBookings($conn);
if (!empty($cancelledBookings)) {
    $messages = [];
    foreach ($cancelledBookings as $booking) {
        $messages[] = "Booking #{$booking['booking_id']} for {$booking['client_name']} with {$booking['lawyer_name']} has been cancelled due to non-payment within 10 minutes.";
    }
    $_SESSION['info_message'] = implode("<br>", $messages);
}

// Auto-verify client if coming from report page with client_email parameter
if (isset($_GET['client_email']) && !isset($_SESSION['payment_client_email'])) {
    $client_email = sanitizeInput($_GET['client_email']);
    
    try {
        // Check if client exists and get their bookings
        $clientBookingsQuery = "
            SELECT 
                b.*,
                c.name as client_name,
                c.email as client_email,
                l.name as lawyer_name,
                cs.case_title,
                cs.case_fee,
                p.payment_id,
                p.status as payment_status
            FROM bookings b
            JOIN clients c ON b.client_id = c.client_id
            JOIN lawyers l ON b.lawyer_id = l.lawyer_id
            JOIN cases cs ON b.case_id = cs.case_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE c.email = :email
            ORDER BY b.date DESC
        ";
        $clientStmt = $conn->prepare($clientBookingsQuery);
        $clientStmt->bindParam(':email', $client_email);
        $clientStmt->execute();
        $clientBookings = $clientStmt->fetchAll();
        
        if (!empty($clientBookings)) {
            $_SESSION['payment_client_bookings'] = $clientBookings;
            $_SESSION['payment_client_email'] = $client_email;
            $_SESSION['success_message'] = "Client automatically verified! Select a booking to make payment.";
        }
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Database error: " . $e->getMessage();
    }
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        
        // VERIFY CLIENT EMAIL FOR PAYMENT
        if ($_POST['action'] === 'verify_payment_client') {
            $client_email = sanitizeInput($_POST['client_email']);
            
            try {
                // Check if client exists and get their bookings
                $clientBookingsQuery = "
                    SELECT 
                        b.*,
                        c.name as client_name,
                        c.email as client_email,
                        l.name as lawyer_name,
                        cs.case_title,
                        cs.case_fee,
                        p.payment_id,
                        p.status as payment_status
                    FROM bookings b
                    JOIN clients c ON b.client_id = c.client_id
                    JOIN lawyers l ON b.lawyer_id = l.lawyer_id
                    JOIN cases cs ON b.case_id = cs.case_id
                    LEFT JOIN payments p ON b.booking_id = p.booking_id
                    WHERE c.email = :email
                    ORDER BY b.date DESC
                ";
                $clientStmt = $conn->prepare($clientBookingsQuery);
                $clientStmt->bindParam(':email', $client_email);
                $clientStmt->execute();
                $clientBookings = $clientStmt->fetchAll();
                
                if (empty($clientBookings)) {
                    $_SESSION['error_message'] = "No bookings found for this client email address.";
                } else {
                    $_SESSION['payment_client_bookings'] = $clientBookings;
                    $_SESSION['payment_client_email'] = $client_email;
                    $_SESSION['success_message'] = "Client verified! Select a booking to make payment.";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // CHANGE CLIENT
        elseif ($_POST['action'] === 'change_payment_client') {
            unset($_SESSION['payment_client_bookings']);
            unset($_SESSION['payment_client_email']);
            $_SESSION['success_message'] = "Client cleared. Please verify a different client email.";
        }
        
        // PROCESS PAYMENT
        elseif ($_POST['action'] === 'process_payment') {
            $booking_id = (int)$_POST['booking_id'];
            $payment_method = sanitizeInput($_POST['payment_method']);
            
            try {
                // Check if payment already exists and is successful for this booking
                $existingPaymentQuery = "SELECT * FROM payments WHERE booking_id = :booking_id AND status = 'Complete'";
                $existingStmt = $conn->prepare($existingPaymentQuery);
                $existingStmt->bindParam(':booking_id', $booking_id);
                $existingStmt->execute();
                
                if ($existingStmt->rowCount() > 0) {
                    $_SESSION['error_message'] = "Already Paid. This booking has already been paid successfully.";
                } else {
                    // Get booking and case details for payment amount
                    $bookingDetailsQuery = "
                        SELECT b.*, cs.case_fee 
                        FROM bookings b 
                        JOIN cases cs ON b.case_id = cs.case_id 
                        WHERE b.booking_id = :booking_id
                    ";
                    $detailStmt = $conn->prepare($bookingDetailsQuery);
                    $detailStmt->bindParam(':booking_id', $booking_id);
                    $detailStmt->execute();
                    $bookingDetails = $detailStmt->fetch();
                    
                    if ($bookingDetails) {
                        // Check if there's a failed payment that can be retried
                        $failedPaymentQuery = "SELECT payment_id FROM payments WHERE booking_id = :booking_id AND status = 'Failed'";
                        $failedStmt = $conn->prepare($failedPaymentQuery);
                        $failedStmt->bindParam(':booking_id', $booking_id);
                        $failedStmt->execute();
                        $failedPayment = $failedStmt->fetch();
                        
                        // Simulate payment processing (high success rate for testing)
                        $paymentSuccess = (rand(1, 10) <= 9); // 90% success rate for demo
                        $paymentStatus = $paymentSuccess ? 'Complete' : 'Failed';
                        
                        if ($failedPayment) {
                            // Update existing failed payment
                            $updatePaymentQuery = "UPDATE payments SET method = :method, status = :status, date = NOW() WHERE payment_id = :payment_id";
                            $paymentStmt = $conn->prepare($updatePaymentQuery);
                            $paymentStmt->bindParam(':method', $payment_method);
                            $paymentStmt->bindParam(':status', $paymentStatus);
                            $paymentStmt->bindParam(':payment_id', $failedPayment['payment_id']);
                        } else {
                            // Insert new payment record
                            $paymentQuery = "INSERT INTO payments (booking_id, amount, method, status) VALUES (:booking_id, :amount, :method, :status)";
                            $paymentStmt = $conn->prepare($paymentQuery);
                            $paymentStmt->bindParam(':booking_id', $booking_id);
                            $paymentStmt->bindParam(':amount', $bookingDetails['case_fee']);
                            $paymentStmt->bindParam(':method', $payment_method);
                            $paymentStmt->bindParam(':status', $paymentStatus);
                        }
                        
                        if ($paymentStmt->execute()) {
                            if ($paymentSuccess) {
                                $_SESSION['success_message'] = "Payment processed successfully! Status: Complete. You can now download your documents from the Reports page.";
                                
                                // Update booking status to confirmed if payment is successful
                                $updateBookingQuery = "UPDATE bookings SET status = 'Confirmed' WHERE booking_id = :booking_id";
                                $updateStmt = $conn->prepare($updateBookingQuery);
                                $updateStmt->bindParam(':booking_id', $booking_id);
                                $updateStmt->execute();
                                
                                // Refresh client booking data to show updated payment status
                                $refreshQuery = "
                                    SELECT 
                                        b.*,
                                        c.name as client_name,
                                        c.email as client_email,
                                        l.name as lawyer_name,
                                        cs.case_title,
                                        cs.case_fee,
                                        p.payment_id,
                                        p.status as payment_status
                                    FROM bookings b
                                    JOIN clients c ON b.client_id = c.client_id
                                    JOIN lawyers l ON b.lawyer_id = l.lawyer_id
                                    JOIN cases cs ON b.case_id = cs.case_id
                                    LEFT JOIN payments p ON b.booking_id = p.booking_id
                                    WHERE c.email = :email
                                    ORDER BY b.date DESC
                                ";
                                $refreshStmt = $conn->prepare($refreshQuery);
                                $refreshStmt->bindParam(':email', $_SESSION['payment_client_email']);
                                $refreshStmt->execute();
                                $_SESSION['payment_client_bookings'] = $refreshStmt->fetchAll();
                                
                            } else {
                                $_SESSION['error_message'] = "Payment failed! Please try again with a different payment method.";
                            }
                        }
                    }
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // UPDATE PAYMENT STATUS
        elseif ($_POST['action'] === 'update_payment_status') {
            $payment_id = (int)$_POST['payment_id'];
            $status = sanitizeInput($_POST['status']);
            
            try {
                $updateQuery = "UPDATE payments SET status = :status WHERE payment_id = :payment_id";
                $updateStmt = $conn->prepare($updateQuery);
                $updateStmt->bindParam(':status', $status);
                $updateStmt->bindParam(':payment_id', $payment_id);
                
                if ($updateStmt->execute()) {
                    $_SESSION['success_message'] = "Payment status updated successfully!";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // DELETE PAYMENT
        elseif ($_POST['action'] === 'delete_payment') {
            $payment_id = (int)$_POST['payment_id'];
            
            try {
                $deleteQuery = "DELETE FROM payments WHERE payment_id = :payment_id";
                $deleteStmt = $conn->prepare($deleteQuery);
                $deleteStmt->bindParam(':payment_id', $payment_id);
                
                if ($deleteStmt->execute()) {
                    $_SESSION['success_message'] = "Payment record deleted successfully!";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
    }
}

// Fetch all payments with related information
try {
    $paymentQuery = "
        SELECT 
            p.*,
            b.date as booking_date,
            b.time_slot,
            b.status as booking_status,
            c.name as client_name,
            c.email as client_email,
            l.name as lawyer_name,
            cs.case_title
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN clients c ON b.client_id = c.client_id
        JOIN lawyers l ON b.lawyer_id = l.lawyer_id
        JOIN cases cs ON b.case_id = cs.case_id
        ORDER BY p.date DESC
    ";
    $paymentStmt = $conn->prepare($paymentQuery);
    $paymentStmt->execute();
    $allPayments = $paymentStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching payments: " . $e->getMessage();
}

include 'header.php';
?>

<!-- Page Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h2 class="mb-0">
                    <i class="fas fa-credit-card me-2"></i>Payment Management
                </h2>
                <p class="mb-0 text-white-50">Process payments for legal services</p>
            </div>
        </div>
    </div>
</div>

<!-- Client Payment Processing -->
<div class="row mb-4">
    <div class="col-md-8">
        <?php if (!isset($_SESSION['payment_client_bookings'])): ?>
            <!-- Client Email Verification for Payment -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">
                        <i class="fas fa-user-check me-2"></i>Step 1: Verify Client for Payment
                    </h4>
                </div>
                <div class="card-body">
                    <form method="POST" action="">
                        <input type="hidden" name="action" value="verify_payment_client">
                        <div class="mb-3">
                            <label for="client_email" class="form-label">
                                <i class="fas fa-envelope me-1"></i>Client Email Address *
                            </label>
                            <input type="email" 
                                   class="form-control" 
                                   id="client_email" 
                                   name="client_email" 
                                   required 
                                   placeholder="Enter client's registered email">
                            <div class="form-text">
                                <i class="fas fa-info-circle me-1"></i>
                                Client must have existing bookings to make payments
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search me-2"></i>Find Client Bookings
                        </button>
                    </form>
                </div>
            </div>
        <?php else: ?>
            <!-- Payment Form -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">
                        <i class="fas fa-credit-card me-2"></i>Step 2: Process Payment
                    </h4>
                    <div class="text-white-50 mt-2">
                        <i class="fas fa-envelope me-2"></i>
                        Client Email: <strong><?php echo htmlspecialchars($_SESSION['payment_client_email']); ?></strong>
                        
                        <form method="POST" style="display: inline; margin-left: 15px;">
                            <input type="hidden" name="action" value="change_payment_client">
                            <button type="submit" class="btn btn-sm btn-outline-light">
                                <i class="fas fa-user-edit me-1"></i>Change Client
                            </button>
                        </form>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <?php foreach ($_SESSION['payment_client_bookings'] as $booking): ?>
                        <div class="col-md-6 mb-3">
                            <div class="card <?php echo $booking['payment_id'] ? 'border-success' : 'border-warning'; ?>">
                                <div class="card-header <?php echo $booking['payment_id'] ? 'bg-success text-white' : 'bg-warning text-dark'; ?>">
                                    <h6 class="mb-0">
                                        <i class="fas fa-calendar-check me-2"></i>
                                        Booking #<?php echo $booking['booking_id']; ?>
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <p class="mb-1">
                                        <i class="fas fa-user-tie text-primary me-1"></i>
                                        <strong>Lawyer:</strong> <?php echo htmlspecialchars($booking['lawyer_name']); ?>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-folder-open text-info me-1"></i>
                                        <strong>Case:</strong> <?php echo htmlspecialchars($booking['case_title']); ?>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-calendar text-secondary me-1"></i>
                                        <strong>Date:</strong> <?php echo date('M j, Y', strtotime($booking['date'])); ?>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-clock text-secondary me-1"></i>
                                        <strong>Time:</strong> <?php echo date('g:i A', strtotime($booking['time_slot'])); ?>
                                    </p>
                                    <p class="mb-3">
                                        <i class="fas fa-dollar-sign text-success me-1"></i>
                                        <strong>Amount:</strong> $<?php echo number_format($booking['case_fee'], 2); ?>
                                    </p>
                                    
                                    <?php if ($booking['payment_id']): ?>
                                        <!-- Already Paid -->
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle me-2"></i>
                                            <strong>Already Paid</strong>
                                            <br>Status: <?php echo ucfirst($booking['payment_status']); ?>
                                        </div>
                                    <?php else: ?>
                                        <!-- Payment Form -->
                                        <form method="POST" action="" onsubmit="return confirmPayment(<?php echo $booking['case_fee']; ?>)">
                                            <input type="hidden" name="action" value="process_payment">
                                            <input type="hidden" name="booking_id" value="<?php echo $booking['booking_id']; ?>">
                                            
                                            <div class="mb-3">
                                                <label class="form-label">Payment Method *</label>
                                                <select class="form-select" name="payment_method" required>
                                                    <option value="">Select payment method...</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Credit Card">Credit Card</option>
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                    <option value="Online">Online Payment</option>
                                                </select>
                                            </div>
                                            
                                            <div class="d-grid">
                                                <button type="submit" class="btn btn-success">
                                                    <i class="fas fa-credit-card me-2"></i>
                                                    Pay $<?php echo number_format($booking['case_fee'], 2); ?>
                                                </button>
                                            </div>
                                        </form>
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
    
    <!-- Payment Statistics -->
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-chart-line me-2"></i>Payment Statistics
                </h4>
            </div>
            <div class="card-body">
                <?php
                // Calculate payment statistics
                $totalPayments = count($allPayments);
                $paymentStatuses = array_count_values(array_column($allPayments, 'status'));
                $totalRevenue = array_sum(array_filter(array_map(function($payment) {
                    return $payment['status'] === 'Complete' ? $payment['amount'] : 0;
                }, $allPayments)));
                $todayPayments = count(array_filter($allPayments, function($payment) {
                    return date('Y-m-d', strtotime($payment['date'])) === date('Y-m-d');
                }));
                ?>
                
                <div class="row text-center mb-3">
                    <div class="col-6">
                        <div class="stats-card" style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); padding: 15px;">
                            <div class="stats-number" style="font-size: 1.5rem;"><?php echo $totalPayments; ?></div>
                            <div class="stats-label" style="font-size: 0.8rem;">Total Payments</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px;">
                            <div class="stats-number" style="font-size: 1.5rem;"><?php echo $todayPayments; ?></div>
                            <div class="stats-label" style="font-size: 0.8rem;">Today's Payments</div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <h4 class="text-success">$<?php echo number_format($totalRevenue, 2); ?></h4>
                    <p class="text-muted">Total Revenue (Completed)</p>
                </div>
                
                <h6 class="mb-3">By Status:</h6>
                <?php foreach (['Pending', 'Complete', 'Failed'] as $status): ?>
                    <?php $count = isset($paymentStatuses[$status]) ? $paymentStatuses[$status] : 0; ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <?php
                            $statusIcon = '';
                            switch($status) {
                                case 'Pending': $statusIcon = 'fas fa-clock text-warning'; break;
                                case 'Complete': $statusIcon = 'fas fa-check-circle text-success'; break;
                                case 'Failed': $statusIcon = 'fas fa-times-circle text-danger'; break;
                            }
                            ?>
                            <i class="<?php echo $statusIcon; ?> me-1"></i>
                            <?php echo $status; ?>
                        </span>
                        <span class="badge bg-secondary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
                
                <hr class="my-3">
                
                <h6 class="mb-3">By Payment Method:</h6>
                <?php
                $paymentMethods = array_count_values(array_column($allPayments, 'method'));
                foreach ($paymentMethods as $method => $count):
                ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><?php echo htmlspecialchars($method); ?></span>
                        <span class="badge bg-primary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- All Payments List -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-list me-2"></i>All Payment Records
                </h4>
                <span class="badge bg-white text-dark"><?php echo count($allPayments); ?> payments</span>
            </div>
            <div class="card-body">
                <?php if (!empty($allPayments)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Client</th>
                                    <th>Lawyer</th>
                                    <th>Case</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($allPayments as $payment): ?>
                                <tr>
                                    <td><strong>#<?php echo $payment['payment_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user text-primary me-1"></i>
                                        <strong><?php echo htmlspecialchars($payment['client_name']); ?></strong><br>
                                        <small class="text-muted"><?php echo htmlspecialchars($payment['client_email']); ?></small>
                                    </td>
                                    <td>
                                        <i class="fas fa-user-tie text-success me-1"></i>
                                        <?php echo htmlspecialchars($payment['lawyer_name']); ?>
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
                                        <span class="badge bg-info">
                                            <?php echo htmlspecialchars($payment['method']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <form method="POST" style="display: inline;">
                                            <input type="hidden" name="action" value="update_payment_status">
                                            <input type="hidden" name="payment_id" value="<?php echo $payment['payment_id']; ?>">
                                            <select name="status" class="form-select form-select-sm" onchange="this.form.submit()">
                                                <option value="Pending" <?php echo $payment['status'] === 'Pending' ? 'selected' : ''; ?>>Pending</option>
                                                <option value="Complete" <?php echo $payment['status'] === 'Complete' ? 'selected' : ''; ?>>Complete</option>
                                                <option value="Failed" <?php echo $payment['status'] === 'Failed' ? 'selected' : ''; ?>>Failed</option>
                                            </select>
                                        </form>
                                    </td>
                                    <td>
                                        <i class="fas fa-calendar text-dark me-1"></i>
                                        <?php echo date('M j, Y', strtotime($payment['date'])); ?><br>
                                        <small class="text-muted"><?php echo date('g:i A', strtotime($payment['date'])); ?></small>
                                    </td>
                                    <td>
                                        <!-- Delete Button -->
                                        <form method="POST" 
                                              style="display: inline-block;" 
                                              onsubmit="return confirmDelete('payment', '#<?php echo $payment['payment_id']; ?>')">
                                            <input type="hidden" name="action" value="delete_payment">
                                            <input type="hidden" name="payment_id" value="<?php echo $payment['payment_id']; ?>">
                                            <button type="submit" 
                                                    class="btn btn-sm btn-danger" 
                                                    title="Delete Payment">
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
                        <i class="fas fa-credit-card fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Payment Records Found</h5>
                        <p class="text-muted">Start by verifying a client email and processing your first payment.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
// Payment confirmation
function confirmPayment(amount) {
    return confirm(`Are you sure you want to process payment of $${amount.toFixed(2)}?\n\nThis action will attempt to charge the selected payment method.`);
}

// Auto-submit status change
document.querySelectorAll('select[name="status"]').forEach(function(select) {
    select.addEventListener('change', function() {
        if (confirm('Are you sure you want to update the payment status?')) {
            this.form.submit();
        }
    });
});
</script>

<?php include 'footer.php'; ?>
