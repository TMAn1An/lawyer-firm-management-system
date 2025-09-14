<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $reportType === 'appointment_slip' ? 'Appointment Slip' : 'Payment Invoice'; ?> - Lawyer Firm Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Print-friendly styles */
        @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 10px; }
            .container { max-width: 100% !important; margin: 0; padding: 0; }
            .page { page-break-after: always; }
            .compact-slip { 
                height: 48vh; 
                border: 2px solid #333; 
                margin-bottom: 10px;
                page-break-inside: avoid;
            }
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background-color: white;
            color: #333;
            font-size: 12px;
            line-height: 1.3;
        }
        
        .compact-slip {
            border: 2px solid #2c3e50;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            height: 45vh;
            display: flex;
            flex-direction: column;
        }
        
        .document-header {
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .firm-logo {
            font-size: 1.4rem;
            color: #2c3e50;
            font-weight: bold;
            margin: 0;
        }
        
        .document-title {
            font-size: 1.1rem;
            color: #34495e;
            margin: 5px 0;
            font-weight: bold;
        }
        
        .slip-content {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .info-column {
            flex: 1;
            min-width: 180px;
        }
        
        .info-group {
            margin-bottom: 8px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 4px;
            font-size: 11px;
        }
        
        .label {
            font-weight: bold;
            color: #2c3e50;
            min-width: 70px;
            font-size: 10px;
        }
        
        .value {
            color: #34495e;
            font-size: 11px;
            flex: 1;
        }
        
        .amount-highlight {
            background-color: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 4px;
            padding: 6px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #155724;
            margin: 8px 0;
        }
        
        .status-badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-confirmed {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-complete {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        
        .document-footer {
            border-top: 1px solid #2c3e50;
            padding-top: 8px;
            margin-top: auto;
            text-align: center;
            color: #6c757d;
            font-size: 9px;
        }
        
        .signature-section {
            margin-top: 12px;
            padding: 8px 0;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            width: 120px;
            text-align: center;
            margin: 8px auto 5px;
            padding-top: 3px;
            font-size: 8px;
        }
        
        .terms-section {
            background-color: #f8f9fa;
            padding: 6px;
            margin: 6px 0;
            font-size: 8px;
            color: #6c757d;
            border-left: 2px solid #6c757d;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        
        <?php if ($reportType === 'appointment_slip'): ?>
            <!-- APPOINTMENT SLIP - COMPACT VERSION -->
            <div class="compact-slip">
                <div class="document-header">
                    <div class="firm-logo">
                        <i class="fas fa-balance-scale"></i> Lawyer Firm Management
                    </div>
                    <div class="document-title">APPOINTMENT SLIP</div>
                    <div style="font-size: 9px;">Document #: AS-<?php echo $reportData['booking_id']; ?> | Generated: <?php echo date('M j, Y g:i A'); ?></div>
                </div>

                <div class="slip-content">
                    <div class="info-column">
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">CLIENT INFORMATION</strong>
                            <div class="info-row">
                                <span class="label">Name:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_name']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_email']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Phone:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_phone']); ?></span>
                            </div>
                        </div>
                        
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">CASE DETAILS</strong>
                            <div class="info-row">
                                <span class="label">Case:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['case_title']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Type:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_case_type']); ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-column">
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">APPOINTMENT DETAILS</strong>
                            <div class="info-row">
                                <span class="label">Date:</span>
                                <span class="value"><?php echo date('M j, Y', strtotime($reportData['date'])); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Time:</span>
                                <span class="value"><?php echo date('g:i A', strtotime($reportData['time_slot'])); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Status:</span>
                                <span class="value">
                                    <span class="status-badge status-<?php echo strtolower($reportData['status']); ?>">
                                        <?php echo $reportData['status']; ?>
                                    </span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">LAWYER INFORMATION</strong>
                            <div class="info-row">
                                <span class="label">Name:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['lawyer_name']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Special:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['lawyer_specialization']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Phone:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['lawyer_phone']); ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-column">
                        <div class="amount-highlight">
                            Legal Fee: $<?php echo number_format($reportData['case_fee'], 2); ?>
                        </div>
                        
                        <?php if ($reportData['payment_status'] === 'Complete'): ?>
                            <div class="status-badge status-complete" style="width: 100%; text-align: center; padding: 4px;">
                                ✓ PAYMENT CONFIRMED
                            </div>
                        <?php else: ?>
                            <div class="status-badge status-pending" style="width: 100%; text-align: center; padding: 4px;">
                                ⚠ PAYMENT PENDING
                            </div>
                        <?php endif; ?>
                        
                        <div class="terms-section">
                            <strong>Important:</strong><br>
                            • Please arrive 15 minutes early<br>
                            • Bring valid ID and case documents<br>
                            • Payment due before consultation
                        </div>
                    </div>
                </div>

                <div class="document-footer">
                    <div class="signature-section">
                        <div>
                            <div class="signature-line">Client Signature</div>
                        </div>
                        <div>
                            <div class="signature-line">Lawyer Signature</div>
                        </div>
                    </div>
                    <div>lawyer_firm BINTE MUHAMMAD | ID: 2320315</div>
                    <div>Professional Legal Services | Phone: +1 (555) 123-4567 | Email: info@lawfirm.com</div>
                </div>
            </div>

        <?php elseif ($reportType === 'payment_invoice'): ?>
            <!-- PAYMENT INVOICE - COMPACT VERSION -->
            <div class="compact-slip">
                <div class="document-header">
                    <div class="firm-logo">
                        <i class="fas fa-file-invoice-dollar"></i> Lawyer Firm Management
                    </div>
                    <div class="document-title">PAYMENT INVOICE</div>
                    <div style="font-size: 9px;">Invoice #: PI-<?php echo $reportData['payment_id']; ?> | Generated: <?php echo date('M j, Y g:i A'); ?></div>
                </div>

                <div class="slip-content">
                    <div class="info-column">
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">BILLING INFORMATION</strong>
                            <div class="info-row">
                                <span class="label">Name:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_name']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_email']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Phone:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['client_phone']); ?></span>
                            </div>
                        </div>
                        
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">SERVICE DETAILS</strong>
                            <div class="info-row">
                                <span class="label">Service:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['case_title']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Lawyer:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['lawyer_name']); ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-column">
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">PAYMENT DETAILS</strong>
                            <div class="info-row">
                                <span class="label">Date:</span>
                                <span class="value"><?php echo date('M j, Y', strtotime($reportData['date'])); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Method:</span>
                                <span class="value"><?php echo htmlspecialchars($reportData['method']); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Status:</span>
                                <span class="value">
                                    <span class="status-badge status-<?php echo strtolower($reportData['status']); ?>">
                                        <?php echo $reportData['status']; ?>
                                    </span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="info-group">
                            <strong style="font-size: 10px; color: #2c3e50;">APPOINTMENT INFO</strong>
                            <div class="info-row">
                                <span class="label">Date:</span>
                                <span class="value"><?php echo date('M j, Y', strtotime($reportData['booking_date'])); ?></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Time:</span>
                                <span class="value"><?php echo date('g:i A', strtotime($reportData['time_slot'])); ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-column">
                        <div class="amount-highlight">
                            Total Paid: $<?php echo number_format($reportData['amount'], 2); ?>
                        </div>
                        
                        <div class="status-badge status-complete" style="width: 100%; text-align: center; padding: 4px;">
                            ✓ PAYMENT RECEIVED
                        </div>
                        
                        <div class="terms-section">
                            <strong>Receipt Details:</strong><br>
                            • Payment Date: <?php echo date('M j, Y', strtotime($reportData['date'])); ?><br>
                            • Transaction ID: <?php echo $reportData['payment_id']; ?><br>
                            • Method: <?php echo $reportData['method']; ?><br>
                            • This serves as official receipt
                        </div>
                    </div>
                </div>

                <div class="document-footer">
                    <div class="signature-section">
                        <div>
                            <div class="signature-line">Authorized Signature</div>
                        </div>
                        <div style="font-size: 8px; padding: 8px;">
                            <strong>Thank you for your payment!</strong><br>
                            Keep this invoice for your records
                        </div>
                    </div>
                    <div>lawyer_firm BINTE MUHAMMAD | ID: 2320315</div>
                    <div>Professional Legal Services | Phone: +1 (555) 123-4567 | Email: info@lawfirm.com</div>
                </div>
            </div>
        <?php endif; ?>

        <!-- Print Button -->
        <div class="no-print text-center mt-4 mb-4">
            <button onclick="window.print()" class="btn btn-primary btn-lg me-3">
                <i class="fas fa-print me-2"></i>Print Document
            </button>
            <button onclick="window.close()" class="btn btn-secondary btn-lg">
                <i class="fas fa-times me-2"></i>Close Window
            </button>
        </div>
    </div>
    
    <script>
        // Auto-print when page loads (optional)
        // window.onload = function() { window.print(); }
    </script>
</body>
</html>
