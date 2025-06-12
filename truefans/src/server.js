const cors = require('cors');

const app = require('express')();

app.use(cors({
  origin: 'https://gettruefans.netlify.app',
  credentials: true
}));

// ... existing code ... 