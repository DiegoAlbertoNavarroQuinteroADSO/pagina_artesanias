document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const carritoContainer = document.querySelector("#carrito");
  const listaCarritoBody = document.querySelector("#lista-carrito tbody");
  const cartCount = document.querySelector(".cart-count");
  const totalCarrito = document.querySelector("#total-carrito");
  const pagarBtn = document.querySelector("#btn-pagar");
  const vaciarCarritoBtn = document.querySelector("#vaciar-carrito");
  const cerrarCarritoBtn = document.querySelector("#cerrar-carrito");
  const loadMoreBtn = document.querySelector("#load-more");
  const contactoForm = document.querySelector("#contacto-form");

  // Mensaje de carrito vacío (asumiendo que lo agregarás al HTML como <p class="carrito-vacio">)
  const mensajeVacio =
    document.querySelector(".carrito-vacio") ||
    (() => {
      const p = document.createElement("p");
      p.className = "carrito-vacio";
      p.textContent = "El carrito está vacío";
      p.style.display = "none";
      carritoContainer.insertBefore(p, listaCarritoBody.parentElement);
      return p;
    })();

  // Estado del carrito
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Función para actualizar el carrito
  function actualizarCarrito() {
    if (!listaCarritoBody || !cartCount || !totalCarrito || !pagarBtn) return;

    listaCarritoBody.innerHTML = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((producto) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td class="cart-item-cell"><img src="${producto.imagen}" alt="${
        producto.nombre
      }" style="width: 50px;"></td>
        <td class="cart-item-cell">${producto.nombre}</td>
        <td class="cart-item-cell">$${(
          producto.precio * producto.cantidad
        ).toLocaleString()}</td>
        <td class="cart-item-cell">${producto.cantidad}</td>
        <td class="cart-item-cell"><button class="btn-eliminar" data-id="${
          producto.id
        }">🗑️</button></td>
      `;
      listaCarritoBody.appendChild(fila);
      total += producto.precio * producto.cantidad;
      cantidadTotal += producto.cantidad;
    });

    cartCount.textContent = cantidadTotal;
    totalCarrito.textContent = `Total: $${total.toLocaleString()}`;
    pagarBtn.style.display = carrito.length > 0 ? "block" : "none";

    // Verificar si el carrito está vacío
    mensajeVacio.style.display = carrito.length === 0 ? "block" : "none";
    carritoContainer.classList.toggle("vacio", carrito.length === 0);
  }

  // Función para agregar al carrito (solo en index.html)
  function agregarAlCarrito(event) {
    event.preventDefault();
    const boton = event.target;
    const productoItem = boton.closest(".box");
    const producto = {
      id: boton.dataset.id,
      nombre: productoItem.querySelector("h3").textContent,
      precio: parseFloat(
        productoItem
          .querySelector(".precio")
          .textContent.replace("$", "")
          .replace(",", "")
      ),
      imagen: productoItem.querySelector("img").src,
      cantidad: 1,
    };

    const productoExistente = carrito.find((item) => item.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push(producto);
    }

    actualizarCarrito();
    guardarCarritoEnStorage();
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  // Función para eliminar del carrito
  function eliminarDelCarrito(event) {
    const idProducto = event.target.dataset.id;
    const producto = carrito.find((item) => item.id === idProducto);
    if (producto.cantidad > 1) {
      producto.cantidad--;
    } else {
      carrito = carrito.filter((item) => item.id !== idProducto);
    }
    actualizarCarrito();
    guardarCarritoEnStorage();
  }

  // Función para vaciar el carrito
  function vaciarCarrito(event) {
    event.preventDefault();
    carrito = [];
    actualizarCarrito();
    guardarCarritoEnStorage();
  }

  // Guardar en localStorage
  function guardarCarritoEnStorage() {
    try {
      localStorage.setItem("carrito", JSON.stringify(carrito));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }

  // Asociar eventos
  if (vaciarCarritoBtn) {
    vaciarCarritoBtn.addEventListener("click", vaciarCarrito);
  }

  if (cerrarCarritoBtn) {
    cerrarCarritoBtn.addEventListener("click", () => {
      carritoContainer.style.display = "none";
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("agregar-carrito")) {
      agregarAlCarrito(e);
    } else if (e.target.classList.contains("btn-eliminar")) {
      eliminarDelCarrito(e);
    }
  });

  // Cargar más productos (solo en index.html)
  if (loadMoreBtn) {
    let currentItem = 8;
    loadMoreBtn.addEventListener("click", () => {
      const boxes = [...document.querySelectorAll(".box-container .box")];
      for (let i = currentItem; i < currentItem + 4 && i < boxes.length; i++) {
        boxes[i].style.display = "inline-block";
      }
      currentItem += 4;
      if (currentItem >= boxes.length) loadMoreBtn.style.display = "none";
    });
  }

  // Redirección al formulario de checkout
  if (pagarBtn) {
    pagarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const total = carrito.reduce(
        (acc, prod) => acc + prod.precio * prod.cantidad,
        0
      );
      if (total === 0) {
        alert("El carrito está vacío");
        return;
      }
      window.location.href = "checkout.html";
    });
  }

  // Formulario de contacto (solo en index.html)
  if (contactoForm) {
    contactoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nombre = document.querySelector("#nombre").value.trim();
      const email = document.querySelector("#email").value.trim();
      const mensaje = document.querySelector("#mensaje").value.trim();

      if (!nombre || !email || !mensaje) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      alert("Gracias por contactarnos. Te responderemos pronto.");
      contactoForm.reset();
    });
  }

  // Inicializar el carrito al cargar la página
  actualizarCarrito();
});
