// ===== CONSTANTS AND DATA =====
const POKEMON_COUNT = 151;
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const CRY_BASE_URL = 'https://play.pokemonshowdown.com/audio/cries';
const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// DOM Elements
const elements = {
  card: document.getElementById('card'),
  cardFront: document.getElementById('card-front'),
  cardBack: document.getElementById('card-back'),
  pokemonImage: document.getElementById('pokemon-image'),
  pokemonName: document.getElementById('pokemon-name'),
  pokemonNumber: document.getElementById('pokemon-number'),
  pokemonTypes: document.getElementById('pokemon-types'),
  pokemonStats: document.getElementById('pokemon-stats'),
  instructions: document.getElementById('instructions'),
  loadingScreen: document.getElementById('loading-screen'),
  loadingProgress: document.getElementById('loading-progress'),
  pokedexModal: document.getElementById('pokedex-modal'),
  pokedexContent: document.getElementById('pokedex-content'),
  pokedexSearch: document.getElementById('pokedex-search'),
  typeFilter: document.getElementById('type-filter'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  paginationInfo: document.getElementById('pagination-info'),
  musicToggle: document.getElementById('music-toggle'),
  soundToggle: document.getElementById('sound-toggle'),
  musicStatus: document.getElementById('music-status'),
  soundStatus: document.getElementById('sound-status'),
  detailsBtn: document.getElementById('details-btn'),
  newPokemonBtn: document.getElementById('new-pokemon-btn'),
  randomPokemonBtn: document.getElementById('random-pokemon-btn'),
  closeBtns: document.querySelectorAll('.close-btn, .close-pokemon-btn'),
  pokemonModal: document.getElementById('pokemon-modal'),
  pokemonModalContent: document.querySelector('.pokemon-modal-main')
};

// Audio Elements
const audio = {
  backgroundMusic: document.getElementById('background-music'),
  pokemonCry: document.getElementById('pokemon-cry'),
  uiSound: document.getElementById('ui-sound'),
  cardFlipSound: document.getElementById('card-flip-sound')
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
  cache: new Map()
};

// ===== INITIALIZATION =====
async function init() {
  // Preload essential assets
  await preloadAssets();
  
  // Load Pokémon data
  await loadPokemonData();
  
  // Load Pokémon types for filtering
  await loadAllTypes();
  
  // Set up event listeners
  setupEventListeners();
  
  // Hide loading screen
  hideLoadingScreen();
  
  // Get initial random Pokémon
  getRandomPokemon();
  
  // Load Pokédex
  loadPokedexPage();
  
  // Check for shared Pokémon from URL
  checkForSharedPokemon();
}

// ===== DATA LOADING =====
async function loadPokemonData() {
  try {
    updateLoadingProgress(10, 'Fetching Pokémon list...');
    
    // Check cache first
    const cacheKey = `pokemon-list-${POKEMON_COUNT}`;
    if (state.cache.has(cacheKey)) {
      state.pokemonData = state.cache.get(cacheKey);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/pokemon?limit=${POKEMON_COUNT}`);
    const data = await response.json();
    
    state.pokemonData = await Promise.all(
      data.results.map(async (pokemon, index) => {
        const id = index + 1;
        return {
          id,
          name: formatPokemonName(pokemon.name),
          imageUrl: `${SPRITE_BASE_URL}/${id}.png`,
          cryUrl: `${CRY_BASE_URL}/${pokemon.name}.mp3`,
          detailsUrl: pokemon.url
        };
      })
    );
    
    // Cache the data
    state.cache.set(cacheKey, state.pokemonData);
    updateLoadingProgress(70, 'Processing data...');
    
  } catch (error) {
    console.error('Error loading Pokémon data:', error);
    showError('Failed to load Pokémon data. Please refresh the page.');
  }
}

async function loadAllTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/type`);
    const data = await response.json();
    state.allTypes = data.results.map(type => type.name);
    
    // Populate type filter dropdown
    elements.typeFilter.innerHTML = `
      <option value="">All Types</option>
      ${state.allTypes.map(type => `
        <option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>
      `).join('')}
    `;
    
  } catch (error) {
    console.error('Error loading Pokémon types:', error);
  }
}

async function loadPokemonDetails(pokemon) {
  try {
    // Check cache first
    if (state.cache.has(`pokemon-${pokemon.id}`)) {
      return state.cache.get(`pokemon-${pokemon.id}`);
    }
    
    const response = await fetch(pokemon.detailsUrl);
    const data = await response.json();
    
    const details = {
      types: data.types.map(t => t.type.name),
      stats: data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {}),
      height: data.height / 10, // Convert to meters
      weight: data.weight / 10, // Convert to kg
      abilities: data.abilities.map(a => a.ability.name),
      moves: data.moves.map(m => m.move.name)
    };
    
    // Cache the details
    state.cache.set(`pokemon-${pokemon.id}`, details);
    return details;
    
  } catch (error) {
    console.error(`Error loading details for ${pokemon.name}:`, error);
    return null;
  }
}

