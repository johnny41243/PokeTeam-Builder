console.log("PokeTeam.js loaded");

const button = document.getElementById("generate-team");
const input = document.getElementById("pokemon-search");
const teamGrid = document.getElementById("team-grid");

function getStatClass(stat) {
    if (stat >= 120) {
        return "stat-amazing";
    } else if (stat >= 90) {
        return "stat-good";
    } else if (stat >= 60) {
        return "stat-ok";
    } else {
        return "stat-bad";
    }
}

button.addEventListener("click", async () => {
    teamGrid.innerHTML = "";

    const analysisDiv = document.getElementById("team-analysis");
    analysisDiv.innerHTML = "";
    analysisDiv.classList.add("hidden");

    const pokemonName = input.value.toLowerCase();

    const herotext = document.getElementById("hero-text");
    herotext.classList.add("hidden");

    document.querySelector(".team-card").classList.add("full-width");

    const hero = document.querySelector(".hero");

    hero.style.gridTemplateColumns = "1fr";
    
    const teamCard = document.querySelector(".team-card");
    teamCard.style.maxWidth = "900px";
    teamCard.style.margin = "0 auto";


    if (!pokemonName) {
        alert("Please enter a Pokémon name.");
        return;
    }

    const testResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    if (!testResponse.ok) {
        alert("That Pokémon does not exist.");
        return;
    }

    const team = [
        pokemonName,
        "garchomp",
        "gengar",
        "rotom-wash",
        "ferrothorn",
        "tyranitar"
    ];

    const weaknessCounts = {};
    const typeCounts = {};

    for (let pokemon of team) {
        try {
            const isMainPokemon = pokemon === pokemonName;

            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

            if (!response.ok) {
                console.log(`${pokemon} failed`);
                continue;
            }

            const data = await response.json();

            const weaknessResponse = await fetch(
                `https://pokeapi.co/api/v2/type/${data.types[0].type.name}`
            );

            const weaknessData = await weaknessResponse.json();

            const types = data.types.map(typeInfo => typeInfo.type.name);

            const weaknesses = weaknessData.damage_relations.double_damage_from.map(
                type => type.name
            );

            weaknesses.forEach(weakness => {
                if (weaknessCounts[weakness]) {
                    weaknessCounts[weakness]++;
                } else {
                    weaknessCounts[weakness] = 1;
                }
            });

            const strengths = weaknessData.damage_relations.half_damage_from.map(
                type => type.name
            );

            strengths.forEach(type => {
                if (typeCounts[type]) {
                    typeCounts[type]++;
                } else {
                    typeCounts[type] = 1;
                }
            });

            const typeIcons = types.map(type => {
                return `
                    <img 
                        class="type-icon"
                        src="PokemonTypes/${type}Type.png"
                    >
                `;
            }).join("");

            const weaknessIcons = weaknesses.map(type => {
                return `
                    <img 
                        class="type-icon"
                        src="PokemonTypes/${type}Type.png"
                    >
                `;
            }).join("");

            teamGrid.innerHTML += ` 
                <div class="pokemon-card ${isMainPokemon ? "main-pokemon" : ""}" 
                    onclick="openPokemonModal('${data.name}')">
                    <img class="pokemon-sprite" src="${data.sprites.front_default}">
                    <h2>${data.name}</h2>
                    <p>Types: ${typeIcons}</p> 
                    <p>weaknesses: ${weaknessIcons}</p>
                </div>
            `;
        } catch (error) {
            console.log("Error:", error);
        }
    }

    const analysisHTML = Object.entries(weaknessCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
            return `
                <div class="analysis-item">
                    <img
                        class="type-icon"
                        src="PokemonTypes/${type}Type.png"
                    >
                    <span>${count}</span>
                </div>
            `;
        }).join("");

    analysisDiv.innerHTML = `
        <div class="analysis-box">
            <h3>Team Weakness Analysis</h3>
            ${analysisHTML}
        </div>
    `;

    analysisDiv.classList.remove("hidden");

        const strengthsDiv = document.getElementById("team-strengths");

    const strengthsHTML = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
            return `
                <div class="analysis-item">
                    <img
                        class="type-icon"
                        src="PokemonTypes/${type}Type.png"
                    >
                    <span>${count}</span>
                </div>
            `;
        }).join("");

    strengthsDiv.innerHTML = `
        <div class="analysis-box">
            <h3>Team Strength Analysis</h3>
            ${strengthsHTML}
        </div>
    `;

    strengthsDiv.classList.remove("hidden");
});



async function openPokemonModal(pokemonName) {

    const modal = document.getElementById("pokemon-modal");
    const modalBody = document.getElementById("modal-body");
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();

     const types = data.types.map(typeInfo => typeInfo.type.name);

const typeIcons = types.map(type => {
    return `
        <img class="type-icon" src="PokemonTypes/${type}Type.png">
    `;
}).join("");

const abilities = data.abilities.map(abilityInfo => {
    return abilityInfo.ability.name;
}).join(", ");

const stats = data.stats.map(statInfo => {

    const statClass = getStatClass(statInfo.base_stat);

    const statWidth =
        Math.min(statInfo.base_stat, 150) / 150 * 100;

    return `
        <div class="stat-row">
            <span>${statInfo.stat.name}</span>

            <div class="stat-bar">
                <div
                    class="stat-fill ${statClass}"
                    style="width: ${statWidth}%">
                </div>
            </div>

            <strong>${statInfo.base_stat}</strong>
        </div>
    `;
}).join("");


modalBody.innerHTML = `
    <div class="modal-pokemon">
        <h1>${data.name}</h1>

        <img class="modal-sprite" src="${data.sprites.front_default}">

        <div class="modal-types">
            ${typeIcons}
        </div>

        <p><strong>Abilities:</strong> ${abilities}</p>
</br>
        <h3>Base Stats</h3>
        <div class="stats-box">
            ${stats}
        </div>
    </div>
`;

    modal.classList.remove("hidden");

}

const closeButton = document.getElementById("close-modal");

closeButton.addEventListener("click", () => {

    const modal = document.getElementById("pokemon-modal");

    modal.classList.add("hidden");

});


