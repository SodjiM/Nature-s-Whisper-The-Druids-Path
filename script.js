import { dialogues } from './dialogues.js';

let dayDruid = {
    id: 0,
    name: '',
    inventory: [],
    actionPoints: 10,
    hasTalkedToday: {},
    maxInventorySize: 8
  };
  
  let nightDruid = {
    id: 1,
    name: '',
    inventory: [],
    actionPoints: 10,
    hasTalkedToday: {},
    maxInventorySize: 8
  };
let isDayTurn = true;
let dayCount = 1;
let currentYear = 1;
let season = 'Spring';
let villagerRelationships = {};
const moods = ["Happy", "Sad", "Anxious", "Excited", "Thoughtful"];
let villagers = generateVillagerList();
let availableVillagers = [];
let villageCenterStatus = 100;
let villageFestivals = [
    { season: 'Spring', day: 5, name: 'Blossom Festival' },
    { season: 'Spring', day: 13, name: 'Rain Dance' },
    { season: 'Summer', day: 4, name: 'Sun Celebration' },
    // Add more festivals for each season
];
let villageFoodSupply = 100; // Max 100
let villagerHappiness = 100; // Max 100
let villagerHealth = 100; // Max 100
let villageSafety = 100; // Max 100
let environmentalHealth = 100; // Max 100
let moonPhases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
let currentMoonPhaseIndex = 0;
let weatherBySeason = {
    "Spring": ["Rainy", "Cloudy", "Clear"],
    "Summer": ["Sunny", "Clear", "Windy"],
    "Fall": ["Windy", "Cloudy", "Rainy"],
    "Winter": ["Snowy", "Cloudy", "Cold"]
};
let wildlandsAreas = [
    { name: 'Grasslands', img: 'images/wildlands/grasslands.png', desc: 'Expansive grasslands with various herbs.', cost: 1 },
    { name: 'Forest', img: 'images/wildlands/forest.png', desc: 'A dense forest teeming with life.', cost: 2 },
    { name: 'Mines', img: 'images/wildlands/mines.png', desc: 'Ancient mines with hidden treasures.', cost: 3 },
    // Add more wildlands areas as needed
]
let currentWeather = "";
let rituals = {
    "Sun's Embrace": {
        item: "Sunstone Crystal",
        weather: "Sunny",
        effect: "Boost happiness and crop growth"
    },
    "Rain Whisperer": {
        item: "Blue Sapphire",
        weather: "Cloudy",
        effect: "Increase chance of rain"
    },
    "Wind Dancer": {
        item: "Feather of a Hawk",
        weather: "Windy",
        effect: "Improve villager health"
    },
    "Harvest Blessing": {
        item: "Golden Wheat Sheaf",
        weather: "Clear",
        effect: "Increase food supply"
    },
    "Lunar Bonding Ceremony": {
        item: "Heartstone Gem",
        weather: "Clear",
        moonPhase: "Waxing Gibbous",
        effect: "Double social points",
        duration: 5  // Duration in days 
    }
};

document.getElementById('game-display').innerHTML = `
    <h2>Nature's Whisper: The Druids' Path</h2>
    <p>In the heart of an ancient, mystical forest, where nature and magic are one, stands the Old Oak - a symbol of wisdom and balance. Both the Day Druid and Night Druid are called upon to unravel the mystery of the Old Oak's recent whispers. These cryptic messages hint at a disturbance in the natural order, threatening the harmony of the forest and its inhabitants.</p>
    <p>Your journey is not just one of discovery but of maintaining the delicate balance between day and night, growth and decay. Develop deep connections with the unique villagers, each with their own story and role in preserving the village. Explore hidden realms, uncover age-old secrets, and face challenges that test your connection to nature.</p>
    <p>Work alongside your partner to interpret the whispers of the Old Oak. Your choices and actions will shape the fate of the village and the forest itself. Connect with others, discover  mysteries, and ensure the harmony of the natural world.</p>
    <p>Are you ready to listen to Nature's Whisper?</p>
`;

function startGame() {
    document.getElementById('game-display').innerHTML = ''
    dayDruid.name = document.getElementById('day-druid-name').value;
    nightDruid.name = document.getElementById('night-druid-name').value;
    document.getElementById('name-form').style.display = 'none';
    document.getElementById('navigation-menu').style.display = 'block';
    document.getElementById('sleep-button').style.display = 'block';
    availableVillagers = pickRandomVillagers();
    currentYear = 1;  // Set the initial year
    season = 'Spring';  // Set the initial season
    dayCount = 1;  // Set the initial day
    isDayTurn = true;  // Set who starts the game

    // Update initial weather
    updateWeather();

    // Call updateDisplayHeaders to set the initial display of day, season, year, etc.
    updateDisplayHeaders();
    updateTurnDisplay();
}

