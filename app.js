const API = "https://script.google.com/macros/s/AKfycby1XI2MzMSQ9X6JmdQFWAZq8kbT2a-wl-4W_bXfgCtNOY7eULl42QLUvpz9t_cd55pq/exec";

const albumsContainer = document.getElementById("albums");
const buscador = document.getElementById("buscador");
let cancionesGlobal = [];

function render(canciones){
  albumsContainer.innerHTML = "";
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
        <img src="${albums[album].portada}">
        <div>
          <h2>${album}</h2>
          <p>${albums[album].canciones.length} canciones</p>
        </div>
      </div>
    `;
    albums[album].canciones.forEach(c => {
      bloque.innerHTML += `
        <div class="cancion">
          <h3>${c.titulo}</h3>
          <audio controls>
            <source src="${c.enlace}" type="audio/mpeg">
          </audio>
        </div>
      `;
    });
    albumsContainer.appendChild(bloque);
  });
}

fetch(API)
  .then(r => r.json())
  .then(data => {
    cancionesGlobal = data;
    render(data);
  });

buscador.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();
  const filtradas = cancionesGlobal.filter(c =>
    c.titulo.toLowerCase().includes(texto) ||
    c.album.toLowerCase().includes(texto)
  );
  render(filtradas);
});
