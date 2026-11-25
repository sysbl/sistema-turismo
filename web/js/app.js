"use strict";
/* ============================================================
   Rumbo Perú · lógica de la página
   Habla con el servidor Flask (python/servidor.py):
     GET  /api/destinos    -> [{nombre_destino, tipo_interes, costo}, ...]
     POST /api/recomendar  -> {nivel, scala, prolog, coinciden, cercanos}
   ============================================================ */

// ---------- Datos fijos de la interfaz ----------
const TIPOS = {
  historia: {
    etiqueta: "Historia",
    icono: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6z"/>',
  },
  playa: {
    etiqueta: "Playa",
    icono: '<circle cx="12" cy="8" r="3.5"/><path d="M2 16c2.5-2 5-2 7.5 0s5 2 7.5 0 2.5-1 5 0M2 20.5c2.5-2 5-2 7.5 0s5 2 7.5 0 2.5-1 5 0"/>',
  },
  gastronomia: {
    etiqueta: "Gastronomía",
    icono: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9 7c0-1.5 1.5-1.5 1.5-3M13.5 7c0-1.5 1.5-1.5 1.5-3"/>',
  },
  aventura: {
    etiqueta: "Aventura",
    icono: '<path d="M2 20 9 8l4 7 3-4 6 9z"/>',
  },
  naturaleza: {
    etiqueta: "Naturaleza",
    icono: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19l8-8"/>',
  },
};

// Modo presentación: con ?tecnico=1 la página muestra el detalle de Scala y Prolog.
const TECNICO = new URLSearchParams(location.search).has("tecnico");

// Mismo criterio que Scala (ViajeroService.nivelPresupuesto)
const nivelDe = (monto) => (monto < 500 ? "bajo" : monto < 1000 ? "medio" : "alto");
// Cómo se llama cada nivel de cara al turista
const NIVEL_TEXTO = { bajo: "económico", medio: "moderado", alto: "premium" };

const TIEMPO_MAXIMO_MS = 240000; // sbt puede tardar; el servidor corta a los 180 s

// ---------- Utilidades ----------
const $ = (selector, raiz = document) => raiz.querySelector(selector);

/** "Machu Picchu" -> "machu_picchu" (igual que utils.normalizar en Python) */
const normalizar = (texto) =>
  texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");

/** "Machu Picchu" -> "machu-picchu" (nombre del archivo de la foto) */
const slug = (texto) => normalizar(texto).replace(/_/g, "-");

const soles = (n) => "S/ " + Number(n).toLocaleString("es-PE");

function svg(tipo, clase = "") {
  const contenido = TIPOS[tipo] ? TIPOS[tipo].icono : "";
  return `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${contenido}</svg>`;
}

function el(etiqueta, atributos = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (clave === "texto") nodo.textContent = valor;
    else if (clave === "html") nodo.innerHTML = valor;
    else nodo.setAttribute(clave, valor);
  }
  for (const hijo of [].concat(hijos)) if (hijo) nodo.append(hijo);
  return nodo;
}

const sinAnimaciones = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Pone la foto solo si existe; si no, queda el fondo de color con su ícono. */
function cargarFoto(nodo, ruta) {
  const prueba = new Image();
  prueba.onload = () => {
    // Ruta absoluta: una url() dentro de una variable CSS se resolvería respecto a css/
    nodo.style.setProperty("--img", `url("${new URL(ruta, document.baseURI).href}")`);
    nodo.classList.add("con-foto");
  };
  prueba.src = ruta;
}

// ---------- Estado ----------
let catalogo = [];

// ---------- Tarjeta de destino ----------
function crearFoto(destino) {
  const tipo = destino.tipo_interes;
  const foto = el("div", { class: "foto", "data-tipo": tipo, role: "img", "aria-label": `Foto de ${destino.nombre_destino}` });
  foto.innerHTML = svg(tipo, "ico") +
    `<span class="etiqueta-tipo">${svg(tipo)}${TIPOS[tipo] ? TIPOS[tipo].etiqueta : ""}</span>`;
  cargarFoto(foto, `img/${slug(destino.nombre_destino)}.jpg`);
  return foto;
}

