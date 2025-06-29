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
                this.updateCalculations();
            });
        });
        // Also update calculations on checkbox click
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateCalculations());
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
            dm: document.getElementById('dm').checked ? 2 : 0,
            dl: document.getElementById('dl').checked ? 2 : 0,
            pm: document.getElementById('pm').checked ? 2 : 0,
            pl: document.getElementById('pl').checked ? 2 : 0,
            tm: document.getElementById('tm').checked ? 2 : 0,
            tl: document.getElementById('tl').checked ? 2 : 0,
            femoralVarVal: document.getElementById('femoralVarVal').value,
            dmPlanning: document.getElementById('dmPlanning').value,
            dlPlanning: document.getElementById('dlPlanning').value,
            pmPlanning: document.getElementById('pmPlanning').value,
            plPlanning: document.getElementById('plPlanning').value,
            femoralSize: document.getElementById('femoralSize').value,
            tibialVarVal: document.getElementById('tibialVarVal').value,
            tmPlanning: document.getElementById('tmPlanning').value,
            tlPlanning: document.getElementById('tlPlanning').value,
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
                element.value = data[key];
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

    updateCalculations() {
        const data = this.getFormData();
        // Cartilage values (for display if needed)
        // Calculate DF_d = DM - DL
        const DM = parseFloat(data.dmPlanning) || 0;
        const DL = parseFloat(data.dlPlanning) || 0;
        const DF_d = DM - DL;
        // Calculate DT_d = TL - TM
        const TL = parseFloat(data.tlPlanning) || 0;
        const TM = parseFloat(data.tmPlanning) || 0;
        const DT_d = TL - TM;
        // Femoral Width lookup
        const femoralWidthTable = {
            1: 38.06, 2: 39.92, 3: 41.78, 4: 44.33, 5: 45.4,
            6: 46.49, 7: 47.6, 8: 48.75, 9: 49.92, 10: 51.11
        };
        const FW = femoralWidthTable[data.femoralSize] || 0;
        // LDFA_v = atan2(DF_d,FW)*(180/pi) - Femoral Var/Val
        let LDFA_v = '';
        if (FW !== 0) {
            LDFA_v = (Math.atan2(DF_d, FW) * (180 / Math.PI)) - (parseFloat(data.femoralVarVal) || 0);
            LDFA_v = LDFA_v.toFixed(2);
        }
        // MPTA_v = 90 - degrees(atan(DT_d/FW)) + Tibial Var/Val
        let MPTA_v = '';
        if (FW !== 0) {
            MPTA_v = 90 - (Math.atan(DT_d / FW) * (180 / Math.PI)) + (parseFloat(data.tibialVarVal) || 0);
            MPTA_v = MPTA_v.toFixed(2);
        }
        // JLO_v = MPTA_v + LDFA_v
        let JLO_v = '';
        if (MPTA_v !== '' && LDFA_v !== '') {
            JLO_v = (parseFloat(MPTA_v) + parseFloat(LDFA_v)).toFixed(2);
        }
        // aHKA_v = MPTA_v - LDFA_v
        let aHKA_v = '';
        if (MPTA_v !== '' && LDFA_v !== '') {
            aHKA_v = (parseFloat(MPTA_v) - parseFloat(LDFA_v)).toFixed(2);
        }
        // Output
        document.getElementById('dfdOutput').textContent = isNaN(DF_d) ? '' : DF_d;
        document.getElementById('dtdOutput').textContent = isNaN(DT_d) ? '' : DT_d;
        document.getElementById('fwOutput').textContent = FW ? FW : '';
        document.getElementById('ldfavOutput').textContent = LDFA_v;
        document.getElementById('mptavOutput').textContent = MPTA_v;
        document.getElementById('jlovOutput').textContent = JLO_v;
        document.getElementById('ahkavOutput').textContent = aHKA_v;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DataCaptureApp();
    app.updateCalculations();
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
