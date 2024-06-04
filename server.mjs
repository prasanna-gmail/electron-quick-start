import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

import tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import sharp from 'sharp';
import base64js from 'base64-js';

class MyConstants { }

MyConstants.SAVED_PATH = "saved";

async function imageTransformations(X) {
    try {
        let { data, info } = await sharp(Buffer.from(X, 'base64')).resize(224, 224).greyscale().raw().toBuffer({ resolveWithObject: true });
        const tensorData = new Uint8ClampedArray(data)
        return tf.tensor4d(tensorData, [1, 224, 224, 1]).div(255.0);
    } catch (error) {
        console.error(error);
        throw new Error("Error transforming image data");
    }
}

async function predictShape(img) {
    try {
        const modelPath = "./" + MyConstants.SAVED_PATH + "/model.json";
        const encoderPath = "./" + MyConstants.SAVED_PATH + "/label_encoder.json"
        const model = await tf.loadLayersModel(`file://${modelPath}`);
        const labelEncoder = JSON.parse(fs.readFileSync(encoderPath, 'utf8'));
        const image = await imageTransformations(img);
        const pred = model.predict(image);
        const predArray = pred.arraySync();
        const predLabelIndex = predArray[0].indexOf(Math.max(...predArray[0])); // Get index of max value
        const predLabel = labelEncoder["classes"][predLabelIndex];

        return predLabel;
    } catch (error) {
        console.error(error);
        return "Error occuring in Node.js script";
    }
}

async function submitShape(imageData) {
    const buffer = base64js.toByteArray(imageData);
    let img = Buffer.from(buffer);
    return predictShape(img);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3003;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'static' directory

app.use('/static', express.static(path.join(__dirname, 'static'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle the POST request to '/check_shape'
app.post('/check_Shape', async (req, res) => {
    try {
        const ShapeData = req.body.ShapeData;
        const pred = await submitShape(ShapeData.toString())
        const result = { result: pred };
        res.json(result);
    } catch (error) {
        console.error('Error processing Text data:', error);
        res.status(500).json({ error: 'Failed to process Text data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
