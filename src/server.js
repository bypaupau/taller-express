import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Muestra en consola cuándo y qué ruta se consulta; ayuda a comprobar las pruebas.
app.use((req, res, next) => {
    const hora = new Date().toISOString();
    console.log(`${hora} ${req.method} ${req.url}`);
    next();
});


app.get('/api/fotos/:id', (req, res) => {
    const id = Number(req.params.id);
    const foto = fotos.find((f) => f.id === id);
    if (!foto) {
        return res.status(404).json({ mensaje: `Foto ${id} no encontrada` });
    }
    res.json(foto);
});


app.post('/api/fotos', (req, res) => {
    const { titulo, descripcion, calificacion } = req.body;
    if (!titulo) {
        return res.status(400).json({ mensaje: 'El titulo es obligatorio' });
    }
    // Se calcula a partir del id más alto. Así no se repite un id si antes se borró una foto.
    const nuevoId = fotos.length ? Math.max(...fotos.map((f) => f.id)) + 1 : 1;
    const nueva = {
        id: nuevoId, titulo, descripcion, calificacion,
    };
    fotos.push(nueva);
    res.status(201).json(nueva);
});


// PATCH modifica parcialmente un recurso: el cliente envía únicamente los campos que desea cambiar.
app.patch('/api/fotos/:id', (req, res) => {
    const id = Number(req.params.id);
    const foto = fotos.find((f) => f.id === id);
    // Antes de actualizar se confirma que la foto exista.
    if (!foto) {
        return res.status(404).json({ mensaje: `Foto ${id} no encontrada` });
    }
    // Solo se extraen los campos editables; el id nunca puede modificarse.
    const { titulo, descripcion, calificacion } = req.body;
    // Se usa !== undefined, y no "if (calificacion)", para aceptar valores válidos como 0.
    if (titulo !== undefined) foto.titulo = titulo;
    if (descripcion !== undefined) foto.descripcion = descripcion;
    if (calificacion !== undefined) foto.calificacion = calificacion;
    // 200 OK y la foto con los cambios aplicados.
    return res.json(foto);
});


// DELETE elimina una foto. Una eliminación correcta responde 204 y no lleva cuerpo.
app.delete('/api/fotos/:id', (req, res) => {
    const id = Number(req.params.id);
    // findIndex devuelve -1 cuando no existe una foto con ese id.
    const indice = fotos.findIndex((f) => f.id === id);
    if (indice === -1) {
        return res.status(404).json({ mensaje: `Foto ${id} no encontrada` });
    }
    // splice(posición, cantidad) quita un único elemento del arreglo en memoria.
    fotos.splice(indice, 1);
    return res.status(204).end();
});


app.get('/api/error', async () => {
    throw new Error('Algo salió mal');
})

const fotos = [
    {id: 1, titulo: 'Atardecer', calificacion: 4.5, descripcion: 'Playa de Montañita'},
    {id: 2, titulo: 'Malecon', calificacion: 4.0, descripcion: 'Guayaquil de noche'}
];

app.get('/api/fotos', (req, res) => {
    res.json(fotos);
});

// Este middleware debe ir después de las rutas para capturar errores de toda la API.
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
