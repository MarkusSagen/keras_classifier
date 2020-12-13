# Setup for Deploying Classifier with uWSGI and NGINX

This guide is for setting up a Flask server with uWSGI and NGINX on a remote server  
This step assumes you have set up a remote server, with correct security settings and attached a public ip-address  
For reference, all new files created when setting up the remote server is also provided in the `remote`-folder.  

## Overview
- Preparations: Installation of packages on Ubuntu 

- Python packages and libraries

- Setup uWSGI and NGINX 

- Test the remote server. 

     


## Preparations: Installation of packages on Ubuntu 
Install packages and prerequisites for Ubuntu

``` sh
sudo apt update
sudo apt install python3-pip python3-dev python3-venv build-essential \
                 libssl-dev libffi-dev python3-setuptools nginx
```

## Setup for Python packages and modules
If not done previously, clone this Github repo to the server:

``` sh
git clone https://github.com/MarkusSagen/keras_classifier.git
cd keras_classifier
```

Setup a python viritual enviroment and activate it
``` sh
python3 -m venv .venv
source .venv/bin/activate
```

Install the required python libraries

``` sh
pip install -r requirements.txt
```

  

## Setup uWSGI and NGINX

Flask is not recommended as a production server, instead we leverage the support and capabilities of full fledged WSGI servers instead. 
In this setup, we favor uWSGI as a interface between the Flask app and the NGINX server and reverse proxy.   
We name the project to the repository name, if reusing this project, change the name 'keras_classifier' to your project name  


- The file `wsgi.py` will serve as the entry point for uWSGI instead of  `app.py` when we ran it in develop mode.   
- The file `keras_classifier.ini` specifies the configurations for uWSGI, such as number of threads and workers  
- The file `keras_classifier.ini` also specifies the socket used to pass requests between NGINX and uWSGI `/tmp/keras_classifier.sock`

#### Create a uWSGI systemd unit file 
For the Ubuntu server to automatically start uWSGI and serve the Flask application, we create a systemd service unit file: 

``` sh
sudo vim /etc/systemd/system/keras_classifier.service
```

Paste in:
``` sh
[Unit]
Description=uWSGI instance to serve keras_classifier
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/sammy/keras_classifier
Environment="PATH=/home/ubuntu/keras_classifier/.venv/bin"
ExecStart=/home/ubuntu/keras_classifier/.venv/bin/uwsgi --ini keras_classifier.ini

[Install]
WantedBy=multi-user.target
```

Now start the uWSGI service and enable it on boot-up 
``` sh
sudo systemctl start keras_classifier
sudo systemctl enable keras_classifier
```
Verify that the process worked as expected:

``` sh
sudo systemctl status keras_classifier
```
With an expected outcome of:
``` sh
● keras_classifier.service - uWSGI instance to serve myproject
     Loaded: loaded (/etc/systemd/system/keras_classifier.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2020-12-13 18:44:54 UTC; 43s ago
   Main PID: 77008 (uwsgi)
      Tasks: 44 (limit: 38529)
     Memory: 460.2M
     CGroup: /system.slice/keras_classifier.service
             ├─77008 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77086 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77088 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77090 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77093 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77095 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             ├─77097 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
             └─77099 /home/ubuntu/.local/bin/uwsgi --ini keras_classifier.ini
```


#### Configure NGINX to proxy requests
Setup where NGINX will redirect requests to. This socket must be the same as used by uWSGI. In the `keras_classifier.ini`-file, this socket is set to:  
`/tmp/keras_classifier.sock`  

Create new server block configuration for NGINX for use for this application:

``` sh
sudo vim /etc/nginx/sites-available/keras_classifier
```
Replace <YOUR_PUBLIC_IP> with the public IP address for your server 

``` sh
server {
    listen 80;
    server_name <YOUR_PUBLIC_IP>;

    location / {
        try_files $uri @app;
    }
    location @app {
        include uwsgi_params;
        uwsgi_pass unix:///tmp/myproject.sock;
    }
}
```

Now enable it:

``` sh
sudo ln -s /etc/nginx/sites-available/keras_classifier /etc/nginx/sites-enabled
```

Verify that everything was worked as expected:

``` sh
sudo nginx -t
```
If everything succeeds, restart NGINX to enable the new configuration:

``` sh
sudo systemctl restart nginx
```

Open up the firewall to allow access for NGINX

``` sh
sudo ufw allow 'Nginx Full'
```

Finally, lets test that it all works with the application

   

## Testing the setup server 

The server should now be accessable by:  
- Entering the public IP address of the server in a web browser 
- Sending requests from the `keras_classifier`application running on localhost:
  - Then when making predictions specify for Server __custom__
  - Enter the public ip of your server in the url address bar
  - Example: `http://3.138.254.75/predict`



