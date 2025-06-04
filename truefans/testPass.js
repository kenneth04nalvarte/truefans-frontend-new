const generatePass = require('./generatePass');

// Create a test pass
async function createTestPass() {
  try {
    // For testing, we'll use placeholder images
    // In production, these would be the restaurant's uploaded images
    const testPass = await generatePass({
      serialNumber: 'TEST123456',
      restaurantName: 'Test Restaurant',
      iconPath: './assets/icon.png',
      logoPath: './assets/logo.png',
      description: 'Test Restaurant Loyalty Pass'
    });
    
    console.log('Test pass generated successfully:', testPass);
  } catch (error) {
    console.error('Failed to generate test pass:', error);
  }
}

createTestPass(); 