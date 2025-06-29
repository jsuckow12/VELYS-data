# Data Capture Tool

A mobile-optimized Progressive Web App (PWA) for capturing clinical research data on iPhone and other mobile devices.

## Features

- **Mobile-Optimized Interface**: Touch-friendly design optimized for iPhone and mobile devices
- **Offline Functionality**: Works without internet connection using service worker caching
- **Camera Integration**: Capture photos directly within the app
- **Auto-Save**: Automatically saves form data to prevent data loss
- **Data Export**: Export collected data as CSV files
- **PWA Support**: Can be installed as a native app on mobile devices

## How to Use

### On iPhone/iOS:

1. **Open the app** in Safari browser
2. **Add to Home Screen**:
   - Tap the share button (square with arrow)
   - Select "Add to Home Screen"
   - The app will now appear as a native app icon

### Data Entry:

1. **Case Information**: Enter V_ID, date, and case number
2. **X-Ray Input**: Enter LDFA, MPTA, and HKA measurements
3. **Clinical Data**: Add diagnosis, symptoms, medications, and cartilage assessment
4. **Planning Screen**: Enter femoral/tibial measurements
5. **Notes**: Include additional observations
6. **Save**: Tap "Save Data" to store the information

### Camera Features:

1. Tap the "📷 Camera" button to open camera
2. Use "Switch Camera" to toggle between front/back cameras
3. Tap "Capture Photo" to take a picture
4. Photos are automatically downloaded to your device

### Data Management:

- **Export**: Download all collected data as a CSV file
- **Clear**: Reset the current form
- **Auto-save**: Form data is automatically saved every 30 seconds

## Technical Details

- **Progressive Web App**: Works offline and can be installed on home screen
- **Local Storage**: Data is stored locally on the device
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets for mobile use
- **Dark Mode Support**: Automatically adapts to system theme

## Browser Compatibility

- Safari (iOS 11.3+)
- Chrome (Android 67+)
- Firefox (Android 68+)
- Edge (Windows 79+)

## Security & Privacy

- All data is stored locally on the device
- No data is transmitted to external servers
- Camera access requires user permission
- Data can be exported and backed up manually
