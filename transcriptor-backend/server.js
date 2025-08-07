// Versión de prueba de server.js para testear Railway (puerto dinámico)
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Endpoint de prueba simple
app.get('/', (req, res) => {
  res.send('Servidor corriendo correctamente en Railway');
});

// Puerto dinámico para Railway o 3000 para local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
