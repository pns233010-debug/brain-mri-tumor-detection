
import os
import numpy as np
import tensorflow as tf

from flask import Flask, request, render_template
from PIL import Image

MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    "VGG16_GAP_PSO_AdamW_FocalLoss.keras"
)

CLASS_NAMES = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary"
]

IMG_SIZE = (224, 224)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

print("Loading brain MRI model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("✅ Model loaded successfully")


@app.route("/health")
def health():
    return {
        "status": "ok",
        "model": "VGG16 + GAP + PSO + AdamW + Focal Loss"
    }


@app.route("/", methods=["GET", "POST"])
def home():

    prediction = None
    confidence = None
    probabilities = []
    error = None

    if request.method == "POST":

        file = request.files.get("file")

        if file is None or file.filename == "":
            error = "Please select a brain MRI image."

        else:

            try:

                image = Image.open(file.stream)
                image = image.convert("RGB")
                image = image.resize(IMG_SIZE)

                image_array = np.asarray(
                    image,
                    dtype=np.float32
                )

                image_array = image_array / 255.0
                image_array = np.expand_dims(
                    image_array,
                    axis=0
                )

                preds = model.predict(
                    image_array,
                    verbose=0
                )[0]

                predicted_index = int(np.argmax(preds))

                prediction = CLASS_NAMES[predicted_index]

                confidence = round(
                    float(preds[predicted_index] * 100),
                    2
                )

                probabilities = [
                    (
                        class_name,
                        round(float(preds[i] * 100), 2)
                    )
                    for i, class_name in enumerate(CLASS_NAMES)
                ]

            except Exception as e:

                error = f"Could not process image: {str(e)}"

    return render_template(
        "index.html",
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities,
        error=error
    )


if __name__ == "__main__":

    port = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
