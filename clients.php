<?php
// Clients Management Page - Lawyer Firm Management System
// lawyer_firm BINTE MUHAMMAD | ID: 2320315

session_start();
require_once 'config.php';

$pageTitle = 'Client Management - Lawyer Firm Management System';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        
        // ADD NEW CLIENT
        if ($_POST['action'] === 'add_client') {
            $name = sanitizeInput($_POST['name']);
            $phone = sanitizeInput($_POST['phone']);
            $email = sanitizeInput($_POST['email']);
            $case_type = sanitizeInput($_POST['case_type']);
            
            // Validate email format
            if (!validateEmail($email)) {
                $_SESSION['error_message'] = "Invalid email format!";
            } else {
                try {
                    // Check if email already exists
                    $checkEmailQuery = "SELECT email FROM clients WHERE email = :email";
                    $checkStmt = $conn->prepare($checkEmailQuery);
                    $checkStmt->bindParam(':email', $email);
                    $checkStmt->execute();
                    
                    if ($checkStmt->rowCount() > 0) {
                        // Email already exists
                        $_SESSION['error_message'] = "Client already exists with this email.";
                    } else {
                        // Insert new client
                        $insertQuery = "INSERT INTO clients (name, phone, email, case_type) VALUES (:name, :phone, :email, :case_type)";
                        $insertStmt = $conn->prepare($insertQuery);
                        $insertStmt->bindParam(':name', $name);
                        $insertStmt->bindParam(':phone', $phone);
                        $insertStmt->bindParam(':email', $email);
                        $insertStmt->bindParam(':case_type', $case_type);
                        
                        if ($insertStmt->execute()) {
                            $_SESSION['success_message'] = "Client added successfully!";
                        }
                    }
                } catch(PDOException $e) {
                    $_SESSION['error_message'] = "Database error: " . $e->getMessage();
                }
            }
        }
        
        // UPDATE CLIENT
        elseif ($_POST['action'] === 'update_client') {
            $client_id = (int)$_POST['client_id'];
            $name = sanitizeInput($_POST['name']);
            $phone = sanitizeInput($_POST['phone']);
            $email = sanitizeInput($_POST['email']);
            $case_type = sanitizeInput($_POST['case_type']);
            
            // Validate email format
            if (!validateEmail($email)) {
                $_SESSION['error_message'] = "Invalid email format!";
            } else {
                try {
                    // Check if email exists for another client
                    $checkEmailQuery = "SELECT email FROM clients WHERE email = :email AND client_id != :client_id";
                    $checkStmt = $conn->prepare($checkEmailQuery);
                    $checkStmt->bindParam(':email', $email);
                    $checkStmt->bindParam(':client_id', $client_id);
                    $checkStmt->execute();
                    
                    if ($checkStmt->rowCount() > 0) {
                        $_SESSION['error_message'] = "Another client already exists with this email.";
                    } else {
                        // Update client
                        $updateQuery = "UPDATE clients SET name = :name, phone = :phone, email = :email, case_type = :case_type WHERE client_id = :client_id";
                        $updateStmt = $conn->prepare($updateQuery);
                        $updateStmt->bindParam(':name', $name);
                        $updateStmt->bindParam(':phone', $phone);
                        $updateStmt->bindParam(':email', $email);
                        $updateStmt->bindParam(':case_type', $case_type);
                        $updateStmt->bindParam(':client_id', $client_id);
                        
                        if ($updateStmt->execute()) {
                            $_SESSION['success_message'] = "Client updated successfully!";
                        }
                    }
                } catch(PDOException $e) {
                    $_SESSION['error_message'] = "Database error: " . $e->getMessage();
                }
            }
        }
        
        // DELETE CLIENT
        elseif ($_POST['action'] === 'delete_client') {
            $client_id = (int)$_POST['client_id'];
            
            try {
                // First check if client has any bookings
                $checkBookingsQuery = "SELECT COUNT(*) as booking_count FROM bookings WHERE client_id = :client_id";
                $checkStmt = $conn->prepare($checkBookingsQuery);
                $checkStmt->bindParam(':client_id', $client_id);
                $checkStmt->execute();
                $bookingCount = $checkStmt->fetch()['booking_count'];
                
                if ($bookingCount > 0) {
                    $_SESSION['error_message'] = "Cannot delete client: Client has existing bookings. Please cancel bookings first.";
                } else {
                    // Delete client
                    $deleteQuery = "DELETE FROM clients WHERE client_id = :client_id";
                    $deleteStmt = $conn->prepare($deleteQuery);
                    $deleteStmt->bindParam(':client_id', $client_id);
                    
                    if ($deleteStmt->execute()) {
                        $_SESSION['success_message'] = "Client deleted successfully!";
                    }
                }
            } catch(PDOException $e) {
                $_SESSION['error_message'] = "Database error: " . $e->getMessage();
            }
        }
    }
}

