// Pokémon data and type colors
const pokemonData = Array.from({ length: 151 }, (_, i) => ({
    id: i + 1,
    name: getPokemonName(i + 1),
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
    soundUrl: `https://play.pokemonshowdown.com/audio/cries/${getPokemonName(i + 1).toLowerCase()}.ogg`,
    fallbackSoundUrl: `https://play.pokemonshowdown.com/audio/cries/${getPokemonName(i + 1).toLowerCase()}.mp3`
}));

const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

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
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');
const pokedexBtn = document.getElementById('pokedex-btn');
const pokedexModal = document.getElementById('pokedex-modal');
const pokedexContent = document.getElementById('pokedex-content');
const closeBtn = document.querySelector('.close-btn');
const pokedexSearch = document.getElementById('pokedex-search');
const randomPokemonBtn = document.getElementById('random-pokemon-btn');
const loadingScreen = document.getElementById('loading-screen');
const container = document.querySelector('.container');
const uiSound = document.getElementById('ui-sound');

let currentPokemon = null;
let isRevealed = false;
let allPokemonTypes = {};
let isMusicOn = true;

// Initialize app
async function init() {
    // Preload essential assets
    await preloadAssets();
    
    // Hide loading screen after initializing done 
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            container.classList.add('loaded');
        }, 500);
    }, 1000);
    
    // Load Pokémon types
    await loadPokemonTypes();
    
    // Set up event listeners
    setupEventListeners();
    
    // Get initial random Pokémon
    getRandomPokemon();
    
    // Load Pokédex
    loadPokedex();
}

// Preload essential assets
async function preloadAssets() {
    try {
        // Preload background music
        backgroundMusic.volume = 0.3;
        await backgroundMusic.play().then(() => {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }).catch(e => console.log('Music preload failed, will try again later'));
        
        // Preload UI sound
        uiSound.volume = 0.5;
        await uiSound.play().then(() => {
            uiSound.pause();
            uiSound.currentTime = 0;
        });
    } catch (e) {
        console.log('Audio preload error:', e);
    }
}

// Load Pokémon types data
async function loadPokemonTypes() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        const data = await response.json();
        allPokemonTypes = data.results.reduce((acc, type) => {
            acc[type.name] = type.url;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error loading Pokémon types:', error);
    }
}

// Get Pokémon name by ID
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

