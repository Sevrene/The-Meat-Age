//* GLOBAL VARIABLES *//
var Game = {};

// TODO: Remove parameter after finished development
let activeTab = 'research';
//

document.addEventListener("DOMContentLoaded", function(event) {
	Game.launch();
});

Game.launch = function() {
	Game.reloadDiscoveries = 1;
	Game.reloadRecipes = 1;
	Game.reloadCrafts = 1;
	let fps = 30;
	var inventory;

	Game.init = function() {
		/*=====================================================================================
		Game Features
		=======================================================================================*/
		
		// Meat Roast
		Game.meatSpin = function() {
			let meatRoaster = document.getElementById("meat");
			meatRoaster.style.animationPlayState = "running";
			
			let mouseHandler = function() {
				clearEvents();
			}
			meatRoaster.addEventListener("mouseleave", mouseHandler)
			meatRoaster.addEventListener("mouseup", mouseHandler)

			function clearEvents() {
				meatRoaster.removeEventListener("mouseleave", mouseHandler);
				meatRoaster.removeEventListener("mouseup", mouseHandler);
				meatRoaster.style.animationPlayState = "paused";
			}
		}

		Game.canvas = function() {
			var canvasContainer = document.getElementById("canvasContainer");
			var canvas = document.getElementById("drawingCanvas");
			var ctx = canvas.getContext("2d");
			
			var discoverBtn = document.getElementById("discoverBtn");
			discoverBtn.disabled = true;

			// TODO: Prevent canvas getting forever lost if sized to 0
			Game.canvas.resizeCanvas = function() {
                // Altering the width and height of canvas clear all properties.
				// Deconstruct the ctx and extract the required styling properties
				let properties = (({ lineWidth, strokeStyle }) => ({ lineWidth, strokeStyle }))(ctx)
				// Copy and scale the current art. Not foolproof, gets blurry when resolution is lost
				properties.tempCanvas = document.createElement("canvas");
				properties.tempCanvas.width = canvas.width;
				properties.tempCanvas.height = canvas.height
			    properties.tempCanvas.getContext("2d").drawImage(canvas, 0, 0, canvas.width, canvas.height);

				// Resize
				canvas.width = canvasContainer.offsetWidth * 0.5;
				canvas.height = canvas.width/2;
				// Reapply properties
				ctx.lineWidth = properties.lineWidth;
				ctx.strokeStyle = properties.strokeStyle;
				ctx.drawImage(properties.tempCanvas, 0, 0, properties.tempCanvas.width, properties.tempCanvas.height, 0, 0, canvas.width, canvas.height);
			}
			window.addEventListener('resize', function(){
				Game.canvas.resizeCanvas();
			});

            Game.canvas.setColor = function() {
                ctx.strokeStyle = "black";
            }
            Game.canvas.setStroke = function() {
                ctx.lineWidth = 5;
            }

			var lastX = 0;
			var lastY = 0;
			let drawing = false;

			// Mouse event handlers
			canvasContainer.addEventListener("click", function(e) {
				if (canvasContainer.querySelector(".active")) {
					discoverBtn.disabled = false;
				}
				else {
					discoverBtn.disabled = true;
				}
			});
			canvas.addEventListener("mousedown", function(e) {
				drawing = true;
				var rect = canvas.getBoundingClientRect()
				lastX = e.clientX - rect.left;
				lastY = e.clientY - rect.top;
			});
			canvas.addEventListener("mousemove", function(e) {
                drawing = e.buttons == 1;
				if (drawing) {
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
			canvas.addEventListener("mouseup", function() {
				drawing = false;
			});
			document.getElementById("clearCanvasBtn").addEventListener("click", function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});
		    discoverBtn.addEventListener("click", function() {
				const selectedResearchItem = document.querySelector(".researchItem.active");
				
				Game.researchStructure[selectedResearchItem.innerHTML].discovered = true;
				Game.researchStructure[selectedResearchItem.innerHTML].canvasData = canvas.toDataURL()
				selectedResearchItem.remove();
				
				Game.actOnReloadDiscoveries();
				// clear the canvas
				document.getElementById("clearCanvasBtn").click()
		  	});
		
		}

		Game.unlock = function(type, item) {
			type[item].locked = false;
			let list = document.getElementById(type.location);
			list.insertAdjacentHTML('beforeend', `${type.HTML.replace("${item}", item)}`);
			
			// Attach a click listener for selecting element as active
			let newElement = document.getElementById(type.location).lastElementChild;
			Game.attachListener(newElement, "click", Game.toggleActive.bind(newElement, newElement.className));
		}

		// TODO: Game.checkRequirements?

		/*=====================================================================================
		Reloads
		=======================================================================================*/
		Game.discoveries = [];
		
		Game.actOnReloadDiscoveries = function() {
			const discoveredContainer = document.getElementById("discoveredContainer");
			
			for (let item in Game.researchStructure) {
				if (Game.researchStructure[item].discovered && !Game.researchStructure[item].researched) {
					if (Game.discoveries.includes(item)) { continue; }
					// create a new div to hold the research information
					let researchDiv = document.createElement("div");
					researchDiv.classList.add("research-div");

					let researchItemText = document.createElement("p");
				  	researchItemText.innerHTML = item;
					
					// create a copy of the canvas drawing
					let canvasCopy = document.createElement("canvas");
					canvasCopy.width = 225;
					canvasCopy.height = 112;
					
					let img = new Image;
					img.src = Game.researchStructure[item].canvasData
					img.onload = function() {
						canvasCopy.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, canvasCopy.width, canvasCopy.height);
					};

					researchDiv.appendChild(researchItemText);
					researchDiv.appendChild(canvasCopy);
					discoveredContainer.appendChild(researchDiv);

					Game.discoveries.push(item);
				}
			}
			Game.reloadDiscoveries = 0;
		}
		/*=====================================================================================
		Unlockable Structures
		=======================================================================================*/
		if (!localStorage.length === 0) {
			Game.features = localStorage.getItem(features);
			Game.foodStructure = localStorage.getItem(foodStructure);
			Game.researchStructure = localStorage.getItem(researchStructure);
			Game.craftablesStructure = localStorage.getItem(craftablesStructure);
			Game.achievementsStructure = localStorage.getItem(achievementsStructure);
		}
		else {
			Game.features = {
			cooking: false,
			research: false,
			crafting: false,
			exploring: false,
			infobox: false,
			trading: false
			}
			Game.foodStructure = {}
			Game.researchStructure = {
			location : 'researchItemList',
			HTML: '<button class="researchItem">${item}</button>',
			"Research Item 1" : {
				locked: true,
				requirements: 'inventory.getItemValue("Hunger") > 10',
				hungerRequired: 1000,
				discovered: false,
				canvasData: null,
				researched: false
			},
			"Research Item 2" : {
				locked: true,
				requirements: 'inventory.getItemValue("Hunger") > 20',
				hungerRequired: 1000,
				discovered: false,
				canvasData: null,
				researched: false
			},
			"Research Item 3" : {
				locked: true,
				requirements: 'inventory.getItemValue("Hunger") > 30',
				hungerRequired: 1000,
				discovered: false,
				canvasData: null,
				researched: false
			},
			"Research Item 4" : {
				locked: true,
				requirements: 'inventory.getItemValue("Hunger") > 40',
				hungerRequired: 1000,
				discovered: false,
				canvasData: null,
				researched: false
			},
			}
			Game.craftablesStructure = {}
			Game.achievementsStructure = {}
		}

		/*=====================================================================================
		Inventory
		=======================================================================================*/
		if (!localStorage.length === 0) {
			inventory = localStorage.getItem(inventory)
		}
		else {
			inventory = {
				items: {
					"Hunger" : {
						value: parseFloat(0).toFixed(1),
						maxValue: parseInt(100).toFixed(0),
						precision: 1
					}
				}
			}
		}

		inventory.createItem = function(item, value = 0, maxValue = 0, precision = 1) {
			inventory.items[item] = {
				value: value.toFixed(precision),
				maxValue: maxValue.toFixed(0),
				precision: precision
			};
		}
		inventory.addToItemValue = function(item, value) {
			if (!inventory.items[item]) {
				inventory.createItem(item, value)
				return;
			}
			inventory.items[item].value = (parseFloat(inventory.items[item].value) + parseFloat(value)).toFixed(this.items[item].precision);
			if (parseFloat(inventory.items[item].value) < 0) {
				inventory.items[item].value = 0;
			}
			if (parseFloat(inventory.items[item].value) > parseFloat(inventory.items[item].maxValue)) {
				inventory.items[item].value = inventory.items[item].maxValue;
			}
		}
		inventory.getItemValue = function(item) {
			if (!inventory.items[item]) {
				console.error(`Error: ${item} does not exist in inventory.`);
				return;
			}
			return inventory.items[item].value;
		}
		inventory.getMaxValue = function(item) {
			if (!inventory.items[item]) {
				console.error(`Error: ${item} does not exist in inventory.`);
				return;
			}
			return inventory.items[item].maxValue;
		}
		inventory.updateInventory = function() {
			let inventoryList = document.getElementById("playerInventory");
			inventoryList.innerHTML = "";
			for (let item in inventory.items) {
				let itemValue = inventory.getItemValue(item);
				let itemMaxValue = inventory.getMaxValue(item);
				let inventoryItem = document.createElement("P");
				inventoryItem.innerHTML = `${item}: ${itemValue}/${itemMaxValue}`;
				inventoryList.appendChild(inventoryItem);
			}
		}

		/*=====================================================================================
		Helper Functions
		=======================================================================================*/

		// TODO: Broken, redo
		Game.togglePopup = function(event) {
			event.stopPropagation();
			var popup = document.getElementById(event.target.id);
			popup.classList.toggle("hidden");
			// Check for clicks outside the popup
			if (popup.classList.contains("hidden")) {
				document.addEventListener("click", popupDismissal);
			} else {
				document.removeEventListener("click", popupDismissal);
			}
		
			function popupDismissal(event) {
				if (!event.target.closest(popup.id)) {
					popup.classList.add("hidden");
				}
			}
		}
		Game.switchGameTab = function(tab) {
			document.getElementById(activeTab).style.display = "none";
			document.getElementById(tab).style.display = "flex";

			document.getElementById(`tab-${activeTab}`).classList.remove("active");
			document.getElementById(`tab-${tab}`).classList.add("active");
		  
			activeTab = tab;

			if (activeTab == "research") {
				Game.canvas.resizeCanvas();
                Game.canvas.setColor();
                Game.canvas.setStroke();
			}
		}
		Game.attachListener = function(element, eventType, callback) {
			element.addEventListener(eventType, callback);
		}
		Game.toggleActive = function(familyClass) {
			var activeButton = document.querySelector(`.${familyClass}.active`);
			if (!this.classList.contains("active")) {
				this.classList.add("active");
			}
            if (activeButton) {
				activeButton.classList.remove("active");
			}
		}

		/*=====================================================================================
		Load Game Features
		=======================================================================================*/
		Game.load();
	}
	Game.load = function() {
		/*=====================================================================================
		General Listeners
		=======================================================================================*/
		
		// Meat Roast
		document.getElementById("meat").addEventListener("mousedown", Game.meatSpin);

		// Footer Buttons
		document.getElementById("menu-button").addEventListener("click", Game.togglePopup);
		document.getElementById("achievements-button").addEventListener("click", Game.togglePopup);
		
		/*=====================================================================================
		Function Calls
		=======================================================================================*/
		
		Game.canvas();
		/*=====================================================================================
		Begin Game
		=======================================================================================*/
		//TODO: Localstorage the current tab?
		Game.switchGameTab(activeTab);

		Game.loop();
	}
	Game.logic = function() {
		/*=====================================================================================
		General Logic
		=======================================================================================*/
		if (document.getElementById("meat").style.animationPlayState == "running")
			inventory.addToItemValue("Hunger", 20);
		if (inventory.getItemValue("Hunger") > 0) {
			inventory.addToItemValue("Hunger", -0.1);
		}
		inventory.updateInventory();

		/*=====================================================================================
		Research Tab Logic
		=======================================================================================*/
		// If the research queue isn't full, checked the locked research for eligible unlocks
		if (document.getElementById("researchItemList").childElementCount < 4) {
			for (let item in Game.researchStructure) {
				// TODO: Rewrite inventory/research to avoid eval() and better access?
				if (Game.researchStructure[item].locked && eval(`${Game.researchStructure[item].requirements}`)) {
					Game.unlock(Game.researchStructure, item);
				}
			}
		}
		if (Game.reloadDiscoveries) { Game.actOnReloadDiscoveries(); }

		// TODO: Populate discovered research
	}
	Game.loop = function() {
		//TODO: Setup logic to fps limiter
		Game.logic();
		setTimeout(Game.loop,1000);
	}

	Game.init();
}