// ===== OPTIMIZED CONSTANTS AND DATA =====
const POKEMON_COUNT = 151;
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const CRY_BASE_URL = 'https://play.pokemonshowdown.com/audio/cries';
const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// DOM Elements
const elements = {
  // (Keep your existing element references)
};

// Audio Elements
const audio = {
  // (Keep your existing audio references)
};

// App State
const state = {
  currentPokemon: null,
  isRevealed: false,
  isMusicOn: true,
  isSoundOn: true,
  pokemonData: [],
  loadedPokemonCount: 0,
  currentPage: 1,
  itemsPerPage: 20,
  allTypes: [],
  cache: new Map(),
  isFirstLoad: true
};

// ===== OPTIMIZED INITIALIZATION =====
async function init() {
  try {
    // Phase 1: Load critical assets first
    updateLoadingProgress(10, 'Loading essential assets...');
    await preloadCriticalAssets();

    // Phase 2: Load initial Pokémon data
    updateLoadingProgress(30, 'Loading Pokémon data...');
    await loadInitialPokemonData();

    // Phase 3: Load remaining assets in background
    updateLoadingProgress(70, 'Preparing your Pokédex...');
    loadRemainingAssets();

    // Set up event listeners early
    setupEventListeners();

    // Get initial random Pokémon from preloaded data
    getRandomPokemon();

    // Hide loading screen when ready
    setTimeout(() => {
      hideLoadingScreen();
      state.isFirstLoad = false;
    }, 500);

    // Check for shared Pokémon from URL
    checkForSharedPokemon();

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize. Please refresh the page.');
  }
}

// ===== OPTIMIZED DATA LOADING =====
async function preloadCriticalAssets() {
  // Preload first 10 Pokémon immediately
  const criticalPokemon = [1, 4, 7, 25, 150, 151]; // Starters + popular
  await Promise.all([
    ...criticalPokemon.map(id => preloadPokemon(id)),
    preloadAudio('ui-sound'),
    preloadAudio('card-flip-sound')
  ]);
}

async function loadInitialPokemonData() {
  const cacheKey = `pokemon-list-${POKEMON_COUNT}`;

  if (state.cache.has(cacheKey)) {
    state.pokemonData = state.cache.get(cacheKey);
    return;
  }

  // Only load basic data initially
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=${POKEMON_COUNT}`);
  const data = await response.json();

  state.pokemonData = data.results.map((pokemon, index) => ({
    id: index + 1,
    name: formatPokemonName(pokemon.name),
    imageUrl: `${SPRITE_BASE_URL}/${index + 1}.png`,
    cryUrl: `${CRY_BASE_URL}/${pokemon.name}.ogg`,
    detailsUrl: pokemon.url
  }));

  state.cache.set(cacheKey, state.pokemonData);
}

async function loadRemainingAssets() {
  // Lazy load remaining Pokémon data
  setTimeout(async () => {
    try {
      await loadAllTypes();

      // Load remaining Pokémon in chunks
      const chunkSize = 10;
      for (let i = 0; i < state.pokemonData.length; i += chunkSize) {
        const chunk = state.pokemonData.slice(i, i + chunkSize);
        await Promise.all(chunk.map(pokemon => loadPokemonDetails(pokemon)));
        updateLoadingProgress(70 + (i / state.pokemonData.length * 20));
      }

      // Load Pokédex after all data is ready
      if (!state.isFirstLoad) {
        loadPokedexPage();
      }

    } catch (error) {
      console.error('Background loading error:', error);
    }
  }, 1000);
}

async function preloadPokemon(id) {
  try {
    const pokemon = state.pokemonData.find(p => p.id === id) || await getPokemonById(id);

    await Promise.all([
      preloadImage(pokemon.imageUrl),
      preloadImage(`${SPRITE_BASE_URL}/shiny/${pokemon.id}.png`),
      preloadAudio(pokemon.cryUrl)
    ]);

    return pokemon;
  } catch (error) {
    console.error(`Error preloading Pokémon ${id}:`, error);
    return null;
  }
}

async function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
    img.onerror = resolve;
  });
}

async function preloadAudio(url) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.oncanplaythrough = resolve;
    audio.onerror = resolve;
  });
}

// ===== OPTIMIZED POKÉMON DISPLAY =====
async function showPokemon(pokemon) {
  if (!pokemon) return;

  state.currentPokemon = pokemon;
  state.isRevealed = true;

  // Set image source and handle loading
  elements.pokemonImage.onload = () => {
    elements.pokemonImage.classList.add('loaded');
    animateCardReveal();
  };

  elements.pokemonImage.classList.remove('loaded');
  elements.pokemonImage.src = pokemon.imageUrl;
  elements.pokemonImage.alt = pokemon.name;

  // Update basic info immediately
  elements.pokemonName.textContent = pokemon.name;
  elements.pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;

  // Load details if not already loaded
  if (!pokemon.types) {
    const details = await loadPokemonDetails(pokemon);
    if (details) Object.assign(pokemon, details);
  }

  // Display types if available
  if (pokemon.types) {
    displayPokemonTypes(pokemon.types);
  }

  // Play cry with fallback
  playPokemonCry(pokemon.cryUrl);

  // Update UI
  elements.instructions.textContent = 'Click to reveal another Pokémon';
  elements.detailsBtn.classList.remove('hidden');

  // Flip card if not already flipped
  if (!elements.card.classList.contains('flipped')) {
    flipCard();
  }
}

// ===== OPTIMIZED AUDIO HANDLING =====
async function playPokemonCry(url) {
  if (!state.isSoundOn) return;

  try {
    // Try OGG first
    audio.pokemonCry.src = url;
    await audio.pokemonCry.play().catch(async () => {
      // Fallback to MP3
      audio.pokemonCry.src = url.replace('.ogg', '.mp3');
      await audio.pokemonCry.play();
    });
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
}

// ===== OPTIMIZED POKÉDEX LOADING =====
async function loadPokedexPage() {
  try {
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pokemonToLoad = state.pokemonData.slice(startIdx, endIdx);

    // Show skeleton loading
    showLoading(elements.pokedexContent, pokemonToLoad.length);

    // Load details for current page
    const pokemonWithDetails = await Promise.all(
      pokemonToLoad.map(async pokemon => {
        const details = await loadPokemonDetails(pokemon);
        return { ...pokemon, ...(details || {}) };
      })
    );

    // Render items
    elements.pokedexContent.innerHTML = '';
    pokemonWithDetails.forEach(pokemon => {
      elements.pokedexContent.appendChild(createPokedexItem(pokemon));
    });

    updatePaginationInfo();
    elements.loadMoreBtn.style.display =
      endIdx < state.pokemonData.length ? 'block' : 'none';

  } catch (error) {
    console.error('Error loading Pokédex page:', error);
    showError('Failed to load Pokédex. Please try again.', elements.pokedexContent);
  }
}

// ===== NEW PERFORMANCE FEATURES =====
function createImageObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  return observer;
}

function setupLazyLoading() {
  const imageObserver = createImageObserver();
  document.querySelectorAll('[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

function cleanupResources() {
  // Clean up old particles
  document.querySelectorAll('.particle').forEach(particle => {
    particle.remove();
  });

  // Clear unused cache entries
  if (state.cache.size > 50) {
    const keys = Array.from(state.cache.keys()).slice(0, 10);
    keys.forEach(key => state.cache.delete(key));
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Start loading immediately
  init();

  // Set up periodic cleanup
  setInterval(cleanupResources, 30000);
});