function crearTarjeta(destino, indice = 0, quien = null, cercanos = []) {
  const foto = crearFoto(destino);

  const pie = el("div", { class: "destino-pie" });
  if (destino.costo != null) {
    pie.append(
      el("span", { class: "costo", html: `${soles(destino.costo)} <small>por persona</small>` }),
      el("span", { class: `pildora pildora-${nivelDe(destino.costo)}`, texto: NIVEL_TEXTO[nivelDe(destino.costo)] })
    );
  }

  const cuerpo = el("div", { class: "destino-cuerpo" }, [el("h3", { texto: destino.nombre_destino })]);
  if (destino.departamento) cuerpo.append(el("p", { class: "depto", texto: destino.departamento }));
  if (quien && TECNICO) {
    cuerpo.append(
      el("div", { class: "quien" }, [
        el("span", { class: quien.scala ? "" : "no", texto: quien.scala ? "✓ Scala" : "Scala: no" }),
        el("span", { class: quien.prolog ? "" : "no", texto: quien.prolog ? "✓ Prolog" : "Prolog: no" }),
      ])
    );
  }
  if (cercanos.length) {
    // Cada lugar cercano es un botón que abre su ficha, sin ir al catálogo
    const lista = el("p", { class: "cerca" }, [el("strong", { texto: "Cerca de aquí:" })]);
    cercanos.forEach((nombre) => {
      lista.append(" ", el("button", { type: "button", class: "cerca-enlace", texto: nombre, "data-destino": nombre }));
    });
    cuerpo.append(lista);
  }
  cuerpo.append(pie);

  const tarjeta = el("article", { class: "destino" }, [foto, cuerpo]);
  tarjeta.style.setProperty("--i", indice);
  return tarjeta;
}

// ---------- Ficha de un destino ----------
let presupuestoActual = null; // el de la última búsqueda, para decir si te alcanza

function abrirFicha(nombre) {
  const destino = catalogo.find((d) => d.nombre_destino === nombre);
  if (!destino) return;
  const ficha = $("#ficha");
  const cuerpo = $("#ficha-cuerpo");
  cuerpo.replaceChildren(crearFoto(destino));

  const datos = el("div", { class: "ficha-datos" }, [
    el("h3", { id: "ficha-titulo", texto: destino.nombre_destino }),
    el("p", { class: "depto", texto: destino.departamento }),
    el("div", { class: "destino-pie" }, [
      el("span", { class: "costo", html: `${soles(destino.costo)} <small>por persona</small>` }),
      el("span", { class: `pildora pildora-${nivelDe(destino.costo)}`, texto: NIVEL_TEXTO[nivelDe(destino.costo)] }),
    ]),
  ]);
  if (presupuestoActual != null && destino.costo <= presupuestoActual) {
    datos.append(el("p", { class: "ficha-alcanza", texto: `Te alcanza con tu presupuesto de ${soles(presupuestoActual)}: te sobrarían ${soles(presupuestoActual - destino.costo)}.` }));
  }
  cuerpo.append(datos);
  ficha.showModal();
}

// ---------- Catálogo ----------
function pintarCatalogo(filtro = "todos") {
  const rejilla = $("#rejilla");
  rejilla.replaceChildren();
  const lista = catalogo.filter((d) => filtro === "todos" || d.tipo_interes === filtro);
  lista.forEach((d, i) => rejilla.append(crearTarjeta(d, i)));
  $("#conteo").textContent =
    filtro === "todos"
      ? `Mostrando los ${lista.length} lugares.`
      : `${lista.length} ${lista.length === 1 ? "lugar" : "lugares"} de ${TIPOS[filtro].etiqueta.toLowerCase()}.`;
}

function pintarFiltros() {
  const caja = $("#filtros");
  caja.replaceChildren();
  const opciones = [["todos", "Todos"], ...Object.entries(TIPOS).map(([k, v]) => [k, v.etiqueta])];
  for (const [valor, texto] of opciones) {
    const boton = el("button", { type: "button", class: "filtro", "data-filtro": valor, "aria-pressed": valor === "todos" });
    boton.innerHTML = (valor === "todos" ? "" : svg(valor)) + `<span>${texto}</span>`;
    boton.addEventListener("click", () => {
      caja.querySelectorAll(".filtro").forEach((b) => b.setAttribute("aria-pressed", b === boton));
      pintarCatalogo(valor);
    });
    caja.append(boton);
  }
}

