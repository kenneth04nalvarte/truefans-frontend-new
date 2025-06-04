const sharp = require('sharp');

// Generate icon@2x.png (58x58)
sharp('passModels/myModel.pass/icon.png')
  .resize(58, 58)
  .toFile('passModels/myModel.pass/icon@2x.png', (err, info) => {
    if (err) throw err;
    console.log('icon@2x.png created');
  });

// Generate icon@3x.png (87x87)
sharp('passModels/myModel.pass/icon.png')
  .resize(87, 87)
  .toFile('passModels/myModel.pass/icon@3x.png', (err, info) => {
    if (err) throw err;
    console.log('icon@3x.png created');
  }); 