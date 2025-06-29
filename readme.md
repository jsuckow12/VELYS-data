# Data Capture Tool

A mobile-optimized Progressive Web App (PWA) for capturing clinical research data on iPhone and other mobile devices.

## Features

- **Mobile-Optimized Interface**: Touch-friendly design optimized for iPhone and mobile devices
- **Offline Functionality**: Works without internet connection using service worker caching
- **Camera Integration**: Capture photos directly within the app
- **Auto-Save**: Automatically saves form data to prevent data loss
- **Data Export**: Export collected data as CSV files
- **BMI Calculator**: Automatic BMI calculation from height and weight
- **PWA Support**: Can be installed as a native app on mobile devices

## How to Use

### On iPhone/iOS:

1. **Open the app** in Safari browser
2. **Add to Home Screen**:
   - Tap the share button (square with arrow)
   - Select "Add to Home Screen"
   - The app will now appear as a native app icon

### Data Entry:

1. **Patient Information**: Enter patient ID, date, age, and gender
2. **Measurements**: Enter height and weight (BMI calculates automatically)
3. **Clinical Data**: Add diagnosis, symptoms, and medications
4. **Notes**: Include additional observations
5. **Save**: Tap "Save Data" to store the information

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

## File Structure

```
Athey_algo/
├── index.html          # Main app interface
├── styles.css          # Mobile-optimized styling
├── app.js             # App functionality
├── manifest.json      # PWA configuration
├── sw.js             # Service worker for offline support
├── icons/            # App icons (placeholder)
└── README.md         # This file
```

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

## Installation

1. Host the files on a web server (HTTPS required for PWA features)
2. Access via mobile browser
3. Add to home screen for app-like experience

## Development

To run locally for development:

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js
npx serve .

# Then access at http://localhost:8000
```

## Customization

The app can be easily customized by modifying:
- `styles.css` for visual changes
- `app.js` for functionality
- `index.html` for form fields
- `manifest.json` for PWA settings 