async function cargarCatalogo() {
  const rejilla = $("#rejilla");
  $("#conteo").textContent = "Cargando destinos…";
  try {
    const r = await fetch("/api/destinos");
    if (!r.ok) throw new Error(`El servidor respondió con el código ${r.status}`);
    catalogo = await r.json();
    pintarFiltros();
    pintarCatalogo();
  } catch (error) {
    $("#conteo").textContent = "";
    rejilla.replaceChildren(cajaError("No pudimos cargar los lugares", error, cargarCatalogo));
  }
}

// ---------- Buscador: controles ----------
function pintarIntereses() {
  const caja = $("#chips-interes");
  for (const [valor, datos] of Object.entries(TIPOS)) {
    const id = `interes-${valor}`;
    const chip = el("div", { class: "chip" });
    chip.innerHTML =
      `<input type="radio" name="interes" id="${id}" value="${valor}">` +
      `<label for="${id}">${svg(valor)}<span>${datos.etiqueta}</span></label>`;
    caja.append(chip);
  }
  caja.addEventListener("change", () => ponerError("interes", ""));
}

function actualizarPresupuesto() {
  const barra = $("#presupuesto");
  const valor = Number(barra.value);
  const minimo = Number(barra.min), maximo = Number(barra.max);
  const pos = (n) => (((n - minimo) / (maximo - minimo)) * 100).toFixed(2) + "%";
  barra.style.setProperty("--p1", pos(500));
  barra.style.setProperty("--p2", pos(1000));
  $("#monto").textContent = soles(valor);
  $("#nivel-texto").innerHTML = `Presupuesto <strong>${NIVEL_TEXTO[nivelDe(valor)]}</strong>`;
}

function ponerError(campo, mensaje) {
  const caja = $(`#err-${campo}`);
  caja.textContent = mensaje;
  const control = campo === "nombre" ? $("#nombre") : null;
  if (control) control.setAttribute("aria-invalid", mensaje ? "true" : "false");
}

function leerFormulario() {
  const nombre = $("#nombre").value.trim();
  const presupuesto = Number($("#presupuesto").value);
  const marcado = document.querySelector('input[name="interes"]:checked');
  let valido = true;

  // Mismas reglas que el servidor: sin espacios, solo letras y números
  if (!nombre) {
    ponerError("nombre", "Escribe tu nombre.");
    valido = false;
  } else if (!/^[\p{L}\p{N}_-]{1,20}$/u.test(nombre)) {
    ponerError("nombre", "Usa una sola palabra, sin espacios ni símbolos. Por ejemplo, Ana.");
    valido = false;
  } else {
    ponerError("nombre", "");
  }
  if (!marcado) {
    ponerError("interes", "Elige un interés para continuar.");
    valido = false;
  }
  if (!valido) {
    const primero = $("#nombre").getAttribute("aria-invalid") === "true" ? $("#nombre") : document.querySelector('input[name="interes"]');
    primero.focus();
    return null;
  }
  return { nombre, presupuesto, interes: marcado.value };
}

// ---------- Llamada al servidor ----------
async function pedirRecomendacion(datos) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);
  try {
    const r = await fetch("/api/recomendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
      signal: control.signal,
    });
    let cuerpo = null;
    try { cuerpo = await r.json(); } catch { /* sin JSON */ }
    if (!r.ok) {
      const e = new Error((cuerpo && cuerpo.error) || `El servidor respondió con el código ${r.status}`);
      e.deServidor = true;
      e.estado = r.status;
      throw e;
    }
    return cuerpo;
  } finally {
    clearTimeout(reloj);
  }
}