// ===== POKÉDEX FUNCTIONS =====
async function loadPokedexPage() {
  try {
    showLoading(elements.pokedexContent, 12);
    
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pokemonToLoad = state.pokemonData.slice(startIdx, endIdx);
    
    const pokemonWithDetails = await Promise.all(
      pokemonToLoad.map(async pokemon => {
        const details = await loadPokemonDetails(pokemon);
        return { ...pokemon, ...details };
      })
    );
    
    // Render Pokédex items
    pokemonWithDetails.forEach(pokemon => {
      elements.pokedexContent.appendChild(createPokedexItem(pokemon));
    });
    
    // Update pagination info
    updatePaginationInfo();
    
    // Show/hide load more button
    elements.loadMoreBtn.style.display = 
      endIdx < state.pokemonData.length ? 'block' : 'none';
    
  } catch (error) {
    console.error('Error loading Pokédex page:', error);
    showError('Failed to load Pokédex. Please try again.', elements.pokedexContent);
  }
}

function createPokedexItem(pokemon) {
  const item = document.createElement('div');
  item.className = 'pokedex-item';
  item.dataset.id = pokemon.id;
  item.dataset.types = pokemon.types.join(',');
  
  item.innerHTML = `
    <img src="${pokemon.imageUrl}" alt="${pokemon.name}" loading="lazy">
    <div class="pokedex-item-info">
      <h3>${pokemon.name}</h3>
      <p class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</p>
      <div class="types-container">
        ${pokemon.types.map(type => `
          <span class="type-icon" style="background-color: ${getTypeColor(type)}">
            ${type.toUpperCase()}
          </span>
        `).join('')}
      </div>
    </div>
  `;
  
  item.addEventListener('click', () => {
    playUISound();
    showPokemon(pokemon);
    closeModal(elements.pokedexModal);
  });
  
  return item;
}

function updatePaginationInfo() {
  const start = (state.currentPage - 1) * state.itemsPerPage + 1;
  const end = Math.min(state.currentPage * state.itemsPerPage, state.pokemonData.length);
  elements.paginationInfo.textContent = `Showing ${start}-${end} of ${state.pokemonData.length}`;
}

// ===== POKÉMON DISPLAY FUNCTIONS =====
async function showPokemon(pokemon) {
  state.currentPokemon = pokemon;
  state.isRevealed = true;
  
  // Load details if not already loaded
  if (!pokemon.types) {
    const details = await loadPokemonDetails(pokemon);
    if (details) Object.assign(pokemon, details);
  }
  
  // Update card display
  elements.pokemonImage.onload = () => {
    elements.pokemonImage.classList.remove('hidden');
    animateCardReveal();
  };
  
  elements.pokemonImage.classList.add('hidden');
  elements.pokemonImage.src = pokemon.imageUrl;
  elements.pokemonImage.alt = pokemon.name;
  elements.pokemonName.textContent = pokemon.name;
  elements.pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
  
  // Display types
  displayPokemonTypes(pokemon.types);
  
  // Play cry
  playPokemonCry(pokemon.cryUrl);
  
  // Update UI
  elements.instructions.textContent = 'Click to reveal another Pokémon';
  elements.detailsBtn.classList.remove('hidden');
  
  // Flip card if not already flipped
  if (!elements.card.classList.contains('flipped')) {
    flipCard();
  }
}

