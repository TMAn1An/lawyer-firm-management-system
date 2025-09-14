<?php
// Cases Management Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Case Management - Lawyer Firm Management System';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        
        // ADD NEW CASE
        if ($_POST['action'] === 'add_case') {
            $case_title = sanitizeInput($_POST['case_title']);
            $case_description = sanitizeInput($_POST['case_description']);
            $case_fee = (float)$_POST['case_fee'];
            $case_status = sanitizeInput($_POST['case_status']);
            
            try {
                // Insert new case
                $insertQuery = "INSERT INTO cases (case_title, case_description, case_fee, case_status) VALUES (:case_title, :case_description, :case_fee, :case_status)";
                $insertStmt = $conn->prepare($insertQuery);
                $insertStmt->bindParam(':case_title', $case_title);
                $insertStmt->bindParam(':case_description', $case_description);
                $insertStmt->bindParam(':case_fee', $case_fee);
                $insertStmt->bindParam(':case_status', $case_status);
                
                if ($insertStmt->execute()) {
                    $_SESSION['success_message'] = "Case added successfully!";
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // UPDATE CASE
        elseif ($_POST['action'] === 'update_case') {
            $case_id = (int)$_POST['case_id'];
            $case_title = sanitizeInput($_POST['case_title']);
            $case_description = sanitizeInput($_POST['case_description']);
            $case_fee = (float)$_POST['case_fee'];
            $case_status = sanitizeInput($_POST['case_status']);
            
            try {
                // Update case
                $updateQuery = "UPDATE cases SET case_title = :case_title, case_description = :case_description, case_fee = :case_fee, case_status = :case_status WHERE case_id = :case_id";
                $updateStmt = $conn->prepare($updateQuery);
                $updateStmt->bindParam(':case_title', $case_title);
                $updateStmt->bindParam(':case_description', $case_description);
                $updateStmt->bindParam(':case_fee', $case_fee);
                $updateStmt->bindParam(':case_status', $case_status);
                $updateStmt->bindParam(':case_id', $case_id);
                
                if ($updateStmt->execute()) {
                    $_SESSION['success_message'] = "Case updated successfully!";
                    
                    // If case is set to active and has bookings, mark those as confirmed
                    if ($case_status === 'Active') {
                        $updateBookingsQuery = "UPDATE bookings SET status = 'Confirmed' WHERE case_id = :case_id AND status = 'Pending'";
                        $updateBookingsStmt = $conn->prepare($updateBookingsQuery);
                        $updateBookingsStmt->bindParam(':case_id', $case_id);
                        $updateBookingsStmt->execute();
                    }
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
        
        // DELETE CASE
        elseif ($_POST['action'] === 'delete_case') {
            $case_id = (int)$_POST['case_id'];
            
            try {
                // First check if case has any bookings
                $checkBookingsQuery = "SELECT COUNT(*) as booking_count FROM bookings WHERE case_id = :case_id";
                $checkStmt = $conn->prepare($checkBookingsQuery);
                $checkStmt->bindParam(':case_id', $case_id);
                $checkStmt->execute();
                $bookingCount = $checkStmt->fetch()['booking_count'];
                
                if ($bookingCount > 0) {
                    $_SESSION['error_message'] = "Cannot delete case: Case has existing bookings. Please cancel bookings first.";
                } else {
                    // Delete case
                    $deleteQuery = "DELETE FROM cases WHERE case_id = :case_id";
                    $deleteStmt = $conn->prepare($deleteQuery);
                    $deleteStmt->bindParam(':case_id', $case_id);
                    
                    if ($deleteStmt->execute()) {
                        $_SESSION['success_message'] = "Case deleted successfully!";
                    }
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
    }
}

// Fetch all cases for display with booking count
try {
    $fetchQuery = "
        SELECT 
            c.*,
            COUNT(b.booking_id) as booking_count,
            COALESCE(SUM(CASE WHEN b.status = 'Confirmed' THEN 1 ELSE 0 END), 0) as confirmed_bookings
        FROM cases c
        LEFT JOIN bookings b ON c.case_id = b.case_id
        GROUP BY c.case_id
        ORDER BY c.created_at DESC
    ";
    $fetchStmt = $conn->prepare($fetchQuery);
    $fetchStmt->execute();
    $cases = $fetchStmt->fetchAll();
    
    // Auto-update case status based on bookings
    foreach ($cases as $case) {
        if ($case['confirmed_bookings'] > 0 && $case['case_status'] !== 'Active') {
            // Case has confirmed bookings, make it active
            $autoUpdateQuery = "UPDATE cases SET case_status = 'Active' WHERE case_id = :case_id";
            $autoUpdateStmt = $conn->prepare($autoUpdateQuery);
            $autoUpdateStmt->bindParam(':case_id', $case['case_id']);
            $autoUpdateStmt->execute();
        }
    }
    
    // Re-fetch cases after auto-update
    $fetchStmt->execute();
    $cases = $fetchStmt->fetchAll();
    
} catch(PDOException $e) {
    $error_message = "Error fetching cases: " . $e->getMessage();
}

// Get case for editing if edit_id is set
$editCase = null;
if (isset($_GET['edit_id'])) {
    $edit_id = (int)$_GET['edit_id'];
    try {
        $editQuery = "SELECT * FROM cases WHERE case_id = :case_id";
        $editStmt = $conn->prepare($editQuery);
        $editStmt->bindParam(':case_id', $edit_id);
        $editStmt->execute();
        $editCase = $editStmt->fetch();
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Error fetching case data: " . $e->getMessage();
    }
}

include 'header.php';
?>

<!-- Page Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h2 class="mb-0">
                    <i class="fas fa-folder-open me-2"></i>Case Management
                </h2>
                <p class="mb-0 text-white-50">Add, edit, and manage legal cases</p>
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Case Form -->
<div class="row mb-4">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-plus-circle me-2"></i>
                    <?php echo $editCase ? 'Edit Case' : 'Add New Case'; ?>
                </h4>
            </div>
            <div class="card-body">
                <form method="POST" action="" onsubmit="return validateCaseForm()">
                    <input type="hidden" name="action" value="<?php echo $editCase ? 'update_case' : 'add_case'; ?>">
                    
                    <?php if ($editCase): ?>
                        <input type="hidden" name="case_id" value="<?php echo $editCase['case_id']; ?>">
                    <?php endif; ?>
                    
                    <div class="row">
                        <!-- Case Title -->
                        <div class="col-md-8 mb-3">
                            <label for="case_title" class="form-label">
                                <i class="fas fa-file-alt me-1"></i>Case Title *
                            </label>
                            <input type="text" 
                                   class="form-control" 
                                   id="case_title" 
                                   name="case_title" 
                                   value="<?php echo $editCase ? htmlspecialchars($editCase['case_title']) : ''; ?>"
                                   required 
                                   placeholder="Enter descriptive case title">
                        </div>
                        
                        <!-- Case Fee -->
                        <div class="col-md-4 mb-3">
                            <label for="case_fee" class="form-label">
                                <i class="fas fa-dollar-sign me-1"></i>Case Fee *
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" 
                                       class="form-control" 
                                       id="case_fee" 
                                       name="case_fee" 
                                       value="<?php echo $editCase ? $editCase['case_fee'] : ''; ?>"
                                       step="0.01" 
                                       min="0" 
                                       required 
                                       placeholder="0.00">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Case Description -->
                    <div class="mb-3">
                        <label for="case_description" class="form-label">
                            <i class="fas fa-align-left me-1"></i>Case Description *
                        </label>
                        <textarea class="form-control" 
                                  id="case_description" 
                                  name="case_description" 
                                  rows="4" 
                                  required 
                                  placeholder="Provide detailed description of the case, including background and requirements"><?php echo $editCase ? htmlspecialchars($editCase['case_description']) : ''; ?></textarea>
                    </div>
                    
                    <!-- Case Status -->
                    <div class="mb-3">
                        <label for="case_status" class="form-label">
                            <i class="fas fa-toggle-on me-1"></i>Case Status *
                        </label>
                        <select class="form-select" id="case_status" name="case_status" required>
                            <option value="Active" <?php echo ($editCase && $editCase['case_status'] === 'Active') ? 'selected' : ''; ?>>Active</option>
                            <option value="Closed" <?php echo ($editCase && $editCase['case_status'] === 'Closed') ? 'selected' : ''; ?>>Closed</option>
                        </select>
                        <div class="form-text">
                            <i class="fas fa-info-circle me-1"></i>
                            Cases with confirmed bookings are automatically set to Active
                        </div>
                    </div>
                    
                    <!-- Submit Button -->
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            <?php echo $editCase ? 'Update Case' : 'Add Case'; ?>
                        </button>
                        
                        <?php if ($editCase): ?>
                            <a href="cases.php" class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Cancel Edit
                            </a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Case Statistics -->
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>Case Statistics
                </h4>
            </div>
            <div class="card-body">
                <?php
                // Calculate statistics
                $totalCases = count($cases);
                $activeCases = count(array_filter($cases, function($case) { return $case['case_status'] === 'Active'; }));
                $closedCases = $totalCases - $activeCases;
                $totalRevenue = array_sum(array_column($cases, 'case_fee'));
                ?>
                
                <div class="row text-center mb-3">
                    <div class="col-6">
                        <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px;">
                            <div class="stats-number" style="font-size: 1.5rem;"><?php echo $totalCases; ?></div>
                            <div class="stats-label" style="font-size: 0.8rem;">Total Cases</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stats-card" style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); padding: 15px;">
                            <div class="stats-number" style="font-size: 1.5rem;"><?php echo $activeCases; ?></div>
                            <div class="stats-label" style="font-size: 0.8rem;">Active Cases</div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h6>Status Breakdown:</h6>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-play-circle text-success me-1"></i>Active</span>
                        <span class="badge bg-success"><?php echo $activeCases; ?></span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-stop-circle text-secondary me-1"></i>Closed</span>
                        <span class="badge bg-secondary"><?php echo $closedCases; ?></span>
                    </div>
                </div>
                
                <hr>
                
                <div class="text-center">
                    <h6>Total Case Value</h6>
                    <h4 class="text-success">$<?php echo number_format($totalRevenue, 2); ?></h4>
                </div>
                
                <?php if (empty($cases)): ?>
                    <div class="text-center text-muted mt-3">
                        <i class="fas fa-info-circle me-1"></i>
                        No cases added yet
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Cases List -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-list me-2"></i>All Cases
                </h4>
                <span class="badge bg-white text-dark"><?php echo count($cases); ?> cases</span>
            </div>
            <div class="card-body">
                <?php if (!empty($cases)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Bookings</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($cases as $case): ?>
                                <tr>
                                    <td><strong>#<?php echo $case['case_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-file-alt text-primary me-2"></i>
                                        <strong><?php echo htmlspecialchars($case['case_title']); ?></strong>
                                    </td>
                                    <td>
                                        <small class="text-muted">
                                            <?php echo strlen($case['case_description']) > 50 
                                                ? substr(htmlspecialchars($case['case_description']), 0, 50) . '...' 
                                                : htmlspecialchars($case['case_description']); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <strong class="text-success">
                                            <i class="fas fa-dollar-sign me-1"></i>
                                            <?php echo number_format($case['case_fee'], 2); ?>
                                        </strong>
                                    </td>
                                    <td>
                                        <?php
                                        $statusClass = $case['case_status'] === 'Active' ? 'success' : 'secondary';
                                        $statusIcon = $case['case_status'] === 'Active' ? 'play-circle' : 'stop-circle';
                                        ?>
                                        <span class="badge bg-<?php echo $statusClass; ?>">
                                            <i class="fas fa-<?php echo $statusIcon; ?> me-1"></i>
                                            <?php echo $case['case_status']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($case['booking_count'] > 0): ?>
                                            <span class="badge bg-info">
                                                <i class="fas fa-calendar-check me-1"></i>
                                                <?php echo $case['booking_count']; ?> booking(s)
                                            </span>
                                        <?php else: ?>
                                            <span class="text-muted">
                                                <i class="fas fa-calendar-times me-1"></i>
                                                No bookings
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <small class="text-muted">
                                            <?php echo date('M j, Y', strtotime($case['created_at'])); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <!-- Edit Button -->
                                        <a href="cases.php?edit_id=<?php echo $case['case_id']; ?>" 
                                           class="btn btn-sm btn-warning me-1" 
                                           title="Edit Case">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        
                                        <!-- Delete Button -->
                                        <form method="POST" 
                                              style="display: inline-block;" 
                                              onsubmit="return confirmDelete('case', '<?php echo htmlspecialchars($case['case_title']); ?>')">
                                            <input type="hidden" name="action" value="delete_case">
                                            <input type="hidden" name="case_id" value="<?php echo $case['case_id']; ?>">
                                            <button type="submit" 
                                                    class="btn btn-sm btn-danger" 
                                                    title="Delete Case">
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
                        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Cases Found</h5>
                        <p class="text-muted">Start by adding your first case using the form above.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
// Case form validation
function validateCaseForm() {
    const title = document.getElementById('case_title').value.trim();
    const description = document.getElementById('case_description').value.trim();
    const fee = parseFloat(document.getElementById('case_fee').value);
    const status = document.getElementById('case_status').value;
    
    // Check if all fields are filled
    if (!title || !description || !status) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Validate fee
    if (isNaN(fee) || fee < 0) {
        alert('Please enter a valid case fee (must be 0 or greater).');
        return false;
    }
    
    // Check description length
    if (description.length < 10) {
        alert('Case description should be at least 10 characters long.');
        return false;
    }
    
    return true;
}
</script>

<?php include 'footer.php'; ?>