// Set up event listeners
function setupEventListeners() {
    // Card click to reveal Pokémon
    card.addEventListener('click', revealPokemon);
    
    // Music toggle
    musicToggle.addEventListener('click', toggleMusic);
    
    // Pokédex button
    pokedexBtn.addEventListener('click', () => {
        playUISound();
        pokedexModal.classList.add('show');
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        playUISound();
        pokedexModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    pokedexModal.addEventListener('click', (e) => {
        if (e.target === pokedexModal) {
            playUISound();
            pokedexModal.classList.remove('show');
        }
    });
    
    // Search functionality
    pokedexSearch.addEventListener('input', () => {
        const searchTerm = pokedexSearch.value.toLowerCase();
        const items = document.querySelectorAll('.pokedex-item');
        
        items.forEach(item => {
            const name = item.querySelector('h3').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Random Pokémon button
    randomPokemonBtn.addEventListener('click', () => {
        playUISound();
        const visibleItems = [...document.querySelectorAll('.pokedex-item')].filter(
            item => item.style.display !== 'none'
        );
        
        if (visibleItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * visibleItems.length);
            visibleItems[randomIndex].click();
        }
    });
    
    // Try to play background music when user interacts with the page
    document.addEventListener('click', tryPlayBackgroundMusic, { once: true });
}

// Try to play background music (needed for autoplay policies)
function tryPlayBackgroundMusic() {
    if (isMusicOn) {
        backgroundMusic.play().catch(e => {
            console.log('Autoplay prevented, will play after user interaction');
            musicStatus.textContent = 'OFF';
            isMusicOn = false;
        });
    }
}

// Toggle background music
function toggleMusic() {
    playUISound();
    isMusicOn = !isMusicOn;
    
    if (isMusicOn) {
        backgroundMusic.play();
        musicStatus.textContent = 'ON';
    } else {
        backgroundMusic.pause();
        musicStatus.textContent = 'OFF';
    }
}

// Play UI sound effect
function playUISound() {
    uiSound.currentTime = 0;
    uiSound.play().catch(e => console.log('UI sound play failed'));
}

// Get a random Pokémon
function getRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonData.length);
    currentPokemon = pokemonData[randomIndex];
    isRevealed = false;
    
    // Reset card state
    card.classList.remove('flipped');
    cardFront.classList.add('hidden');
    cardBack.classList.remove('hidden');
    
    instructions.textContent = 'Click to reveal a Pokémon';
}

// Reveal the Pokémon with animations and effects
async function revealPokemon() {
    if (!isRevealed) {
        playUISound();
        isRevealed = true;
        card.classList.add('flipped');
        
        // Show loading for image
        pokemonImage.classList.add('hidden');
        
        // Set Pokémon info
        pokemonImage.onload = () => {
            pokemonImage.classList.remove('hidden');
            createParticles();
        };
        
        pokemonImage.src = currentPokemon.imageUrl;
        pokemonImage.alt = currentPokemon.name;
        pokemonName.textContent = currentPokemon.name;
        pokemonNumber.textContent = `#${currentPokemon.id.toString().padStart(3, '0')}`;
        
        // Load and display types
        await displayPokemonTypes(currentPokemon.id);
        
        // Play sound (try .ogg first, fallback to .mp3)
        try {
            pokemonCry.src = currentPokemon.soundUrl;
            await pokemonCry.play().catch(async () => {
                pokemonCry.src = currentPokemon.fallbackSoundUrl;
                await pokemonCry.play();
            });
        } catch (e) {
            console.log('Audio play failed:', e);
        }
        
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

// Display Pokémon types with animations
async function displayPokemonTypes(pokemonId) {
    pokemonTypes.innerHTML = '';
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const data = await response.json();
        
        data.types.forEach((typeInfo, index) => {
            const typeName = typeInfo.type.name;
            const typeElement = document.createElement('span');
            typeElement.className = 'type-icon';
            typeElement.textContent = typeName.toUpperCase();
            typeElement.style.backgroundColor = typeColors[typeName] || '#777';
            typeElement.style.animationDelay = `${index * 0.1}s`;
            pokemonTypes.appendChild(typeElement);
        });
    } catch (error) {
        console.error('Error loading Pokémon types:', error);
    }
}

// Create particle effect when revealing Pokémon
function createParticles() {
    const cardRect = card.getBoundingClientRect();
    const colors = ['#FF0000', '#FFDE59', '#FFFFFF', '#000000'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${cardRect.left + cardRect.width / 2}px`;
        particle.style.top = `${cardRect.top + cardRect.height / 2}px`;
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const duration = 0.5 + Math.random() * 0.5;
        
        const animation = particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0 
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
    }
}

// Load Pokédex content
async function loadPokedex() {
    try {
        // Show skeleton loading
        pokedexContent.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            pokedexContent.appendChild(createSkeletonItem());
        }
        
        // Load actual data
        const pokemonWithDetails = await Promise.all(
            pokemonData.map(async pokemon => {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`);
                    const data = await response.json();
                    return {
                        ...pokemon,
                        types: data.types.map(t => t.type.name)
                    };
                } catch (error) {
                    console.error(`Error loading details for ${pokemon.name}:`, error);
                    return {
                        ...pokemon,
                        types: []
                    };
                }
            })
        );
        
        // Clear skeleton and display actual data
        pokedexContent.innerHTML = '';
        pokemonWithDetails.forEach(pokemon => {
            pokedexContent.appendChild(createPokedexItem(pokemon));
        });
    } catch (error) {
        console.error('Error loading Pokédex:', error);
        pokedexContent.innerHTML = '<p>Failed to load Pokédex. Please try again later.</p>';
    }
}

