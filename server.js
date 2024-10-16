//Importar archivos
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

// Middleware para manejar JSON en las peticiones
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta public
app.use(express.static('public'));

// Obtener los tickets
const getTickets = () => {
    const data = fs.readFileSync('ticket.json', 'utf-8');
    return JSON.parse(data);
};

// Guardar tickets
const saveTickets = (tickets) => {
    fs.writeFileSync('ticket.json', JSON.stringify(tickets, null, 2), 'utf-8');
};

// Crear un nuevo ticket
app.post('/tickets', (req, res) => {
    const tickets = getTickets();
    const newTicket = {
        id: tickets.length + 1,  // Generar un ID simple basado en la longitud del array
        estado: 'abierto',       // Estado por defecto
        mensajes: [],            // Inicialmente sin mensajes
        fechaActualizacion: new Date().toISOString()
    };

    tickets.push(newTicket);
    saveTickets(tickets);
    res.status(201).json(newTicket);
});

// Obtener todos los tickets
app.get('/tickets', (req, res) => {
    const tickets = getTickets();
    res.json(tickets);
});

// Obtener un ticket por ID
app.get('/tickets/:id', (req, res) => {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(ticket);
});

// Actualizar el estado del ticket (abrir/cerrar)
app.patch('/tickets/:id', (req, res) => {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    ticket.estado = ticket.estado === 'abierto' ? 'cerrado' : 'abierto';
    ticket.fechaActualizacion = new Date().toISOString();
    saveTickets(tickets);

    res.json(ticket);
});

// Agregar un mensaje a un ticket
app.post('/tickets/:id/mensajes', (req, res) => {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));

    // Verificar si el ticket existe
    if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar si el cuerpo de la solicitud contiene el campo 'mensajes'
    if (!req.body || !req.body.mensajes) {
        return res.status(400).json({ message: 'El campo "mensaje" es requerido' });
    }

    const nuevoMensaje = {
        mensaje: req.body.mensajes,
        fecha: new Date().toISOString()
    };

    ticket.mensajes.push(nuevoMensaje);
    ticket.fechaActualizacion = new Date().toISOString();
    saveTickets(tickets);

    res.status(201).json(nuevoMensaje);
});

//eliminar un ticket
app.delete('/tickets/:id', (req, res) => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === parseInt(req.params.id));

    // Verificar si el ticket existe
    if (ticketIndex === -1) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Eliminar el ticket del array
    tickets.splice(ticketIndex, 1);
    saveTickets(tickets);  // Guardar los cambios en el archivo JSON

    res.status(204).send();  // Respuesta sin contenido
});

// Escuchar al servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