function updateTurnDisplay() {
    const druidTurn = document.getElementById('druid-turn');
    const currentDruid = isDayTurn ? dayDruid : nightDruid;
    const theme = isDayTurn ? 'day-theme' : 'night-theme';
    document.body.className = theme;
    druidTurn.textContent = `It's ${currentDruid.name}'s turn. Action Points: ${currentDruid.actionPoints}`;
    document.getElementById('day-counter').textContent = `${season}, Day ${dayCount}`;
}

function exploreWildlandsOptions() {
    let gameDisplayDiv = document.getElementById('game-display');
    gameDisplayDiv.innerHTML = '<h2>Explore Wildlands</h2>';

    wildlandsAreas.forEach(area => {
        let areaDiv = document.createElement('div');
        areaDiv.classList.add('wildland-interaction');

        areaDiv.innerHTML = `
            <div class="wildland-portrait">
                <img src="${area.img}" alt="${area.name}" style="width: 150px; height: 100px;">
            </div>
            <div class="wildland-info">
                <strong>${area.name}</strong>
                <p>${area.desc}</p>
                <p>Cost: ${area.cost} Action Points</p>
                <button class="explore-button" onclick="myFuncs.explore('${area.name}')">Explore</button>
            </div>
        `;

        gameDisplayDiv.appendChild(areaDiv);
    });
}

function explore(areaName) {
    let explorationResult;
    switch (areaName) {
        case 'Grasslands':
            explorationResult = exploreGrasslands();
            break;
        case 'Forest':
            explorationResult = exploreForest();
            break;
        case 'Mines':
            explorationResult = exploreMines();
            break;
        default:
            explorationResult = "Unknown area.";
            break;
    }

    displayExplorationResults(areaName, explorationResult);
}

function displayExplorationResults(areaName, result) {
    let gameDisplayDiv = document.getElementById('game-display');
    let selectedArea = wildlandsAreas.find(area => area.name === areaName);

    gameDisplayDiv.innerHTML = `
        <div id="explore-result">
            <div class="explore-image">
                 <img src="${selectedArea.img}" alt="${selectedArea.name}" width="300" height="200">
        </div>
            </div>
            <div class="explore-text">
                <h2>${selectedArea.name}</h2>
                <p>${result}</p>
            </div>
        </div>
        <button onclick="myFuncs.explore('${areaName}')">Explore Again</button>
<button onclick="myFuncs.exploreWildlandsOptions()">Change Location</button>
    `;
}

function exploreGrasslands() {
    let currentDruid = isDayTurn ? dayDruid : nightDruid;
    
    if (currentDruid.actionPoints <= 0) {
        let message = "You don't have enough action points to explore.";
        document.getElementById('game-display').textContent = message;
        alert(message);
        return "Not enough action points.";
    }
    
    currentDruid.actionPoints -= 1; // Deduct an action point from the current druid
    updateTurnDisplay(); // You might need to update this function too if it uses actionPoints directly
    
    const result = Math.random();

    if (result < 0.25) {
        return `
        You tread lightly through the swaying fields, feeling the soft earth beneath your feet.
        <br><br>
        <b>Your exploration yielded a peaceful moment of tranquility.</b>
      `;
    } else if (result < 0.50) {
        addItemToInventory(currentDruid.inventory, 'Herbs', 1);
        return `
        A fragrant scent catches your attention, leading you to a hidden grove of vibrant herbs. Their leaves shimmer with dewdrops, and their petals pulse with vibrant life. You carefully gather these gifts of nature, knowing their healing properties will be invaluable in your quest.
        <br><br>
        <b>Herbs added to your inventory!</b>
      `;
    } else if (result < 0.95) {
        addItemToInventory(currentDruid.inventory, 'Flint', 1);
        return `
        Amidst the whispering grasses, your keen eyes spot a gleaming stone. You kneel and unearth a sharp piece of flint, its edges hinting at the ancient forces that shaped it. The spirits of fire whisper within its core, promising a spark to ignite your path forward.
        <br><br>
        <b>Flint added to your inventory!</b>
      `;
    } else {
        const rareItemResult = Math.random();
        if (rareItemResult < 0.50) {
            addItemToInventory(currentDruid.inventory,'Golden Wheat Sheaf', 1);
            return `
            A radiant glow emerges from the heart of the grasslands, drawing your gaze to a mesmerizing sight. As you approach, you discover a sheaf of wheat unlike any other, its golden stalks shimmering with the sun's essence. You carefully gather the precious grain, feeling its warmth radiate through your fingertips.
            <br><br>
            <span style="color: #DAA520;"> <b>Golden Wheat Sheaf </span> added to your inventory!</b>
          `;
        } else {
            addItemToInventory(currentDruid.inventory,'Ancient Coin', 1);
            return `
            A whisper of forgotten ages calls to you from beneath the roots of a gnarled tree. You kneel and gently brush aside the earth, revealing a gleaming coin that has weathered countless seasons. Its markings bear symbols of a lost civilization, and you feel the weight of history cradled in your palm.
            <br><br>
            <b><span style="color: #DAA520;"> Ancient Coin </span> added to your inventory!</b>
          `;
        }
    }
}

