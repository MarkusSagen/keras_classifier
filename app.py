import json
import os
import re
import sys

# Server
from flask import Flask, url_for, render_template, jsonify, request
from gevent.pywsgi import WSGIServer

# Model and Classifier
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras.applications.imagenet_utils import preprocess_input, decode_predictions

# Utilities
import base64
from io import BytesIO
import numpy as np
from PIL import Image


app = Flask(__name__)


# More models available at: https://keras.io/applications/
model = ResNet50(weights='imagenet')

print('Running server on: http://127.0.0.1:5000/')


def base64_to_pil(img_base64):
    """
    Convert from base64 image encoding (string) to PIL image
    """
    image_data = re.sub('^data:image/.+;base64,', '', img_base64)
    img = Image.open(BytesIO(base64.b64decode(image_data))).convert('RGB')
    return img


def model_predict(img):
    """
    Make image classification prediction from pretrained Keras model
    """
    img = img.resize((224, 224)) # Each model expects shape: (224, 224, 3)
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)

    x = preprocess_input(x)
    preds = model.predict(x)
    return preds


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        
        request_data = request.get_json(force=True)        
        image = request_data['image']
        model_name = request_data['settings']['model']

        img = base64_to_pil(image) # Get image from request
        

        # Make prediction
        preds = model_predict(img)
        preds = decode_predictions(preds, top=3)[0]  # Format: [(class, object_name, prob)]
        print('Predicted:', preds)
        
        # TODO: Give user chopice for how many predictions returned
        # TODO: Give user choice if only return result above some threshold
        preds_list = []
        round_to_digits = 3 # How many digits to round prediction score
        for pred in preds:
            predicted_object = pred[1].replace('_', ' ').capitalize() 
            prediction_value  = float(str(round(pred[2], round_to_digits))) 
            preds_list.append({predicted_object: prediction_value})

        return jsonify(results=preds_list)
    return None


if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 5000), app)
    http_server.serve_forever()