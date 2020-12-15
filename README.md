# Machine Learning Engineer Home Assignment
A simple image classifier:  
A home assignment for the machine learning engineer position at Peltarion  
  
The image classifier could be built and run on a users computer locally or online (http://3.138.254.75) 
- A user can choose between three pretrained imagenets: `ResNet50`, `MobileNet V2` or `NASNetMobile` with more models are possible to integrate from [https://keras.io/api/applications/](https://keras.io/api/applications/)   
- If running the application locally a user has the option to either make the predictions locally or on a remote server. For example: http://3.138.254.75/predict   


## Overview
- Clone repository
- Install requirements
- Start the server
- Open your browser on http://localhost:5000
- Select a image for prediction
- Profit!

![Our Image Classifier](https://user-images.githubusercontent.com/20767068/102025304-47451d80-3d97-11eb-853e-7117630aa283.png)

## Setup with local installation
Setup and start the server locally
```shell
# Clone repo
git clone https://github.com/MarkusSagen/keras_classifier.git
cd keras_classifier

# Create and activate a virtual enviroment
python3 -m venv keras_classifier
source keras_classifier/bin/activate

# Install requirements
pip install -r requirements.txt

# Start server
python app.py
```
Now on http://localhost:5000 you can send in an image and get out a prediction   
To send your predictions to a remote server, either set the ___server-mode__  to *custom* and enter the IP address: `http://3.138.254.75/predict` or just *server* when you make the predictions for them to be done on a remote server.   




## Setting up the application for production on a remote server
For serving our Flask app in production, we deploy a AWS EC2 instance   
with uWSGI and NGINX.   
   
For detailed instructions see: [HERE](remote/README.md)    

## Make prediction on a remote server
Go to http://localhost:5000 and upload an image for classification  
To use a remote server, choose the pre-configured remote server or a custom IP address  

**Example**: Specifying a remote API could be set as:  
`http://3.138.254.75/predict`


# About the implementation
For this project I built a simple images classifier API with Flask, Keras, Tensorflow, uWSGI and NGINX.  
Users can start a local instance of the application or access it online and send in images, which the model will yield predictions for, both class labels and scores. The user can choose between three different pretrained imagenets:
`ResNet50`, `MobileNet V2` or `NASNetMobile`. The prediction can then be done either locally or done on a remote server.   

A user can specify a specific IP address for where predictions should be made, or use the pre-configured IP address of a server setup to work for this application, which is a EC2 instance with NGINX and uWSGI; available at: [http://3.138.254.75](http://3.138.254.75).   

   
## Overview of the solution
For my solution I chose to serve the model predictions using the python web framework Flask to build our API.  
When implementing the application I strived for  
  
a) **Quick Development** with a well know framework, so that other people could inspect it and provide feedback, knowing that a server solution in Rust or Java would potentially be a faster application, but not in implementation. The application   
b) **Customer Focused** to imagine this as a project users would want to use and based on that, what should be prioritized for the application.  With this in mind, I chose to focus on making the application work on a server so users no matter the hardware or technical expertise could still use the application. We could then also leverage using for instance servers with dedicated NVIDIA GPUs to further speed up predictions.   
c) **Speed** With the user experience in mind, speed of predictions were prioritized. Models should be small to load and make predictions quickly.  
d) **Reliability** No matter how fast the model is, if it doesn't yield accurate predictions reliably, then no one will use it.  
e) **Usability** We want the user to easily be able to use the system and interpret the results.
f) **Maintainability** We as developers wants the application to be able easily maintainable, be scalable and secure. This part is currently lacking in our implementation.  