function exploreForest() {
    let currentDruid = isDayTurn ? dayDruid : nightDruid;
    
    if (currentDruid.actionPoints <= 1) {
        let message = "You don't have enough action points to explore.";
        document.getElementById('game-display').textContent = message;
        alert(message);
        return "Not enough action points.";
    }
    
    currentDruid.actionPoints -= 2; // Deduct an action point from the current druid
    updateTurnDisplay(); // You might need to update this function too if it uses actionPoints directly

    const result = Math.random();

    if (result < 0.20) {
        return `
        The forest whispers secrets in the rustling leaves, but today its gifts remain hidden. Your footsteps alone echo through the ancient trees.
        <br><br>
        <b>Your exploration yields a tranquil moment amidst the trees.</b>
      `;
    } else if (result < 0.50) {
        addItemToInventory(currentDruid.inventory,'Wild Berries', 1);
        return `
        A burst of color catches your eye amidst the verdant foliage. You reach out to find a cluster of plump wild berries, their vibrant hues promising a burst of sweetness.
        <br><br>
        <b>Wild Berries added to your inventory!</b>
      `;
    } else if (result < 0.75) {
        addItemToInventory(currentDruid.inventory,'Wooden Branch', 1);
        return `
        Under a canopy of emerald leaves, you spot a fallen branch, its wood weathered yet sturdy. It hums with the forest's energy, offering potential for crafting and kindling.
        <br><br>
        <b>Wooden Branch added to your inventory!</b>
      `;

    } else {
        const rareItemResult = Math.random();
        if (rareItemResult < 0.5) {
            addItemToInventory(currentDruid.inventory,'Feather of a Hawk', 1);
          return `
            A hush falls over the forest as you approach a sun-dappled glade. There, nestled among emerald ferns, a pristine Feather of a Hawk awaits. Its silky ebony is accented by a single white stripe, embodying both strength and grace. You carefully pluck the feather, sensing the spirit of the hawk guiding your journey.
            <br><br>
            <b><span style="color: #DAA520;"> Feather of a Hawk </span> added to your inventory!</b>
          `;
        } else {
            addItemToInventory(currentDruid.inventory,'Enchanted Acorn', 1);
          return `
            The forest invites you deeper, where ancient trees whisper secrets of the past. Beneath their gnarled roots, you glimpse a soft, ethereal glow. As you draw closer, you discover an Enchanted Acorn nestled within a bed of moss. Its shell shimmers with an otherworldly aura, promising hidden potential. You cradle the acorn in your palm, feeling its warmth pulse with the forest's ancient magic.
            <br><br>
            <b><span style="color: #DAA520;"> Enchanted Acorn </span> added to your inventory!</b>
          `;
        }
      }
    }

function exploreMines() {
    let currentDruid = isDayTurn ? dayDruid : nightDruid;
    
    if (currentDruid.actionPoints <= 2) {
        let message = "You don't have enough action points to explore.";
        document.getElementById('game-display').textContent = message;
        alert(message);
        return "Not enough action points.";
    }
    
    currentDruid.actionPoints -= 3; // Deduct an action point from the current druid
    updateTurnDisplay(); // You might need to update this function too if it uses actionPoints directly
    
    const result = Math.random();

    if (result < 0.10) {
        return `
        The mines echo with the silence of a slumbering giant. Your lantern casts flickering shadows upon the barren walls, but no treasures reveal themselves today.
        <br><br>
        <b>The mines yield no treasures on this venture.</b>
      `;
    } else if (result < 0.40) {
        addItemToInventory(currentDruid.inventory,'Coal', 1);
        return `
        Amidst the dark depths, you uncover a vein of coal, its ebony fragments whispering tales of ancient fires. It promises warmth and energy for the journey ahead.
        <br><br>
        <b>Coal added to your inventory!</b>
      `;
    } else if (result < 0.65) {
        addItemToInventory(currentDruid.inventory,'Iron Ore', 1);
        return `
        Your pickaxe strikes a resonant note, revealing a deposit of iron ore. Its metallic gleam hints at potential for crafting sturdy tools and resilient armor.
        <br><br>
        <b>Iron Ore added to your inventory!</b>
      `;
      } else { 
        const rareItemResult = Math.random();
        if (rareItemResult < 0.33) {
            addItemToInventory(currentDruid.inventory,'Sunstone', 1);
          return `
            As you delve deeper into the mines, a dazzling ray of light pierces the darkness. Embedded within a crystalline formation, a radiant Sunstone awaits. Its golden hues shimmer with the brilliance of a captured star, promising to illuminate even the darkest paths.
            <br><br>
            <b><span style="color: #DAA520;"> Sunstone </span>added to your inventory!</b>
          `;
        } else if(rareItemResult < 0.66) {
        
            addItemToInventory(currentDruid.inventory,'Heartstone Gem', 1);
            return `
            A pulsating glow draws your gaze into a hidden crevice. There, nestled within the earth's embrace, lies a Heartstone Gem, its scarlet facets radiating warmth and vitality.
            <br><br>
            <b><span style="color: #DAA520;"> Heartstone Gem </span> added to your inventory!</b>
          `;
        } else {
            addItemToInventory(currentDruid.inventory,'Blue Sapphire', 1);
          return `
            Within a secluded grotto, sapphire hues dance upon the walls, beckoning you closer. There, amidst the mineral veins, rests a Blue Sapphire of exquisite clarity. Its azure depths whisper secrets of the sea and sky, embodying serenity amidst the earth's embrace.
            <br><br>
            <b><span style="color: #DAA520;"> Blue Sapphire </span> added to your inventory!</b>
          `;
        } 
    }
}

