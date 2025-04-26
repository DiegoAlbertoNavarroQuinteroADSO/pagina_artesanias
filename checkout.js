document.addEventListener("DOMContentLoaded", () => {
  // Obtener el carrito desde localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Mostrar el resumen de la compra
  const resumenCarrito = document.getElementById("resumen-carrito");
  const totalCompra = document.getElementById("total-compra");

  if (carrito.length === 0) {
    resumenCarrito.innerHTML =
      "<tr><td colspan='4'>El carrito está vacío.</td></tr>";
    totalCompra.textContent = "Total: $0";
    document.querySelector(".btn-procesar").disabled = true;
  } else {
    let total = 0;
    carrito.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.nombre}</td>
        <td>$${item.precio.toLocaleString()}</td>
        <td>${item.cantidad}</td>
        <td>$${subtotal.toLocaleString()}</td>
      `;
      resumenCarrito.appendChild(fila);
    });
    totalCompra.textContent = `Total: $${total.toLocaleString()}`;
  }

  // Actualizar el carrito (para el header)
  actualizarCarrito();

  // Manejar el formulario de pago
  const paymentForm = document.querySelector("#payment-form");
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

    // Resetear mensajes de error
    document.querySelectorAll(".error").forEach((error) => {
      error.style.display = "none";
      error.textContent = "";
    });

    // Validar los campos
    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre) {
      showError("error-nombre", "El nombre es obligatorio.");
      hasError = true;
    }
    if (!email) {
      showError("error-email", "El correo electrónico es obligatorio.");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      showError("error-email", "Por favor, ingresa un correo válido.");
      hasError = true;
    }
    if (!calle) {
      showError("error-calle", "La calle es obligatoria.");
      hasError = true;
    }
    if (!numero) {
      showError("error-numero", "El número es obligatorio.");
      hasError = true;
    }
    if (!barrio) {
      showError("error-barrio", "El barrio es obligatorio.");
      hasError = true;
    }
    if (!ciudad) {
      showError("error-ciudad", "La ciudad es obligatoria.");
      hasError = true;
    }
    if (!departamento) {
      showError("error-departamento", "El departamento es obligatorio.");
      hasError = true;
    }
    if (!telefono) {
      showError("error-telefono", "El teléfono es obligatorio.");
      hasError = true;
    } else if (!/^\d+$/.test(telefono)) {
      showError("error-telefono", "El teléfono debe contener solo números.");
      hasError = true;
    }

    if (hasError) return;

    // Calcular el total
    const total = carrito.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );

    // Validar el monto antes de enviar a ePayco
    const MIN_AMOUNT = 10000; // Ajusta según los rangos de ePayco
    const MAX_AMOUNT = 500000; // Ajusta según los rangos de ePayco
    if (total < MIN_AMOUNT || total > MAX_AMOUNT) {
      alert(
        `El monto total ($${total.toLocaleString()}) está fuera del rango permitido por ePayco ($${MIN_AMOUNT.toLocaleString()} - $${MAX_AMOUNT.toLocaleString()}). Por favor, ajusta tu carrito.`
      );
      return;
    }

    // Deshabilitar el botón mientras se procesa el pago
    const btnProcesar = document.querySelector(".btn-procesar");
    btnProcesar.disabled = true;
    btnProcesar.textContent = "Procesando...";

    // Construir la dirección completa
    const direccionCompleta = `${calle} ${numero}, ${barrio}, ${ciudad}, ${departamento}`;

    // Guardar los datos del cliente en localStorage (opcional)
    const datosCliente = {
      nombre,
      email,
      telefono,
      direccion: direccionCompleta,
    };
    localStorage.setItem("datosCliente", JSON.stringify(datosCliente));

    // Iniciar el pago con ePayco
    iniciarPagoConEpayco(nombre, email, telefono, direccionCompleta, () => {
      // Rehabilitar el botón en caso de error
      btnProcesar.disabled = false;
      btnProcesar.textContent = "Procesar Pago";
    });
  });

  // Función para mostrar errores
  function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  // Función para actualizar el carrito (para el header)
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
        listaCarrito.appendChild(fila);
        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;
      });

      cartCount.textContent = cantidadTotal;
      totalCarrito.textContent = `Total: $${total.toLocaleString()}`;
      pagarBtn.style.display = carrito.length > 0 ? "block" : "none";

      // Evento para eliminar productos del carrito
      document.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const id = e.target.getAttribute("data-id");
          const itemIndex = carrito.findIndex((item) => item.id === id);
          if (itemIndex !== -1) {
            const item = carrito[itemIndex];
            item.cantidad -= 1;
            if (item.cantidad <= 0) {
              carrito.splice(itemIndex, 1);
            }
            localStorage.setItem("carrito", JSON.stringify(carrito));
            actualizarCarrito();
            // Recargar la página para actualizar el resumen
            window.location.reload();
          }
        });
      });
    }
  }

  // Función para iniciar el pago con ePayco
  function iniciarPagoConEpayco(nombre, email, telefono, direccion, callback) {
    const total = carrito.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );

    // Generar la lista de productos comprados
    let productos = carrito
      .map((item) => `${item.nombre} x${item.cantidad}`)
      .join(", ");

    // Truncar la lista de productos si es demasiado larga
    const MAX_DESCRIPTION_LENGTH = 255; // Límite de caracteres para ePayco
    const BASE_DESCRIPTION = "Compra de productos artesanales: ";
    const maxProductosLength =
      MAX_DESCRIPTION_LENGTH - BASE_DESCRIPTION.length - 10; // 10 caracteres de margen

    if (productos.length > maxProductosLength) {
      productos = productos.substring(0, maxProductosLength - 3) + "...";
    }

    // Combinar la descripción estática con los productos
    const descripcion = `${BASE_DESCRIPTION}${productos}`;

    // Enviar los datos al backend para generar la referencia de pago
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
            description: descripcion, // Descripción combinada
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
            // Datos del cliente
            name_billing: nombre,
            email_billing: email,
            phone_billing: telefono,
            address_billing: direccion,
          };

          console.log("Datos enviados a ePayco:", paymentData);
          handler.open(paymentData);
        } else {
          alert("Error al iniciar el pago: " + data.message);
          callback();
        }
      })
      .catch((err) => {
        console.error("Error al iniciar el pago:", err);
        alert("Hubo un error al iniciar el pago. Por favor, intenta de nuevo.");
        callback();
      });
  }
});
