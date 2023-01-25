//* GLOBAL VARIABLES *//
var Game = {};
var volMuted = false;
let activeTab = 'research';
var volToggle = document.getElementById("vol-toggle");
var menuButton = document.getElementById("menu-button");
var achievementsButton = document.getElementById("achievements-button");
var menuWindow = document.getElementById("menu-window");
var achievementsWindow = document.getElementById("achievements-window");
var meatRoaster = document.getElementById("meat");

menuButton.addEventListener("click", togglePopup);
achievementsButton.addEventListener("click", togglePopup);
meatRoaster.addEventListener("mousedown", startAnimation);
meatRoaster.addEventListener("mouseup", stopAnimation);

document.addEventListener("DOMContentLoaded", function(event) {
    Game.launch();
});

volToggle.addEventListener("click", function() {
    if (volMuted) {
        volToggle.src = "images/volume.png";
        unmute();
    } else {
        volToggle.src = "images/volMute.png";
        mute();
    }
    volMuted = !volMuted;
});

function togglePopup(event) {
    event.stopPropagation();
    var popup = event.target.id === "menu-button" ? menuWindow : achievementsWindow;
    popup.classList.toggle("hidden");
    if (popup.classList.contains("hidden")) {
        document.removeEventListener("click", checkClick);
    } else {
        document.addEventListener("click", checkClick);
    }
}

function checkClick(event) {
    if (!event.target.closest("#menu-window, #achievements-window")) {
        menuWindow.classList.add("hidden");
        achievementsWindow.classList.add("hidden");
    }
}

function mute() {
    // code to mute the tab
}

function unmute() {
    // code to unmute the tab
}

function showTab(tab) {
  document.getElementById(activeTab).style.display = "none";
  document.getElementById(`tab-${activeTab}`).classList.remove("active");

  document.getElementById(tab).style.display = "block";
  document.getElementById(`tab-${tab}`).classList.add("active");

  activeTab = tab;
}

function startAnimation() {
    meatRoaster.style.animationPlayState = "running";
    console.log(inventory.Meat);
    // start interval for adding Meat every second
  let meatInterval = setInterval(function() {
    if (inventory.Meat < maxMeat) {
      inventory.Meat++;
    }
  }, 1000);

  document.getElementById("meat").addEventListener("mouseleave", function() {
    clearInterval(meatInterval);
    stopAnimation()
  });

  // add event listener for mouseup to stop interval
  document.addEventListener("mouseup", function() {
    clearInterval(meatInterval);
  });
}

function stopAnimation() {
    meatRoaster.style.animationPlayState = "paused";
}

Game.launch = function() {
    loadCanvas();
    showTab(activeTab);
}

function loadCanvas() {
    // Get the canvas and context
    var canvasContainer = document.getElementById("researchCanvasContainer");
    var canvas = document.getElementById("drawingCanvas");
    var ctx = canvas.getContext("2d");
    setTimeout(function() {
        canvas.width = canvasContainer.offsetWidth * 0.7;
        canvas.height = canvasContainer.offsetHeight;
        // Set the drawing properties
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
    }, 0);

    // Variables to keep track of the mouse position and status
    var isMouseDown = false;
    var lastX = 0;
    var lastY = 0;

    // Mouse event handlers
    canvas.addEventListener("mousedown", function (e) {
        canvas.classList.add("drawing");
        isMouseDown = true;
        var rect = canvas.getBoundingClientRect()
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (isMouseDown) {
            var rect = canvas.getBoundingClientRect()
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
        
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastX = x;
            lastY = y;
        }
    });

    canvas.addEventListener("mouseup", function (e) {
        checkResearch();
        isMouseDown = false;
    });
        
    // Clear canvas button event handler
    var clearCanvasBtn = document.getElementById("clearCanvasBtn");
    var beginResearchBtn = document.getElementById("beginResearchBtn");
    beginResearchBtn.disabled = true;
    clearCanvasBtn.addEventListener("click", function () {
        beginResearchBtn.disabled = true;
        canvas.classList.remove("drawing");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    var researchItems = document.querySelectorAll(".researchItem");
    for (var i = 0; i < researchItems.length; i++) {
        researchItems[i].addEventListener("click", function(e) {
            var activeButton = document.querySelector(".researchItem.active");
            if (activeButton) {
                activeButton.classList.remove("active");
            }
            if (!this.classList.contains("active")) {
                this.classList.add("active");
                checkResearch()
            }
        });
    }

    function checkResearch() {
        
        // Check if a research item is active and if the user has drawn something
        if (document.querySelector('.researchItem.active') && canvas.classList.contains("drawing")) {
            // Enable the save drawing button
            beginResearchBtn.disabled = false;
        } else {
            // Disable the save drawing button
            beginResearchBtn.disabled = true;
        }
    }

// add an event listener for the click event
beginResearchBtn.addEventListener("click", function() {
    // check if the button is disabled
    if(beginResearchBtn.disabled) return;
  
    // select the "currentResearchContainer" div
    const currentResearchContainer = document.getElementById("currentResearchContainer");
  
    // create a new div to hold the research information
    const researchDiv = document.createElement("div");
    researchDiv.classList.add("research-div");
  
    // create a copy of the canvas drawing
    const canvasCopy = document.createElement("canvas");
    canvasCopy.width = drawingCanvas.width/2;
    canvasCopy.height = drawingCanvas.height/2;
    canvasCopy.getContext("2d").drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 0, 0, canvasCopy.width, canvasCopy.height);
  
    // append the canvas copy to the research div
    researchDiv.appendChild(canvasCopy);
  
    // get the text of the selected research item
    const selectedResearchItem = document.querySelector(".researchItem.active");
    if(selectedResearchItem){
      //create a new element to hold the text of the selected research item
      const researchItemText = document.createElement("p");
      researchItemText.innerHTML = selectedResearchItem.innerHTML;
  
      // append the research item text to the research div
      researchDiv.appendChild(researchItemText);
  
      // remove the selected class from the selected research item
      selectedResearchItem.classList.remove("active");
      selectedResearchItem.remove();
      canvas.classList.remove("drawing");
    }
  
    // create a progress bar
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
  
    //append the progress bar to the research div
    researchDiv.appendChild(progressBar);
  
    // append the research div to the "currentResearchContainer" div
    currentResearchContainer.appendChild(researchDiv);
  
    // clear the canvas
    drawingCanvas.getContext("2d").clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  
    // disable the "beginResearchBtn" button
    beginResearchBtn.disabled = true;
  });

}

// player inventory
let inventory = {
    Meat: 0
};
  
// maximum Meat that can be held
const maxMeat = 100;

// start interval for removing meat every second
setInterval(function() {
    if (inventory.Meat > 0) {
      inventory.Meat -= 0.1;
    }
}, 1000);