function addItemToInventory(inventory, itemName, quantity) {
    let item = inventory.find(item => item.name === itemName);
    if (item) {
        item.quantity += quantity;
    } else {
        inventory.push({ name: itemName, quantity: quantity });
    }
}

function visitVillageCenter() {
    updateVillageCenterStatus();
    document.getElementById('game-display').innerHTML += `
        <p>Food Supply: ${villageFoodSupply}%</p>
        <p>Villager Happiness: ${villagerHappiness}%</p>
        <p>Health Status: ${villagerHealth}%</p>
        <p>Safety: ${villageSafety}%</p>
        <p>Environmental Conditions: ${environmentalHealth}%</p>`;
}

function updateVillageCenterStatus() {
    villageCenterStatus = Math.floor((villageFoodSupply + villagerHappiness + villagerHealth + villageSafety + environmentalHealth) / 5);
    document.getElementById('game-display').innerHTML = `<strong>Village Center Status: ${villageCenterStatus}%</strong><br>`;
}

function degradeVillageFactors() {
    // Degrade factors over time or due to specific events
    villageFoodSupply -= 2; // Example degradation rate
    villagerHappiness -= 1; // Example degradation rate
    // Similarly, degrade other factors

    // Ensure factors don't go below 0
    villageFoodSupply = Math.max(0, villageFoodSupply);
    villagerHappiness = Math.max(0, villagerHappiness);
    // Similarly, ensure for other factors

    updateVillageCenterStatus();
}

function manageResources() {
    let gameDisplayDiv = document.getElementById('game-display');
    gameDisplayDiv.innerHTML = ''; // Clear the game display

    // Create and append the crafting section
    createCraftingSection(gameDisplayDiv);

    // Create and append the inventory section
    createInventorySection(gameDisplayDiv);

    // Populate the crafting dropdowns based on the current player's inventory
    populateCraftingOptions();

    // Display the inventory items for the current player
    displayInventoryItems();
    
}

function createCraftingSection(parentElement) {
    let craftingSection = document.createElement('div');
    craftingSection.id = 'crafting-section';
    craftingSection.innerHTML = '<h2>Crafting</h2>';
    parentElement.appendChild(craftingSection);

    let craftingOptions = document.createElement('div');
    craftingOptions.id = 'crafting-options';
    craftingSection.appendChild(craftingOptions);

    let craftButton = document.createElement('button');
    craftButton.id = 'craft-button';
    craftButton.textContent = 'Craft';
    craftingSection.appendChild(craftButton);
}

function createInventorySection(parentElement) {
    let inventorySection = document.createElement('div');
    inventorySection.id = 'inventory-section';
    inventorySection.innerHTML = '<h2>Inventory</h2>';
    parentElement.appendChild(inventorySection);

    let inventoryItemsDiv = document.createElement('div');
    inventoryItemsDiv.className = 'inventory-items';
    inventorySection.appendChild(inventoryItemsDiv);
}

function populateCraftingOptions() {
    // Access the current player's inventory
    const currentInventory = isDayTurn ? dayDruid.inventory : nightDruid.inventory;
    const craftingOptionsDiv = document.getElementById('crafting-options');

    // Create dropdowns with inventory items
    for (let i = 0; i < 5; i++) {
        let selectElement = document.createElement('select');
        currentInventory.forEach(item => {
            let optionElement = document.createElement('option');
            optionElement.value = item.name;
            optionElement.textContent = `${item.name} x${item.quantity}`;
            selectElement.appendChild(optionElement);
        });
        craftingOptionsDiv.appendChild(selectElement);
    }
}

