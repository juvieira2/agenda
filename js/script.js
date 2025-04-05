document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageForm = document.getElementById('imageForm');
    const hostInput = document.getElementById('host');
    const apartmentInput = document.getElementById('apartment');
    const blockSelect = document.getElementById('block');
    const receiptDateInput = document.getElementById('receiptDate');
    const deliveryDateInput = document.getElementById('deliveryDate');
    const statusSelect = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const recordsList = document.getElementById('recordsList');
    const recordsTable = document.getElementById('recordsTable');
    const noRecordsMsg = document.getElementById('noRecordsMsg');
    const filterActiveCheckbox = document.getElementById('filterActive');
    const recordDetails = document.getElementById('recordDetails');
    const noRecordSelected = document.getElementById('noRecordSelected');
    const editSelectedBtn = document.getElementById('editSelectedBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

    // Current editing record id
    let currentEditId = null;
    let selectedRecordId = null;

    // Initialize records from localStorage
    let records = JSON.parse(localStorage.getItem('maeRainhaRecords')) || [];

    // Format date for display (DD/MM/YYYY)
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Format date for input value (YYYY-MM-DD)
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Validate host name (uppercase letters only)
    hostInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });

    // Display records
    function displayRecords() {
        // Filter records if the checkbox is checked
        let displayedRecords = records;
        if (filterActiveCheckbox.checked) {
            displayedRecords = records.filter(record => record.status === 'Recebido');
        }

        // Sort records by receipt date (newest first)
        displayedRecords.sort((a, b) => new Date(b.receiptDate) - new Date(a.receiptDate));

        if (displayedRecords.length === 0) {
            recordsTable.classList.add('d-none');
            noRecordsMsg.classList.remove('d-none');
        } else {
            recordsTable.classList.remove('d-none');
            noRecordsMsg.classList.add('d-none');

            recordsList.innerHTML = '';
            displayedRecords.forEach(record => {
                const row = document.createElement('tr');
                row.dataset.id = record.id;
                row.classList.add('record-row');
                
                if (record.id === selectedRecordId) {
                    row.classList.add('table-active');
                }

                // Status badge class
                const statusClass = record.status === 'Recebido' ? 'bg-success' : 'bg-warning';

                row.innerHTML = `
                    <td>${record.host}</td>
                    <td>${record.apartment}</td>
                    <td>${record.block}</td>
                    <td><span class="badge ${statusClass}">${record.status}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary btn-view" data-id="${record.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-primary btn-edit" data-id="${record.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-delete" data-id="${record.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                recordsList.appendChild(row);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', viewRecord);
            });
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', editRecord);
            });
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteRecord);
            });
            document.querySelectorAll('.record-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    if (!e.target.closest('button')) {
                        // Only select row if we didn't click a button
                        selectRecord(this.dataset.id);
                    }
                });
            });
        }

        // Save to localStorage
        localStorage.setItem('maeRainhaRecords', JSON.stringify(records));
    }

    // Select record for viewing details
    function selectRecord(id) {
        // Clear previous selection
        document.querySelectorAll('.record-row').forEach(row => {
            row.classList.remove('table-active');
        });

        // Set current selection
        selectedRecordId = id;
        const selectedRow = document.querySelector(`.record-row[data-id="${id}"]`);
        if (selectedRow) {
            selectedRow.classList.add('table-active');
        }

        // Show details
        showRecordDetails(id);
    }

    // Show record details
    function showRecordDetails(id) {
        const record = records.find(r => r.id === id);
        if (record) {
            document.getElementById('detail-host').textContent = record.host;
            document.getElementById('detail-apartment').textContent = record.apartment;
            document.getElementById('detail-block').textContent = record.block;
            document.getElementById('detail-receiptDate').textContent = formatDate(record.receiptDate);
            document.getElementById('detail-deliveryDate').textContent = formatDate(record.deliveryDate);
            
            const statusBadge = document.getElementById('detail-status');
            statusBadge.textContent = record.status;
            statusBadge.className = 'badge ' + (record.status === 'Recebido' ? 'bg-success' : 'bg-warning');
            
            recordDetails.classList.remove('d-none');
            noRecordSelected.classList.add('d-none');
        } else {
            recordDetails.classList.add('d-none');
            noRecordSelected.classList.remove('d-none');
        }
    }

    // View record details
    function viewRecord(e) {
        const id = e.currentTarget.dataset.id;
        selectRecord(id);
    }

    // Edit record
    function editRecord(e) {
        const id = e.currentTarget.dataset.id;
        const record = records.find(r => r.id === id);
        
        if (record) {
            // Fill form with record data
            hostInput.value = record.host;
            apartmentInput.value = record.apartment;
            blockSelect.value = record.block;
            receiptDateInput.value = formatDateForInput(record.receiptDate);
            deliveryDateInput.value = formatDateForInput(record.deliveryDate);
            statusSelect.value = record.status;
            
            // Switch to edit mode
            currentEditId = id;
            submitBtn.classList.add('d-none');
            updateBtn.classList.remove('d-none');
            cancelBtn.classList.remove('d-none');
            
            // Scroll to form
            imageForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Delete record
    function deleteRecord(e) {
        const id = e.currentTarget.dataset.id;
        
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            records = records.filter(record => record.id !== id);
            
            // If we're deleting the selected record, clear the selection
            if (selectedRecordId === id) {
                selectedRecordId = null;
                recordDetails.classList.add('d-none');
                noRecordSelected.classList.remove('d-none');
            }
            
            // If we're deleting the record being edited, reset the form
            if (currentEditId === id) {
                resetForm();
            }
            
            displayRecords();
        }
    }

    // Reset form to add mode
    function resetForm() {
        imageForm.reset();
        currentEditId = null;
        submitBtn.classList.remove('d-none');
        updateBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
    }

    // Form submit handler
    imageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate host name (uppercase letters only)
        const hostValue = hostInput.value;
        if (!/^[A-Z\s]+$/.test(hostValue)) {
            alert('O nome do anfitrião deve conter apenas letras maiúsculas.');
            return;
        }
        
        // Create new record
        const newRecord = {
            host: hostInput.value,
            apartment: apartmentInput.value,
            block: blockSelect.value,
            receiptDate: receiptDateInput.value,
            deliveryDate: deliveryDateInput.value,
            status: statusSelect.value
        };
        
        // Add or update record
        if (currentEditId) {
            // Update existing record
            const index = records.findIndex(record => record.id === currentEditId);
            if (index !== -1) {
                newRecord.id = currentEditId;
                records[index] = newRecord;
            }
        } else {
            // Add new record
            newRecord.id = generateId();
            records.push(newRecord);
        }
        
        // Reset form and update display
        resetForm();
        displayRecords();
    });

    // Update button click handler
    updateBtn.addEventListener('click', function() {
        // Trigger form submission
        const submitEvent = new Event('submit', { cancelable: true });
        imageForm.dispatchEvent(submitEvent);
    });

    // Cancel button click handler
    cancelBtn.addEventListener('click', resetForm);

    // Edit selected record button
    editSelectedBtn.addEventListener('click', function() {
        if (selectedRecordId) {
            // Trigger edit action
            const editButton = document.querySelector(`.btn-edit[data-id="${selectedRecordId}"]`);
            if (editButton) {
                editButton.click();
            }
        }
    });

    // Delete selected record button
    deleteSelectedBtn.addEventListener('click', function() {
        if (selectedRecordId) {
            // Trigger delete action
            const deleteButton = document.querySelector(`.btn-delete[data-id="${selectedRecordId}"]`);
            if (deleteButton) {
                deleteButton.click();
            }
        }
    });

    // Filter active records checkbox
    filterActiveCheckbox.addEventListener('change', displayRecords);

    // Set today's date as default for receipt date
    const today = new Date().toISOString().split('T')[0];
    receiptDateInput.value = today;

    // Initial display
    displayRecords();
});
