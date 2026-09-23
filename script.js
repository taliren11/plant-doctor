const MODEL_URL = "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";

let model;
let selectedImage = null;
let cameraStream = null;
let currentCamera = "environment";

// Main elements
const cameraButton = document.getElementById("cameraButton");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const analyzeButton = document.getElementById("analyzeButton");
const loading = document.getElementById("loading");

const result = document.getElementById("result");
const disease = document.getElementById("disease");
const confidence = document.getElementById("confidence");
const treatment = document.getElementById("treatment");
const prevention = document.getElementById("prevention");

// Camera elements
const cameraModal = document.getElementById("cameraModal");
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const captureButton = document.getElementById("captureButton");
const switchCameraButton = document.getElementById("switchCameraButton");
const closeCameraButton = document.getElementById("closeCameraButton");


// ===============================
// LOAD AI MODEL
// ===============================

async function loadModel() {
    try {
        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );

        console.log("Plant Doctor AI model loaded.");
    } catch (error) {
        console.error("Could not load AI model:", error);
        alert("The AI model could not be loaded. Please check your internet connection.");
    }
}

loadModel();


// ===============================
// OPEN CAMERA
// ===============================

cameraButton.addEventListener("click", openCamera);

async function openCamera() {
    try {
        stopCamera();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Your browser does not support camera access.");
            return;
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: currentCamera
                },
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                }
            },
            audio: false
        });

        cameraVideo.srcObject = cameraStream;

        cameraModal.style.display = "flex";

    } catch (error) {
        console.error("Camera error:", error);

        alert(
            "We couldn't access your camera. Please allow camera permission and try again."
        );

        stopCamera();
        cameraModal.style.display = "none";
    }
}


// ===============================
// CAPTURE PHOTO
// ===============================

captureButton.addEventListener("click", () => {

    if (!cameraStream) {
        return;
    }

    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;

    const context = cameraCanvas.getContext("2d");

    context.drawImage(
        cameraVideo,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
    );

    const imageData = cameraCanvas.toDataURL("image/jpeg", 0.9);

    preview.src = imageData;
    preview.style.display = "block";

    selectedImage = preview;

    stopCamera();
    cameraModal.style.display = "none";

    analyzeButton.disabled = false;

    result.style.display = "none";
});


// ===============================
// SWITCH CAMERA
// ===============================

switchCameraButton.addEventListener("click", async () => {

    if (currentCamera === "environment") {
        currentCamera = "user";
    } else {
        currentCamera = "environment";
    }

    await openCamera();
});


// ===============================
// CLOSE CAMERA
// ===============================

closeCameraButton.addEventListener("click", () => {
    stopCamera();
    cameraModal.style.display = "none";
});


// ===============================
// STOP CAMERA
// ===============================

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    cameraVideo.srcObject = null;
}


// ===============================
// UPLOAD IMAGE
// ===============================

imageInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        preview.src = e.target.result;
        preview.style.display = "block";

        selectedImage = preview;

        analyzeButton.disabled = false;

        result.style.display = "none";
    };

    reader.readAsDataURL(file);
});


// ===============================
// ANALYZE IMAGE
// ===============================

analyzeButton.addEventListener("click", async () => {

    if (!selectedImage) {
        alert("Please take a picture or upload a leaf image first.");
        return;
    }

    if (!model) {
        alert("The AI model is still loading. Please wait a moment and try again.");
        return;
    }

    loading.style.display = "block";
    result.style.display = "none";
    analyzeButton.disabled = true;

    try {

        const predictions = await model.predict(selectedImage);

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
            Math.round(highestPrediction.probability * 100);

        disease.textContent = predictedDisease;
        confidence.textContent =
            `Confidence: ${predictedConfidence}%`;

        const advice = getAdvice(predictedDisease);

        treatment.textContent = advice.treatment;
        prevention.textContent = advice.prevention;

        result.style.display = "block";

    } catch (error) {

        console.error("Prediction error:", error);

        alert(
            "Something went wrong while analyzing the image. Please try again."
        );

    } finally {

        loading.style.display = "none";
        analyzeButton.disabled = false;
    }
});


// ===============================
// DISEASE ADVICE
// ===============================

function getAdvice(diseaseName) {

    const name = diseaseName.toLowerCase();

    if (name.includes("powdery")) {

        return {
            treatment:
                "Remove badly affected leaves and improve air circulation around the plant. Avoid watering the leaves. A suitable fungicide or an appropriate powdery mildew treatment can help control the infection.",

            prevention:
                "Keep plants well spaced, provide good sunlight and airflow, avoid excessive humidity, and water near the soil instead of directly on the leaves."
        };
    }


    if (name.includes("downy")) {

        return {
            treatment:
                "Remove infected leaves and dispose of them away from healthy plants. Improve ventilation and avoid keeping the foliage wet for long periods. A suitable fungicide may help manage the disease.",

            prevention:
                "Avoid overhead watering, provide good air circulation, keep leaves dry when possible, and remove infected plant material quickly."
        };
    }


    if (name.includes("curl")) {

        return {
            treatment:
                "Remove severely affected leaves and check the plant carefully for pests such as aphids or whiteflies. Control insect pests using an appropriate treatment and keep the plant properly watered.",

            prevention:
                "Regularly inspect new leaves for pests, maintain good plant nutrition and watering, remove weeds that may host pests, and keep the growing area clean."
        };
    }


    if (
        name.includes("fungal leaf spot") ||
        name.includes("leaf spot")
    ) {

        return {
            treatment:
                "Remove infected leaves and dispose of them safely. Avoid getting water on the foliage and improve air circulation. A suitable fungicide may help if the infection is severe.",

            prevention:
                "Water at the base of the plant, avoid overcrowding, provide good airflow, remove fallen infected leaves, and keep gardening tools clean."
        };
    }


    if (name.includes("healthy")) {

        return {
            treatment:
                "Your plant appears healthy! Continue providing suitable sunlight, water and nutrients.",

            prevention:
                "Keep monitoring the leaves regularly, maintain good airflow, avoid overwatering, and remove damaged or dead plant material."
        };
    }


    return {
        treatment:
            "The condition could not be identified with complete certainty. Remove severely affected leaves and keep the plant in a clean, well-ventilated environment.",

        prevention:
            "Monitor the plant regularly, avoid overwatering, provide good airflow and sunlight, and remove infected plant material promptly."
    };
}


// ===============================
// STOP CAMERA WHEN LEAVING PAGE
// ===============================

window.addEventListener("beforeunload", () => {
    stopCamera();
});


// ===============================
// REGISTER SERVICE WORKER
// ===============================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./service-worker.js")

            .then(() => {
                console.log(
                    "Plant Doctor service worker registered successfully."
                );
            })

            .catch(error => {
                console.error(
                    "Service worker registration failed:",
                    error
                );
            });

    });
}