function displayInventoryItems() {
    // Access the current player's inventory and action points
    const currentDruid = isDayTurn ? dayDruid : nightDruid;
    const currentInventory = currentDruid.inventory;
    const inventoryItemsDiv = document.querySelector('.inventory-items');
  console.log("inventoryItemsDiv: ", inventoryItemsDiv)

    // Create inventory item slots
    currentInventory.forEach(item => {
      let itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';
      itemDiv.innerHTML = `
        <h3>${item.name} x${item.quantity}</h3>
        <img src="images/items/${item.name}.png" alt="${item.name}">
        <button onclick="myFuncs.useItem('${item.name}')">Use</button>
        <button onclick="myFuncs.giveItem('${item.name}')">Give</button>
        <button onclick="myFuncs.dropItem('${item.name}')">Drop</button>
      `;
      // Append the div to the inventory display
      inventoryItemsDiv.appendChild(itemDiv);
    });
  
    // Update action points display
    updateTurnDisplay();
  }

function useItem(itemName) {
    const useFunction = itemUseEffects[itemName];
    if (useFunction && canUseItem(itemName)) {
        useFunction();
        removeItemFromInventory(currentDruid.inventory, itemName);
        updateGameDisplay(`${itemName} used successfully.`);
    } else {
        updateGameDisplay(`Cannot use ${itemName} at this time.`);
    }
}

function canUseItem(itemName) {
    // Implement logic to check if conditions for using the item are met
    return true; // Placeholder return value
}

function giveItem(itemName) {
    const sourceDruid = isDayTurn ? dayDruid : nightDruid;
    const targetDruid = isDayTurn ? nightDruid : dayDruid;

    const sourceInventory = sourceDruid.inventory;
    const targetInventory = targetDruid.inventory;

    if (targetInventory.length < sourceDruid.maxInventorySize) {
        // Find the item in the source inventory
        const itemIndex = sourceInventory.findIndex(item => item.name === itemName);
        
        if (itemIndex !== -1) {
            const item = sourceInventory[itemIndex];

            // Check if the target inventory already has this item
            const targetItemIndex = targetInventory.findIndex(item => item.name === itemName);

            if (targetItemIndex !== -1) {
                // If the target already has the item, increase its quantity
                targetInventory[targetItemIndex].quantity += item.quantity;
            } else {
                // If the target does not have the item, add it
                targetInventory.push({ ...item });
            }

            // Remove the item from the source inventory
            sourceInventory.splice(itemIndex, 1);

            updateGameDisplay(`${itemName} given to the other player.`);
        }
    } else {
        updateGameDisplay(`The other player's inventory is full.`);
    }

}

function dropItem(itemName) {
    const confirmation = confirm(`Are you sure you want to drop all of your ${itemName}?`);
    if (confirmation) {
        removeItemFromInventory(itemName);
        updateGameDisplay(`${itemName} dropped from inventory.`);
    }
}

function removeItemFromInventory(itemName) {
    const currentDruid = isDayTurn ? dayDruid : nightDruid;
    const currentInventory = currentDruid.inventory;
    const itemIndex = currentInventory.findIndex(item => item.name === itemName);

    if (itemIndex !== -1) {
        // Check if the item quantity is more than 1
        if (currentInventory[itemIndex].quantity > 1) {
            // If so, just decrease the quantity
            currentInventory[itemIndex].quantity -= 1;
        } else {
            // Otherwise, remove the item entirely
            currentInventory.splice(itemIndex, 1);
        }
    }

}

function updateGameDisplay(message) {
    const gameDisplayDiv = document.getElementById('game-display');
    gameDisplayDiv.textContent = message;
}

function updateRitualsList() {
    let gameDisplayDiv = document.getElementById('game-display');

    // Clear existing content in game display
    gameDisplayDiv.innerHTML = '';

    Object.keys(rituals).forEach(ritualName => {
        let ritual = rituals[ritualName];
        let canPerform = canPerformRitual(ritual);

        let ritualElement = document.createElement('div');
        ritualElement.innerHTML = `
            <p><b>${ritualName}</b> - Required Item: ${ritual.item}, Required Weather: ${ritual.weather}${ritual.moonPhase ? ', Required Moon Phase: ' + ritual.moonPhase : ''}</p>
            <button onclick="performRitual('${ritualName}')" ${!canPerform ? 'disabled' : ''}>Perform Ritual</button>
        `;

        gameDisplayDiv.appendChild(ritualElement);
    });
}

function canPerformRitual(ritual) {
    let currentDruid = isDayTurn ? dayDruid : nightDruid;
    let currentInventory = isDayTurn ? currentDruid.inventory : currentDruid.inventory;
    return currentInventory.includes(ritual.item) &&
        currentWeather === ritual.weather &&
        (!ritual.moonPhase || moonPhases[currentMoonPhaseIndex] === ritual.moonPhase);
}