// Create skeleton loading item
function createSkeletonItem() {
    const skeleton = document.createElement('div');
    skeleton.className = 'pokedex-skeleton';
    skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text-short"></div>
    `;
    return skeleton;
}

// Create Pokédex item
function createPokedexItem(pokemon) {
    const item = document.createElement('div');
    item.className = 'pokedex-item';
    item.dataset.id = pokemon.id;
    
    const img = document.createElement('img');
    img.src = pokemon.imageUrl;
    img.alt = pokemon.name;
    
    const name = document.createElement('h3');
    name.textContent = pokemon.name;
    
    const number = document.createElement('p');
    number.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    
    const typesContainer = document.createElement('div');
    typesContainer.className = 'types-container';
    
    pokemon.types.forEach(type => {
        const typeElement = document.createElement('span');
        typeElement.className = 'type-icon';
        typeElement.textContent = type.toUpperCase();
        typeElement.style.backgroundColor = typeColors[type] || '#777';
        typesContainer.appendChild(typeElement);
    });
    
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.innerHTML = '<i class="fas fa-share"></i> Share';
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sharePokemon(pokemon);
    });
    
    item.appendChild(img);
    item.appendChild(name);
    item.appendChild(number);
    item.appendChild(typesContainer);
    item.appendChild(shareBtn);
    
    item.addEventListener('click', () => {
        playUISound();
        currentPokemon = pokemon;
        isRevealed = true;
        
        // Update card display
        pokemonImage.onload = () => {
            pokemonImage.classList.remove('hidden');
        };
        pokemonImage.classList.add('hidden');
        pokemonImage.src = pokemon.imageUrl;
        pokemonName.textContent = pokemon.name;
        pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        displayPokemonTypes(pokemon.id);
        
        // Play cry
        try {
            pokemonCry.src = pokemon.soundUrl;
            pokemonCry.play().catch(async () => {
                pokemonCry.src = pokemon.fallbackSoundUrl;
                await pokemonCry.play();
            });
        } catch (e) {
            console.log('Audio play failed:', e);
        }
        
        // Show card if not already showing
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
            setTimeout(() => {
                cardFront.classList.remove('hidden');
                cardBack.classList.add('hidden');
            }, 400);
        }
        
        // Close modal
        pokedexModal.classList.remove('show');
    });
    
    return item;
}

// Share Pokémon feature
function sharePokemon(pokemon) {
    playUISound();
    const url = `${window.location.origin}${window.location.pathname}?pokemon=${pokemon.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Check out ${pokemon.name}!`,
            text: `I found ${pokemon.name} on Pokémon Card Revealer!`,
            url: url
        }).catch(e => console.log('Share cancelled:', e));
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(url).then(() => {
            alert(`Link to ${pokemon.name} copied to clipboard!`);
        }).catch(() => {
            prompt('Copy this link to share:', url);
        });
    }
}

// Check for shared Pokémon on page load
function checkForSharedPokemon() {
    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('pokemon');
    
    if (pokemonId) {
        const pokemon = pokemonData.find(p => p.id === parseInt(pokemonId));
        if (pokemon) {
            // Remove the parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show the shared Pokémon
            currentPokemon = pokemon;
            isRevealed = true;
            
            // Update card display
            pokemonImage.onload = () => {
                pokemonImage.classList.remove('hidden');
            };
            pokemonImage.classList.add('hidden');
            pokemonImage.src = pokemon.imageUrl;
            pokemonName.textContent = pokemon.name;
            pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
            displayPokemonTypes(pokemon.id);
            
            // Show card
            card.classList.add('flipped');
            setTimeout(() => {
                cardFront.classList.remove('hidden');
                cardBack.classList.add('hidden');
            }, 400);
            
            instructions.textContent = 'Click to reveal another Pokémon';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    checkForSharedPokemon();
});