
import re
import base64

import numpy as np
from PIL import Image
from io import BytesIO

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


def model_load(model_path):
    """
    Load model saved from Keras: `model.save()`
    """
    model = load_mode(model_path)
    model._make_predict_function() # Required if loading from own path
    return model    


def base64_to_pil(img_base64):
    """
    Convert from base64 image encoding (string) to PIL image
    """
    image_data = re.sub('^data:image/.+;base64,', '', img_base64)
    img = Image.open(BytesIO(base64.b64decode(image_data))).convert('RGB')
    return img


def np_to_base64(img_np):
    """
    Convert from numpy RGB image (array) to base64 encoding (string)
    """
    img = Image.fromarray(img_np.astype('uint8'), 'RGB')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return u"data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode("ascii")


def model_predict(img, model, preprocess_func):
    """
    Make image classification prediction from pretrained Keras model
    """
    img = img.resize((224, 224)) # Each model expects shape: (224, 224, 3)
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)

    x = preprocess_func(x)
    preds = model.predict(x)
    return preds