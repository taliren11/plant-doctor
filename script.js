const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";

let model;

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeButton = document.getElementById("analyzeButton");
const result = document.getElementById("result");


/* =========================================
   DISEASE INFORMATION
========================================= */

const diseaseInfo = {

    "leaf curl": {
        icon: "🍃",

        treatment:
            "First check the underside of the leaves and new growth for aphids, whiteflies, or other sucking insects. Remove badly damaged leaves and affected plant parts. Keep the plant consistently watered, but avoid waterlogging the soil. If insects are present, use an appropriate insect-control treatment according to its label. If curling continues without visible insects, the cause may be viral or environmental, and severely affected plants may need to be isolated or removed.",

        prevention:
            "Inspect new leaves regularly for insects and early signs of curling. Keep weeds and infected plant material away from the growing area. Avoid overcrowding and provide good airflow. Maintain consistent watering and avoid sudden changes in growing conditions. Use healthy planting material and, where available, varieties that are resistant to common viruses or pests."
    },


    "downy mildew": {
        icon: "🦠",

        treatment:
            "Remove leaves that are heavily affected and dispose of them away from healthy plants. Improve air circulation by spacing plants and removing excessive foliage. Water at the base of the plant instead of wetting the leaves. Keep foliage as dry as possible and reduce prolonged periods of high humidity. If the disease continues to spread, use a fungicide specifically labeled for downy mildew on your particular crop and follow the product label carefully.",

        prevention:
            "Avoid overcrowding plants and provide good air circulation. Water near the base of plants, preferably early enough for foliage to dry quickly. Avoid unnecessary overhead watering. Remove fallen or infected leaves promptly. Inspect plants regularly, especially during cool and humid weather, because these conditions can favor downy mildew development."
    },


    "powdery mildew": {
        icon: "🍂",

        treatment:
            "Remove severely infected leaves and plant parts and dispose of them rather than leaving them around the plant. Improve sunlight and air circulation by reducing overcrowding. Avoid excessive nitrogen fertilization because very lush growth can be more susceptible. Keep the foliage dry when possible. If the infection is spreading, use a fungicide labeled for powdery mildew and the specific plant, following the product label instructions.",

        prevention:
            "Give plants enough space for good airflow and sunlight. Avoid planting in locations with poor air circulation. Inspect new growth regularly for the characteristic white, powdery coating. Remove infected plant material early and keep the growing area clean. Water the soil rather than repeatedly wetting foliage, while maintaining appropriate moisture for the plant."
    },


    "fungal leaf spot": {
        icon: "⚫",

        treatment:
            "Remove badly affected leaves and dispose of them away from healthy plants. Clean up fallen leaves and infected plant debris because fungal pathogens can survive in them. Improve air circulation by reducing overcrowding. Avoid overhead watering and allow foliage to dry quickly. If the disease continues to spread, use a fungicide specifically labeled for fungal leaf spot on the affected crop and follow the product label carefully.",

        prevention:
            "Inspect leaves regularly so symptoms can be detected early. Remove infected leaves and fallen debris promptly. Give plants enough space for good airflow. Water at the base of the plant rather than keeping the leaves wet. Keep pruning tools clean and disinfect them between plants when disease is suspected."
    },


    "healthy plant": {
        icon: "🌿",

        treatment:
            "No obvious disease was detected by the AI model. Continue normal plant care, including appropriate watering, sunlight, nutrition, and monitoring. If new symptoms appear, take another clear photograph and check the plant again.",

        prevention:
            "Inspect leaves and new growth regularly for spots, discoloration, curling, or unusual growth. Keep the growing area clean, provide good airflow, and avoid unnecessary leaf wetness. Healthy plants are generally better able to tolerate disease and environmental stress."
    }

};


/* =========================================
   MATCH MODEL CLASS TO OUR INFORMATION
========================================= */

function getDiseaseKey(className) {

    const name = className.trim().toLowerCase();

    /* Leaf Curl / Leaf Curls */

    if (
        name === "leaf curl" ||
        name === "leaf curls"
    ) {
        return "leaf curl";
    }


    /* Downy Mildew */

    if (
        name === "downy mildew"
    ) {
        return "downy mildew";
    }


    /* Powdery Mildew */

    if (
        name === "powdery mildew"
    ) {
        return "powdery mildew";
    }


    /* Fungal Leaf Spot */

    if (
        name === "fungal leaf spot" ||
        name === "fungal leaf spots"
    ) {
        return "fungal leaf spot";
    }


    /* Healthy Plant / Healthy Plants */

    if (
        name === "healthy plant" ||
        name === "healthy plants"
    ) {
        return "healthy plant";
    }


    return null;
}


/* =========================================
   LOAD AI MODEL
========================================= */

async function loadModel() {

    result.innerHTML = "🧠 Loading AI model...";

    try {

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(
            modelURL,
            metadataURL
        );

        result.innerHTML =
            "✅ AI model ready!<br>Upload a leaf to begin.";

    } catch (error) {

        console.error(error);

        result.innerHTML =
            "❌ Could not load the AI model.";
    }
}


/* =========================================
   IMAGE UPLOAD
========================================= */

imageInput.addEventListener(
    "change",
    function () {

        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        const imageURL =
            URL.createObjectURL(file);

        preview.src = imageURL;

        preview.style.display = "block";

        result.innerHTML =
            "📷 Image ready!<br>Click <b>Analyze Plant</b>.";
    }
);


/* =========================================
   ANALYZE IMAGE
========================================= */

analyzeButton.addEventListener(
    "click",
    async function () {

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

            const prediction =
                await model.predict(preview);


            /* Find highest prediction */

            let highestPrediction =
                prediction[0];


            for (
                let i = 1;
                i < prediction.length;
                i++
            ) {

                if (
                    prediction[i].probability >
                    highestPrediction.probability
                ) {

                    highestPrediction =
                        prediction[i];
                }
            }


            const disease =
                highestPrediction.className;


            const confidence =
                (
                    highestPrediction.probability * 100
                ).toFixed(1);


            /* Find matching advice */

            const diseaseKey =
                getDiseaseKey(disease);


            const info =
                diseaseInfo[diseaseKey];


            /* =====================================
               DIAGNOSIS
            ===================================== */

            let output = `

                <div class="diagnosis">

                    ${info ? info.icon : "🌱"}

                    ${disease}

                </div>


                <div class="confidence">

                    Confidence:

                    <b>${confidence}%</b>

                </div>

            `;


            /* =====================================
               TREATMENT + PREVENTION
            ===================================== */

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
                            for further diagnosis and treatment.
                        </p>


                        <h3>🛡️ Prevention</h3>

                        <p>
                            Keep the plant healthy and monitor
                            the leaves regularly for changes.
                        </p>

                    </div>

                `;

            }


            /* =====================================
               ALL PREDICTIONS
            ===================================== */

            output += `

                <br>

                <details>

                    <summary>
                        📊 View all AI predictions
                    </summary>

                    <br>

            `;


            for (
                let i = 0;
                i < prediction.length;
                i++
            ) {

                const name =
                    prediction[i].className;


                const percentage =
                    (
                        prediction[i].probability * 100
                    ).toFixed(1);


                output += `

                    ${name}:
                    <b>${percentage}%</b>

                    <br>

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

    }
);


/* =========================================
   START
========================================= */

loadModel();