// Fetch all clients for display
try {
    $fetchQuery = "SELECT * FROM clients ORDER BY created_at DESC";
    $fetchStmt = $conn->prepare($fetchQuery);
    $fetchStmt->execute();
    $clients = $fetchStmt->fetchAll();
} catch(PDOException $e) {
    $error_message = "Error fetching clients: " . $e->getMessage();
}

// Get client for editing if edit_id is set
$editClient = null;
if (isset($_GET['edit_id'])) {
    $edit_id = (int)$_GET['edit_id'];
    try {
        $editQuery = "SELECT * FROM clients WHERE client_id = :client_id";
        $editStmt = $conn->prepare($editQuery);
        $editStmt->bindParam(':client_id', $edit_id);
        $editStmt->execute();
        $editClient = $editStmt->fetch();
    } catch(PDOException $e) {
        $_SESSION['error_message'] = "Error fetching client data: " . $e->getMessage();
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
                    <i class="fas fa-users me-2"></i>Client Management
                </h2>
                <p class="mb-0 text-white-50">Add, edit, and manage client information</p>
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Client Form -->
<div class="row mb-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-user-plus me-2"></i>
                    <?php echo $editClient ? 'Edit Client' : 'Add New Client'; ?>
                </h4>
            </div>
            <div class="card-body">
                <form method="POST" action="" onsubmit="return validateClientForm()">
                    <input type="hidden" name="action" value="<?php echo $editClient ? 'update_client' : 'add_client'; ?>">
                    
                    <?php if ($editClient): ?>
                        <input type="hidden" name="client_id" value="<?php echo $editClient['client_id']; ?>">
                    <?php endif; ?>
                    
                    <!-- Client Name -->
                    <div class="mb-3">
                        <label for="name" class="form-label">
                            <i class="fas fa-user me-1"></i>Full Name *
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="name" 
                               name="name" 
                               value="<?php echo $editClient ? htmlspecialchars($editClient['name']) : ''; ?>"
                               required 
                               placeholder="Enter client's full name">
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
                               value="<?php echo $editClient ? htmlspecialchars($editClient['phone']) : ''; ?>"
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
                               value="<?php echo $editClient ? htmlspecialchars($editClient['email']) : ''; ?>"
                               required 
                               placeholder="client@example.com">
                        <div class="form-text">
                            <i class="fas fa-info-circle me-1"></i>
                            Email must be unique for each client
                        </div>
                    </div>
                    
                    <!-- Case Type -->
                    <div class="mb-3">
                        <label for="case_type" class="form-label">
                            <i class="fas fa-gavel me-1"></i>Case Type *
                        </label>
                        <select class="form-select" id="case_type" name="case_type" required>
                            <option value="">Select case type...</option>
                            <option value="Criminal Law" <?php echo ($editClient && $editClient['case_type'] === 'Criminal Law') ? 'selected' : ''; ?>>Criminal Law</option>
                            <option value="Family Law" <?php echo ($editClient && $editClient['case_type'] === 'Family Law') ? 'selected' : ''; ?>>Family Law</option>
                            <option value="Corporate Law" <?php echo ($editClient && $editClient['case_type'] === 'Corporate Law') ? 'selected' : ''; ?>>Corporate Law</option>
                            <option value="Civil Rights" <?php echo ($editClient && $editClient['case_type'] === 'Civil Rights') ? 'selected' : ''; ?>>Civil Rights</option>
                            <option value="Personal Injury" <?php echo ($editClient && $editClient['case_type'] === 'Personal Injury') ? 'selected' : ''; ?>>Personal Injury</option>
                            <option value="Property Law" <?php echo ($editClient && $editClient['case_type'] === 'Property Law') ? 'selected' : ''; ?>>Property Law</option>
                            <option value="Immigration Law" <?php echo ($editClient && $editClient['case_type'] === 'Immigration Law') ? 'selected' : ''; ?>>Immigration Law</option>
                            <option value="Tax Law" <?php echo ($editClient && $editClient['case_type'] === 'Tax Law') ? 'selected' : ''; ?>>Tax Law</option>
                        </select>
                    </div>
                    
                    <!-- Submit Button -->
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            <?php echo $editClient ? 'Update Client' : 'Add Client'; ?>
                        </button>
                        
                        <?php if ($editClient): ?>
                            <a href="clients.php" class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Cancel Edit
                            </a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Client Statistics -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>Client Statistics
                </h4>
            </div>
            <div class="card-body">
                <?php
                // Calculate statistics
                $totalClients = count($clients);
                $caseTypes = array_count_values(array_column($clients, 'case_type'));
                ?>
                
                <div class="text-center mb-4">
                    <h2 class="text-primary"><?php echo $totalClients; ?></h2>
                    <p class="text-muted">Total Registered Clients</p>
                </div>
                
                <h6 class="mb-3">Cases by Type:</h6>
                <?php foreach ($caseTypes as $type => $count): ?>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><?php echo htmlspecialchars($type); ?></span>
                        <span class="badge bg-primary"><?php echo $count; ?></span>
                    </div>
                <?php endforeach; ?>
                
                <?php if (empty($caseTypes)): ?>
                    <div class="text-center text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        No clients registered yet
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Clients List -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-list me-2"></i>All Clients
                </h4>
                <span class="badge bg-white text-dark"><?php echo count($clients); ?> clients</span>
            </div>
            <div class="card-body">
                <?php if (!empty($clients)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Case Type</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($clients as $client): ?>
                                <tr>
                                    <td><strong>#<?php echo $client['client_id']; ?></strong></td>
                                    <td>
                                        <i class="fas fa-user text-primary me-2"></i>
                                        <?php echo htmlspecialchars($client['name']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-phone text-success me-1"></i>
                                        <?php echo htmlspecialchars($client['phone']); ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-envelope text-info me-1"></i>
                                        <?php echo htmlspecialchars($client['email']); ?>
                                    </td>
                                    <td>
                                        <span class="badge bg-secondary">
                                            <?php echo htmlspecialchars($client['case_type']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <small class="text-muted">
                                            <?php echo date('M j, Y', strtotime($client['created_at'])); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <!-- Edit Button -->
                                        <a href="clients.php?edit_id=<?php echo $client['client_id']; ?>" 
                                           class="btn btn-sm btn-warning me-1" 
                                           title="Edit Client">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        
                                        <!-- Delete Button -->
                                        <form method="POST" 
                                              style="display: inline-block;" 
                                              onsubmit="return confirmDelete('client', '<?php echo htmlspecialchars($client['name']); ?>')">
                                            <input type="hidden" name="action" value="delete_client">
                                            <input type="hidden" name="client_id" value="<?php echo $client['client_id']; ?>">
                                            <button type="submit" 
                                                    class="btn btn-sm btn-danger" 
                                                    title="Delete Client">
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
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No Clients Found</h5>
                        <p class="text-muted">Start by adding your first client using the form above.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
// Client form validation
function validateClientForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const caseType = document.getElementById('case_type').value;
    
    // Check if all fields are filled
    if (!name || !phone || !email || !caseType) {
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
