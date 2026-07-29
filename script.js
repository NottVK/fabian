/* cursor personalizado */
const cursoPunto  = document.getElementById('cursor-punto');
const cursoAnillo = document.getElementById('cursor-anillo');
let ratonX = 0, ratonY = 0, anilloX = 0, anilloY = 0;

document.addEventListener('mousemove', function(e) {
  ratonX = e.clientX;
  ratonY = e.clientY;
  cursoPunto.style.left = ratonX + 'px';
  cursoPunto.style.top  = ratonY + 'px';
});

(function animarAnillo() {
  anilloX += (ratonX - anilloX) * 0.12;
  anilloY += (ratonY - anilloY) * 0.12;
  cursoAnillo.style.left = anilloX + 'px';
  cursoAnillo.style.top  = anilloY + 'px';
  requestAnimationFrame(animarAnillo);
})();

function activarCursorHover(elemento) {
  elemento.addEventListener('mouseenter', function() {
    cursoPunto.style.transform  = 'translate(-50%, -50%) scale(2.5)';
    cursoAnillo.style.width      = '50px';
    cursoAnillo.style.height     = '50px';
    cursoAnillo.style.borderColor = 'rgba(196, 30, 58, 0.7)';
  });
  elemento.addEventListener('mouseleave', function() {
    cursoPunto.style.transform  = 'translate(-50%, -50%) scale(1)';
    cursoAnillo.style.width      = '30px';
    cursoAnillo.style.height     = '30px';
    cursoAnillo.style.borderColor = 'rgba(196, 30, 58, 0.5)';
  });
}

document.querySelectorAll('a, button, .tarjeta-coleccion').forEach(activarCursorHover);

/* navbar con fondo al hacer scroll */
const barraPrincipal = document.getElementById('barra-principal');
window.addEventListener('scroll', function() {
  if (window.scrollY > 80) {
    barraPrincipal.classList.add('con-fondo');
  } else {
    barraPrincipal.classList.remove('con-fondo');
  }
});

/* revelado de elementos al hacer scroll */
const observadorScroll = new IntersectionObserver(function(entradas) {
  entradas.forEach(function(entrada) {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.elemento-revelado').forEach(function(elemento) {
  observadorScroll.observe(elemento);
});

/* carrusel de colecciones */
const pistaCarrusel     = document.getElementById('pista-carrusel');
const flechaAnterior    = document.getElementById('flecha-anterior');
const flechaSiguiente   = document.getElementById('flecha-siguiente');
const contenedorPuntos  = document.getElementById('puntos-carrusel');
const columnasCarrusel  = pistaCarrusel ? Array.from(pistaCarrusel.children) : [];

let indiceActual = 0;
let porVista = 3;

function calcularPorVista() {
  const ancho = window.innerWidth;
  if (ancho <= 640) return 1;
  if (ancho <= 991) return 2;
  return 3;
}

function totalPaginas() {
  return Math.max(1, columnasCarrusel.length - porVista + 1);
}

function construirPuntos() {
  if (!contenedorPuntos) return;
  contenedorPuntos.innerHTML = '';
  const paginas = totalPaginas();
  for (let i = 0; i < paginas; i++) {
    const punto = document.createElement('button');
    punto.type = 'button';
    punto.className = 'punto-carrusel' + (i === indiceActual ? ' activo' : '');
    punto.setAttribute('aria-label', 'Ir a la tarjeta ' + (i + 1));
    punto.addEventListener('click', function() {
      indiceActual = i;
      actualizarCarrusel();
    });
    activarCursorHover(punto);
    contenedorPuntos.appendChild(punto);
  }
}

function actualizarCarrusel() {
  if (!pistaCarrusel || columnasCarrusel.length === 0) return;

  porVista = calcularPorVista();
  const maxIndice = totalPaginas() - 1;
  if (indiceActual > maxIndice) indiceActual = maxIndice;
  if (indiceActual < 0) indiceActual = 0;

  const anchoColumna = columnasCarrusel[0].getBoundingClientRect().width;
  const estiloComputado = getComputedStyle(pistaCarrusel);
  const espacio = parseFloat(estiloComputado.gap) || 0;
  const desplazamiento = indiceActual * (anchoColumna + espacio);

  pistaCarrusel.style.transform = 'translateX(-' + desplazamiento + 'px)';

  if (flechaAnterior) flechaAnterior.disabled = indiceActual === 0;
  if (flechaSiguiente) flechaSiguiente.disabled = indiceActual >= maxIndice;

  if (contenedorPuntos) {
    Array.from(contenedorPuntos.children).forEach(function(punto, i) {
      punto.classList.toggle('activo', i === indiceActual);
    });
  }
}

if (flechaSiguiente) {
  flechaSiguiente.addEventListener('click', function() {
    indiceActual++;
    actualizarCarrusel();
  });
}

if (flechaAnterior) {
  flechaAnterior.addEventListener('click', function() {
    indiceActual--;
    actualizarCarrusel();
  });
}

window.addEventListener('resize', function() {
  construirPuntos();
  actualizarCarrusel();
});

if (pistaCarrusel) {
  construirPuntos();
  actualizarCarrusel();
}

/* modal de detalle de colección */
const overlayModal      = document.getElementById('overlay-modal');
const cerrarModalBoton   = document.getElementById('cerrar-modal');
const imagenModal        = document.getElementById('imagen-modal');
const categoriaModal     = document.getElementById('categoria-modal');
const tituloModal        = document.getElementById('titulo-modal');
const descripcionModal   = document.getElementById('descripcion-modal');
const piezasModal        = document.getElementById('piezas-modal');
const telaModal          = document.getElementById('tela-modal');

function abrirModal(tarjeta) {
  const datos = tarjeta.dataset;

  imagenModal.className = 'imagen-modal ' + (datos.imagen || '');
  imagenModal.style.backgroundImage = datos.imagenSrc ? 'url(' + datos.imagenSrc + ')' : '';
  categoriaModal.textContent   = datos.categoria || '';
  tituloModal.textContent      = datos.titulo || '';
  descripcionModal.textContent = datos.detalle || datos.descripcion || '';
  piezasModal.textContent      = datos.piezas || '—';
  telaModal.textContent        = datos.tela || '—';

  overlayModal.classList.add('activo');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  overlayModal.classList.remove('activo');
  document.body.style.overflow = '';
}

document.querySelectorAll('.tarjeta-coleccion').forEach(function(tarjeta) {
  tarjeta.addEventListener('click', function() {
    abrirModal(tarjeta);
  });
  tarjeta.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirModal(tarjeta);
    }
  });
});

