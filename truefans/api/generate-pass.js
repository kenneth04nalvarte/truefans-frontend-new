const generatePass = require('../generatePass');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { serialNumber, restaurantName, description } = req.body;
    // For demo, use default icon/logo paths. In production, use uploaded files or brand assets.
    const iconPath = path.join(__dirname, '../passModels/myModel.pass/icon.png');
    const logoPath = path.join(__dirname, '../passModels/myModel.pass/logo.png');

    const passPath = await generatePass({
      serialNumber,
      restaurantName,
      description,
      modelFolder: path.join(__dirname, '../passModels/myModel.pass'),
    });

    // Set headers for .pkpass file download
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', `attachment; filename="${serialNumber}.pkpass"`);
    const fileStream = fs.createReadStream(passPath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 