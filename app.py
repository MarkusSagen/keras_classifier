import json
import os
import re
import sys

# Server
from flask import Flask, url_for, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from gevent.pywsgi import WSGIServer

# Model and Classifier
from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
from tensorflow.keras.applications.nasnet import NASNetMobile

from tensorflow.keras.applications.imagenet_utils import preprocess_input, decode_predictions
from tensorflow.keras.applications.nasnet import preprocess_input as preprocess_input_nasnet
from tensorflow.keras.applications.nasnet import decode_predictions as decode_predictions_nasnet

# Utilities
import numpy as np
from utils import (
    model_load,
    base64_to_pil,
    model_predict
)

app = Flask(__name__)
CORS(app)


# More models available at: https://keras.io/applications/
model_mobilenet_v2 = MobileNetV2(weights='imagenet')
model_resnet50 = ResNet50(weights='imagenet')
model_nasnet_mobile = NASNetMobile(weights='imagenet')

print('Running server on: http://127.0.0.1:5000/')


# Utility for loading correct model and parameters
def model_select_imagenet(model_name):
    """
    Given a pretrained model chosen by user
    Return pretrained model, preprocess- and decode functions 
    """
    preprocess_func = preprocess_input
    decode_preds_func = decode_predictions 
    
    if model_name == "ResNet50":
        model = model_resnet50           
    elif model_name == "MobileNetV2":
        model = model_mobilenet_v2
    elif model_name == "NASNetMobile":
        model = model_nasnet_mobile
        # Because NASNet uses different preprocessing of input and other dimensions
        preprocess_func = preprocess_input_nasnet
        decode_preds_func = decode_predictions_nasnet
    else:
        ValueError("Passed in model is not available for use")
    
    return model, preprocess_func, decode_preds_func



@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


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
        model, preprocess_func, decode_preds_func = model_select_imagenet(model_name)

        # Make prediction
        preds = model_predict(img, model, preprocess_func)
        preds = decode_preds_func(preds, top=3)[0]  # Format: [(class, object_name, prob)]
        print('Predicted:', preds)
        
        # TODO: Give user chopice for how many predictions returned
        # TODO: Give user choice if only return result above some threshold
        preds_list = []
        round_to_digits = 3 # How many digits to round prediction score
        for pred in preds:
            predicted_object = pred[1].replace('_', ' ').capitalize() 
            prediction_value  = float(str(round(pred[2], round_to_digits))) 
            preds_list.append({predicted_object: prediction_value})

        return jsonify(result=preds_list)
    return None


if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 5000), app)
    http_server.serve_forever()
