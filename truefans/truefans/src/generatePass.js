const path = require('path');
const fs = require('fs');
const PKPass = require('pkpass');

async function generatePass({
  serialNumber,
  restaurantName,
  description = 'Restaurant Loyalty Pass',
  modelFolder = path.join(__dirname, 'passModels', 'myModel.pass'),
}) {
  try {
    // Create a basic pass without requiring image files
    const pass = await PKPass.from({
      model: {
        passTypeIdentifier: PASS_TYPE_IDENTIFIER,
        teamIdentifier: TEAM_IDENTIFIER,
        organizationName: ORG_NAME,
        description: description,
        generic: {
          primaryFields: [
            {
              key: 'balance',
              label: 'BALANCE',
              value: '0'
            }
          ],
          secondaryFields: [
            {
              key: 'visits',
              label: 'VISITS',
              value: '0'
            }
          ],
          auxiliaryFields: [
            {
              key: 'memberSince',
              label: 'MEMBER SINCE',
              value: new Date().getFullYear().toString()
            }
          ]
        },
        barcode: {
          format: 'PKBarcodeFormatQR',
          message: 'https://gettruefans.netlify.app',
          messageEncoding: 'iso-8859-1'
        }
      },
      certificates: {
        wwdr: fs.readFileSync(WWDR_PATH),
        signerCert: fs.readFileSync(CERT_PATH),
        signerKey: fs.readFileSync(KEY_PATH),
        signerKeyPassphrase: undefined
      }
    }, {
      serialNumber,
      description,
      organizationName: restaurantName,
      logoText: restaurantName,
    });

    // Output path
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, `${serialNumber}.pkpass`);
    const stream = pass.getAsStream();
    await new Promise((resolve, reject) => {
      stream.pipe(fs.createWriteStream(outputPath))
        .on('finish', resolve)
        .on('error', reject);
    });
    console.log(`Pass generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating pass:', error);
    throw error;
  }
} 