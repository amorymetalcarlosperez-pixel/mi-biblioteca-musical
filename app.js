const API = "https://script.google.com/macros/s/AKfycby1XI2MzMSQ9X6JmdQFWAZq8kbT2a-wl-4W_bXfgCtNOY7eULl42QLUvpz9t_cd55pq/exec";

const albumsContainer = document.getElementById("albums");
const buscador = document.getElementById("buscador");
let cancionesGlobal = [];

function render(canciones){
  albumsContainer.innerHTML = "";
  
  if (canciones.length === 0) {
    albumsContainer.innerHTML = "<p class='no-results'>No se encontraron canciones</p>";
    return;
  }
  
  const albums = {};
  canciones.forEach(c => {
    if (!albums[c.album]) {
      albums[c.album] = {
        portada: c.portada,
        canciones: []
      };
    }
    albums[c.album].canciones.push(c);
  });

  Object.keys(albums).forEach(album => {
    const bloque = document.createElement("div");
    bloque.className = "album";
    bloque.innerHTML = `
      <div class="album-header">
        <img src="${albums[album].portada}" alt="${album}">
        <div>
          <h2>${album}</h2>
          <p>${albums[album].canciones.length} canciones</p>
        </div>
      </div>
    `;
    albums[album].canciones.forEach(c => {
      // Validar que el enlace exista y sea válido
      const enlaceValido = c.enlace && (c.enlace.startsWith('http') || c.enlace.startsWith('blob:'));
      bloque.innerHTML += `
        <div class="cancion">
          <h3>${c.titulo}</h3>
          <p class="artista">${c.artista || 'Artista desconocido'}</p>
          ${enlaceValido ? `
            <audio controls crossorigin="anonymous">
              <source src="${c.enlace}" type="audio/mpeg">
              Tu navegador no soporta reproducción de audio.
            </audio>
          ` : `<p class="error">❌ Enlace de audio no disponible</p>`}
        </div>
      `;
    });
    albumsContainer.appendChild(bloque);
  });
}

// Cargar datos del API con manejo de errores
fetch(API)
  .then(r => {
    if (!r.ok) throw new Error(`Error HTTP: ${r.status}`);
    return r.json();
  })
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No hay canciones disponibles');
    }
    cancionesGlobal = data;
    console.log(`✅ Se cargaron ${data.length} canciones`);
    render(data);
  })
  .catch(error => {
    console.error('❌ Error al cargar las canciones:', error);
    albumsContainer.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Error al cargar las canciones</h2>
        <p>${error.message}</p>
        <p>Verifica que el API de Google Sheets esté compartido públicamente.</p>
      </div>
    `;
  });

// Búsqueda con debounce
let searchTimeout;
buscador.addEventListener("input", e => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const texto = e.target.value.toLowerCase();
    const filtradas = texto === "" 
      ? cancionesGlobal 
      : cancionesGlobal.filter(c =>
          (c.titulo && c.titulo.toLowerCase().includes(texto)) ||
          (c.album && c.album.toLowerCase().includes(texto)) ||
          (c.artista && c.artista.toLowerCase().includes(texto))
        );
    render(filtradas);
  }, 300);
});
