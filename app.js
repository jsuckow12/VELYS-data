// Data Capture App JavaScript
class DataCaptureApp {
    constructor() {
        this.data = [];
        this.currentStream = null;
        this.facingMode = 'environment'; // Start with back camera
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Form buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveData());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        
        // Camera functionality
        document.getElementById('cameraBtn').addEventListener('click', () => this.openCamera());
        document.getElementById('closeCamera').addEventListener('click', () => this.closeCamera());
        document.getElementById('captureBtn').addEventListener('click', () => this.capturePhoto());
        document.getElementById('switchCameraBtn').addEventListener('click', () => this.switchCamera());
        
        // Close modal when clicking outside
        document.getElementById('cameraModal').addEventListener('click', (e) => {
            if (e.target.id === 'cameraModal') {
                this.closeCamera();
            }
        });

        // Auto-save on form changes
        this.setupAutoSave();
    }

    setupAutoSave() {
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            element.addEventListener('input', () => {
                this.autoSave();
            });
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    getFormData() {
        return {
            patientId: document.getElementById('patientId').value,
            date: document.getElementById('date').value,
            caseOfDay: document.getElementById('caseOfDay').value,
            ldfa: document.getElementById('ldfa').value,
            mpta: document.getElementById('mpta').value,
            hka: document.getElementById('hka').value,
            diagnosis: document.getElementById('diagnosis').value,
            symptoms: document.getElementById('symptoms').value,
            medications: document.getElementById('medications').value,
            mdf: document.getElementById('mdf').checked ? '2mm' : '0mm',
            ldf: document.getElementById('ldf').checked ? '2mm' : '0mm',
            mpf: document.getElementById('mpf').checked ? '2mm' : '0mm',
            lpf: document.getElementById('lpf').checked ? '2mm' : '0mm',
            mpt: document.getElementById('mpt').checked ? '2mm' : '0mm',
            lpt: document.getElementById('lpt').checked ? '2mm' : '0mm',
            femoralVarVal: document.getElementById('femoralVarVal').value,
            mdfPlanning: document.getElementById('mdfPlanning').value,
            ldfPlanning: document.getElementById('ldfPlanning').value,
            mpfPlanning: document.getElementById('mpfPlanning').value,
            lpfPlanning: document.getElementById('lpfPlanning').value,
            tibialVarVal: document.getElementById('tibialVarVal').value,
            mptPlanning: document.getElementById('mptPlanning').value,
            lptPlanning: document.getElementById('lptPlanning').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
    }

    validateForm() {
        const data = this.getFormData();
        const requiredFields = ['patientId', 'date'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                const fieldName = field === 'patientId' ? 'V_ID' : field.replace(/([A-Z])/g, ' $1').toLowerCase();
                this.showToast(`Please fill in ${fieldName}`, 'error');
                return false;
            }
        }
        
        return true;
    }

    saveData() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        
        // Check if this V_ID already exists
        const existingIndex = this.data.findIndex(item => item.patientId === formData.patientId);
        
        if (existingIndex !== -1) {
            // Update existing record
            this.data[existingIndex] = formData;
            this.showToast('Data updated successfully!', 'success');
        } else {
            // Add new record
            this.data.push(formData);
            this.showToast('Data saved successfully!', 'success');
        }

        this.saveToStorage();
        this.clearForm();
    }

    clearForm() {
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (element.type === 'date') {
                element.value = new Date().toISOString().split('T')[0];
            } else if (element.type === 'number' || element.type === 'text') {
                element.value = '';
            } else if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else if (element.tagName === 'TEXTAREA') {
                element.value = '';
            }
        });
        
        // Clear checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    exportData() {
        if (this.data.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        const csvContent = this.convertToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `data_capture_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback for older browsers
            this.showToast('Download not supported in this browser', 'error');
        }
    }

    convertToCSV() {
        if (this.data.length === 0) return '';

        const headers = Object.keys(this.data[0]);
        const csvRows = [headers.join(',')];

        for (const row of this.data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in CSV
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    async openCamera() {
        const modal = document.getElementById('cameraModal');
        modal.style.display = 'block';
        
        try {
            await this.startCamera();
        } catch (error) {
            this.showToast('Camera access denied', 'error');
            this.closeCamera();
        }
    }

    closeCamera() {
        const modal = document.getElementById('cameraModal');
        modal.style.display = 'none';
        this.stopCamera();
    }

    async startCamera() {
        const video = document.getElementById('camera');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            video.srcObject = stream;
            this.currentStream = stream;
        } catch (error) {
            console.error('Camera error:', error);
            throw error;
        }
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }

    async switchCamera() {
        this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
        this.stopCamera();
        await this.startCamera();
    }

    capturePhoto() {
        const video = document.getElementById('camera');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `photo_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.8);

        this.showToast('Photo captured!', 'success');
    }

    autoSave() {
        // Auto-save form data to localStorage every 30 seconds
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const formData = this.getFormData();
            localStorage.setItem('dataCapture_autoSave', JSON.stringify(formData));
        }, 30000);
    }

    loadStoredData() {
        try {
            const stored = localStorage.getItem('dataCapture_data');
            if (stored) {
                this.data = JSON.parse(stored);
            }

            // Load auto-saved form data
            const autoSaved = localStorage.getItem('dataCapture_autoSave');
            if (autoSaved) {
                const formData = JSON.parse(autoSaved);
                this.populateForm(formData);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    populateForm(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element && key !== 'timestamp') {
                if (element.type === 'checkbox') {
                    element.checked = data[key] === '2mm';
                } else {
                    element.value = data[key];
                }
            }
        });
    }

    saveToStorage() {
        try {
            localStorage.setItem('dataCapture_data', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataCaptureApp();
});

// Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
