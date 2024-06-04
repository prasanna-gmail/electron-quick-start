
import path from 'path';

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
        const modelPath = "./Saved/model.json";
        const model = await tf.loadLayersModel(`file://${modelPath}`);
        const labelEncoder = JSON.parse(fs.readFileSync('./Saved/label_encoder.json', 'utf8'));
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
