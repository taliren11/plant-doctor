const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";

let model;

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeButton = document.getElementById("analyzeButton");
const result = document.getElementById("result");


/* =========================
   DISEASE INFORMATION
========================= */

const diseaseInfo = {

    "leaf curl": {
        icon: "🍃",
        treatment:
            "Remove badly affected leaves and check the plant for insects such as aphids or whiteflies. Keep the plant properly watered.",
        prevention:
            "Regularly check for insects, remove infected leaves, and keep the plant healthy."
    },

    "downy mildew": {
        icon: "🦠",
        treatment:
            "Remove infected leaves and improve air circulation around the plant. Avoid getting water directly on the leaves.",
        prevention:
            "Give plants enough space for airflow and avoid excessive moisture on the leaves."
    },

    "powdery mildew": {
        icon: "🍂",
        treatment:
            "Remove severely affected leaves and improve sunlight and air circulation around the plant.",
        prevention:
            "Avoid overcrowding and maintain good airflow around the leaves."
    },

    "black spots": {
        icon: "⚫",
        treatment:
            "Remove affected leaves and fallen plant material. Avoid unnecessarily wetting the leaves.",
        prevention:
            "Maintain good air circulation and avoid keeping the leaves wet for long periods."
    },

    "healthy plant": {
        icon: "🌿",
        treatment:
            "No disease was detected. Continue providing appropriate water, sunlight, and nutrients.",
        prevention:
            "Continue regular plant care and monitor the leaves for any changes."
    }
};


/* =========================
   LOAD MODEL
========================= */

async function loadModel() {

    result.innerHTML = "🧠 Loading AI model...";

    try {

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        result.innerHTML =
            "✅ AI model ready!<br>Upload a leaf to begin.";

    } catch (error) {

        console.error(error);

        result.innerHTML =
            "❌ Could not load the AI model.";
    }
}


/* =========================
   IMAGE UPLOAD
========================= */

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    preview.src = imageURL;

    preview.style.display = "block";

    result.innerHTML =
        "📷 Image ready!<br>Click <b>Analyze Plant</b>.";
});


/* =========================
   ANALYZE IMAGE
========================= */

analyzeButton.addEventListener("click", async function () {

    if (!imageInput.files[0]) {

        result.innerHTML =
            "⚠️ Please upload a leaf image first.";

        return;
    }

    if (!model) {

        result.innerHTML =
            "🧠 AI model is still loading.";

        return;
    }

    result.innerHTML =
        "🔍 <b>Analyzing your plant...</b>";

    try {

        const prediction = await model.predict(preview);

        let highestPrediction = prediction[0];

        for (let i = 1; i < prediction.length; i++) {

            if (
                prediction[i].probability >
                highestPrediction.probability
            ) {

                highestPrediction = prediction[i];
            }
        }

        const disease = highestPrediction.className;

        const confidence =
            (highestPrediction.probability * 100).toFixed(1);

        /*
        Convert the model's class name to lowercase
        so "Downy Mildew", "DOWNY MILDEW", etc. all work.
        */

        const diseaseKey = disease.trim().toLowerCase();

        const info = diseaseInfo[diseaseKey];


        /* =========================
           MAIN RESULT
        ========================= */

        let output = `

            <div class="diagnosis">
                ${info ? info.icon : "🌱"} ${disease}
            </div>

            <div class="confidence">
                Confidence: <b>${confidence}%</b>
            </div>

        `;


        /* =========================
           TREATMENT + PREVENTION
        ========================= */

        if (info) {

            output += `

                <div class="advice">

                    <h3>💊 What to do</h3>

                    <p>
                        ${info.treatment}
                    </p>

                    <h3>🛡️ Prevention</h3>

                    <p>
                        ${info.prevention}
                    </p>

                </div>

            `;

        } else {

            output += `

                <div class="advice">

                    <h3>💊 What to do</h3>

                    <p>
                        Please consult a plant specialist
                        for treatment recommendations.
                    </p>

                    <h3>🛡️ Prevention</h3>

                    <p>
                        Keep the plant healthy and monitor
                        the leaves regularly for changes.
                    </p>

                </div>

            `;
        }


        /* =========================
           ALL PREDICTIONS
        ========================= */

        output += `

            <br>

            <details>

                <summary>
                    📊 View all AI predictions
                </summary>

                <br>
        `;


        for (let i = 0; i < prediction.length; i++) {

            const name = prediction[i].className;

            const percentage =
                (prediction[i].probability * 100).toFixed(1);

            output += `
                ${name}: <b>${percentage}%</b><br>
            `;
        }


        output += `

            </details>

        `;


        result.innerHTML = output;


    } catch (error) {

        console.error(error);

        result.innerHTML =
            "❌ Error analyzing image.";
    }

});


/* =========================
   START MODEL
========================= */

loadModel();