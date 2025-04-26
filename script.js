// Detectar la categoría actual basada en la página
const currentPage = window.location.pathname.split("/").pop();
let categoria;
if (currentPage === "sombreros.html") categoria = "sombreros";
else if (currentPage === "mochilas.html") categoria = "mochilas";
else if (currentPage === "hamacas.html") categoria = "hamacas";
else if (currentPage === "monederos.html") categoria = "monederos";
else if (currentPage === "accesorios.html") categoria = "accesorios";

// Variables para el manejo de "Cargar Más"
let productosMostrados = 0;
const productosPorCarga = 4;

// Cargar productos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("Cargando productos para la categoría:", categoria);
  fetch(`http://localhost:5000/api/productos?categoria=${categoria}`)
    .then((response) => {
      console.log("Respuesta del endpoint /api/productos:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((productos) => {
      console.log("Productos recibidos:", productos);
      window.productos = productos; // Guardar productos globalmente
      cargarProductos();
    })
    .catch((err) => console.error("Error al cargar productos:", err));

  // Configurar eventos del carrito
  configurarCarrito();
});

// Función para cargar productos
function cargarProductos() {
  const productList = document.getElementById("product-list");
  const loadMoreBtn = document.getElementById("load-more");
  const productosACargar = window.productos.slice(
    productosMostrados,
    productosMostrados + productosPorCarga
  );

  productosACargar.forEach((producto) => {
    console.log("Producto a cargar:", producto); // Log para depurar
    const box = document.createElement("div");
    box.classList.add("box");
    box.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <div class="products-txt">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p class="precio">$${producto.precio.toLocaleString()}</p>
        <a href="#" class="agregar-carrito btn-3" data-id="${
          producto._id
        }">Agregar al carrito</a>
      </div>
    `;
    productList.appendChild(box);
  });

  productosMostrados += productosACargar.length;

  // Mostrar u ocultar el botón "Cargar Más"
  if (productosMostrados >= window.productos.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }
}

// Evento para el botón "Cargar Más"
document.getElementById("load-more").addEventListener("click", cargarProductos);

// Configurar el carrito
function configurarCarrito() {
  const imgCarrito = document.getElementById("img-carrito");
  const cerrarCarrito = document.getElementById("cerrar-carrito");
  const vaciarCarrito = document.getElementById("vaciar-carrito");
  const btnPagar = document.getElementById("btn-pagar");

  // Mostrar/Ocultar carrito
  imgCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("carrito").classList.toggle("mostrar-carrito");
  });

  cerrarCarrito.addEventListener("click", () => {
    document.getElementById("carrito").classList.remove("mostrar-carrito");
  });

  // Vaciar carrito
  vaciarCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("carrito");
    actualizarCarrito();
  });

  // Redirigir a checkout.html al hacer clic en "Pagar"
  btnPagar.addEventListener("click", (e) => {
    e.preventDefault();
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    window.location.href = "checkout.html"; // Redirigir a checkout.html
  });

  // Agregar al carrito
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("agregar-carrito")) {
      e.preventDefault();
      console.log("Botón 'Agregar al carrito' clickeado");
      const id = e.target.getAttribute("data-id");
      console.log("ID del producto:", id);
      console.log("Lista de productos en window.productos:", window.productos);
      const producto = window.productos.find((p) => p._id === id);
      console.log("Producto encontrado:", producto);
      agregarAlCarrito(producto);
    }
  });

  // Actualizar carrito al cargar la página
  actualizarCarrito();
}

function agregarAlCarrito(producto) {
  if (!producto) {
    console.error("Producto no encontrado para agregar al carrito");
    alert("Error: No se pudo agregar el producto al carrito");
    return;
  }

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const itemExistente = carrito.find((item) => item.id === producto._id);

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();

  // Mostrar mensaje de confirmación
  alert(`${producto.nombre} ha sido agregado al carrito`);
}

function actualizarCarrito() {
  const listaCarrito = document.querySelector("#lista-carrito tbody");
  const totalCarrito = document.getElementById("total-carrito");
  const carritoVacio = document.querySelector(".carrito-vacio");
  const btnPagar = document.getElementById("btn-pagar");
  const cartCount = document.querySelector(".cart-count");
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  listaCarrito.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  carrito.forEach((item) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><img src="${item.imagen}" alt="${
      item.nombre
    }" style="width: 50px;"></td>
      <td>${item.nombre}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>${item.cantidad}</td>
      <td><a href="#" class="borrar-producto" data-id="${item.id}">🗑️</a></td>
    `;
    listaCarrito.appendChild(fila);
    total += item.precio * item.cantidad;
    totalItems += item.cantidad;
  });

  totalCarrito.textContent = `Total: $${total.toLocaleString()}`;
  cartCount.textContent = totalItems;

  if (carrito.length === 0) {
    carritoVacio.style.display = "block";
    btnPagar.style.display = "none";
  } else {
    carritoVacio.style.display = "none";
    btnPagar.style.display = "block";
  }

  // Evento para eliminar productos del carrito (reducir cantidad en 1)
  document.querySelectorAll(".borrar-producto").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.target.getAttribute("data-id");
      console.log("Eliminando producto con ID:", id); // Log para depurar

      // Buscar el ítem en el carrito
      const itemIndex = carrito.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        const item = carrito[itemIndex];
        item.cantidad -= 1; // Reducir la cantidad en 1
        console.log(
          `Cantidad actualizada para ${item.nombre}: ${item.cantidad}`
        );

        if (item.cantidad <= 0) {
          // Si la cantidad es 0 o menos, eliminar el ítem del carrito
          carrito.splice(itemIndex, 1);
          console.log(`Producto ${item.nombre} eliminado del carrito`);
        }
      }

      // Guardar el carrito actualizado en localStorage
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarCarrito();
    });
  });
}

// Función para iniciar el pago con ePayco (se usará en checkout.html)
function iniciarPagoConEpayco() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  // Calcular el total
  const total = carrito.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  const descripcion = carrito
    .map((item) => `${item.nombre} x${item.cantidad}`)
    .join(", ");

  // Enviar los datos del carrito al backend para generar la referencia de pago
  fetch("http://localhost:5000/api/pagos/crear", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      total,
      descripcion,
      items: carrito,
    }),
  })
    .then((response) => {
      console.log("Respuesta del backend:", response);
      return response.json();
    })
    .then((data) => {
      console.log("Datos recibidos del backend:", data);
      if (data.success) {
        // Abrir el Checkout de ePayco
        const handler = ePayco.checkout.configure({
          key: data.publicKey,
          test: data.testMode,
        });

        const paymentData = {
          name: "Compra en Artesanías del Hurtado",
          description: descripcion,
          invoice: data.ref,
          currency: "cop",
          amount: total.toString(),
          tax_base: "0",
          tax: "0",
          country: "CO",
          lang: "es",
          external: "false",
          confirmation: "http://localhost:5000/api/pagos/confirmacion",
          response: "http://localhost:3000/respuesta.html",
          extra1: data.ref,
        };

        console.log("Datos enviados a ePayco:", paymentData);
        handler.open(paymentData);
      } else {
        alert("Error al iniciar el pago: " + data.message);
      }
    })
    .catch((err) => {
      console.error("Error al iniciar el pago:", err);
      alert("Hubo un error al iniciar el pago. Por favor, intenta de nuevo.");
    });
}