function performRitual(ritualName) {
    let ritual = rituals[ritualName];
    let currentInventory = isDayTurn ? dayDruidInventory : nightDruidInventory;

    if (canPerformRitual(ritual)) {
        applyRitualEffect(ritualName);
        currentInventory.splice(currentInventory.indexOf(ritual.item), 1); // Remove the item from inventory
        document.getElementById('game-display').textContent = `You performed the ${ritualName}.`;
        updateRitualsList(); // Refresh the list of rituals
    } else {
        document.getElementById('game-display').textContent = `Conditions not met for the ${ritualName}.`;
    }
}

function applyRitualEffect(ritualName) {
    switch (ritualName) {
        case "Sun's Embrace":
            villagerHappiness += 10; // Example effect
            break;
        case "Rain Whisperer":
            activeRitualEffects.rainWhispererActive = true;
            activeRitualEffects.rainWhispererDaysRemaining = 6;
            updateActiveEffectsDisplay(); // Update display of active effects
            break;
        case "Wind Dancer":
            villagerHealth += 10; // Example effect
            break;
        case "Harvest Blessing":
            villageFoodSupply += 20; // Example effect
            break;
        case "Lunar Bonding Ceremony":
            activeRitualEffects.lunarBondingActive = true;
            activeRitualEffects.lunarBondingDaysRemaining = rituals["Lunar Bonding Ceremony"].duration;
            break;
    }
    updateVillageCenterStatus(); // Update village status
}

let activeRitualEffects = {
    rainWhispererActive: false,
    rainWhispererDaysRemaining: 0
};

function updateActiveEffectsDisplay() {
    let activeEffectsDiv = document.getElementById('active-effects-display');
    activeEffectsDiv.innerHTML = ''; // Clear existing content

    // Check for active Rain Whisperer effect
    if (activeRitualEffects.rainWhispererActive) {
        let effectElement = document.createElement('div');
        effectElement.textContent = `Rain Whisperer Active - ${activeRitualEffects.rainWhispererDaysRemaining} turns remaining`;
        activeEffectsDiv.appendChild(effectElement);
    }
    // Add Lunar Bonding Ceremony check
    if (activeRitualEffects.lunarBondingActive) {
        let effectElement = document.createElement('div');
        effectElement.textContent = `Lunar Bonding Ceremony Active - ${activeRitualEffects.lunarBondingDaysRemaining} days remaining`;
        activeEffectsDiv.appendChild(effectElement);
    }
    // Add similar checks and displays for other active effects
}

function planFestivals() {
    let currentSeasonFestivals = villageFestivals.filter(festival => festival.season === season);
    let festivalsDisplay = currentSeasonFestivals.map(festival => `${festival.name} on Day ${festival.day}`).join(', ');
    document.getElementById('game-display').textContent = `Upcoming Festivals: ${festivalsDisplay}`;

}

function getRelationshipStatus(points) {
    if (points === 0) return "Stranger";
    if (points <= 10) return "Acquaintance";
    if (points <= 20) return "Friend";
    if (points <= 30) return "Best Friend";
    return "Romantic";
}

function villagerInteractions() {
    let gameDisplayDiv = document.getElementById('game-display');
    gameDisplayDiv.innerHTML = '';
    let currentDruid = isDayTurn ? dayDruid : nightDruid;

    availableVillagers.forEach(villager => {
        let villagerDiv = document.createElement('div');
        villagerDiv.classList.add('villager-interaction');

        let relationshipPoints = villagerRelationships[villager.name][currentDruid.id];
        let relationshipStatus = getRelationshipStatus(relationshipPoints);

        let villagerObject = villagers.find(v => v.name === villager.name);
        let mood = villagerObject ? villagerObject.mood : "Unknown";

        // Use the villager's name to select their specific image file
        let imageFileName = `${villager.name}.PNG`; // Assuming the file name is exactly the villager's name
        villagerDiv.innerHTML = `
            <div class="villager-portrait">
                <img src="images/Villager Portraits/${imageFileName}" alt="${villager.name}">
            </div>
            <div class="villager-info">
                <span class="villager-name">${villager.name}:</span>
                <span class="relationship-status">Relationship Status - ${relationshipStatus}</span>
                <span class='mood-display'>Mood: ${mood}</span>
                <button class="talk-button">Talk</button>
            </div>
        `;

        let talkButton = villagerDiv.querySelector('.talk-button');
        if (currentDruid.hasTalkedToday[villager.name]) {
            talkButton.disabled = true;
            talkButton.classList.add('talked');
        } else {
            talkButton.addEventListener('click', function () {
                talkToVillager(villager.name);
            });
        }

        gameDisplayDiv.appendChild(villagerDiv);
    });
}

