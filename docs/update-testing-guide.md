# PWA Update Testing Guide

This guide provides step-by-step instructions for testing the PWA update notification system in the Advanced Metal Calculator.

## Step 1: Initial Setup (Version 1.0.1)

The current version of the service worker is 1.0.1. Make sure your application is deployed with this version.

```javascript
// In sw.js
const VERSION = "1.0.1";
```

## Step 2: Deploy Version 2.0.0

1. Update the VERSION constant in sw.js:
   ```javascript
   const VERSION = "2.0.0";
   ```

2. Make a visible change to your application (e.g., change a text color or add a small UI element)

3. Deploy the application

4. Test:
   - Open the application in a browser that already has version 1.0.1 installed
   - The update notification should appear
   - Click "Update Now" to apply the update
   - Verify the visible change appears after the update

## Step 3: Deploy Version 3.0.0

1. Update the VERSION constant in sw.js:
   ```javascript
   const VERSION = "3.0.0";
   ```

2. Make another visible change to your application

3. Deploy the application

4. Test:
   - Open the application in a browser that has version 2.0.0 installed
   - The update notification should appear
   - Click "Update Now" to apply the update
   - Verify the new visible change appears after the update

## Step 4: Deploy Version 4.0.0

1. Update the VERSION constant in sw.js:
   ```javascript
   const VERSION = "4.0.0";
   ```

2. Make a final visible change to your application

3. Deploy the application

4. Test:
   - Open the application in a browser that has version 3.0.0 installed
   - The update notification should appear
   - Click "Update Now" to apply the update
   - Verify the final visible change appears after the update

## Troubleshooting

If updates are not being detected:

1. Check browser console for errors
2. Verify the service worker is properly registered
3. Clear browser cache and reload
4. Check that the VERSION constant is actually changing between deployments
5. Verify the cache name remains consistent

## Additional Testing

- Test the "Later" button to ensure users can defer updates
- Test with different browsers and devices
- Test the offline functionality after each update
