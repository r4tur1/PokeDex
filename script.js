// Pokémon data with extended information
const pokemonData = Array.from({ length: 151 }, (_, i) => {
    const id = i + 1;
    const name = getPokemonName(id);
    return {
        id,
        name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        soundUrl: `https://play.pokemonshowdown.com/audio/cries/${name.toLowerCase()}.ogg`,
        ...getPokemonDetails(id, name)
    };
});

// Type colors mapping
const typeColors = {
    bug: '#A8B820',
    dragon: '#7038F8',
    electric: '#F8D030',
    fighting: '#C03028',
    fire: '#F08030',
    flying: '#A890F0',
    ghost: '#705898',
    grass: '#78C850',
    ground: '#E0C068',
    ice: '#98D8D8',
    normal: '#A8A878',
    poison: '#A040A0',
    psychic: '#F85888',
    rock: '#B8A038',
    water: '#6890F0'
};

// Extended Pokémon details
function getPokemonDetails(id, name) {
    // This is a simplified version - in a real app you'd fetch from PokeAPI
    const details = {
        height: (Math.floor(Math.random() * 20) + 1) / 10, // 0.1 to 2.0 meters
        weight: Math.floor(Math.random() * 1000) + 1, // 1 to 1000 kg
        habitat: ['Forest', 'Cave', 'Mountain', 'Urban', 'Water', 'Grassland', 'Rare'][Math.floor(Math.random() * 7)],
        generation: 1,
        category: getCategory(name),
        abilities: ['Overgrow', 'Chlorophyll', 'Blaze', 'Torrent', 'Static'][Math.floor(Math.random() * 5)],
        stats: {
            hp: Math.floor(Math.random() * 100) + 50,
            attack: Math.floor(Math.random() * 100) + 30,
            defense: Math.floor(Math.random() * 100) + 30,
            'special-attack': Math.floor(Math.random() * 100) + 30,
            'special-defense': Math.floor(Math.random() * 100) + 30,
            speed: Math.floor(Math.random() * 100) + 30
        },
        description: getDescription(name),
        types: getTypes(id),
        evolution: getEvolution(id)
    };

    return details;
}

function getCategory(name) {
    if (name === 'Charizard') return 'Flame Pokémon';
    if (name === 'Blastoise') return 'Shellfish Pokémon';
    if (name === 'Venusaur') return 'Seed Pokémon';
    if (name === 'Pikachu') return 'Mouse Pokémon';
    if (name === 'Gyarados') return 'Atrocious Pokémon';
    if (name === 'Snorlax') return 'Sleeping Pokémon';
    if (name === 'Dragonite') return 'Dragon Pokémon';
    if (name === 'Mewtwo') return 'Genetic Pokémon';
    if (name === 'Mew') return 'New Species Pokémon';
    return 'Pokémon';
}

function getDescription(name) {
    const descriptions = [
        `${name} is a fascinating creature with unique abilities.`,
        `The ${name} is known for its distinctive characteristics in the Pokémon world.`,
        `${name} has been the subject of many Pokémon research studies.`,
        `Trainers value ${name} for its special capabilities.`,
        `In the wild, ${name} exhibits interesting behavioral patterns.`,
        `${name} is one of the most recognizable Pokémon species.`,
        `Legends tell stories about the power of ${name}.`,
        `${name} has evolved unique adaptations to survive in its habitat.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getTypes(id) {
    // Simplified type assignments - in a real app you'd get accurate types
    const typePairs = [
        ['grass', 'poison'], ['fire'], ['water'], ['bug'], ['flying', 'normal'],
        ['poison'], ['electric'], ['ground'], ['fairy'], ['psychic'],
        ['fighting'], ['ghost'], ['dragon'], ['ice'], ['rock']
    ];

    const type1 = typePairs[id % typePairs.length][0];
    const type2 = typePairs[id % typePairs.length][1];

    return type2 ? [type1, type2] : [type1];
}

function getEvolution(id) {
    // Simplified evolution chains - in a real app you'd get accurate evolutions
    if (id === 1) return [1, 2, 3];
    if (id === 4) return [4, 5, 6];
    if (id === 7) return [7, 8, 9];
    if (id === 10) return [10, 11, 12];
    if (id === 13) return [13, 14, 15];
    if (id === 16) return [16, 17, 18];
    if (id === 25) return [172, 25, 26];
    if (id === 133) return [133, 134, 135, 136];
    return [id];
}

function getPokemonName(id) {
    const names = [
        'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard',
        'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie', 'Metapod', 'Butterfree',
        'Weedle', 'Kakuna', 'Beedrill', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata',
        'Raticate', 'Spearow', 'Fearow', 'Ekans', 'Arbok', 'Pikachu', 'Raichu',
        'Sandshrew', 'Sandslash', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂',
        'Nidorino', 'Nidoking', 'Clefairy', 'Clefable', 'Vulpix', 'Ninetales',
        'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume',
        'Paras', 'Parasect', 'Venonat', 'Venomoth', 'Diglett', 'Dugtrio', 'Meowth',
        'Persian', 'Psyduck', 'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine',
        'Poliwag', 'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam', 'Machop',
        'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool',
        'Tentacruel', 'Geodude', 'Graveler', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke',
        'Slowbro', 'Magnemite', 'Magneton', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Seel',
        'Dewgong', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar',
        'Onix', 'Drowzee', 'Hypno', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Exeggcute',
        'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Koffing',
        'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey', 'Tangela', 'Kangaskhan', 'Horsea',
        'Seadra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Mr. Mime', 'Scyther',
        'Jynx', 'Electabuzz', 'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Gyarados',
        'Lapras', 'Ditto', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon',
        'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Snorlax', 'Articuno',
        'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite', 'Mewtwo', 'Mew'
    ];
    return names[id - 1] || 'Unknown';
}

// DOM elements
const card = document.getElementById('card');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const pokemonImage = document.getElementById('pokemon-image');
const pokemonName = document.getElementById('pokemon-name');
const pokemonNumber = document.getElementById('pokemon-number');
const pokemonTypes = document.getElementById('pokemon-types');
const instructions = document.getElementById('instructions');
const pokemonCry = document.getElementById('pokemon-cry');
const pokedexBtn = document.getElementById('pokedex-btn');
const pokedexModal = document.getElementById('pokedex-modal');
const pokedexContent = document.getElementById('pokedex-content');
const closeBtn = document.querySelector('.close-btn');
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');

let currentPokemon = null;
let isRevealed = false;
let isMusicPlaying = false;

// Initialize
window.addEventListener('load', () => {
    getRandomPokemon();
    // Try to autoplay background music (may be blocked by browser)
    playBackgroundMusic().catch(e => console.log('Autoplay prevented:', e));
});

// Get a random Pokémon
function getRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonData.length);
    currentPokemon = pokemonData[randomIndex];
    isRevealed = false;

    // Reset card state
    card.classList.remove('flipped');
    cardFront.classList.add('hidden');
    cardBack.classList.remove('hidden');

    // Set background based on primary type
    document.body.className = currentPokemon.types[0] ? `${currentPokemon.types[0]}-bg` : '';

    instructions.textContent = 'Click to reveal a Pokémon';
}

// Reveal the Pokémon
function revealPokemon() {
    if (!isRevealed) {
        isRevealed = true;
        card.classList.add('flipped');

        // Set Pokémon info
        pokemonImage.src = currentPokemon.imageUrl;
        pokemonImage.alt = currentPokemon.name;
        pokemonName.textContent = currentPokemon.name;
        pokemonNumber.textContent = `#${currentPokemon.id.toString().padStart(3, '0')}`;

        // Set types
        pokemonTypes.innerHTML = '';
        currentPokemon.types.forEach(type => {
            const typeBadge = document.createElement('div');
            typeBadge.className = `type-badge type-${type}`;
            typeBadge.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            pokemonTypes.appendChild(typeBadge);
        });

        // Play sound
        pokemonCry.src = currentPokemon.soundUrl;
        pokemonCry.play().catch(e => console.log('Audio play failed:', e));

        // Show front after animation
        setTimeout(() => {
            cardFront.classList.remove('hidden');
            cardBack.classList.add('hidden');
        }, 400);

        instructions.textContent = 'Click to reveal another Pokémon';
    } else {
        getRandomPokemon();
    }
}

