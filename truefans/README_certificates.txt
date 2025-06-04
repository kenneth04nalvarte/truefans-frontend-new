Apple Wallet Certificate Setup
=============================

You must generate and place the following files in this folder:

- signerCert.pem   (Your Pass Type ID certificate, exported as PEM)
- signerKey.pem    (The private key for your Pass Type ID certificate, exported as PEM)
- wwdr.pem         (Apple's Worldwide Developer Relations certificate, downloadable from Apple)

How to generate these files:
----------------------------
1. Log in to your Apple Developer account and create a Pass Type ID.
2. Download the Pass Type ID certificate (.cer) and the WWDR certificate (.cer).
3. Export your private key from Keychain Access as a .p12 file.
4. Convert the .cer and .p12 files to PEM format using OpenSSL:

   # Convert Pass Type ID certificate to PEM
   openssl x509 -inform DER -in pass.cer -out signerCert.pem

   # Convert private key to PEM
   openssl pkcs12 -in yourkey.p12 -out signerKey.pem -nocerts -nodes

   # Convert WWDR certificate to PEM
   openssl x509 -inform DER -in AppleWWDRCA.cer -out wwdr.pem

5. Place signerCert.pem, signerKey.pem, and wwdr.pem in the certs/ folder.

For more details, see: https://github.com/alexandercerutti/passkit-generator/wiki/Generating-Certificates 