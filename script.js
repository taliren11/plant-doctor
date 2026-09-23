```javascript
// ==========================================
// PLANT DOCTOR - AI DISEASE DETECTION
// ==========================================

// Your Teachable Machine model
const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";

// Elements
const cameraInput = document.getElementById("cameraInput");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeButton = document.getElementById("analyzeButton");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const disease = document.getElementById("disease");
const confidence = document.getElementById("confidence");
const treatment = document.getElementById("treatment");
const prevention = document.getElementById("prevention");

// AI model
let model = null;

// Currently selected image
let selectedImage = null;


// ==========================================
// LOAD AI MODEL
// ==========================================

async function loadModel() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        console.log("AI model loaded successfully.");

        analyzeButton.disabled = false;

    } catch (error) {
        console.error("Could not load AI model:", error);

        alert(
            "The AI model could not be loaded. Please check your internet connection and try again."
        );
    }
}

loadModel();


// ==========================================
// HANDLE IMAGE
// ==========================================

function handleImage(file) {

    if (!file) {
        return;
    }

    // Make sure the selected file is an image
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        preview.src = event.target.result;

        preview.onload = function() {

            selectedImage = preview;

            analyzeButton.disabled = false;

            // Hide previous result
            result.style.display = "none";

            console.log("Image ready for analysis.");
        };
    };

    reader.readAsDataURL(file);
}


// ==========================================
// TAKE A PICTURE
// ==========================================

cameraInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    handleImage(file);

});


// ==========================================
// UPLOAD A FILE
// ==========================================

imageInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    handleImage(file);

});


// ==========================================
// ANALYZE LEAF
// ==========================================

analyzeButton.addEventListener("click", async function() {

    if (!selectedImage) {
        alert("Please take a picture or upload an image first.");
        return;
    }

    if (!model) {
        alert("The AI model is still loading. Please wait a moment.");
        return;
    }

    // Show loading
    loading.style.display = "block";
    result.style.display = "none";

    analyzeButton.disabled = true;

    try {

        // Get predictions
        const predictions = await model.predict(selectedImage);

        console.log("Predictions:", predictions);

        // Find highest probability
        let highestPrediction = predictions[0];

        for (let i = 1; i < predictions.length; i++) {

            if (
                predictions[i].probability >
                highestPrediction.probability
            ) {
                highestPrediction = predictions[i];
            }

        }

        const predictedDisease = highestPrediction.className;
        const predictedConfidence =
            highestPrediction.probability * 100;

        // Display disease
        disease.textContent = predictedDisease;

        // Display confidence
        confidence.textContent =
            predictedConfidence.toFixed(1) + "%";

        // Get advice
        const advice = getAdvice(predictedDisease);

        treatment.textContent = advice.treatment;
        prevention.textContent = advice.prevention;

        // Show results
        result.style.display = "block";

    } catch (error) {

        console.error("Prediction error:", error);

        alert(
            "Something went wrong while analyzing the image."
        );

    } finally {

        loading.style.display = "none";

        analyzeButton.disabled = false;
    }

});


// ==========================================
// DISEASE ADVICE
// ==========================================

function getAdvice(diseaseName) {

    const name = diseaseName.toLowerCase();

    // --------------------------------------
    // POWDERY MILDEW
    // --------------------------------------

    if (name.includes("powdery")) {

        return {

            treatment:
                "Remove badly affected leaves and dispose of them away from healthy plants. Improve air circulation around the plant and avoid wetting the leaves when watering. A suitable fungicide may be used according to its label directions.",

            prevention:
                "Give plants enough spacing, provide good sunlight and air circulation, avoid excessive nitrogen fertilizer, and water near the soil rather than directly on the leaves. Check plants regularly for white powdery growth."

        };
    }


    // --------------------------------------
    // DOWNY MILDEW
    // --------------------------------------

    if (name.includes("downy")) {

        return {

            treatment:
                "Remove and dispose of heavily infected leaves. Keep foliage as dry as possible and improve air circulation. Avoid overhead watering. If the disease continues to spread, use an appropriate fungicide according to the product label.",

            prevention:
                "Avoid overcrowding plants, provide good ventilation, water at the base of the plant, and remove infected plant material. Regularly inspect the undersides of leaves for early signs of infection."

        };
    }


    // --------------------------------------
    // LEAF CURL
    // --------------------------------------

    if (name.includes("leaf curl") || name.includes("leafcurl")) {

        return {

            treatment:
                "Remove severely affected leaves and check the plant carefully for insects such as aphids, whiteflies or other sap-sucking pests. Control the pests using an appropriate method and keep the plant properly watered.",

            prevention:
                "Inspect plants regularly for pests, keep weeds under control, maintain consistent watering, avoid plant stress, and keep infected or heavily infested plant material away from healthy plants."

        };
    }


    // --------------------------------------
    // FUNGAL LEAF SPOT
    // --------------------------------------

    if (
        name.includes("fungal leaf spot") ||
        name.includes("leaf spot") ||
        name.includes("black spot")
    ) {

        return {

            treatment:
                "Remove affected leaves and dispose of them rather than leaving them near the plant. Avoid getting water on the foliage and improve air circulation. A suitable fungicide can be considered for serious infections according to its label directions.",

            prevention:
                "Keep leaves dry, water at the base of the plant, provide good spacing and air circulation, remove fallen infected leaves, and regularly inspect plants for new spots."

        };
    }


    // --------------------------------------
    // HEALTHY PLANT
    // --------------------------------------

    if (name.includes("healthy")) {

        return {

            treatment:
                "No disease treatment is currently indicated. Continue normal plant care and monitor the plant regularly for changes.",

            prevention:
                "Maintain good sunlight, appropriate watering, adequate nutrition and good air circulation. Inspect leaves regularly so that any disease or pest problem can be detected early."

        };
    }


    // --------------------------------------
    // DEFAULT
    // --------------------------------------

    return {

        treatment:
            "Follow the recommended care for the detected condition and monitor the plant closely. If symptoms become worse, consult a local agricultural expert.",

        prevention:
            "Maintain good air circulation, avoid unnecessary leaf wetness, remove infected plant material and regularly inspect your plants."

    };
}
```