/** Mensaje para el turista: claro y sin términos técnicos. */
function mensajePublico(error) {
  if (error.name === "AbortError") return "La búsqueda tardó más de lo normal. Inténtalo de nuevo.";
  if (error.deServidor) {
    // Los errores de datos (por ejemplo, un nombre no válido) sí se explican; los demás, no.
    return error.estado < 500 ? error.message : "Tuvimos un problema al buscar tus destinos. Inténtalo de nuevo en un momento.";
  }
  return "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.";
}

/** Detalle técnico: solo se muestra en modo presentación (?tecnico=1). */
function detalleTecnico(error) {
  if (error.name === "AbortError") return "La consulta superó el tiempo máximo de espera.";
  if (error.deServidor) return error.message;
  if (location.protocol === "file:")
    return "Abriste el archivo directamente. Abre la página desde http://localhost:5000 con el servidor encendido.";
  return "No hay conexión con el servidor. ¿Está encendido? (python python/servidor.py)";
}

// ---------- Panel de resultados ----------
function mostrarSeccion(nodos) {
  const seccion = $("#resultados");
  seccion.hidden = false;
  $("#resultados-contenido").replaceChildren(...[].concat(nodos));
  return seccion;
}

function irAResultados() {
  const seccion = $("#resultados");
  seccion.scrollIntoView({ behavior: sinAnimaciones() ? "auto" : "smooth", block: "start" });
  seccion.focus({ preventScroll: true });
}

function cajaError(titulo, error, reintentar) {
  const caja = el("div", { class: "caja-error", role: "alert" }, [
    el("h3", { texto: titulo }),
    el("p", { texto: mensajePublico(error) }),
  ]);
  if (TECNICO) caja.append(el("pre", { texto: detalleTecnico(error) }));
  if (reintentar) {
    const boton = el("button", { type: "button", class: "boton boton-borde", texto: "Reintentar" });
    boton.addEventListener("click", reintentar);
    caja.append(boton);
  }
  return caja;
}

function pantallaCargando() {
  const pasos = TECNICO ? ["Python", "Scala", "Prolog"] : ["Tu presupuesto", "Tus gustos", "Tus destinos"];
  const nodo = el("div", { class: "cargando" }, [
    el("h2", { id: "t-resultados", texto: TECNICO ? "Consultando al sistema…" : "Buscando destinos para ti…" }),
    el("div", { class: "ruta", "aria-hidden": "true", html: pasos.map((p) => `<span>${p}</span>`).join("<i>→</i>") }),
    el("div", { class: "barra-carga", role: "progressbar", "aria-label": "Buscando" }),
    el("p", {
      texto: TECNICO
        ? "Esto toma unos segundos porque Scala (sbt) arranca de nuevo en cada consulta."
        : "Estamos eligiendo los lugares que mejor encajan con tu presupuesto y con lo que te gusta. Solo tomará unos segundos.",
    }),
  ]);
  mostrarSeccion(nodo);
  irAResultados();
}

