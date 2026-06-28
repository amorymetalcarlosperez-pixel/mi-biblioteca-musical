const API = "https://script.google.com/macros/s/AKfycby1XI2MzMSQ9X6JmdQFWAZq8kbT2a-wl-4W_bXfgCtNOY7eULl42QLUvpz9t_cd55pq/exec";

const albumsContainer = document.getElementById("albums");
const buscador = document.getElementById("buscador");
let cancionesGlobal = [];

// Función para limpiar y validar enlaces de Google Drive
function limpiarEnlaceGoogleDrive(enlace) {
  if (!enlace) return null;
  
  // Si es un enlace de Google Drive de vista previa
  if (enlace.includes('drive.google.com') && enlace.includes('/view')) {
    const fileId = enlace.match(/[-\w]{25,}/);
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId[0]}`;
    }
  }
  
  // Si es un enlace directo de descarga de Google Drive
  if (enlace.includes('drive.google.com') && enlace.includes('export=download')) {
    return enlace;
  }
  
  // Si es cualquier otro enlace HTTP válido
  if (enlace.startsWith('http')) {
    return enlace;
  }
  
  return null;
}

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
        <img src="${albums[album].portada}" alt="${album}" onerror="this.src='https://via.placeholder.com/180?text=No+Portada'">
        <div>
          <h2>${album}</h2>
          <p>${albums[album].canciones.length} canciones</p>
        </div>
      </div>
    `;
    albums[album].canciones.forEach((c, idx) => {
      // Validar y limpiar el enlace
      const enlace = limpiarEnlaceGoogleDrive(c.enlace);
      
      bloque.innerHTML += `
        <div class="cancion">
          <h3>${c.titulo}</h3>
          <p class="artista">${c.artista || 'Artista desconocido'}</p>
          ${enlace ? `
            <audio controls controlsList="nodownload" style="width: 100%;">
              <source src="${enlace}" type="audio/mpeg">
              Tu navegador no soporta reproducción de audio.
            </audio>
            <p class="debug">🔗 Enlace: ${enlace.substring(0, 50)}...</p>
          ` : `<p class="error">❌ Enlace de audio no disponible${c.enlace ? '<br><small>Formato: ' + c.enlace.substring(0, 40) + '...</small>' : ''}</p>`}
        </div>
      `;
    });
    albumsContainer.appendChild(bloque);
  });
}

// Cargar datos del API con manejo de errores mejorado
fetch(API)
  .then(r => {
    console.log('📡 Respuesta HTTP:', r.status, r.statusText);
    if (!r.ok) throw new Error(`Error HTTP: ${r.status} ${r.statusText}`);
    return r.json();
  })
  .then(data => {
    console.log('📊 Datos recibidos del API:', data);
    console.log('📊 Tipo de dato:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('📊 Cantidad:', Array.isArray(data) ? data.length : 'N/A');
    
    // Si data es un objeto con propiedad que contiene el array
    let canciones = data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        console.log('📊 Array encontrado en propiedad:', firstKey);
        canciones = data[firstKey];
      }
    }
    
    if (!Array.isArray(canciones) || canciones.length === 0) {
      throw new Error('No hay canciones disponibles o formato incorrecto');
    }
    
    cancionesGlobal = canciones;
    console.log(`✅ Se cargaron ${canciones.length} canciones correctamente`);
    
    // Mostrar primer elemento para debugueo
    if (canciones.length > 0) {
      console.log('🎵 Primer elemento:', canciones[0]);
    }
    
    render(canciones);
  })
  .catch(error => {
    console.error('❌ Error al cargar las canciones:', error);
    console.error('Stack:', error.stack);
    
    albumsContainer.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Error al cargar las canciones</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Posibles causas:</strong></p>
        <ul style="text-align: left; display: inline-block;">
          <li>El API de Google Sheets no está compartido públicamente</li>
          <li>El formato del JSON devuelto no es correcto</li>
          <li>No hay datos en el Google Sheet</li>
          <li>Problema de CORS o conectividad</li>
        </ul>
        <p style="margin-top: 20px;">📋 <strong>Abre la consola (F12)</strong> para ver detalles técnicos</p>
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
