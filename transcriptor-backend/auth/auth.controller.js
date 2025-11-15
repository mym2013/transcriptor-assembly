// auth.controller.js
const { registerSchema } = require('./auth.schema');

async function registerController(req, res) {
    try {
        // Validar body con Zod
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            console.warn('⚠️ Intento de registro inválido:', result.error.errors);
            return res.status(400).json({
                error: 'Datos inválidos',
                detalles: result.error.errors,
            });
        }

        const { name, email, password } = result.data;

        // Aquí más adelante irá la lógica real con base de datos
        console.log(`🟢 Nuevo registro recibido: ${email}`);

        return res.status(201).json({
            message: 'Usuario registrado (mock)',
            user: { name, email },
        });
    } catch (err) {
        console.error('❌ Error en registro:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    registerController,
};
