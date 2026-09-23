const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeButton = document.getElementById("analyzeButton");
const result = document.getElementById("result");

let selectedImage = null;
let model;


// ================================
// LOAD AI MODEL
// ================================

async function loadModel() {

    try {

        result.innerHTML =
            "⏳ Loading Plant Doctor AI...";

        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );

        result.innerHTML =
            "✅ AI Ready! Choose a plant picture.";

    } catch (error) {

        console.error(error);

        result.innerHTML =
            "❌ Could not load the AI model. Please refresh the page.";
    }
}


// ================================
// IMAGE UPLOAD
// ================================

imageInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;

    const reader = new FileReader();

    reader.onload = function(e) {

        preview.src = e.target.result;

        preview.style.display = "block";

        result.innerHTML =
            "📸 Picture selected! Click Analyze Plant.";
    };

    reader.readAsDataURL(file);

});


// ================================
// GET DISEASE KEY
// ================================

function getDiseaseKey(label) {

    const name = label.toLowerCase().trim();

    if (
        name === "leaf curl" ||
        name === "leaf curls"
    ) {
        return "leaf curl";
    }

    if (name === "downy mildew") {
        return "downy mildew";
    }

    if (name === "powdery mildew") {
        return "powdery mildew";
    }

    if (
        name === "fungal leaf spot" ||
        name === "fungal leaf spots"
    ) {
        return "fungal leaf spot";
    }

    if (
        name === "healthy plant" ||
        name === "healthy plants"
    ) {
        return "healthy plant";
    }

    return null;
}


// ================================
// DISEASE INFORMATION
// ================================

const diseaseInfo = {

    "leaf curl": {

        title: "🍃 Leaf Curl",

        cure: `
        <ul>
            <li>Check the undersides of leaves and new growth for aphids, whiteflies, or other sucking insects.</li>
            <li>Remove badly damaged or heavily curled leaves.</li>
            <li>Keep watering consistent, but avoid waterlogging the soil.</li>
            <li>If insects are present, use an appropriate insect-control treatment for the plant.</li>
            <li>If curling continues even when pests are absent, the plant may be experiencing a viral infection or environmental stress.</li>
            <li>Isolate severely affected plants to reduce the risk of spreading disease.</li>
        </ul>
        `,

        prevention: `
        <ul>
            <li>Inspect new growth regularly for insects.</li>
            <li>Keep weeds and infected plant debris under control.</li>
            <li>Give plants enough space for good air circulation.</li>
            <li>Maintain consistent watering.</li>
            <li>Use healthy planting material.</li>
            <li>Choose resistant varieties when available.</li>
        </ul>
        `
    },

    "downy mildew": {

        title: "🌿 Downy Mildew",

        cure: `
        <ul>
            <li>Remove heavily infected leaves.</li>
            <li>Dispose of infected leaves away from healthy plants.</li>
            <li>Improve air circulation around the plant.</li>
            <li>Water at the base of the plant instead of wetting the leaves.</li>
            <li>Reduce prolonged periods of high humidity around the foliage.</li>
            <li>If the disease continues spreading, use a fungicide specifically labeled for downy mildew and the affected crop.</li>
        </ul>
        `,

        prevention: `
        <ul>
            <li>Give plants enough space for good airflow.</li>
            <li>Avoid unnecessary overhead watering.</li>
            <li>Water near the soil rather than repeatedly wetting leaves.</li>
            <li>Remove fallen and infected leaves.</li>
            <li>Monitor plants carefully during cool and humid weather.</li>
        </ul>
        `
    },

    "powdery mildew": {

        title: "☁️ Powdery Mildew",

        cure: `
        <ul>
            <li>Remove severely infected leaves and plant parts.</li>
            <li>Improve sunlight and air circulation around the plant.</li>
            <li>Avoid excessive nitrogen fertilizer.</li>
            <li>Keep foliage dry where possible.</li>
            <li>If the disease continues spreading, use a fungicide labeled for powdery mildew and the affected crop.</li>
        </ul>
        `,

        prevention: `
        <ul>
            <li>Provide adequate spacing between plants.</li>
            <li>Maintain good air circulation.</li>
            <li>Provide sufficient sunlight.</li>
            <li>Look regularly for the white powdery coating that can appear on leaves.</li>
            <li>Remove infected plant material early.</li>
            <li>Water the soil rather than repeatedly wetting the foliage.</li>
        </ul>
        `
    },

    "fungal leaf spot": {

        title: "🍂 Fungal Leaf Spot",

        cure: `
        <ul>
            <li>Remove badly affected leaves.</li>
            <li>Clean up fallen leaves and infected plant debris.</li>
            <li>Improve air circulation around the plant.</li>
            <li>Avoid overhead watering.</li>
            <li>Allow the foliage to dry after watering.</li>
            <li>If the disease continues spreading, use a fungicide labeled for fungal leaf spot and the affected crop.</li>
        </ul>
        `,

        prevention: `
        <ul>
            <li>Inspect plants regularly for new spots.</li>
            <li>Remove infected leaves as soon as possible.</li>
            <li>Keep the growing area free of infected plant debris.</li>
            <li>Provide enough spacing and airflow.</li>
            <li>Water at the base of the plant.</li>
            <li>Clean and disinfect pruning tools after working with infected plants.</li>
        </ul>
        `
    },

    "healthy plant": {

        title: "🌱 Healthy Plant",

        cure: `
        <p>
            Your plant appears healthy! No major disease was detected.
            Continue providing the plant with suitable sunlight, water,
            nutrients, and growing conditions.
        </p>
        `,

        prevention: `
        <ul>
            <li>Check your plants regularly for early signs of disease.</li>
            <li>Provide appropriate sunlight.</li>
            <li>Water consistently without overwatering.</li>
            <li>Maintain good air circulation.</li>
            <li>Remove dead or infected plant material.</li>
            <li>Keep gardening tools clean.</li>
        </ul>
        `
    }
};


