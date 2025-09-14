<?php
// Lawyers Management Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Lawyer Management - Lawyer Firm Management System';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        
        // ADD NEW LAWYER
        if ($_POST['action'] === 'add_lawyer') {
            $name = sanitizeInput($_POST['name']);
            $specialization = sanitizeInput($_POST['specialization']);
            $phone = sanitizeInput($_POST['phone']);
            $email = sanitizeInput($_POST['email']);
            $availability = sanitizeInput($_POST['availability']);
            
            // Validate email format
            if (!validateEmail($email)) {
                $_SESSION['error_message'] = "Invalid email format!";
            } else {
                try {
                    // Check if email already exists
                    $checkEmailQuery = "SELECT email FROM lawyers WHERE email = :email";
                    $checkStmt = $conn->prepare($checkEmailQuery);
                    $checkStmt->bindParam(':email', $email);
                    $checkStmt->execute();
                    
                    if ($checkStmt->rowCount() > 0) {
                        // Email already exists
                        $_SESSION['error_message'] = "Lawyer already exists with this email.";
                    } else {
                        // Insert new lawyer
                        $insertQuery = "INSERT INTO lawyers (name, specialization, phone, email, availability) VALUES (:name, :specialization, :phone, :email, :availability)";
                        $insertStmt = $conn->prepare($insertQuery);
                        $insertStmt->bindParam(':name', $name);
                        $insertStmt->bindParam(':specialization', $specialization);
                        $insertStmt->bindParam(':phone', $phone);
                        $insertStmt->bindParam(':email', $email);
                        $insertStmt->bindParam(':availability', $availability);
                        
                        if ($insertStmt->execute()) {
                            $_SESSION['success_message'] = "Lawyer added successfully!";
                        }
                    }
                } catch(PDOException $e) {
                    $_SESSION['error_message'] = "Database error: " . $e->getMessage();
                }
            }
        }
        
        // UPDATE LAWYER
        elseif ($_POST['action'] === 'update_lawyer') {
            $lawyer_id = (int)$_POST['lawyer_id'];
            $name = sanitizeInput($_POST['name']);
            $specialization = sanitizeInput($_POST['specialization']);
            $phone = sanitizeInput($_POST['phone']);
            $email = sanitizeInput($_POST['email']);
            $availability = sanitizeInput($_POST['availability']);
            
            // Validate email format
            if (!validateEmail($email)) {
                $_SESSION['error_message'] = "Invalid email format!";
            } else {
                try {
                    // Check if email exists for another lawyer
                    $checkEmailQuery = "SELECT email FROM lawyers WHERE email = :email AND lawyer_id != :lawyer_id";
                    $checkStmt = $conn->prepare($checkEmailQuery);
                    $checkStmt->bindParam(':email', $email);
                    $checkStmt->bindParam(':lawyer_id', $lawyer_id);
                    $checkStmt->execute();
                    
                    if ($checkStmt->rowCount() > 0) {
                        $_SESSION['error_message'] = "Another lawyer already exists with this email.";
                    } else {
                        // Update lawyer
                        $updateQuery = "UPDATE lawyers SET name = :name, specialization = :specialization, phone = :phone, email = :email, availability = :availability WHERE lawyer_id = :lawyer_id";
                        $updateStmt = $conn->prepare($updateQuery);
                        $updateStmt->bindParam(':name', $name);
                        $updateStmt->bindParam(':specialization', $specialization);
                        $updateStmt->bindParam(':phone', $phone);
                        $updateStmt->bindParam(':email', $email);
                        $updateStmt->bindParam(':availability', $availability);
                        $updateStmt->bindParam(':lawyer_id', $lawyer_id);
                        
                        if ($updateStmt->execute()) {
                            $_SESSION['success_message'] = "Lawyer updated successfully!";
                        }
                    }
                } catch(PDOException $e) {
                    $_SESSION['error_message'] = "Database error: " . $e->getMessage();
                }
            }
        }
        
        // DELETE LAWYER
        elseif ($_POST['action'] === 'delete_lawyer') {
            $lawyer_id = (int)$_POST['lawyer_id'];
            
            try {
                // First check if lawyer has any bookings
                $checkBookingsQuery = "SELECT COUNT(*) as booking_count FROM bookings WHERE lawyer_id = :lawyer_id";
                $checkStmt = $conn->prepare($checkBookingsQuery);
                $checkStmt->bindParam(':lawyer_id', $lawyer_id);
                $checkStmt->execute();
                $bookingCount = $checkStmt->fetch()['booking_count'];
                
                if ($bookingCount > 0) {
                    $_SESSION['error_message'] = "Cannot delete lawyer: Lawyer has existing bookings. Please cancel bookings first.";
                } else {
                    // Delete lawyer
                    $deleteQuery = "DELETE FROM lawyers WHERE lawyer_id = :lawyer_id";
                    $deleteStmt = $conn->prepare($deleteQuery);
                    $deleteStmt->bindParam(':lawyer_id', $lawyer_id);
                    
                    if ($deleteStmt->execute()) {
                        $_SESSION['success_message'] = "Lawyer deleted successfully!";
                    }
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
    }
}

// Fetch all lawyers for display
try {
    $fetchQuery = "SELECT * FROM lawyers ORDER BY created_at DESC";
    $fetchStmt = $conn->prepare($fetchQuery);
    $fetchStmt->execute();
    $lawyers = $fetchStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching lawyers: " . $e->getMessage();
}

// Get lawyer for editing if edit_id is set
$editLawyer = null;
if (isset($_GET['edit_id'])) {
    $edit_id = (int)$_GET['edit_id'];
    try {
        $editQuery = "SELECT * FROM lawyers WHERE lawyer_id = :lawyer_id";
        $editStmt = $conn->prepare($editQuery);
        $editStmt->bindParam(':lawyer_id', $edit_id);
        $editStmt->execute();
        $editLawyer = $editStmt->fetch();
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Error fetching lawyer data: " . $e->getMessage();
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
                    <i class="fas fa-user-tie me-2"></i>Lawyer Management
                </h2>
                <p class="mb-0 text-white-50">Add, edit, and manage lawyer profiles</p>
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Lawyer Form -->
<div class="row mb-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-user-plus me-2"></i>
                    <?php echo $editLawyer ? 'Edit Lawyer' : 'Add New Lawyer'; ?>
                </h4>
            </div>
            <div class="card-body">
                <form method="POST" action="" onsubmit="return validateLawyerForm()">
                    <input type="hidden" name="action" value="<?php echo $editLawyer ? 'update_lawyer' : 'add_lawyer'; ?>">
                    
                    <?php if ($editLawyer): ?>
                        <input type="hidden" name="lawyer_id" value="<?php echo $editLawyer['lawyer_id']; ?>">
                    <?php endif; ?>
                    
                    <!-- Lawyer Name -->
                    <div class="mb-3">
                        <label for="name" class="form-label">
                            <i class="fas fa-user me-1"></i>Full Name *
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="name" 
                               name="name" 
                               value="<?php echo $editLawyer ? htmlspecialchars($editLawyer['name']) : ''; ?>"
                               required 
                               placeholder="Enter lawyer's full name">
                    </div>
                    
                    <!-- Specialization -->
                    <div class="mb-3">
                        <label for="specialization" class="form-label">
                            <i class="fas fa-gavel me-1"></i>Specialization *
                        </label>
                        <select class="form-select" id="specialization" name="specialization" required>
                            <option value="">Select specialization...</option>
                            <option value="Criminal Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Criminal Law') ? 'selected' : ''; ?>>Criminal Law</option>
                            <option value="Family Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Family Law') ? 'selected' : ''; ?>>Family Law</option>
                            <option value="Corporate Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Corporate Law') ? 'selected' : ''; ?>>Corporate Law</option>
                            <option value="Civil Rights" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Civil Rights') ? 'selected' : ''; ?>>Civil Rights</option>
                            <option value="Personal Injury" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Personal Injury') ? 'selected' : ''; ?>>Personal Injury</option>
                            <option value="Property Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Property Law') ? 'selected' : ''; ?>>Property Law</option>
                            <option value="Immigration Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Immigration Law') ? 'selected' : ''; ?>>Immigration Law</option>
                            <option value="Tax Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Tax Law') ? 'selected' : ''; ?>>Tax Law</option>
                            <option value="Business Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Business Law') ? 'selected' : ''; ?>>Business Law</option>
                            <option value="Employment Law" <?php echo ($editLawyer && $editLawyer['specialization'] === 'Employment Law') ? 'selected' : ''; ?>>Employment Law</option>
                        </select>
                    </div>
                    
                    <!-- Phone Number -->
                    <div class="mb-3">
                        <label for="phone" class="form-label">
                            <i class="fas fa-phone me-1"></i>Phone Number *
                        </label>
                        <input type="tel" 
                               class="form-control" 
                               id="phone" 
                               name="phone" 
                               value="<?php echo $editLawyer ? htmlspecialchars($editLawyer['phone']) : ''; ?>"
                               required 
                               placeholder="e.g., +1-555-0123">
                    </div>
                    
                    <!-- Email Address -->
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope me-1"></i>Email Address *
                        </label>
                        <input type="email" 
                               class="form-control" 
                               id="email" 
                               name="email" 
                               value="<?php echo $editLawyer ? htmlspecialchars($editLawyer['email']) : ''; ?>"
                               required 
                               placeholder="lawyer@example.com">
                        <div class="form-text">
                            <i class="fas fa-info-circle me-1"></i>
                            Email must be unique for each lawyer
                        </div>
                    </div>
                    
                    <!-- Availability Status -->
                    <div class="mb-3">
                        <label for="availability" class="form-label">
                            <i class="fas fa-clock me-1"></i>Availability Status *
                        </label>
                        <select class="form-select" id="availability" name="availability" required>
                            <option value="Available" <?php echo ($editLawyer && $editLawyer['availability'] === 'Available') ? 'selected' : ''; ?>>Available</option>
                            <option value="Busy" <?php echo ($editLawyer && $editLawyer['availability'] === 'Busy') ? 'selected' : ''; ?>>Busy</option>
                            <option value="On Leave" <?php echo ($editLawyer && $editLawyer['availability'] === 'On Leave') ? 'selected' : ''; ?>>On Leave</option>
                        </select>
                    </div>
                    
                    <!-- Submit Button -->
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            <?php echo $editLawyer ? 'Update Lawyer' : 'Add Lawyer'; ?>
                        </button>
                        
                        <?php if ($editLawyer): ?>
                            <a href="lawyers.php" class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Cancel Edit
                            </a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Lawyer Statistics -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>Lawyer Statistics
                </h4>
            </div>
            <div class="card-body">
                <?php
                // Calculate statistics
                $totalLawyers = count($lawyers);
                $specializations = array_count_values(array_column($lawyers, 'specialization'));
                $availabilityStats = array_count_values(array_column($lawyers, 'availability'));
                ?>
                
                <div class="text-center mb-4">
                    <h2 class="text-primary"><?php echo $totalLawyers; ?></h2>
                    <p class="text-muted">Total Registered Lawyers</p>
                </div>
                
                <h6 class="mb-3">By Specialization:</h6>
                <?php foreach ($specializations as $spec => $count): ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><?php echo htmlspecialchars($spec); ?></span>
                        <span class="badge bg-primary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
                
                <hr class="my-3">
                
                <h6 class="mb-3">By Availability:</h6>
                <?php foreach ($availabilityStats as $status => $count): ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <?php
                            $statusIcon = '';
                            switch($status) {
                                case 'Available': $statusIcon = 'fas fa-check-circle text-success'; break;
                                case 'Busy': $statusIcon = 'fas fa-clock text-warning'; break;
                                case 'On Leave': $statusIcon = 'fas fa-times-circle text-danger'; break;
                            }
                            ?>
                            <i class="<?php echo $statusIcon; ?> me-1"></i>
                            <?php echo htmlspecialchars($status); ?>
                        </span>
                        <span class="badge bg-secondary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
                
                <?php if (empty($lawyers)): ?>
                    <div class="text-center text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        No lawyers registered yet
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Lawyers List -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-list me-2"></i>All Lawyers
                </h4>
                <span class="badge bg-white text-dark"><?php echo count($lawyers); ?> lawyers</span>
            </div>
            <div class="card-body">
                <?php if (!empty($lawyers)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Specialization</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Availability</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($lawyers as $lawyer): ?>
                                <tr>
                                    <td><strong>#<?php echo $lawyer['lawyer_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user-tie text-primary me-2"></i>
                                        <?php echo htmlspecialchars($lawyer['name']); ?>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">
                                            <?php echo htmlspecialchars($lawyer['specialization']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <i class="fas fa-phone text-success me-1"></i>
                                        <?php echo htmlspecialchars($lawyer['phone']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-envelope text-info me-1"></i>
                                        <small><?php echo htmlspecialchars($lawyer['email']); ?></small>
                                    </td>
                                    <td>
                                        <?php
                                        $statusClass = '';
                                        $statusIcon = '';
                                        switch($lawyer['availability']) {
                                            case 'Available':
                                                $statusClass = 'success';
                                                $statusIcon = 'fas fa-check-circle';
                                                break;
                                            case 'Busy':
                                                $statusClass = 'warning';
                                                $statusIcon = 'fas fa-clock';
                                                break;
                                            case 'On Leave':
                                                $statusClass = 'danger';
                                                $statusIcon = 'fas fa-times-circle';
                                                break;
                                        }
                                        ?>
                                        <span class="badge bg-<?php echo $statusClass; ?>">
                                            <i class="<?php echo $statusIcon; ?> me-1"></i>
                                            <?php echo $lawyer['availability']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <small class="text-muted">
                                            <?php echo date('M j, Y', strtotime($lawyer['created_at'])); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <!-- Edit Button -->
                                        <a href="lawyers.php?edit_id=<?php echo $lawyer['lawyer_id']; ?>" 
                                           class="btn btn-sm btn-warning me-1" 
                                           title="Edit Lawyer">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        
                                        <!-- Delete Button -->
                                        <form method="POST" 
                                              style="display: inline-block;" 
                                              onsubmit="return confirmDelete('lawyer', '<?php echo htmlspecialchars($lawyer['name']); ?>')">
                                            <input type="hidden" name="action" value="delete_lawyer">
                                            <input type="hidden" name="lawyer_id" value="<?php echo $lawyer['lawyer_id']; ?>">
                                            <button type="submit" 
                                                    class="btn btn-sm btn-danger" 
                                                    title="Delete Lawyer">
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
                        <i class="fas fa-user-tie fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Lawyers Found</h5>
                        <p class="text-muted">Start by adding your first lawyer using the form above.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
// Lawyer form validation
function validateLawyerForm() {
    const name = document.getElementById('name').value.trim();
    const specialization = document.getElementById('specialization').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const availability = document.getElementById('availability').value;
    
    // Check if all fields are filled
    if (!name || !specialization || !phone || !email || !availability) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    // Validate phone format (basic check)
    if (!validatePhone(phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }
    
    return true;
}
</script>

<?php include 'footer.php'; ?>
