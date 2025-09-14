        </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-12"
                    <small class="text-muted">Lawyer Firm Management System </small>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- Bootstrap JavaScript for interactive components -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JavaScript for enhanced functionality -->
    <script>
        // Auto-hide alerts after 5 seconds
        document.addEventListener('DOMContentLoaded', function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                setTimeout(function() {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }, 5000);
            });
        });
        
        // Confirm delete operations
        function confirmDelete(itemType, itemName) {
            return confirm(`Are you sure you want to delete this ${itemType}: "${itemName}"?\n\nThis action cannot be undone.`);
        }
        
        // Form validation helper
        function validateForm(formId) {
            const form = document.getElementById(formId);
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(function(input) {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            return isValid;
        }
        
        // Email validation
        function validateEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        }
        
        // Phone validation
        function validatePhone(phone) {
            const regex = /^[\d\s\-\(\)\+]+$/;
            return regex.test(phone) && phone.length >= 10;
        }
        
        // Format currency display
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        }
        
        // Highlight current page in navigation
        document.addEventListener('DOMContentLoaded', function() {
            const currentPage = window.location.pathname.split('/').pop();
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
            
            navLinks.forEach(function(link) {
                const href = link.getAttribute('href');
                if (href === currentPage || (currentPage === '' && href === 'index.php')) {
                    link.style.color = '#667eea !important';
                    link.style.fontWeight = 'bold';
                }
            });
        });
    </script>
</body>
</html>
