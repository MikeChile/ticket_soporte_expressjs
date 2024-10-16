// Función para obtener todos los tickets de la API
async function getTickets() {
    try {
        const response = await fetch('/tickets');
        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Error al obtener los tickets:', error);
    }
}

// Función para mostrar los tickets en el contenedor de la página
function displayTickets(tickets) {
    const container = document.getElementById('tickets-container');
    container.innerHTML = '';  // Limpiar contenido previo

    tickets.forEach(ticket => {
        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket');

        // Crear el contenido del ticket
        ticketDiv.innerHTML = `
            <h2>Ticket #${ticket.id}</h2>
            <p><strong>Estado:</strong> ${ticket.estado}</p>
            <p><strong>Fecha de Actualización:</strong> ${new Date(ticket.fechaActualizacion).toLocaleString()}</p>
            <h3>Mensajes:</h3>
            <ul>
                ${ticket.mensajes.map(mensaje => `<li>${mensaje.mensaje} (enviado el ${new Date(mensaje.fecha).toLocaleString()})</li>`).join('')}
            </ul>
            
            <!-- Input para agregar un nuevo mensaje -->
            <input type="text" id="mensaje-input-${ticket.id}" placeholder="Escribe un mensaje">
            <button onclick="agregarMensaje(${ticket.id})"><i class='bx bx-message-square-dots' ></i> Agregar mensaje</button>

            <!-- Botón para cambiar el estado del ticket -->
            <button onclick="toggleEstado(${ticket.id})"><i class='bx bx-transfer-alt'></i> ${ticket.estado === 'abierto' ? 'Cerrar Ticket' : 'Abrir Ticket'}</button>

            <!-- Botón para eliminar -->
            <button id="delete-btn" onclick="eliminarTicket(${ticket.id})"><i class='bx bxs-comment-x'></i> Eliminar Ticket</button>  
        `;

        container.appendChild(ticketDiv);
    });
}

// Función para cambiar el estado de un ticket
async function toggleEstado(ticketId) {
    try {
        const response = await fetch(`/tickets/${ticketId}`, { method: 'PATCH' });
        const updatedTicket = await response.json();
        alert(`El ticket #${updatedTicket.id} ahora está ${updatedTicket.estado}`);
        getTickets();  // Recargar los tickets para actualizar el estado visualmente
    } catch (error) {
        console.error('Error al cambiar el estado del ticket:', error);
    }
}

// Función para crear un nuevo ticket
async function crearTicket() {
    try {
        const response = await fetch('/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const nuevoTicket = await response.json();
            alert(`Ticket creado exitosamente con ID: ${nuevoTicket.id}`);
            getTickets();  // Recargar los tickets para mostrar el nuevo ticket
        } else {
            alert('Error al crear el ticket');
        }
    } catch (error) {
        console.error('Error al crear el ticket:', error);
    }
}

// Función para agregar un mensaje a un ticket
async function agregarMensaje(ticketId) {
    const mensajeInput = document.getElementById(`mensaje-input-${ticketId}`);
    const mensaje = mensajeInput.value.trim();
    console.log(mensaje); // Asegúrate de que el mensaje se vea correcto aquí

    if (mensaje === '') {
        alert('El mensaje no puede estar vacío.');
        return;
    }

    try {
        const response = await fetch(`/tickets/${ticketId}/mensajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensajes: mensaje })  // Envía el mensaje correctamente
        });

        if (response.ok) {
            const nuevoMensaje = await response.json();
            alert(`Mensaje agregado: ${nuevoMensaje.mensaje}`);
            getTickets();  // Recargar los tickets para mostrar el nuevo mensaje
        } else {
            const errorData = await response.json();
            alert(`Error al agregar el mensaje aquí: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al agregar el mensaje:', error);
    }
}

async function eliminarTicket(ticketId) {
    if (confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
        try {
            const response = await fetch(`/tickets/${ticketId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Ticket eliminado con éxito.');
                getTickets(); // Recargar la lista de tickets
            } else {
                const errorData = await response.json();
                alert(`Error al eliminar el ticket: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar el ticket:', error);
            alert('Error al eliminar el ticket. Intenta nuevamente más tarde.');
        }
    }
}


// Asociar la función al botón de creación de ticket
document.getElementById('crear-ticket-btn').addEventListener('click', crearTicket);

// Llamar a la función para obtener los tickets al cargar la página
window.onload = getTickets;
