//* GLOBAL VARIABLES *//
var Game = {};

// TODO: Remove parameter after finished development
let activeTab;
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
			const dot = document.getElementById("canvasCursor");
			
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

            Game.canvas.setColor = function(colour) {
                ctx.strokeStyle = colour;
            }
            Game.canvas.setStroke = function() {
                ctx.lineWidth = 5;
            }

			var lastX = 0;
			var lastY = 0;
			let drawing = false;

			// Mouse event handlers
			canvasContainer.addEventListener("click", function(e) {
				if (canvasContainer.querySelector(".selected")) {
					discoverBtn.disabled = false;
				}
				else {
					discoverBtn.disabled = true;
				}
			});
			canvas.addEventListener("mouseenter", function() {
				dot.style.visibility = "visible";
			});
			canvas.addEventListener("mouseleave", function() {
				dot.style.visibility = "hidden";
			});
			canvas.addEventListener("mousedown", function(e) {
				drawing = true;
				var rect = canvas.getBoundingClientRect()
				lastX = e.clientX - rect.left;
				lastY = e.clientY - rect.top;
			});
			canvas.addEventListener("mousemove", function(e) {
				dot.style.left = e.pageX+'px';
				dot.style.top = e.pageY+'px';

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

			var colours = document.querySelectorAll(".colour");
			for(const colour of colours) {
				colour.addEventListener("click", function(e) {
					dot.style.backgroundColor = e.target.id;
					Game.canvas.setColor(e.target.id);
				});
			}
			document.getElementById("clearCanvasBtn").addEventListener("click", function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});
		    discoverBtn.addEventListener("click", function() {
				const selectedResearchItem = document.querySelector(".researchItem.selected");
				
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
			newElement.addEventListener("click", Game.toggleSelected.bind(newElement, newElement.className));
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
					researchDiv.id = item;
					researchDiv.classList.add("research-div", "draggable");
					researchDiv.draggable = true;

					researchDiv.addEventListener('dragstart', function(event) {
						console.log("dragging");
						event.dataTransfer.setData("text/plain", event.target.id);
					});

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
		Game.toggleModal = function(event) {
			event.stopPropagation();
			const modal = document.getElementById(event.target.id + 'Window');
			if(!modal.open) {
				modal.show();
				document.addEventListener("click", modalDismissal);
			}

			function modalDismissal(event) {
				if (!(event.target.id === modal.id)) {
					modal.close();
					document.removeEventListener("click", modalDismissal);
				}
			}
		}
		Game.switchGameTab = function(tab) {
			if(activeTab == tab) { return; }
			if(activeTab) { document.getElementById(activeTab).style.display = "none"; }
			document.getElementById(tab).style.display = "flex";
			
			Game.toggleSelected.call(document.getElementById(`tab-${tab}`), 'f_tabs', canDeselect = false);
		  
			activeTab = tab;
			
			if (activeTab == "research") {
				Game.canvas.resizeCanvas();
                Game.canvas.setColor();
                Game.canvas.setStroke();
			}
		}
		Game.toggleSelected = function(familyClass, canDeselect = true) {
			if(this.classList.contains('selected')) {
				if(canDeselect){
					this.classList.remove('selected')
				}
			}
			else {
				let selectedElement = document.querySelector(`.${familyClass}.selected`);
				if(selectedElement) {
					selectedElement.classList.remove("selected");
				}
				this.classList.add("selected");
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
		
		var tabs = document.getElementById("nav").querySelectorAll(".f_tabs")
		for(const tab of tabs) {
			tab.addEventListener('click', Game.switchGameTab.bind(tab, tab.id.substring(4)));
		}
		
		// Meat Roast
		document.getElementById("meat").addEventListener("mousedown", Game.meatSpin);

		// Drop Zones
		var droppables = document.querySelectorAll(".droppable");
		for(const droppable of droppables) {
			droppable.addEventListener('dragover', function(event) {
				event.preventDefault();
			});
			
			droppable.addEventListener('drop', function(event) {
				event.preventDefault();
				const draggableId = event.dataTransfer.getData("text/plain");
				const draggableElement = document.getElementById(draggableId);
				if (draggableElement.parentElement == this) { return; }
				if (this.parentElement.classList.contains("progressable") && this.hasChildNodes()) {
					const currentChild = this.firstChild;
					this.removeChild(currentChild);
					draggableElement.parentElement.appendChild(currentChild);
					this.appendChild(draggableElement);
				} else {
					this.appendChild(draggableElement);
				}
			});
		}

		// Footer Buttons
		document.getElementById("mainMenu").addEventListener("click", Game.toggleModal);
		document.getElementById("achievementsMenu").addEventListener("click", Game.toggleModal);
		
		/*=====================================================================================
		Function Calls
		=======================================================================================*/
		
		Game.canvas();
		/*=====================================================================================
		Begin Game
		=======================================================================================*/
		//TODO: Localstorage the current tab?
		Game.switchGameTab('research');

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
		//TODO: Keep track of time taken in logic to speedup/slowdown timeout
		Game.logic();
		setTimeout(Game.loop,1000)/fps;
	}

	Game.init();
}