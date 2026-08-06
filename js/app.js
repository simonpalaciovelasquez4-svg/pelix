const formulario = document.getElementById("formPelicula");
const listaPeliculas = document.getElementById("listaPeliculas");
const buscar = document.getElementById("buscar");
const filtroGenero = document.getElementById("filtroGenero");
const limpiarFiltro = document.getElementById("limpiarFiltro");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const formLogin = document.getElementById("formLogin");
const formRegister = document.getElementById("formRegister");
const loginUsuario = document.getElementById("loginUsuario");
const loginPassword = document.getElementById("loginPassword");
const registerUsuario = document.getElementById("registerUsuario");
const registerPassword = document.getElementById("registerPassword");
const userBadge = document.getElementById("userBadge");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeTitle = document.getElementById("welcomeTitle");
const infoSubtitle = document.getElementById("infoSubtitle");
const formTitle = document.getElementById("formTitle");
const ratingModalEl = document.getElementById("ratingModal");
const ratingTitle = document.getElementById("ratingTitle");
const ratingForm = document.getElementById("ratingForm");
const ratingInput = document.getElementById("ratingInput");

let peliculas = [];
let usuarios = [];
let usuarioActivo = null;
let ratingModal = null;
let peliculaCalificarId = null;

window.addEventListener("DOMContentLoaded", () => {
  ratingModal = new bootstrap.Modal(ratingModalEl);
  cargarDatos();
  configurarEventos();
  verificarSesion();
  mostrarPeliculas();
});

function cargarDatos() {
  const peliculasGuardadas = localStorage.getItem("peliculas");
  const usuariosGuardados = localStorage.getItem("usuarios");

  if (peliculasGuardadas) {
    peliculas = JSON.parse(peliculasGuardadas);
  }
  if (usuariosGuardados) {
    usuarios = JSON.parse(usuariosGuardados);
  }

  if (!peliculas.length) {
    peliculas = [
      {
        id: Date.now() + 1,
        titulo: "El viaje fantástico",
        director: "Lucía Fernández",
        genero: "Ciencia Ficción",
        anio: "2022",
        imagen: "https://cuentosdiarios.com/wp-content/uploads/2025/02/cuentos-de-magia.webp",
        calificaciones: [8, 9, 7]
      },
      {
        id: Date.now() + 2,
        titulo: "Risas en la ciudad",
        director: "Pedro Gómez",
        genero: "Comedia",
        anio: "2021",
        imagen: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
        calificaciones: [7, 8]
      },
      {
        id: Date.now() + 3,
        titulo: "Sombras del pasado",
        director: "Ana Ruiz",
        genero: "Drama",
        anio: "2020",
        imagen: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
        calificaciones: [9, 9, 8]
      }
    ];
    guardarPeliculas();
  }

  if (!usuarios.length) {
    usuarios = [
      { usuario: "admin", password: "admin123", rol: "admin" },
      { usuario: "usuario", password: "usuario123", rol: "user" }
    ];
    guardarUsuarios();
  }
}

function guardarPeliculas() {
  localStorage.setItem("peliculas", JSON.stringify(peliculas));
}

function guardarUsuarios() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function guardarSesion() {
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
}

function cargarSesion() {
  const sesion = localStorage.getItem("usuarioActivo");
  if (sesion) {
    usuarioActivo = JSON.parse(sesion);
  }
}

function configurarEventos() {
  formLogin.addEventListener("submit", iniciarSesion);
  formRegister.addEventListener("submit", registrarUsuario);
  formulario.addEventListener("submit", guardarPelicula);
  buscar.addEventListener("input", mostrarPeliculas);
  filtroGenero.addEventListener("change", mostrarPeliculas);
  limpiarFiltro.addEventListener("click", (e) => {
    e.preventDefault();
    buscar.value = "";
    filtroGenero.value = "";
    mostrarPeliculas();
  });
  logoutBtn.addEventListener("click", cerrarSesion);
  ratingForm.addEventListener("submit", enviarCalificacion);
}