function displayPokemonTypes(types) {
  elements.pokemonTypes.innerHTML = types.map(type => `
    <span class="type-icon" style="background-color: ${getTypeColor(type)}">
      ${type.toUpperCase()}
    </span>
  `).join('');
}

function animateCardReveal() {
  // Create particle effect
  for (let i = 0; i < 20; i++) {
    createParticle();
  }
  
  // Add shine effect
  elements.cardFront.classList.add('revealed');
  setTimeout(() => {
    elements.cardFront.classList.remove('revealed');
  }, 1000);
}

function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.backgroundColor = getRandomParticleColor();
  document.body.appendChild(particle);
  
  // Random position around card
  const cardRect = elements.card.getBoundingClientRect();
  const x = cardRect.left + cardRect.width / 2;
  const y = cardRect.top + cardRect.height / 2;
  
  // Animate
  const angle = Math.random() * Math.PI * 2;
  const distance = 50 + Math.random() * 100;
  const duration = 0.5 + Math.random() * 0.5;
  
  const animation = particle.animate([
    { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
    { transform: `translate(${x + Math.cos(angle) * distance}px, ${y + Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
  ], {
    duration: duration * 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  });
  
  animation.onfinish = () => particle.remove();
}

// ===== CARD FUNCTIONS =====
function flipCard() {
  playSound(audio.cardFlipSound);
  elements.card.classList.add('flipped');
  
  setTimeout(() => {
    elements.cardFront.classList.remove('hidden');
    elements.cardBack.classList.add('hidden');
  }, 300);
}

function resetCard() {
  elements.card.classList.remove('flipped');
  elements.cardFront.classList.add('hidden');
  elements.cardBack.classList.remove('hidden');
  elements.pokemonImage.classList.add('hidden');
  elements.detailsBtn.classList.add('hidden');
}

// ===== UTILITY FUNCTIONS =====
function formatPokemonName(name) {
  return name.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}

function getTypeColor(type) {
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
  return typeColors[type] || '#777777';
}

function getRandomParticleColor() {
  const colors = ['#FF0000', '#FFDE59', '#FFFFFF', '#000000'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
  // Card interaction
  elements.card.addEventListener('click', handleCardClick);
  elements.card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handleCardClick();
  });
  
  // Details button
  elements.detailsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPokemonDetails(state.currentPokemon);
  });
  
  // New Pokémon button
  elements.newPokemonBtn.addEventListener('click', getRandomPokemon);
  
  // Pokédex button
  elements.pokedexBtn.addEventListener('click', () => {
    playUISound();
    openModal(elements.pokedexModal);
  });
  
  // Search functionality
  elements.pokedexSearch.addEventListener('input', filterPokedex);
  elements.typeFilter.addEventListener('change', filterPokedex);
  
  // Random Pokémon button
  elements.randomPokemonBtn.addEventListener('click', () => {
    playUISound();
    const visibleItems = document.querySelectorAll('.pokedex-item:not([style*="display: none"])');
    if (visibleItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * visibleItems.length);
      visibleItems[randomIndex].click();
    }
  });
  
  // Load more button
  elements.loadMoreBtn.addEventListener('click', () => {
    state.currentPage++;
    loadPokedexPage();
  });
  
  // Close buttons
  elements.closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });
  
  // Modal background click
  elements.pokedexModal.addEventListener('click', (e) => {
    if (e.target === elements.pokedexModal) closeModal(elements.pokedexModal);
  });
  
  // Music toggle
  elements.musicToggle.addEventListener('click', toggleMusic);
  
  // Sound toggle
  elements.soundToggle.addEventListener('click', toggleSound);
  
  // Try to play background music on first interaction
  document.addEventListener('click', tryPlayBackgroundMusic, { once: true });
}

function handleCardClick() {
  if (!state.isRevealed) {
    showPokemon(getRandomPokemon());
  } else {
    resetCard();
    state.isRevealed = false;
    elements.instructions.textContent = 'Click to reveal a Pokémon';
  }
}

function filterPokedex() {
  const searchTerm = elements.pokedexSearch.value.toLowerCase();
  const typeFilter = elements.typeFilter.value;
  
  document.querySelectorAll('.pokedex-item').forEach(item => {
    const name = item.querySelector('h3').textContent.toLowerCase();
    const types = item.dataset.types.split(',');
    
    const matchesSearch = name.includes(searchTerm);
    const matchesType = !typeFilter || types.includes(typeFilter);
    
    item.style.display = matchesSearch && matchesType ? 'flex' : 'none';
  });
  
  // Update random button availability
  const visibleItems = document.querySelectorAll('.pokedex-item:not([style*="display: none"])');
  elements.randomPokemonBtn.disabled = visibleItems.length === 0;
}

// ===== AUDIO FUNCTIONS =====
function playSound(audioElement) {
  if (!state.isSoundOn) return;
  
  audioElement.currentTime = 0;
  audioElement.play().catch(e => console.log('Audio play failed:', e));
}

function playUISound() {
  playSound(audio.uiSound);
}

function playPokemonCry(url) {
  if (!state.isSoundOn) return;
  
  audio.pokemonCry.src = url;
  audio.pokemonCry.play().catch(e => console.log('Pokémon cry play failed:', e));
}

function toggleMusic() {
  playUISound();
  state.isMusicOn = !state.isMusicOn;
  
  if (state.isMusicOn) {
    audio.backgroundMusic.play();
    elements.musicStatus.textContent = 'ON';
  } else {
    audio.backgroundMusic.pause();
    elements.musicStatus.textContent = 'OFF';
  }
}

function toggleSound() {
  playUISound();
  state.isSoundOn = !state.isSoundOn;
  elements.soundStatus.textContent = state.isSoundOn ? 'ON' : 'OFF';
}

function tryPlayBackgroundMusic() {
  if (state.isMusicOn) {
    audio.backgroundMusic.play().catch(e => {
      console.log('Autoplay prevented, will play after user interaction');
      elements.musicStatus.textContent = 'OFF';
      state.isMusicOn = false;
    });
  }
}

// ===== UI FUNCTIONS =====
function showLoading(container, count) {
  container.innerHTML = Array(count).fill(`
    <div class="pokedex-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text-short"></div>
    </div>
  `).join('');
}

function showError(message, container = document.body) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  container.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.remove();
  }, 3000);
}

function updateLoadingProgress(percent, message) {
  elements.loadingProgress.style.width = `${percent}%`;
  if (message) elements.loadingText.textContent = message;
}

function hideLoadingScreen() {
  elements.loadingScreen.style.opacity = '0';
  setTimeout(() => {
    elements.loadingScreen.style.display = 'none';
    document.body.classList.add('loaded');
  }, 500);
}

function openModal(modal) {
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  playUISound();
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===== POKÉMON DETAILS MODAL =====
async function showPokemonDetails(pokemon) {
  playUISound();
  
  // Load complete details if not already loaded
  if (!pokemon.stats) {
    const details = await loadPokemonDetails(pokemon);
    if (details) Object.assign(pokemon, details);
  }
  
  // Create modal content
  elements.pokemonModalContent.innerHTML = `
    <div class="pokemon-modal-header">
      <h2>${pokemon.name}</h2>
      <p class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</p>
      <div class="types-container">
        ${pokemon.types.map(type => `
          <span class="type-icon" style="background-color: ${getTypeColor(type)}">
            ${type.toUpperCase()}
          </span>
        `).join('')}
      </div>
    </div>
    
    <div class="pokemon-modal-body">
      <div class="pokemon-image-container">
        <img src="${pokemon.imageUrl}" alt="${pokemon.name}">
      </div>
      
      <div class="pokemon-stats-container">
        <h3>Stats</h3>
        <div class="stats-grid">
          ${Object.entries(pokemon.stats).map(([stat, value]) => `
            <div class="stat-row">
              <span class="stat-name">${stat.toUpperCase()}</span>
              <progress class="stat-value" value="${value}" max="255"></progress>
              <span class="stat-number">${value}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="pokemon-info">
          <div class="info-item">
            <span class="info-label">Height:</span>
            <span class="info-value">${pokemon.height} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Weight:</span>
            <span class="info-value">${pokemon.weight} kg</span>
          </div>
          <div class="info-item">
            <span class="info-label">Abilities:</span>
            <span class="info-value">${pokemon.abilities.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  openModal(elements.pokemonModal);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', init);