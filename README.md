# Machine Learning Engineer Home Assignment
A simple image classifier:  
A home assignment for the machine learning engineer position at Peltarion   

## Overview
- Clone repository
- Install requirements
- Start the server
- Open your browser on http://localhost:5000
- Select a image for prediction
- Profit!

![Our Image Classifier](https://user-images.githubusercontent.com/20767068/102025304-47451d80-3d97-11eb-853e-7117630aa283.png)

## Setup with local installation
Setup and start the server
```shell
# Clone repo
git clone https://github.com/MarkusSagen/keras_classifier.git
cd keras_classifier

# Install requirements
pip install -r requirements.txt

# Start server
python app.py
```
Now on http://localhost:5000 you can send in an image and get out a prediction


## Setting up the application for production on a remote server
For serving our Flask app in production, we deploy a AWS EC2 instance   
with uWSGI and NGINX.   
   
For detailed instructions see: [HERE](remote/README.md)    

## Make prediction on a remote server
Go to http://localhost:5000 and upload an image for classification  
To use a remote server choose the pre-configured remote server or a custom ip address  

**Example**: Specifying a remote API could be set as:  
`http://3.138.254.75/predict`