// ================================
// ANALYZE PLANT
// ================================

async function analyzePlant() {

    if (!selectedImage) {

        result.innerHTML =
            "📸 Please choose a plant picture first.";

        return;
    }

    if (!model) {

        result.innerHTML =
            "⏳ The AI is still loading. Please wait a moment.";

        return;
    }

    try {

        result.innerHTML =
            "🔍 Analyzing your plant...";

        const image = new Image();

        image.src = URL.createObjectURL(selectedImage);

        image.onload = async function() {

            const predictions =
                await model.predict(image);

            predictions.sort(
                (a, b) =>
                    b.probability - a.probability
            );

            const bestPrediction =
                predictions[0];

            const label =
                bestPrediction.className;

            const confidence =
                (bestPrediction.probability * 100)
                .toFixed(1);

            const diseaseKey =
                getDiseaseKey(label);

            let output = `
                <div class="diagnosis">
                    <h2>🌱 Diagnosis</h2>
                    <h3>${label}</h3>
                    <p>
                        <strong>Confidence:</strong>
                        ${confidence}%
                    </p>
                </div>
            `;

            if (
                diseaseKey &&
                diseaseInfo[diseaseKey]
            ) {

                const info =
                    diseaseInfo[diseaseKey];

                output += `
                    <div class="advice">

                        <h2>${info.title}</h2>

                        <h3>💊 What to do</h3>

                        ${info.cure}

                        <h3>🛡️ Prevention</h3>

                        ${info.prevention}

                    </div>
                `;

            } else {

                output += `
                    <div class="advice">

                        <h3>💡 General Advice</h3>

                        <p>
                            Keep the plant healthy by providing
                            suitable sunlight, watering, nutrition,
                            and good air circulation.
                        </p>

                    </div>
                `;
            }

            output += `
                <div class="predictions">

                    <h3>📊 AI Results</h3>
            `;

            predictions.forEach(function(prediction) {

                const percentage =
                    (
                        prediction.probability * 100
                    ).toFixed(1);

                output += `
                    <p>
                        <strong>
                            ${prediction.className}
                        </strong>
                        : ${percentage}%
                    </p>
                `;

            });

            output += `</div>`;

            result.innerHTML = output;

            URL.revokeObjectURL(image.src);
        };

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            ❌ Something went wrong while analyzing
            the image. Please try another picture.
        `;
    }
}


// ================================
// ANALYZE BUTTON
// ================================

analyzeButton.addEventListener(
    "click",
    analyzePlant
);


// ================================
// START APP
// ================================

loadModel();
