const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icon (29x29)
const iconCanvas = createCanvas(29, 29);
const iconCtx = iconCanvas.getContext('2d');
iconCtx.fillStyle = '#4CAF50';
iconCtx.fillRect(0, 0, 29, 29);
iconCtx.fillStyle = 'white';
iconCtx.font = '20px Arial';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('TF', 14.5, 14.5);

// Create logo (160x50)
const logoCanvas = createCanvas(160, 50);
const logoCtx = logoCanvas.getContext('2d');
logoCtx.fillStyle = '#4CAF50';
logoCtx.fillRect(0, 0, 160, 50);
logoCtx.fillStyle = 'white';
logoCtx.font = 'bold 24px Arial';
logoCtx.textAlign = 'center';
logoCtx.textBaseline = 'middle';
logoCtx.fillText('TrueFans', 80, 25);

// Save images
fs.writeFileSync('./assets/icon.png', iconCanvas.toBuffer());
fs.writeFileSync('./assets/logo.png', logoCanvas.toBuffer());

console.log('Placeholder images created in ./assets/'); 