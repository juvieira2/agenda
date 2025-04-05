document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageForm = document.getElementById('imageForm');
    const hostInput = document.getElementById('host');
    const apartmentInput = document.getElementById('apartment');
    const blockSelect = document.getElementById('block');
    const receiptDateInput = document.getElementById('receiptDate');
    const deliveryDateInput = document.getElementById('deliveryDate');
    const statusSelect = document.getElementById('status');
    const recordsList = document.getElementById('recordsList');
    const recordsTable = document.getElementById('recordsTable');
    const noRecordsMsg = document.getElementById('noRecordsMsg');
    const filterActiveCheckbox = document.getElementById('filterActive');
    const recordDetailsModal = new bootstrap.Modal(document.getElementById('recordDetailsModal'));
    const modalTitle = document.getElementById('recordDetailsModalLabel');
    const modalBody = document.getElementById('recordDetailsBody');
    const submitBtn = document.getElementById('submitBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Variables
    let records = JSON.parse(localStorage.getItem('maeRainhaRecords')) || [];
    let selectedRecordId = null;
    let currentEditId = null;
    
    // Set today's date as default for receiptDate
    const today = new Date();
    receiptDateInput.value = formatDateForInput(today);
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    // Format date for input value
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString();
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

                const statusClass = record.status === 'Recebido' ? 'bg-success text-white' : 'bg-warning';
                
                row.innerHTML = `
                    <td>${record.host}</td>
                    <td>${record.apartment}</td>
                    <td>${record.block}</td>
                    <td>${formatDate(record.receiptDate)}</td>
                    <td>${formatDate(record.deliveryDate)}</td>
                    <td><span class="badge ${statusClass}">${record.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-btn" title="Visualizar"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-primary edit-btn" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-btn" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                
                recordsList.appendChild(row);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', viewRecord);
            });
            
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editRecord);
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteRecord);
            });
            
            // Add click event to rows
            document.querySelectorAll('.record-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    if (!e.target.closest('button')) {
                        selectRecord(this.dataset.id);
                    }
                });
            });
        }
        
        // Save to localStorage
        localStorage.setItem('maeRainhaRecords', JSON.stringify(records));
    }
    
    // Select a record
    function selectRecord(id) {
        selectedRecordId = id;
        document.querySelectorAll('.record-row').forEach(row => {
            if (row.dataset.id === id) {
                row.classList.add('table-active');
            } else {
                row.classList.remove('table-active');
            }
        });
        
        showRecordDetails(id);
    }
    
    // Show record details in sidebar
    function showRecordDetails(id) {
        const record = records.find(r => r.id === id);
        if (record) {
            const detailsContainer = document.getElementById('recordDetails');
            detailsContainer.innerHTML = `
                <div class="card mb-3">
                    <div class="card-header">
                        <h5 class="mb-0">Detalhes do registro</h5>
                    </div>
                    <div class="card-body">
                        <p><strong>Anfitrião:</strong> ${record.host}</p>
                        <p><strong>Apartamento:</strong> ${record.apartment}</p>
                        <p><strong>Bloco:</strong> ${record.block}</p>
                        <p><strong>Data de Recebimento:</strong> ${formatDate(record.receiptDate)}</p>
                        <p><strong>Data de Entrega:</strong> ${formatDate(record.deliveryDate)}</p>
                        <p><strong>Status:</strong> <span class="badge ${record.status === 'Recebido' ? 'bg-success' : 'bg-warning'}">${record.status}</span></p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary edit-detail-btn" data-id="${record.id}">Editar</button>
                        <button class="btn btn-danger delete-detail-btn" data-id="${record.id}">Excluir</button>
                    </div>
                </div>
            `;
            
            // Add event listeners to detail buttons
            document.querySelector('.edit-detail-btn').addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const record = records.find(r => r.id === id);
                if (record) {
                    populateFormForEdit(record);
                }
            });
            
            document.querySelector('.delete-detail-btn').addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este registro?')) {
                    records = records.filter(r => r.id !== id);
                    displayRecords();
                    document.getElementById('recordDetails').innerHTML = '';
                    selectedRecordId = null;
                }
            });
            
            detailsContainer.classList.remove('d-none');
        }
    }
    
    // View record in modal
    function viewRecord(e) {
        e.stopPropagation();
        const id = e.target.closest('tr').dataset.id;
        const record = records.find(r => r.id === id);
        
        if (record) {
            modalTitle.textContent = `Registro de ${record.host}`;
            modalBody.innerHTML = `
                <p><strong>Anfitrião:</strong> ${record.host}</p>
                <p><strong>Apartamento:</strong> ${record.apartment}</p>
                <p><strong>Bloco:</strong> ${record.block}</p>
                <p><strong>Data de Recebimento:</strong> ${formatDate(record.receiptDate)}</p>
                <p><strong>Data de Entrega:</strong> ${formatDate(record.deliveryDate)}</p>
                <p><strong>Status:</strong> <span class="badge ${record.status === 'Recebido' ? 'bg-success' : 'bg-warning'}">${record.status}</span></p>
            `;
            
            recordDetailsModal.show();
        }
    }
    
    // Edit record
    function editRecord(e) {
        e.stopPropagation();
        const id = e.target.closest('tr').dataset.id;
        const record = records.find(r => r.id === id);
        
        if (record) {
            populateFormForEdit(record);
        }
    }
    
    // Populate form for editing
    function populateFormForEdit(record) {
        currentEditId = record.id;
        hostInput.value = record.host;
        apartmentInput.value = record.apartment;
        blockSelect.value = record.block;
        receiptDateInput.value = record.receiptDate;
        deliveryDateInput.value = record.deliveryDate;
        statusSelect.value = record.status;
        
        submitBtn.classList.add('d-none');
        updateBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');
        
        // Scroll to form
        imageForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete record
    function deleteRecord(e) {
        e.stopPropagation();
        const id = e.target.closest('tr').dataset.id;
        
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            records = records.filter(record => record.id !== id);
            
            if (selectedRecordId === id) {
                selectedRecordId = null;
                document.getElementById('recordDetails').innerHTML = '';
            }
            
            displayRecords();
        }
    }
    
    // Reset form
    function resetForm() {
        imageForm.reset();
        
        // Set today's date as default for receiptDate
        receiptDateInput.value = formatDateForInput(new Date());
        
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

        // Get current form values
        const receiptDate = receiptDateInput.value;
        const deliveryDate = deliveryDateInput.value;
        const status = statusSelect.value;
        
        // Verificar se já existe um registro com a mesma data de recebimento
        const dateExists = records.some(record => {
            // Ignora o registro atual durante a edição
            if (currentEditId && record.id === currentEditId) {
                return false;
            }
            return record.receiptDate === receiptDate;
        });
        
        if (dateExists) {
            alert('Não é possível cadastrar mais de uma pessoa recebendo a imagem na mesma data.');
            return;
        }
        
        // Create new record
        const newRecord = {
            host: hostInput.value,
            apartment: apartmentInput.value,
            block: blockSelect.value,
            receiptDate: receiptDate,
            deliveryDate: deliveryDate,
            status: status
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
        imageForm.dispatchEvent(new Event('submit'));
    });
    
    // Cancel button click handler
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });
    
    // Filter checkbox change handler
    filterActiveCheckbox.addEventListener('change', displayRecords);
    
    // Initial display
    displayRecords();
});
