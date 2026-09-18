# 🔢 Digit Vision — Handwritten Digit Recognition

A full-stack Machine Learning web application that recognizes handwritten digits (0-9) drawn on a canvas, powered by a Convolutional Neural Network (CNN) trained on the MNIST dataset.

## 🎯 What It Does

1. User draws a digit (0-9) on the canvas.
2. The image is sent to a FastAPI backend.
3. The backend preprocesses the image (MNIST-style: crop, center, resize to 28×28, normalize).
4. A trained CNN predicts the digit with confidence.
5. Top-3 predictions with confidence bars are shown.

## 🧠 Model Details

| Aspect | Details |
|--------|---------|
| **Architecture** | Convolutional Neural Network (CNN) |
| **Dataset** | MNIST — 70,000 handwritten digit images (28×28) |
| **Training Accuracy** | 98.38% |
| **Validation Accuracy** | **99.12%** |
| **Layers** | 2 Conv2D + 2 MaxPooling + Flatten + Dense(128) + Dropout(0.5) + Dense(10) |
| **Total Parameters** | 225,034 |
| **Trained On** | Google Colab (TensorFlow 2.21) |

## 🚀 Features

- 🎨 Beautiful drawing canvas with mouse & touch support
- 🌙 Dark mode with digit-pattern background
- ☀️ Light mode with a soft pastel theme
- 🔄 Theme preference saved in browser (localStorage)
- 📊 Top-3 predictions with animated confidence bars
- ⚡ Real-time inference — under 1 second
- 📱 Fully responsive (mobile, tablet, desktop)

## 🧠 Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **ML Framework:** TensorFlow 2.21, Keras
- **Image Processing:** Pillow, NumPy
- **Frontend:** HTML5 Canvas, CSS3, Vanilla JavaScript
- **Training:** Google Colab

## 📁 Project Structure
digit-vision/
├── main.py # FastAPI backend + inference
├── digit_cnn.h5 # Trained CNN model (2.1 MB)
├── requirements.txt # Python dependencies
├── README.md # This file
└── static/
├── index.html # UI
├── style.css # Dark + Light themes
└── script.js # Canvas drawing + API calls


## ⚙️ How to Run Locally

1. **Clone the repository:**
    git clone https://github.com/debarghamondal01-lab/digit-vision.git
    cd digit-vision

2. **Install Python 3.12** (TensorFlow does not support Python 3.14):
    winget install Python.Python.3.12

3. **Install dependencies:**
    py -3.12 -m pip install -r requirements.txt

4. **Start the server:**
    py -3.12 -m uvicorn main:app

5. **Open your browser:**
    http://127.0.0.1:8000


## 🔬 How the Preprocessing Works

To match the MNIST format the model was trained on, the canvas image goes through this pipeline:

1. **Decode** base64 PNG → PIL image → grayscale.
2. **Invert** colors (canvas is black-on-white; MNIST is white-on-black).
3. **Crop** to the bounding box of the digit.
4. **Resize** preserving aspect ratio so the longest side = 20px.
5. **Pad** centered onto a 28×28 black square (like MNIST).
6. **Normalize** pixel values to 0-1.
7. **Reshape** to `(1, 28, 28, 1)` for the CNN.

This preprocessing is the key to achieving high accuracy — a raw resize would distort digits and confuse the model.

## 👤 Author

**Debargha Mondal**  
B.Tech CSE Student | Aspiring AI/ML Engineer  
GitHub: [@debarghamondal01-lab](https://github.com/debarghamondal01-lab)

## 📄 License

MIT — free to use for academic purposes.
