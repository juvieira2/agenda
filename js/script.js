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
    const editSelectedBtn = document.getElementById('editSelectedBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const submitBtn = document.getElementById('submitBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    let records = [];
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
        return date.toISOString().split('T')[0];
    }

    // Validate host name (uppercase letters only)
    hostInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });

    // Load records from server
    async function loadRecords() {
        try {
            const response = await fetch('/api/records');
            records = await response.json();
            displayRecords();
        } catch (error) {
            console.error('Error loading records:', error);
            alert('Erro ao carregar registros');
        }
    }

    // Display records
    function displayRecords() {
        let displayedRecords = records;
        if (filterActiveCheckbox.checked) {
            displayedRecords = records.filter(record => record.status === 'Recebido');
        }

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

                const statusClass = record.status === 'Recebido' ? 'bg-primary text-white' : 'bg-warning';

                row.innerHTML = `
                    <td>${record.host}</td>
                    <td>${record.apartment}</td>
                    <td>${record.block}</td>
                    <td><span class="badge ${statusClass}">${record.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-btn" title="Visualizar"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-primary edit-btn" title="Editar"><i class="fas fa-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-btn" title="Excluir"><i class="fas fa-trash"></i></button>
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

            document.querySelectorAll('.record-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    if (!e.target.closest('button')) {
                        selectRecord(parseInt(this.dataset.id));
                    }
                });
            });
        }
    }

    // Select a record
    function selectRecord(id) {
        selectedRecordId = id;
        document.querySelectorAll('.record-row').forEach(row => {
            if (parseInt(row.dataset.id) === id) {
                row.classList.add('table-active');
            } else {
                row.classList.remove('table-active');
            }
        });

        showRecordDetails(id);
    }

    // Show record details
    function showRecordDetails(id) {
        const record = records.find(r => r.id === id);
        if (record) {
            const detailsContainer = document.getElementById('recordDetails');
            const noRecordSelected = document.getElementById('noRecordSelected');

            document.getElementById('detail-host').textContent = record.host;
            document.getElementById('detail-apartment').textContent = record.apartment;
            document.getElementById('detail-block').textContent = record.block;
            document.getElementById('detail-receiptDate').textContent = formatDate(record.receipt_date);
            document.getElementById('detail-deliveryDate').textContent = record.delivery_date ? formatDate(record.delivery_date) : '-';

            const statusElement = document.getElementById('detail-status');
            statusElement.textContent = record.status;
            statusElement.className = `badge ${record.status === 'Recebido' ? 'bg-primary' : 'bg-warning'}`;

            detailsContainer.classList.remove('d-none');
            noRecordSelected.classList.add('d-none');

            editSelectedBtn.setAttribute('data-id', record.id);
            deleteSelectedBtn.setAttribute('data-id', record.id);

            editSelectedBtn.addEventListener('click', function() {
                const recordId = this.getAttribute('data-id');
                const recordToEdit = records.find(r => r.id === recordId);
                if (recordToEdit) {
                    populateFormForEdit(recordToEdit);
                }
            });

            deleteSelectedBtn.addEventListener('click', function() {
                const recordId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este registro?')) {
                    deleteRecord(recordId);
                }
            });
        }
    }

    // View record
    function viewRecord(e) {
        e.stopPropagation();
        const id = parseInt(e.target.closest('tr').dataset.id);
        selectRecord(id);
    }

    // Edit record
    function editRecord(e) {
        e.stopPropagation();
        const id = parseInt(e.target.closest('tr').dataset.id);
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
        receiptDateInput.value = formatDateForInput(record.receipt_date);
        deliveryDateInput.value = record.delivery_date ? formatDateForInput(record.delivery_date) : '';
        statusSelect.value = record.status;

        submitBtn.classList.add('d-none');
        updateBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');

        imageForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Delete record
    async function deleteRecord(id) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                const response = await fetch(`/api/records/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    if (selectedRecordId === id) {
                        selectedRecordId = null;
                        const detailsContainer = document.getElementById('recordDetails');
                        const noRecordSelected = document.getElementById('noRecordSelected');
                        detailsContainer.classList.add('d-none');
                        noRecordSelected.classList.remove('d-none');
                    }
                    await loadRecords();
                } else {
                    alert('Erro ao excluir registro');
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Erro ao excluir registro');
            }
        }
    }

    // Reset form
    function resetForm() {
        imageForm.reset();
        receiptDateInput.value = formatDateForInput(new Date());
        currentEditId = null;
        submitBtn.classList.remove('d-none');
        updateBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
    }

    // Form submit handler
    imageForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const hostValue = hostInput.value;
        if (!/^[A-Z\s]+$/.test(hostValue)) {
            alert('O nome do anfitrião deve conter apenas letras maiúsculas.');
            return;
        }

        const formData = {
            host: hostInput.value,
            apartment: apartmentInput.value,
            block: blockSelect.value,
            receipt_date: receiptDateInput.value,
            delivery_date: deliveryDateInput.value,
            status: statusSelect.value
        };

        try {
            let response;
            if (currentEditId) {
                response = await fetch(`/api/records/${currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                resetForm();
                await loadRecords();
            } else {
                alert('Erro ao salvar registro');
            }
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Erro ao salvar registro');
        }
    });

    updateBtn.addEventListener('click', function() {
        imageForm.dispatchEvent(new Event('submit'));
    });

    cancelBtn.addEventListener('click', function() {
        resetForm();
    });

    filterActiveCheckbox.addEventListener('change', displayRecords);

    // Initial load
    loadRecords();
});