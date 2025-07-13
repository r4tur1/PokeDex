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