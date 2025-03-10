document.addEventListener("DOMContentLoaded", () => {
  // Obtener el carrito desde localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Calcular el total del carrito
  const total = carrito.reduce(
    (acc, prod) => acc + prod.precio * prod.cantidad,
    0
  );

  // Manejar el formulario de pago
  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Obtener los datos del formulario
      const nombre = document.querySelector("#nombre").value.trim();
      const email = document.querySelector("#email").value.trim();
      const calle = document.querySelector("#calle").value.trim();
      const numero = document.querySelector("#numero").value.trim();
      const barrio = document.querySelector("#barrio").value.trim();
      const ciudad = document.querySelector("#ciudad").value.trim();
      const departamento = document.querySelector("#departamento").value.trim();
      const telefono = document.querySelector("#telefono").value.trim();

      // Validar que todos los campos estén llenos
      if (
        !nombre ||
        !email ||
        !calle ||
        !numero ||
        !barrio ||
        !ciudad ||
        !departamento ||
        !telefono
      ) {
        alert("Por favor, completa todos los campos del formulario.");
        return;
      }

      // Construir la dirección completa para ePayco
      const direccionCompleta = `${calle} ${numero}, ${barrio}, ${ciudad}, ${departamento}`;

      // Configurar el checkout de ePayco con los datos del cliente y el carrito
      const handler = ePayco.checkout.configure({
        key: "TU_CLAVE_PUBLICA", // Reemplaza con tu clave pública de ePayco
        test: true, // Cambia a false en producción
      });

      handler.open({
        name: "Artesanías del Hurtado",
        description: "Compra de artesanías",
        currency: "cop",
        amount: total,
        country: "CO",
        lang: "es",
        external: false,
        response: "http://tu-sitio.com/respuesta",
        confirmation: "http://tu-sitio.com/confirmacion",
        buyerName: nombre,
        buyerEmail: email,
        buyerPhone: telefono,
        buyerAddress: direccionCompleta, // Enviar la dirección completa
      });

      // Opcional: Limpiar el carrito después del pago exitoso (puedes ajustar esto según tus necesidades)
      // carrito = [];
      // localStorage.setItem("carrito", JSON.stringify(carrito));
      // actualizarCarrito();
    });
  }

  // Función para actualizar el carrito (si necesitas mostrarlo en checkout.html, puedes incluirla aquí)
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

  // Inicializar carrito en checkout.html (opcional, si quieres mostrar el carrito aquí)
  actualizarCarrito();
});