if (cerrarModalBoton) cerrarModalBoton.addEventListener('click', cerrarModal);

if (overlayModal) {
  overlayModal.addEventListener('click', function(e) {
    if (e.target === overlayModal) cerrarModal();
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') cerrarModal();
});

/* menú móvil */
const botonHamburguesa = document.getElementById('boton-hamburguesa');
const overlayMenuMovil = document.getElementById('overlay-menu-movil');
const cerrarMenuMovilBoton = document.getElementById('cerrar-menu-movil');

function abrirMenuMovil() {
  overlayMenuMovil.classList.add('activo');
  botonHamburguesa.classList.add('activo');
  botonHamburguesa.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function cerrarMenuMovil() {
  overlayMenuMovil.classList.remove('activo');
  botonHamburguesa.classList.remove('activo');
  botonHamburguesa.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (botonHamburguesa) {
  botonHamburguesa.addEventListener('click', function() {
    if (overlayMenuMovil.classList.contains('activo')) {
      cerrarMenuMovil();
    } else {
      abrirMenuMovil();
    }
  });
}

if (cerrarMenuMovilBoton) cerrarMenuMovilBoton.addEventListener('click', cerrarMenuMovil);

document.querySelectorAll('.enlace-nav-movil').forEach(function(enlace) {
  enlace.addEventListener('click', cerrarMenuMovil);
  activarCursorHover(enlace);
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && overlayMenuMovil && overlayMenuMovil.classList.contains('activo')) {
    cerrarMenuMovil();
  }
});

/* formulario de contacto */
const formularioContacto = document.getElementById('formulario-contacto');
const mensajeEstadoFormulario = document.getElementById('mensaje-estado-formulario');

if (formularioContacto) {
  formularioContacto.addEventListener('submit', function(e) {
    e.preventDefault();

    const botonEnviar = formularioContacto.querySelector('.boton-enviar-mensaje');
    const datos = new FormData(formularioContacto);

    botonEnviar.disabled = true;
    botonEnviar.textContent = 'Enviando...';
    mensajeEstadoFormulario.textContent = '';
    mensajeEstadoFormulario.className = 'mensaje-estado-formulario mt-3 mb-0 text-center';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: datos
    })
      .then(function(respuesta) { return respuesta.json(); })
      .then(function(resultado) {
        if (resultado.success) {
          formularioContacto.reset();
          mensajeEstadoFormulario.textContent = 'Mensaje enviado. Te contactaremos pronto.';
          mensajeEstadoFormulario.classList.add('exito');
        } else {
          mensajeEstadoFormulario.textContent = 'No se pudo enviar el mensaje. Intenta de nuevo.';
          mensajeEstadoFormulario.classList.add('error');
        }
      })
      .catch(function() {
        mensajeEstadoFormulario.textContent = 'Error de conexión. Intenta de nuevo.';
        mensajeEstadoFormulario.classList.add('error');
      })
      .finally(function() {
        botonEnviar.disabled = false;
        botonEnviar.textContent = 'Enviar Mensaje';
      });
  });
}

/* buscador del hero */
const formularioBuscador = document.getElementById('formulario-buscador');
const campoBuscador = document.getElementById('campo-buscador');

function normalizarTexto(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

if (formularioBuscador) {
  formularioBuscador.addEventListener('submit', function(e) {
    e.preventDefault();
    const consulta = normalizarTexto(campoBuscador.value);

    if (!consulta) return;

    const tarjetaEncontrada = columnasCarrusel
      .map(function(col) { return col.querySelector('.tarjeta-coleccion'); })
      .find(function(tarjeta) {
        const datos = tarjeta.dataset;
        return normalizarTexto(datos.titulo).includes(consulta) ||
               normalizarTexto(datos.categoria).includes(consulta) ||
               normalizarTexto(datos.descripcion).includes(consulta);
      });

    if (tarjetaEncontrada) {
      const indiceEncontrado = columnasCarrusel.findIndex(function(col) {
        return col.contains(tarjetaEncontrada);
      });

      cerrarMenuMovil();
      document.getElementById('colecciones').scrollIntoView({ behavior: 'smooth', block: 'start' });

      const maxIndice = totalPaginas() - 1;
      indiceActual = Math.min(indiceEncontrado, maxIndice);
      actualizarCarrusel();

      setTimeout(function() { abrirModal(tarjetaEncontrada); }, 550);
    } else {
      formularioBuscador.classList.remove('sin-resultado');
      void formularioBuscador.offsetWidth;
      formularioBuscador.classList.add('sin-resultado');
    }
  });
}