function endTurn() {
    // Switch turns between Day Druid and Night Druid
    isDayTurn = !isDayTurn;
    const currentDruid = isDayTurn ? dayDruid : nightDruid;
    assignVillagerMoods(villagers);

    // If it's now the Day Druid's turn, it means the Night Druid has just finished their turn
    if (isDayTurn) {
        // Advance to the next day
        dayCount++;
        updateSeasonAndDay();
        degradeVillageFactors(); // Update village factors for the new day
        updateMoonPhase(); // Update the moon phase for the new day

        // Decrement the days remaining for the active ritual effects at the end of the full day
        if (activeRitualEffects.rainWhispererActive && activeRitualEffects.rainWhispererDaysRemaining > 0) {
            activeRitualEffects.rainWhispererDaysRemaining -= 1;

            // Disable the effect if duration is over
            if (activeRitualEffects.rainWhispererDaysRemaining <= 0) {
                activeRitualEffects.rainWhispererActive = false;
            }
        }

        // Reset daily interactions for the new day
        if (isDayTurn) {
            hasTalkedToday = { 'dayDruid': {}, 'nightDruid': {} };
        }
    }

    // Reset action points for the next Druid's turn
    currentDruid.actionPoints = 10;
    availableVillagers = pickRandomVillagers();

    // Decrement Lunar Bonding Ceremony days remaining
    if (isDayTurn && activeRitualEffects.lunarBondingActive) {
        activeRitualEffects.lunarBondingDaysRemaining -= 1;
        if (activeRitualEffects.lunarBondingDaysRemaining <= 0) {
            activeRitualEffects.lunarBondingActive = false;
        }
    }

    // Update the display to reflect the change in turn and day
    updateTurnDisplay();
    updateDisplayHeaders();
    updateActiveEffectsDisplay(); // Update the active effects display

    // Notify players of the turn change
    let currentDruidName = isDayTurn ? dayDruid.name : nightDruid.name;
    document.getElementById('game-display').textContent = `It's now ${currentDruidName}'s turn.`;
}

function generateVillagerList() {
    let villagerList = [
        { name: 'Aelwyn', mood: 'Happy', gender: 'Female', race: 'Elf', age: '30' },
        { name: 'Bran', mood: 'Sad', gender: 'Male', race: 'Human', age: '40' },
        { name: 'Ceridwen', mood: 'Happy', gender: 'Female', race: 'Human', age: '25' },
        { name: 'Daveth', mood: 'Sad', gender: 'Male', race: 'Dwarf', age: '55' },
        { name: 'Eira', mood: 'Happy', gender: 'Female', race: 'Elf', age: '20' },
        { name: 'Ffion', mood: 'Sad', gender: 'Female', race: 'Human', age: '45' },
        { name: 'Gareth', mood: 'Happy', gender: 'Male', race: 'Elf', age: '50' },
        { name: 'Heulwen', mood: 'Sad', gender: 'Female', race: 'Half-Elf', age: '22' },
        { name: 'Ifor', mood: 'Happy', gender: 'Male', race: 'Gnome', age: '60' },
        { name: 'Jocelyn', mood: 'Sad', gender: 'Female', race: 'Human', age: '28' },
        { name: 'Kai', mood: 'Happy', gender: "Male", race: 'Human', age: '30' },
        { name: 'Llew', mood: 'Sad', gender: 'Male', race: 'Elf', age: '35' },
        { name: 'Maelona', mood: 'Happy', gender: 'Female', race: 'Elf', age: '40' },
        { name: 'Nia', mood: 'Sad', gender: 'Female', race: 'Human', age: '18' },
        { name: 'Owain', mood: 'Happy', gender: 'Male', race: 'Human', age: '45' },
        { name: 'Pryderi', mood: 'Sad', gender: 'Male', race: 'Dwarf', age: '50' },
        { name: 'Rhian', mood: 'Happy', gender: 'Female', race: 'Elf', age: '55' },
        { name: 'Seren', mood: 'Sad', gender: 'Female', race: 'Elf', age: '32' },
        { name: 'Taliesin', mood: 'Happy', gender: 'Male', race: 'Half-Elf', age: '27' },
        { name: 'Una', mood: 'Sad', gender: 'Female', race: 'Faerie', age: '24' },
        // ... other villagers
    ];
    assignVillagerMoods(villagerList);
    // Initialize relationships for each villager
    const currentDruid = isDayTurn ? dayDruid : nightDruid; 
    villagerList.forEach(v => {
        if (!villagerRelationships[v.name]) {
            villagerRelationships[v.name] = {}; // Initialize a new object if it doesn't exist
        }
        villagerRelationships[v.name][currentDruid.id] = 0;
    }
    );
    return villagerList;
}

function pickRandomVillagers() {
    let selected = [];
    while (selected.length < 5) {
        let randomVillager = villagers[Math.floor(Math.random() * villagers.length)];
        if (!selected.includes(randomVillager)) {
            selected.push(randomVillager);
        }
    }
    return selected;
}

function assignVillagerMoods(vlist) {
    vlist.forEach(villager => {
        villager.mood = moods[Math.floor(Math.random() * moods.length)];
    });
}

