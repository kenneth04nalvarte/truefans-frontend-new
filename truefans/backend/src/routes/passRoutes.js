const admin = require('firebase-admin');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'your-firebase-storage-bucket.appspot.com' // Replace with your bucket name
});

const bucket = admin.storage().bucket();

async function downloadAndResizeLogo(logoUrl) {
    const fileName = path.basename(logoUrl);
    const filePath = path.join(__dirname, 'temp', fileName);

    // Download the file from Firebase Storage
    await bucket.file(`logos/${fileName}`).download({ destination: filePath });

    // Resize the image
    await sharp(filePath)
        .resize(29, 29)
        .toFile(path.join(__dirname, 'temp', `resized_${fileName}`));

    // Read the resized image
    const resizedImageBuffer = fs.readFileSync(path.join(__dirname, 'temp', `resized_${fileName}`));

    // Clean up temporary files
    fs.unlinkSync(filePath);
    fs.unlinkSync(path.join(__dirname, 'temp', `resized_${fileName}`));

    return resizedImageBuffer;
}

// Example usage in your pass generation endpoint
app.post('/api/generate-pass', async (req, res) => {
    const { logoUrl } = req.body; // Assuming the logo URL is sent in the request body

    try {
        const resizedLogoBuffer = await downloadAndResizeLogo(logoUrl);
        // Use resizedLogoBuffer in your pass generation logic
        // ...

        res.status(200).send('Pass generated successfully');
    } catch (error) {
        console.error('Error generating pass:', error);
        res.status(500).send('Error generating pass');
    }
}); 