function mostrarResultado(datos, resp) {
  presupuestoActual = datos.presupuesto;
  // Une lo que devolvió cada lenguaje: una tarjeta por destino
  const mapa = new Map();
  const anotar = (nombre, origen) => {
    if (!nombre) return;
    const clave = normalizar(nombre);
    if (!mapa.has(clave)) mapa.set(clave, { clave, nombre, scala: false, prolog: false });
    mapa.get(clave)[origen] = true;
  };
  // Para el turista se muestra lo que confirma Scala (monto exacto contra costo).
  // En modo presentación se muestran las dos listas.
  resp.scala.forEach((n) => anotar(n, "scala"));
  if (TECNICO) resp.prolog.forEach((n) => anotar(n, "prolog"));

  const tarjetas = [...mapa.values()].map((item, i) => {
    const conocido = catalogo.find((d) => normalizar(d.nombre_destino) === item.clave);
    const destino = conocido || { nombre_destino: item.nombre.replace(/_/g, " "), tipo_interes: datos.interes, costo: null };
    const cercanos = (resp.cercanos && resp.cercanos[destino.nombre_destino]) || [];
    return crearTarjeta(destino, i, TECNICO ? { scala: item.scala, prolog: item.prolog } : null, cercanos);
  });

  const bonito = (lista) => (lista.length ? lista.map((n) => n.replace(/_/g, " ")).join(", ") : "ninguno");
  const ok = resp.coinciden;

  const saludo = el("h2", { class: "res-saludo", id: "t-resultados" });
  saludo.append(`${datos.nombre}, `, el("em", { texto: tarjetas.length ? "este es tu rumbo" : "probemos otra ruta" }));

  const detalle = el("p", {
    class: "res-detalle",
    texto: `Con ${soles(datos.presupuesto)} por persona y gusto por ${TIPOS[datos.interes].etiqueta.toLowerCase()}.` +
      (TECNICO ? ` (nivel ${resp.nivel})` : ""),
  });

  const sello = el("div", { class: "sello" }, [
    el("span", {
      class: "sello-icono", "aria-hidden": "true",
      html: ok
        ? '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'
        : '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17v.01"/></svg>',
    }),
    el("div", {}, [
      el("span", { texto: ok ? "Scala y Prolog coinciden" : "Scala y Prolog dieron listas distintas" }),
      el("small", { texto: ok ? "Dos lenguajes calcularon lo mismo por separado." : "Mira abajo qué encontró cada uno." }),
    ]),
  ]);
  const listas = el("dl", { class: "listas" }, [
    el("div", {}, [el("dt", { texto: "Scala" }), el("dd", { texto: bonito(resp.scala) })]),
    el("div", {}, [el("dt", { texto: "Prolog" }), el("dd", { texto: bonito(resp.prolog) })]),
  ]);
  const verifica = el("div", { class: `verifica ${ok ? "ok" : "aviso"}` }, [sello, listas]);
  if (!ok) {
    verifica.append(
      el("p", {
        class: "nota-aviso",
        texto: "Los dos comparan tu monto exacto con el costo de cada destino, así que deberían coincidir. Revisa que data/destinos.txt y prolog/hechos.pl tengan los mismos costos.",
      })
    );
  }

  let cuerpo;
  if (tarjetas.length) {
    cuerpo = el("div", { class: "rejilla" }, tarjetas);
  } else {
    cuerpo = el("div", { class: "sin-resultados" }, [
      el("h3", { texto: "No encontramos lugares para esa combinación" }),
      el("p", { texto: "Prueba subir un poco el presupuesto o elegir otro tipo de viaje." }),
    ]);
  }

  mostrarSeccion(TECNICO ? [saludo, detalle, verifica, cuerpo] : [saludo, detalle, cuerpo]);
  irAResultados();
}

function mostrarFallo(error, reintentar) {
  mostrarSeccion([
    el("h2", { id: "t-resultados", class: "res-saludo", texto: "No pudimos completar la búsqueda" }),
    el("div", { style: "margin-top:1.4rem" }, [cajaError("Algo salió mal", error, reintentar)]),
  ]);
  irAResultados();
}

// ---------- Envío del formulario ----------
async function enviar(evento) {
  evento.preventDefault();
  const datos = leerFormulario();
  if (!datos) return;

  const boton = $("#enviar");
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = "Consultando…";
  pantallaCargando();
  try {
    const respuesta = await pedirRecomendacion(datos);
    mostrarResultado(datos, respuesta);
  } catch (error) {
    mostrarFallo(error, () => $("#form").requestSubmit());
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
}

// ---------- Inicio ----------
function iniciar() {
  if (TECNICO) $("#pie-tecnico").hidden = false;

  pintarIntereses();
  actualizarPresupuesto();
  $("#presupuesto").addEventListener("input", actualizarPresupuesto);
  $("#nombre").addEventListener("input", () => ponerError("nombre", ""));
  $("#form").addEventListener("submit", enviar);
  // Un solo oyente para todos los botones "cerca de aquí", aunque se creen después
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".cerca-enlace");
    if (boton) abrirFicha(boton.dataset.destino);
  });
  $("#ficha-cerrar").addEventListener("click", () => $("#ficha").close());
  // Clic fuera de la ficha (sobre el fondo oscuro) también la cierra
  $("#ficha").addEventListener("click", (evento) => { if (evento.target.id === "ficha") evento.target.close(); });
  cargarCatalogo();
}

document.addEventListener("DOMContentLoaded", iniciar);