## Server and Web Application
 I chose Flask for several reasons, primarily because it is a minimalistic web framework with an ease of implementing example projects quickly. Because it is a python based our model prediction logic could be incorporated directly in the Flask app. Additionally, there is a lot of resources for serving a Flask app as a machine learning APIs online. As a web framework, Flask is very slow, even when running in production mode. Therefor, for real world usage I would prefer web frameworks based on Node, java, rust, C++ or even other python frameworks such as [FastAPI](https://fastapi.tiangolo.com/).   

Flask is not a server suitable for production, which it also states on the [Official Flask website](https://flask.palletsprojects.com/en/1.1.x/deploying/#deployment). Instead we use dedicated applications for this purpose, namely NGINX as our web server and uWSGI as our application server. NGINX handles multiple requests at a time and is a widely used web server with many features, including a reverse proxy.   
I chose this web server because of it ability to handle a high number of requests, its low memory overhead and speed. I chose it over other web servers such as Apache, because of its speed and wide adoption (Peltarion using it also seemed like a good verification).   
  
Web servers has no way of interacting with python objects directly, so instead we use an interface standard to communicate to communicate between web servers, frameworks and applications. For Flask, this is the synchronous standard interface: WSGI. There are several framework for serving WSGI (python) application, the most popular being uWSGI and Gunicorn. I choose uWSGI primarily becasue of [this online blog post](https://blog.kgriffs.com/2012/12/18/uwsgi-vs-gunicorn-vs-node-benchmarks.html) on the potential for an uWSGI application server to be cofigured to be faster than a node server. I had also worked with Gunicorn before and I wanted the chance to learn another application server.   
   
   
## Machine Learning Framework
For the machine learning framework I chose Tensorflow 2.0 or more specifically Keras over PyTorch primarily because of the wealth of available resources for Keras and Tensorflow based models used in production and especially for image classification. Tensorflows provides an extensive documentation and wide integration with other applications, such as Tensorflow serving, Apache Kafka, Tensorflow.js making it well suited for ML applications in production.   
   
I used pretrained imagenet models from the Keras application page to quickly setup a usable application with at least three different models which the user could use. I chose the pretrained image classifiers to use based on the size of the models (and parameters) and how well they seemed to perform. Thinking with the user in mind, I reasoned that most users of this application would want the predictions to be as accurate and quick as possible ([As in the case for slow websites](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/)). I reasoned that `ResNet50`, `MobileNet V2` and `NASNetMobile` struck a good compromise between these, but a thorough testing would need to be made to verify the best models to use.   

I purposely chose to present the top 3 predictions as opposed to only the best or any other number of predictions. When I previously worked on a project for close-domain question answering on documents, one of the primary reasons cited for not using it was the lack of insight in to how it predictions were made. When you could rely on its predictions or not. By including more predictions the user can hopefully gain more insight into when the model fail in its predictions, if it picked up other objects than the user expected, are there trends to when the prediction is incorrect and so on. However, yielding to many predictions may be to distracting and move focus away from what the user actually wanted for the application.   


 
#### Edge computing
https://www.vxchnge.com/edge-computing   
https://winjit.com/articles/pros-and-cons-of-edge-computing/   
https://rehack.com/iot/the-advantages-and-disadvantages-of-edge-computing/    
  
##### Pros
- **Speed** Having computations performed on the local device, if the device has the hardware for it and the computation is inexpensive, then edge computing is very fast as there is no latency introduced in sending computations to a remote server.   
- **Flexibility** Instead of users sending their requests to a remote server, potentially on the other side of the world, edge nodes can instead be placed nearer to a user becoming potentially cheaper, faster and scalable.  
- **Reliability** When data is processed on multiple edges instead on one central node there is an increased network resilience if one of the edges are unreachable. 
- **Security** Without a single central node where all the data is stored, it becomes harder for potential hackers to sabotage the computing node. It also provides additional security in terms of processing sensitive or private information, such as medical information. 
  
##### Cons
- **Security** In inherent risk of IoT devices is the risk for malicious attacks and hacking. Since edge computing provides more nodes in a distributed network it also means more areas where hackers can attack.  
- **Incomplete data** Because each edge is only guaranteed to have access to a part of the data. This means predictison made from the data may be incomplete. 
- **More Hardware** More edges means more hardware and potentially an increased cost and also require more storage than a traditonal cloud computing solution.

  
#### Cloud computing
https://www.znetlive.com/blog/pros-and-cons-of-cloud-computing/   
https://www.alvareztg.com/the-pros-and-cons-of-cloud-computing/  

##### Pros
- **Accessability** With a cloud solution, files and computations can be done from any place in the world and any device with a internet connection. It removes the need for users to have the hardware and compute resources required.  
- **Lower Cost** Depending on the computations to be to be done, it could be much cheaper to make those in the cloud and forgo the need to pay for an infrastructure and staff you may not need. You pay as you go.  
- **Reliability**  Much of the responsibility for scalability, up-time and security is moved to the cloud computing venue, instead of the end user. Often, there are also methods for storing data with these venues; where lost data could be very expensive. Computations can also scale dynamically is specified.   

##### Cons
- **Internet Issues** With all the computing on one centralized place, without a stable internet connection the computations and work made there can not be accessed.    
- **Security** With one centralized hub for all of a users computations and potentially data, it becomes a much more valuable target for hackers and other malicious attacks.   
- **Hidden Costs** Moving to a cloud solution creates an abstraction layer between the user and how the computation is made on the cloud. Depending on the setup of the computation, costs can increase drastically and is highly dependent of implementation scheme - For instance, [Here](https://www.youtube.com/watch?v=N6lYcXjd4pg) is explained how a mistake of calculating the number of donations on a website racked up a bill of 70K $ because of the calculations being done on the client side for each client.  

#### Why tackle running model server-side and not any of the other tasks?
As stated above, I chose to tackle the tasks (Besides reliability and speed of the predictions) I viewed be the most important part for a application, that being the availability for others (customers) to use it. All of the ideas presented in project description are important! I will try to describe my decision on why a chose not to implement the other ideas proposed in order:  

**Queuing multiple predictions**  
A very important part and was tied for the feature I wanted to integrate, since its reasonable to assume that users want to batch multiple predictions. There were three main aspects to why I choose not to start with this:
1. Starting with a simple working application which any user with internet access can use seemed to be higher priority than queuing multiple predictions, if we don't know if its a feature a potential user will actually use. Better then to allow users to use the application and then implement features based on user feedback, feature requests and the like.   
2. If we started with implementing the queuing of multiple predictions, we would most likely still need to setup the application online eventually. For practical use, we would like to ensure for instance a message queue with a message broker to process and distribute the predictions evenly to multiple instances of our our prediction models - ensuring fast predictions returned to the user. Depending on the use cases of the application and feature request (another reason I chose not to start in this route) I would choose between Apache Kafka  or RabbitMQ. Kafka in general, but especially for streams of large data and RabbitMQ for the because of its compatibility, pre-made plugins and SSL support.   
3. Another problem I saw with making multiple predictions is how best to present all the predictions to the user? With multiple predictions it was not as easy to determine a satisfactory way to present the users predictions, while still making the application user friendly. One thought I had was to present each prediction in order with an index of the order of which the prediction was sent in, a label for the highest predicted class label and corresponding score. A user could then click on a specific prediction to get more information about all other labels it predicted with corresponding scores  


**Weight Quantization and Pruning**  
Because of the multitude of pretrainde models available at [https://keras.io/api/applications/](https://keras.io/api/applications/) and since a few of them are well preforming models with a small memory footprint, I decided that this was a lower priority compared too the other tasks. When used to reduce size of larger models or if a user has trained a model they want to use, then this would be a higher priority. I reasoned that it was better to evaluate the models that already existed in terms of speed and reliability, create a working application, and then look into if additional features such as model pruning was a good feature to add. 

**Inspecting the predictions with Grad-CAM or similar**  
Having reliable and trustworthy prediction prediction model is essential for users wanting to use the system.   
With large and complex models both the user and we as engineers need insight into how the model operates and why it makes it predictions. My estimation was that it was something nice to have and provide to the engineer and user, especially when incorrect predictions are made. A quick implementation of this feature also seems to be possible: https://keras.io/examples/vision/grad_cam/.  

**Run the model for a live Stream**  
Setting up an application which could deal with live streams is something that is new for me and something I would need to research more to feel confident about answering. I'm leaning in the area towards using Kafka as an event-streaming platform and test both a regular image classifier in Tensorflow and pretrained object detection models such as YOLO. Again, I would need to research it a bit more.  
- [Tensorflow with Kafka](https://www.tensorflow.org/io/tutorials/kafka)
- [Another Object Detector](https://gilberttanner.com/blog/live-object-detection)

## Future works and improvement's
- Setup a message queue and task runner such as Celery with RabbitMQ to queue multiple predictions
- Dockerize the application and add Kubernetees to scale dynamically with increased workload. Unfortunately a majority of my time was spent trying to move the full application with the NGINX and uWSGI settings into Docker container but without success and therefor not included in this repo. 
- Increased security to prevent miss use of the application
- Setup a domain name for the application and SSL
- Better fault prevention for what type of data will be sent to the server 
- Adding additional security measures for the server 
- Look into methods for leveraging cloud, edge and on-device computing efficiently and securely
- Allow users to train their own models on tasks 
- Allow models to use GPUs when available
- Include methods for interpret the predictions
- Train the model used on more data to perform better on more data
- Implement the server in a more stable and faster framework than Flask for production
- Prune larger model and investigate the difference in performance 
- Provide more settings for the users to use, but still not to many. For instance allow the user to set how many of the predicitons should be returned.
- Maybe strategies for choosing the best model for the task automatically for the user. A naive approach could for instance be to make a prediction with three different model and return the prediciton for the model with the highest score? But I would need to research what others have done here. 
- Implement similarity search for an image 
- Test out Tensorflow servings, which seems like a simple, fast and scalable methods for using Tensorflow models in production and support for mini-batch evaluation. However, because this approach is more towards a production solution, it is harder to iterate upon and make quick changes. 

## Sources and references
- [For pretrained Keras models](https://keras.io/api/applications/)
- [How not to deploy Keras models](https://towardsdatascience.com/how-to-not-deploy-keras-tensorflow-models-4fa60b487682)
- [Serving a Flask application with uWSGI and NGINX on Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uswgi-and-nginx-on-ubuntu-18-04)
- [NGINX vs Apache](https://kinsta.com/blog/nginx-vs-apache/)
- [The Fastest Web servers in the world](https://linuxnatives.net/2012/the-fastest-web-server-in-the-world)
- [The uWSGI Swiss Army Knife](https://lincolnloop.com/blog/uwsgi-swiss-army-knife/)
- [Python Web server performance](https://help.dreamhost.com/hc/en-us/articles/215945987-Web-server-performance-comparison)
- [Why chose uWSGI over Gunicorn](https://hackersandslackers.com/deploy-flask-uwsgi-nginx/)
- [Setting up Docker with NGINX and uWSGI](https://github.com/tiangolo/uwsgi-nginx-flask-docker)
- [uWSGI vs Gunicorn vs Node.js](https://blog.kgriffs.com/2012/12/18/uwsgi-vs-gunicorn-vs-node-benchmarks.html) 
- [Users abandon site if loads for too long](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/)
- [Official Flask website](https://flask.palletsprojects.com/en/1.1.x/deploying/#deployment)
- [FastAPI](https://fastapi.tiangolo.com/).   
- [https://keras.io/api/applications/](https://keras.io/api/applications/)
- [Grad-CAM in Keras](https://keras.io/examples/vision/grad_cam/)
- [Tensorflow with Kafka](https://www.tensorflow.org/io/tutorials/kafka)
- [Another Object Detector](https://gilberttanner.com/blog/live-object-detection)
- [About Edge computing](https://www.vxchnge.com/edge-computing)   
- [Edge computing: Pros and Cons](https://winjit.com/articles/pros-and-cons-of-edge-computing/)   
- [Edge computing: Disadvantages](https://rehack.com/iot/the-advantages-and-disadvantages-of-edge-computing/)   
- [Edge computing: 5 advantages and disadvantages](https://www.hitechwhizz.com/2020/04/5-advantages-and-disadvantages-risks-and-benefits-of-edge-computing.html)
- [Cloud computing: Pros and Cons](https://www.znetlive.com/blog/pros-and-cons-of-cloud-computing/)   
- [Cloud computing: More Pros and Cons](https://www.alvareztg.com/the-pros-and-cons-of-cloud-computing/)  
- [Interprability for Deep Learning Classifiers](https://towardsdatascience.com/interpretability-in-deep-learning-with-w-b-cam-and-gradcam-45ba5296a58a)
- [More on Model Interpretability](https://distill.pub/2018/building-blocks/)
- [Debugging Neural Networks](https://www.wandb.com/articles/debugging-neural-networks-with-pytorch-and-w-b-using-gradients-and-visualizations)



## Contact 
By [Markus Sagen](mailto:markus.john.sagen@gmail.com?subject=[GitHub]%20About%20The%20Keras%20Classifier%20Project)
