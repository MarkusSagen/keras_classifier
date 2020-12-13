//========================================================================
// Utility functions
//========================================================================

function hide(el) {
  el.classList.add("hidden");
}

function show(el) {
  el.classList.remove("hidden");
}


//========================================================================
// Initialize Settings 
//========================================================================
const ServerURLs = {
  Local: '/predict',
  Remote: 'http://3.138.254.75/predict',
};

// Store selected settings from the form
var selectedModel = document.querySelector('input[name="model"]:checked').value;
var selectedServerSolution = document.querySelector('input[name="server"]:checked').value;
var selectedServerURL = '';
var urlCustomContainer = document.getElementById('server-custom-deploy-url')
var url = document.getElementById('url');

document.servers.onclick = function() {
  selectedServerSolution = document.querySelector('input[name="server"]:checked').value;
  selectedServerSolution == "Custom" ? show(urlCustomContainer) : hide(urlCustomContainer);
}

document.models.onclick = function() { 
  selectedModel = document.querySelector('input[name="model"]:checked').value;
}

// Check if valid http url
function checkValidRemoteServerURL () {
  selectedServerURL = '';
  var regex = /https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|$!:,.;]*/g;
  if (url.value.match(regex)) {
    selectedServerURL = url.value;
  }
}

//========================================================================
// Logic for drag and drop file handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
  e.preventDefault();
  e.stopPropagation();
  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Preview uploaded image and predictions
//========================================================================

var imagePreview = document.getElementById("image-preview");
var uploadFileCaption = document.getElementById("upload-caption");
var generatedPredictions = document.getElementById("generated-predictions");
var loader = document.getElementById("loader");
var imageToPredict = "";


function submitImage() {
  // Check if uploaded file is valid image
  if (!imageToPredict || !imageToPredict.startsWith("data:image")) {
    window.alert("Please select a valid image for submission");
    return;
  }

  if (selectedServerSolution in ServerURLs) {
    selectedServerURL = ServerURLs[selectedServerSolution]
  } else {
    checkValidRemoteServerURL();
    if (selectedServerURL == "") {
      window.alert("Please select a valid server URL for prediction \nFor example: " + ServerURLs.Remote); 
      return;
    }
  } 
 
  // Remove previous predictions
  generatedPredictions.innerHTML = "";

  show(loader);  
  predictImage(imageToPredict);
}


function clearImage() {
  fileSelect.value = "";
  imagePreview.src = "";
  generatedPredictions.innerHTML = "";

  hide(imagePreview);
  hide(loader);
  hide(generatedPredictions);
  show(uploadFileCaption);
}

function previewFile(file) {
  // show the preview of the image
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imagePreview.src = URL.createObjectURL(file);
    
    show(imagePreview);
    hide(uploadFileCaption);

    generatedPredictions.innerHTML = "";
    imageToPredict = reader.result
  };
}


//========================================================================
// Make prediction request
//========================================================================


function predictImage(image) {
  fetch(selectedServerURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        image: image,
        settings: {
          model: selectedModel,
        },
      })
  })
  .then(resp => {
    if (resp.ok)
      resp.json().then(data => {
        hide(loader);
        displayResult(data);
      });
    saveSettings(); // If successful server URL used; Remember it
    })
    .catch(err => {
      hide(loader);
      console.log("An error occured with the prediction", err.message);
      console.log("If a remove server URL is used for predictions, verify that CORS is enabled");
      deleteSettings(); 
    });
}


//========================================================================
// Display prediction
//========================================================================

function displayResult(data) {
  // Get all predictions in order and display
  for (var i in data.result) {
    key = Object.keys(data.result[i])[0];      
    value = Object.values(data.result[i])[0];
    $("#generated-predictions")
      .append('<li>' + '<span>' + key + '</span>' + ' ' + '<span>' + value + '</span>' + '</li>');         
  }

  $('#generated-predictions>li').addClass('displayed-results');
  show(generatedPredictions);
}


//========================================================================
// Display prediction
//========================================================================

function saveSettings() {
  localStorage.setItem('url', url.value);
}

function deleteSettings() {
  url.value = '';
  localStorage.setItem('url', url.value);
}

function restoreSettings() {
  url.value = localStorage.getItem('url') || '';
}


// Load Stored values
restoreSettings();