// Show Pokédex
function showPokedex() {
    if (!currentPokemon) return;

    pokedexContent.innerHTML = `
        <div class="pokedex-header">
            <img src="${currentPokemon.imageUrl}" alt="${currentPokemon.name}" class="pokedex-image">
            <div class="pokedex-details">
                <h2 class="pokedex-name">${currentPokemon.name}</h2>
                <p class="pokedex-number">#${currentPokemon.id.toString().padStart(3, '0')}</p>
                <div class="pokedex-types">
                    ${currentPokemon.types.map(type =>
        `<span class="pokedex-type type-${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`
    ).join('')}
                </div>
                <p><strong>Category:</strong> ${currentPokemon.category}</p>
                <p><strong>Height:</strong> ${currentPokemon.height}m</p>
                <p><strong>Weight:</strong> ${currentPokemon.weight}kg</p>
                <p><strong>Abilities:</strong> ${currentPokemon.abilities}</p>
                <p><strong>Habitat:</strong> ${currentPokemon.habitat}</p>
            </div>
        </div>
        
        <div class="pokedex-stats">
            ${Object.entries(currentPokemon.stats).map(([stat, value]) => `
                <div class="stat-item">
                    <span class="stat-name">${stat.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}:</span>
                    <span class="stat-value">${value}</span>
                </div>
            `).join('')}
        </div>
        
        <p class="pokedex-description">${currentPokemon.description}</p>
        
        ${currentPokemon.evolution.length > 1 ? `
        <div class="pokedex-evolution">
            <h3>Evolution Chain</h3>
            <div class="evolution-chain">
                ${currentPokemon.evolution.map(pokemonId => {
        const pokemon = pokemonData.find(p => p.id === pokemonId) || pokemonData[0];
        return `
                        <div class="evolution-stage">
                            <img src="${pokemon.imageUrl}" alt="${pokemon.name}" class="evolution-image">
                            <span class="evolution-name">${pokemon.name}</span>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
        ` : ''}
    `;

    pokedexModal.classList.remove('hidden');
}

// Close Pokédex
function closePokedex() {
    pokedexModal.classList.add('hidden');
}

// Background music control
async function playBackgroundMusic() {
    try {
        await backgroundMusic.play();
        isMusicPlaying = true;
        musicStatus.textContent = 'ON';
    } catch (e) {
        console.log('Background music play failed:', e);
        isMusicPlaying = false;
        musicStatus.textContent = 'OFF';
    }
}

function toggleBackgroundMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicStatus.textContent = 'OFF';
    } else {
        backgroundMusic.play();
        musicStatus.textContent = 'ON';
    }
    isMusicPlaying = !isMusicPlaying;
}

// Event listeners
card.addEventListener('click', revealPokemon);
pokedexBtn.addEventListener('click', showPokedex);
closeBtn.addEventListener('click', closePokedex);
musicToggle.addEventListener('click', toggleBackgroundMusic);

// Close modal when clicking outside content
pokedexModal.addEventListener('click', (e) => {
    if (e.target === pokedexModal) {
        closePokedex();
    }
});