function verificarSesion() {
  cargarSesion();
  if (usuarioActivo) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  authSection.classList.remove("d-none");
  appSection.classList.add("d-none");
}

function mostrarApp() {
  authSection.classList.add("d-none");
  appSection.classList.remove("d-none");
  userBadge.textContent = `${usuarioActivo.usuario} (${usuarioActivo.rol})`;

  if (usuarioActivo.rol === "admin") {
    formulario.querySelector("button").disabled = false;
    formTitle.textContent = "Nueva película";
    infoSubtitle.textContent = "Administra el catálogo de películas desde el formulario.";
  } else {
    formulario.querySelector("button").disabled = true;
    formTitle.textContent = "Solo administrador puede cambiar películas";
    infoSubtitle.textContent = "Busca, filtra y califica películas como usuario.";
  }

  welcomeTitle.textContent = `Bienvenido, ${usuarioActivo.usuario}`;
  mostrarPeliculas();
}

function iniciarSesion(event) {
  event.preventDefault();
  const usuario = loginUsuario.value.trim();
  const password = loginPassword.value.trim();

  const registro = usuarios.find(u => u.usuario === usuario && u.password === password);
  if (!registro) {
    alert("Usuario o contraseña inválidos.");
    return;
  }

  usuarioActivo = { usuario: registro.usuario, rol: registro.rol };
  guardarSesion();
  formLogin.reset();
  mostrarApp();
}

function registrarUsuario(event) {
  event.preventDefault();
  const usuario = registerUsuario.value.trim();
  const password = registerPassword.value.trim();

  if (!usuario || !password) {
    alert("Completa usuario y contraseña.");
    return;
  }

  const existe = usuarios.some(u => u.usuario === usuario);
  if (existe) {
    alert("El usuario ya existe. Usa otro nombre.");
    return;
  }

  usuarios.push({ usuario, password, rol: "user" });
  guardarUsuarios();
  formRegister.reset();
  alert("Usuario registrado. Inicia sesión para continuar.");
}

function cerrarSesion() {
  usuarioActivo = null;
  localStorage.removeItem("usuarioActivo");
  mostrarLogin();
}

function obtenerPeliculasFiltradas() {
  let resultado = [...peliculas];
  const termino = buscar.value.trim().toLowerCase();
  const genero = filtroGenero.value;

  if (termino) {
    resultado = resultado.filter(p =>
      p.titulo.toLowerCase().includes(termino) ||
      p.director.toLowerCase().includes(termino) ||
      p.genero.toLowerCase().includes(termino)
    );
  }

  if (genero) {
    resultado = resultado.filter(p => p.genero === genero);
  }

  return resultado;
}

function guardarPelicula(e) {
  e.preventDefault();
  if (!usuarioActivo || usuarioActivo.rol !== "admin") {
    alert("Solo el administrador puede agregar o editar películas.");
    return;
  }

  const id = document.getElementById("id").value;
  const titulo = document.getElementById("titulo").value.trim();
  const director = document.getElementById("director").value.trim();
  const genero = document.getElementById("genero").value;
  const anio = document.getElementById("anio").value.trim();
  const imagen = document.getElementById("imagen").value.trim();

  if (!titulo || !director) {
    alert("El título y director son obligatorios.");
    return;
  }

  const pelicula = {
    id: id || Date.now(),
    titulo,
    director,
    genero,
    anio,
    imagen,
    calificaciones: []
  };

  if (id) {
    const indice = peliculas.findIndex(p => p.id == id);
    const calificacionesActuales = peliculas[indice]?.calificaciones || [];
    peliculas[indice] = { ...peliculas[indice], ...pelicula, calificaciones: calificacionesActuales };
  } else {
    peliculas.push(pelicula);
  }

  guardarPeliculas();
  mostrarPeliculas();
  formulario.reset();
  document.getElementById("id").value = "";
}

