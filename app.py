import json
import os
import re
import sys

# Server
from flask import Flask, url_for, render_template, jsonify
from gevent.pywsgi import WSGIServer

# Declare a flask app
app = Flask(__name__)

print('Running server on: http://127.0.0.1:5000/')


@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')


if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 5000), app)
    http_server.serve_forever()