function talkToVillager(villagerName) {
    const currentDruid = isDayTurn ? dayDruid : nightDruid;
    if (currentDruid.actionPoints >= 1) {
        let currentDruid = isDayTurn ? dayDruid : nightDruid;
        let druidSpecificTalkedToday = currentDruid.hasTalkedToday || {};

        if (!currentDruid.hasTalkedToday[villagerName]) {
            let pointsToAdd = 1;
            if (activeRitualEffects.lunarBondingActive) {
                pointsToAdd *= 2;
            }

            villagerRelationships[villagerName][currentDruid.id] += pointsToAdd;

            let points = villagerRelationships[villagerName][currentDruid.id];
            let status = getRelationshipStatus(points);

            // Determine the type of response
            let responseChance = Math.random();
            let selectedDialogue;
            if (responseChance < 0.20) {
                // Standard response
                selectedDialogue = dialogues[villagerName].standard[Math.floor(Math.random() * dialogues[villagerName].standard.length)];
            } else if (responseChance < 0.55) {
                // Status response
                let statusDialogues = dialogues[villagerName].status;
                selectedDialogue = statusDialogues[status][Math.floor(Math.random() * statusDialogues[status].length)];
            } else if (responseChance < 0.90) {
                // Mood response
                let mood = villagers.find(villager => villager.name === villagerName).mood;
                let moodDialogues = dialogues[villagerName].mood;
                selectedDialogue = moodDialogues[mood][Math.floor(Math.random() * moodDialogues[mood].length)];
            } else {
                // Special response
                let specialDialogues = dialogues[villagerName].special;
                selectedDialogue = specialDialogues[Math.floor(Math.random() * specialDialogues.length)];
            }

            // Add additional checks here (IE. Quests, special interactions based on progress/items, ect) 

            // Display the selected dialogue along with the villager's image
            let gameDisplayDiv = document.getElementById('game-display');
            gameDisplayDiv.innerHTML = `
                 <div class="villager-interaction">
                     <div class="villager-portrait">
                         <img src="images/Villager Portraits/${villagerName}.PNG" alt="${villagerName}" style="width: 80px; height: 80px;">
                     </div>
                     <div class="villager-dialogue">
                         ${selectedDialogue}
                     </div>
                 </div>
             `;

            druidSpecificTalkedToday[villagerName] = true;
            hasTalkedToday[currentDruid.id] = currentDruid.hasTalkedToday;

            currentDruid.actionPoints -= 1;
            updateTurnDisplay();
        } else {
            alert("You have already talked to this villager today.");
        }
    } else {
        alert("Not enough action points!");
    }
}

function getRandomDialogue(dialogueArray) {
    if (dialogueArray && dialogueArray.length > 0) {
        return dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
    }
    return "They have nothing to say right now."; // Fallback dialogue
}

function updateSeasonAndDay() {
    if (dayCount > 15) {
        dayCount = 1;
        switch (season) {
            case 'Spring': season = 'Summer'; break;
            case 'Summer': season = 'Fall'; break;
            case 'Fall': season = 'Winter'; break;
            case 'Winter':
                season = 'Spring';
                currentYear++;  // Increment the year after winter
                break;
        }
    }
    updateWeather();
    updateDisplayHeaders();
}

function updateWeather() {
    // Check for active Rain Whisperer effect
    if (activeRitualEffects.rainWhispererActive && activeRitualEffects.rainWhispererDaysRemaining > 0) {
        let increasedRainChance = Math.random() < 0.6; // 60% chance of rain
        currentWeather = increasedRainChance ? "Rainy" : selectNormalWeather();
    } else {
        currentWeather = selectNormalWeather();
    }
    // Function to select normal weather based on season
    function selectNormalWeather() {
        let seasonWeather = weatherBySeason[season];
        return seasonWeather[Math.floor(Math.random() * seasonWeather.length)];
    }
}

function updateMoonPhase() {
    currentMoonPhaseIndex = (currentMoonPhaseIndex + 1) % moonPhases.length;
}

function updateDisplayHeaders() {
    var seasonText = season + ", Day " + dayCount + ", Year " + currentYear;
    var weatherText = currentWeather;
    var moonText = "";

    if (!isDayTurn) {
        moonText = "Moon Phase: " + moonPhases[currentMoonPhaseIndex];
    }

    document.getElementById('day-counter').textContent = seasonText;
    document.getElementById('weather-display').textContent = weatherText;
    document.getElementById('moon-phase').textContent = moonText;
}

const myFuncs = {
    startGame: startGame,
    exploreWildlandsOptions: exploreWildlandsOptions,
    explore: explore,
    visitVillageCenter: visitVillageCenter,
    manageResources: manageResources,
    updateRitualsList: updateRitualsList,
    planFestivals: planFestivals,
    villagerInteractions: villagerInteractions,
    endTurn: endTurn,
    useItem: useItem,
    giveItem: giveItem,
    dropItem: dropItem,
    removeItemFromInventory: removeItemFromInventory,
}

window.myFuncs = myFuncs;