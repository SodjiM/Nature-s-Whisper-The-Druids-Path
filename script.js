import { dialogues } from './dialogues.js';
let dayDruidName = '';
let nightDruidName = '';
let isDayTurn = true;
let actionPoints = 10;
let dayCount = 1;
let currentYear = 1;
let season = 'Spring';
let dayDruidInventory = [];
let nightDruidInventory = [];
let villagerRelationships = {};
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
let hasTalkedToday = {};
let moonPhases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
let currentMoonPhaseIndex = 0;
let weatherBySeason = {
    "Spring": ["Rainy", "Cloudy", "Clear"],
    "Summer": ["Sunny", "Clear", "Windy"],
    "Fall": ["Windy", "Cloudy", "Rainy"],
    "Winter": ["Snowy", "Cloudy", "Cold"]
};
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


function startGame() {
    dayDruidName = document.getElementById('day-druid-name').value;
    nightDruidName = document.getElementById('night-druid-name').value;
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
    const theme = isDayTurn ? 'day-theme' : 'night-theme';
    document.body.className = theme;
    druidTurn.textContent = `It's ${isDayTurn ? dayDruidName : nightDruidName}'s turn. Action Points: ${actionPoints}`;
    document.getElementById('day-counter').textContent = `${season}, Day ${dayCount}`;
}

function exploreWildlands() {
    if (actionPoints >= 2) {
        actionPoints -= 2;
        let exploreResult = Math.random();
        let currentInventory = isDayTurn ? dayDruidInventory : nightDruidInventory;

        if (exploreResult < 0.1) {
            // Something bad happens
            if (currentInventory.length > 0) {
                currentInventory.pop(); // Lose the last item in inventory
                document.getElementById('game-display').textContent = 'Oh no! A wild beast appeared, and you lost an item!';
            } else {
                document.getElementById('game-display').textContent = 'A wild beast appeared, but you had nothing to lose!';
            }
        } else if (exploreResult < 0.3) {
            // Lose AP
            actionPoints = Math.max(0, actionPoints - 2);
            document.getElementById('game-display').textContent = 'You got lost! This cost you extra action points.';
        } else if (exploreResult < 0.8) {
            // Regular item find
            let items = ['Herbs', 'Berries', 'Wood', 'Stone', 'Crystal'];
            let gainedItem = items[Math.floor(Math.random() * items.length)];
            currentInventory.push(gainedItem);
            document.getElementById('game-display').textContent = `You found some ${gainedItem}!`;
        } else {
            // Rare item find
            let rareItems = ['Sunstone Crystal', 'Blue Sapphire', 'Feather of a Hawk', 'Golden Wheat Sheaf', 'Heartstone Gem'];
            let gainedRareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
            currentInventory.push(gainedRareItem);
            document.getElementById('game-display').textContent = `You found a rare item: ${gainedRareItem}!`;
        }
        updateTurnDisplay();
    } else {
        alert("Not enough action points!");
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
    let currentInventory = isDayTurn ? dayDruidInventory : nightDruidInventory;
    let inventoryDisplay = currentInventory.length > 0 ? currentInventory.join(', ') : 'Nothing';
    document.getElementById('game-display').textContent = `You have: ${inventoryDisplay}`;
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
    let currentInventory = isDayTurn ? dayDruidInventory : nightDruidInventory;
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
    let currentDruidKey = isDayTurn ? 'dayDruid' : 'nightDruid';
    let druidSpecificTalkedToday = hasTalkedToday[currentDruidKey] || {};

    availableVillagers.forEach(villager => {
        let villagerDiv = document.createElement('div');
        let relationshipPoints = villagerRelationships[villager][currentDruidKey];
        let relationshipStatus = getRelationshipStatus(relationshipPoints);

        villagerDiv.innerHTML = `${villager}: Relationship Status - ${relationshipStatus}`;
        let talkButton = document.createElement('button');
        talkButton.textContent = 'Talk';

        if (druidSpecificTalkedToday[villager]) {
            talkButton.disabled = true;
            talkButton.style.opacity = 0.5;
        } else {
            talkButton.addEventListener('click', function() {
                talkToVillager(villager);
            });
        }

        villagerDiv.appendChild(talkButton);
        gameDisplayDiv.appendChild(villagerDiv);
    });
}


function endTurn() {
    // Switch turns between Day Druid and Night Druid
    isDayTurn = !isDayTurn;

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
    actionPoints = 10;
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
    let currentDruidName = isDayTurn ? dayDruidName : nightDruidName;
    document.getElementById('game-display').textContent = `It's now ${currentDruidName}'s turn.`;
}

function generateVillagerList() {
    let villagerNames = [
        "Aelwyn", "Bran", "Ceridwen", "Daveth", "Eira",
        "Ffion", "Gareth", "Heulwen", "Ifor", "Jocelyn",
        "Kai", "Llew", "Maelona", "Nia", "Owain",
        "Pryderi", "Rhian", "Seren", "Taliesin", "Una"
    ];
       // Initialize relationships for each villager
       villagerNames.forEach(villagerName => {
        villagerRelationships[villagerName] = { "dayDruid": 0, "nightDruid": 0 };
    });

    return villagerNames;
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

function talkToVillager(villagerName) {
    if (actionPoints >= 1) {
        let currentDruidKey = isDayTurn ? 'dayDruid' : 'nightDruid';
        let druidSpecificTalkedToday = hasTalkedToday[currentDruidKey] || {};

        if (!druidSpecificTalkedToday[villagerName]) {
            let pointsToAdd = 1;
            if (activeRitualEffects.lunarBondingActive) {
                pointsToAdd *= 2;
            }

            villagerRelationships[villagerName][currentDruidKey] += pointsToAdd;

            // Determine the relationship status based on points
            let points = villagerRelationships[villagerName][currentDruidKey];
            let status = getRelationshipStatus(points);

            // Select dialogue based on the relationship status
            let villagerDialogues = dialogues[villagerName][status];
            let selectedDialogue = villagerDialogues[Math.floor(Math.random() * villagerDialogues.length)];

            // Display the selected dialogue in the game display
            document.getElementById('game-display').textContent = selectedDialogue;

            druidSpecificTalkedToday[villagerName] = true;
            hasTalkedToday[currentDruidKey] = druidSpecificTalkedToday;

            villagerInteractions();
            actionPoints -= 1;
            updateTurnDisplay();
        } else {
            alert("You have already talked to this villager today.");
        }
    } else {
        alert("Not enough action points!");
    }
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