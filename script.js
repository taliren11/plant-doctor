// ==========================================
// 🌱 PLANT DOCTOR
// REAL CAMERA + FILE UPLOAD + AI DETECTION
// ==========================================


// ==========================================
// TEACHABLE MACHINE MODEL
// ==========================================

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/bjMLKRiPa/";


// ==========================================
// HTML ELEMENTS
// ==========================================

const cameraButton =
    document.getElementById("cameraButton");

const imageInput =
    document.getElementById("imageInput");

const preview =
    document.getElementById("preview");

const analyzeButton =
    document.getElementById("analyzeButton");

const loading =
    document.getElementById("loading");

const result =
    document.getElementById("result");

const disease =
    document.getElementById("disease");

const confidence =
    document.getElementById("confidence");

const treatment =
    document.getElementById("treatment");

const prevention =
    document.getElementById("prevention");


// ==========================================
// CAMERA ELEMENTS
// ==========================================

const cameraModal =
    document.getElementById("cameraModal");

const cameraVideo =
    document.getElementById("cameraVideo");

const cameraCanvas =
    document.getElementById("cameraCanvas");

const captureButton =
    document.getElementById("captureButton");

const switchCameraButton =
    document.getElementById("switchCameraButton");

const closeCameraButton =
    document.getElementById("closeCameraButton");


// ==========================================
// VARIABLES
// ==========================================

let model = null;

let selectedImage = null;

let cameraStream = null;

let currentCamera = "environment";


// ==========================================
// LOAD AI MODEL
// ==========================================

async function loadModel() {

    try {

        const modelURL =
            MODEL_URL + "model.json";

        const metadataURL =
            MODEL_URL + "metadata.json";


        model = await tmImage.load(
            modelURL,
            metadataURL
        );


        console.log(
            "✅ AI model loaded successfully."
        );


    } catch (error) {

        console.error(
            "❌ AI model loading error:",
            error
        );

        alert(
            "The AI model could not be loaded. Please check your internet connection."
        );
    }
}


loadModel();


// ==========================================
// 📷 OPEN REAL CAMERA
// ==========================================

cameraButton.addEventListener(
    "click",
    async function() {

        await openCamera();

    }
);


// ==========================================
// START CAMERA
// ==========================================

async function openCamera() {

    try {

        // Stop any previous camera
        stopCamera();


        // Show camera interface
        cameraModal.style.display = "flex";


        // Ask browser for camera
        cameraStream =
            await navigator.mediaDevices.getUserMedia({

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


        // Put camera stream into video
        cameraVideo.srcObject =
            cameraStream;


        await cameraVideo.play();


        console.log(
            "📷 Camera started."
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        cameraModal.style.display =
            "none";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Camera permission was denied. Please allow camera access in your browser settings and try again."
            );

        } else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No camera was found on this device."
            );

        } else {

            alert(
                "Could not open the camera. Please make sure your browser has permission to use it."
            );
        }
    }
}


// ==========================================
// 📸 CAPTURE PHOTO
// ==========================================

captureButton.addEventListener(
    "click",
    function() {

        if (!cameraStream) {

            alert(
                "The camera is not currently open."
            );

            return;
        }


        // Get camera dimensions
        const width =
            cameraVideo.videoWidth;

        const height =
            cameraVideo.videoHeight;


        if (
            width === 0 ||
            height === 0
        ) {

            alert(
                "The camera is still starting. Please wait a moment and try again."
            );

            return;
        }


        // Set canvas size
        cameraCanvas.width =
            width;

        cameraCanvas.height =
            height;


        // Draw current camera frame
        const context =
            cameraCanvas.getContext("2d");


        context.drawImage(
            cameraVideo,
            0,
            0,
            width,
            height
        );


        // Convert captured image to data URL
        const imageData =
            cameraCanvas.toDataURL(
                "image/jpeg",
                0.9
            );


        // Put captured image into preview
        preview.src =
            imageData;


        preview.style.display =
            "block";


        // Save image for AI
        selectedImage =
            preview;


        // Close camera
        stopCamera();


        cameraModal.style.display =
            "none";


        // Enable analysis
        analyzeButton.disabled =
            false;


        // Remove previous result
        result.style.display =
            "none";


        console.log(
            "📸 Photo captured successfully."
        );
    }
);


// ==========================================
// 🔄 SWITCH CAMERA
// ==========================================

switchCameraButton.addEventListener(
    "click",
    async function() {

        if (!cameraStream) {
            return;
        }


        if (
            currentCamera ===
            "environment"
        ) {

            currentCamera =
                "user";

        } else {

            currentCamera =
                "environment";
        }


        await openCamera();

    }
);


// ==========================================
// ✕ CLOSE CAMERA
// ==========================================

closeCameraButton.addEventListener(
    "click",
    function() {

        stopCamera();

        cameraModal.style.display =
            "none";

    }
);


// ==========================================
// STOP CAMERA
// ==========================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function(track) {

                    track.stop();

                }
            );


        cameraStream = null;
    }


    cameraVideo.srcObject =
        null;
}


// ==========================================
// 📁 FILE UPLOAD
// ==========================================

imageInput.addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files[0];


        handleImage(file);

    }
);


// ==========================================
// HANDLE UPLOADED IMAGE
// ==========================================

