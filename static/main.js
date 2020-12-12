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
// Initialize parameters from filed
//========================================================================

// Store selected settings from the form
var selectedModel = document.querySelector('input[name="model"]:checked').value;
var selectedServerSolution = document.querySelector('input[name="server"]:checked').value

document.servers.onclick = function(){
  selectedServerSolution = document.querySelector('input[name="server"]:checked').value;
}

document.models.onclick = function(){
  selectedModel = document.querySelector('input[name="model"]:checked').value;
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
  
  generatedPredictions.innerHTML = "";
  loader.classList.remove("hidden");  
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
  // TODO: Add function for sending prediction locally or remotelly
  fetch("/predict", {
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
        displayResult(data);
      });
    })
    .catch(err => {
      console.log("An error occured with the prediction", err.message);
    });
}


//========================================================================
// Display prediction
//========================================================================

function displayResult(data) {
  hide(loader);    

  // Get all predictions in order and display
  for (var i in data.results) {
    key = Object.keys(data.results[i])[0];      
    value = Object.values(data.results[i])[0];
    $("#generated-predictions")
      .append('<li>' + '<span>' + key + '</span>' + ' ' + '<span>' + value + '</span>' + '</li>');         
  }

  $('#generated-predictions>li').addClass('displayed-results');
  show(generatedPredictions);
}

