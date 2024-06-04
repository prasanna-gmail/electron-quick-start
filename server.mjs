import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

//todo: replace original code
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;


// Serve static files from the 'static' directory

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