function handleImage(file) {

    if (!file) {
        return;
    }


    // Make sure it is an image
    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Please select an image file."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            preview.src =
                event.target.result;


            preview.style.display =
                "block";


            preview.onload =
                function() {

                    selectedImage =
                        preview;


                    analyzeButton.disabled =
                        false;


                    result.style.display =
                        "none";


                    console.log(
                        "📁 Image uploaded successfully."
                    );
                };
        };


    reader.readAsDataURL(file);
}


// ==========================================
// 🔍 ANALYZE LEAF
// ==========================================

analyzeButton.addEventListener(
    "click",
    async function() {


        if (!selectedImage) {

            alert(
                "Please take a picture or upload an image first."
            );

            return;
        }


        if (!model) {

            alert(
                "The AI model is still loading. Please wait a moment."
            );

            return;
        }


        // Show loading
        loading.style.display =
            "block";


        // Hide old result
        result.style.display =
            "none";


        // Disable button
        analyzeButton.disabled =
            true;


        try {

            // Get predictions
            const predictions =
                await model.predict(
                    selectedImage
                );


            console.log(
                "AI predictions:",
                predictions
            );


            // Find highest prediction
            let highestPrediction =
                predictions[0];


            for (
                let i = 1;
                i < predictions.length;
                i++
            ) {

                if (
                    predictions[i]
                        .probability >
                    highestPrediction
                        .probability
                ) {

                    highestPrediction =
                        predictions[i];
                }
            }


            // Disease
            const predictedDisease =
                highestPrediction.className;


            // Confidence
            const predictedConfidence =
                highestPrediction
                    .probability * 100;


            // Display disease
            disease.textContent =
                predictedDisease;


            // Display confidence
            confidence.textContent =
                predictedConfidence
                    .toFixed(1) + "%";


            // Get advice
            const advice =
                getAdvice(
                    predictedDisease
                );


            treatment.textContent =
                advice.treatment;


            prevention.textContent =
                advice.prevention;


            // Show result
            result.style.display =
                "block";


        } catch (error) {

            console.error(
                "❌ Prediction error:",
                error
            );


            alert(
                "Something went wrong while analyzing the image."
            );


        } finally {

            loading.style.display =
                "none";


            analyzeButton.disabled =
                false;
        }

    }
);


// ==========================================
// 🌿 DISEASE ADVICE
// ==========================================

function getAdvice(diseaseName) {

    const name =
        diseaseName.toLowerCase();


    // ======================================
    // POWDERY MILDEW
    // ======================================

    if (
        name.includes("powdery")
    ) {

        return {

            treatment:
                "Remove badly affected leaves and dispose of them away from healthy plants. Improve air circulation around the plant and avoid wetting the leaves when watering. A suitable fungicide may be used according to its label directions.",

            prevention:
                "Give plants enough spacing, provide good sunlight and air circulation, avoid excessive nitrogen fertilizer, and water near the soil rather than directly on the leaves. Check plants regularly for white powdery growth."

        };
    }


    // ======================================
    // DOWNY MILDEW
    // ======================================

    if (
        name.includes("downy")
    ) {

        return {

            treatment:
                "Remove and dispose of heavily infected leaves. Keep foliage as dry as possible and improve air circulation. Avoid overhead watering. If the disease continues to spread, use an appropriate fungicide according to the product label.",

            prevention:
                "Avoid overcrowding plants, provide good ventilation, water at the base of the plant, and remove infected plant material. Regularly inspect the undersides of leaves for early signs of infection."

        };
    }


    // ======================================
    // LEAF CURL
    // ======================================

    if (
        name.includes("leaf curl") ||
        name.includes("leafcurl")
    ) {

        return {

            treatment:
                "Remove severely affected leaves and check the plant carefully for insects such as aphids, whiteflies or other sap-sucking pests. Control the pests using an appropriate method and keep the plant properly watered.",

            prevention:
                "Inspect plants regularly for pests, keep weeds under control, maintain consistent watering, avoid plant stress, and keep infected or heavily infested plant material away from healthy plants."

        };
    }


    // ======================================
    // FUNGAL LEAF SPOT
    // ======================================

    if (
        name.includes("fungal leaf spot") ||
        name.includes("leaf spot")
    ) {

        return {

            treatment:
                "Remove affected leaves and dispose of them rather than leaving them near the plant. Avoid getting water on the foliage and improve air circulation. A suitable fungicide can be considered for serious infections according to its label directions.",

            prevention:
                "Keep leaves dry, water at the base of the plant, provide good spacing and air circulation, remove fallen infected leaves, and regularly inspect plants for new spots."

        };
    }


    // ======================================
    // HEALTHY
    // ======================================

    if (
        name.includes("healthy")
    ) {

        return {

            treatment:
                "No disease treatment is currently indicated. Continue normal plant care and monitor the plant regularly for changes.",

            prevention:
                "Maintain good sunlight, appropriate watering, adequate nutrition and good air circulation. Inspect leaves regularly so that any disease or pest problem can be detected early."

        };
    }


    // ======================================
    // DEFAULT
    // ======================================

    return {

        treatment:
            "Follow the recommended care for the detected condition and monitor the plant closely. If symptoms become worse, consult a local agricultural expert.",

        prevention:
            "Maintain good air circulation, avoid unnecessary leaf wetness, remove infected plant material and regularly inspect your plants."

    };
}


// ==========================================
// CLEAN UP CAMERA IF PAGE IS CLOSED
// ==========================================

window.addEventListener(
    "beforeunload",
    function() {

        stopCamera();

    }
);
