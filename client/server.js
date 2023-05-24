const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the "static" directory
app.use(express.static('static'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[+] Server running on port ${PORT}, serving static files from /static`);
    console.log(`[.] Open http://localhost:${PORT} in your browser`);
});