function mostrarPeliculas() {
  listaPeliculas.innerHTML = "";
  const peliculasMostrar = obtenerPeliculasFiltradas();

  if (peliculasMostrar.length === 0) {
    listaPeliculas.innerHTML = `
      <div class="sin-peliculas col-12">
        🎬 No hay películas para mostrar.
      </div>
    `;
    return;
  }

  peliculasMostrar.forEach(pelicula => {
    const promedio = calcularPromedio(pelicula.calificaciones);
    const estrellas = crearEstrellas(promedio);
    const botonesAdmin = usuarioActivo && usuarioActivo.rol === "admin"
      ? `
          <button class="btn btn-warning" onclick="editarPelicula(${pelicula.id})">Editar</button>
          <button class="btn btn-danger eliminar" onclick="eliminarPelicula(${pelicula.id})">Eliminar</button>
        `
      : "";

    listaPeliculas.innerHTML += `
      <div class="col-md-6">
        <div class="movie-card">
          <img src="${pelicula.imagen || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'}" alt="${pelicula.titulo}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80';">
          <div class="movie-body">
            <h3>${pelicula.titulo}</h3>
            <p><strong>Director:</strong> ${pelicula.director}</p>
            <p><strong>Género:</strong> ${pelicula.genero}</p>
            <p><strong>Año:</strong> ${pelicula.anio || 'N/A'}</p>
            <div class="rating-display">${estrellas} <span>${promedio.toFixed(1)} / 10</span></div>
            <div class="acciones">
              ${botonesAdmin}
              <button class="btn btn-outline-light" onclick="mostrarModalCalificar(${pelicula.id})">Calificar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function calcularPromedio(calificaciones = []) {
  if (!calificaciones.length) return 0;
  const total = calificaciones.reduce((sum, score) => sum + Number(score), 0);
  return total / calificaciones.length;
}

function crearEstrellas(promedio) {
  const count = Math.round(promedio / 2);
  const fullStars = "★".repeat(count);
  const emptyStars = "☆".repeat(5 - count);
  return `<span class="stars">${fullStars}${emptyStars}</span>`;
}

window.editarPelicula = function (id) {
  if (!usuarioActivo || usuarioActivo.rol !== "admin") {
    alert("Solo el administrador puede editar películas.");
    return;
  }
  const pelicula = peliculas.find(p => p.id == id);
  if (!pelicula) return;
  document.getElementById("id").value = pelicula.id;
  document.getElementById("titulo").value = pelicula.titulo;
  document.getElementById("director").value = pelicula.director;
  document.getElementById("genero").value = pelicula.genero;
  document.getElementById("anio").value = pelicula.anio;
  document.getElementById("imagen").value = pelicula.imagen;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.eliminarPelicula = function (id) {
  if (!usuarioActivo || usuarioActivo.rol !== "admin") {
    alert("Solo el administrador puede eliminar películas.");
    return;
  }
  const respuesta = confirm("¿Eliminar esta película?");
  if (!respuesta) return;
  peliculas = peliculas.filter(p => p.id != id);
  guardarPeliculas();
  mostrarPeliculas();
};

function enviarCalificacion(event) {
  event.preventDefault();
  const valor = Number(ratingInput.value);
  if (Number.isNaN(valor) || valor < 1 || valor > 10) {
    alert("Ingresa un número entre 1 y 10.");
    return;
  }

  const pelicula = peliculas.find(p => p.id == peliculaCalificarId);
  if (!pelicula) return;
  pelicula.calificaciones = pelicula.calificaciones || [];
  pelicula.calificaciones.push(valor);
  guardarPeliculas();
  mostrarPeliculas();
  ratingModal.hide();
}

window.mostrarModalCalificar = function (id) {
  if (!usuarioActivo) {
    alert("Inicia sesión para calificar.");
    return;
  }
  const pelicula = peliculas.find(p => p.id == id);
  if (!pelicula) return;
  peliculaCalificarId = id;
  ratingTitle.textContent = `Califica ${pelicula.titulo}`;
  ratingInput.value = "";
  ratingModal.show();
};
