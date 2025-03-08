document.addEventListener("DOMContentLoaded", () => {
  // Carrito
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Función para actualizar el carrito
  function actualizarCarrito() {
    const listaCarrito = document.querySelector("#lista-carrito tbody");
    const cartCount = document.querySelector(".cart-count");
    const totalCarrito = document.querySelector("#total-carrito");
    const pagarBtn = document.querySelector("#btn-pagar");

    if (listaCarrito && cartCount && totalCarrito && pagarBtn) {
      listaCarrito.innerHTML = "";
      let total = 0;
      let cantidadTotal = 0;

      carrito.forEach((producto) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
                    <td class="cart-item-cell"><img src="${
                      producto.imagen
                    }" alt="${producto.nombre}" style="width: 50px;"></td>
                    <td class="cart-item-cell">${producto.nombre}</td>
                    <td class="cart-item-cell">$${(
                      producto.precio * producto.cantidad
                    ).toLocaleString()}</td>
                    <td class="cart-item-cell">${producto.cantidad}</td>
                    <td class="cart-item-cell"><button class="btn-eliminar" data-id="${
                      producto.id
                    }">🗑️</button></td>
                `;
        listaCarrito.appendChild(fila);
        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;
      });

      cartCount.textContent = cantidadTotal;
      totalCarrito.textContent = `Total: $${total.toLocaleString()}`;
      pagarBtn.style.display = carrito.length > 0 ? "block" : "none";
    }
  }

  // Función para agregar al carrito (solo aplica en index.html)
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
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // Asociar eventos
  const vaciarCarritoBtn = document.querySelector("#vaciar-carrito");
  if (vaciarCarritoBtn) {
    vaciarCarritoBtn.addEventListener("click", vaciarCarrito);
  }

  const cerrarCarritoBtn = document.querySelector("#cerrar-carrito");
  if (cerrarCarritoBtn) {
    cerrarCarritoBtn.addEventListener("click", () => {
      document.querySelector("#carrito").style.display = "none";
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
  const loadMoreBtn = document.querySelector("#load-more");
  if (loadMoreBtn) {
    let currentItem = 8;
    loadMoreBtn.addEventListener("click", () => {
      let boxes = [...document.querySelectorAll(".box-container .box")];
      for (let i = currentItem; i < currentItem + 4 && i < boxes.length; i++) {
        boxes[i].style.display = "inline-block";
      }
      currentItem += 4;
      if (currentItem >= boxes.length) loadMoreBtn.style.display = "none";
    });
  }

  // Redirección al formulario de checkout desde cualquier página
  const pagarBtn = document.querySelector("#btn-pagar");
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
      window.location.href = "checkout.html"; // Asegúrate de que la ruta sea correcta
    });
  }

  // Formulario de contacto (solo en index.html)
  const contactoForm = document.querySelector("#contacto-form");
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

  // Inicializar carrito en todas las páginas
  actualizarCarrito();
});
