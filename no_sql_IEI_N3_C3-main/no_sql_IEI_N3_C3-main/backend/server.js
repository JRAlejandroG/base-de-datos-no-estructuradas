const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const puerto = 3000;

app.use(cors());
app.use(express.json());

// Conexión a la Base de Datos
mongoose.connect('mongodb://localhost:27017/NoSQL', {})
    .then(() => console.log('Conexión Exitosa!'))
    .catch((err) => console.log('No se ha podido establecer la conexión con el servidor', err));

const PORT = process.env.PORT || puerto;
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));

// ==========================================
// SCHEMAS Y MODELOS DE MONGOOSE
// ==========================================

const comuna = new mongoose.Schema({
    codigo_comuna: String,
    nombre_comuna: String,
    codigo_postal: String,
    nombre_region: String
});
const Comuna = mongoose.model('Comuna', comuna, 'comunas');

const direccion = new mongoose.Schema({
    comuna: { type: String, required: true },
    calle: { type: String, required: true },
    numero: { type: Number, required: true },
    departamento: String
});

const usuario = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: String,
    fechaNacimiento: Date,
    nacionalidad: { type: String, required: true },
    genero: { type: String, enum: ["M", "F", "O"] },
    direccion: { type: direccion, required: true },
    contrasena: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true },
    tecnologias: [String]
});
const Usuario = mongoose.model('Usuario', usuario, 'usuarios');

const pais = new mongoose.Schema({
    nombre: String,
    iso2: String,
    iso3: String,
    codigoPais: String,
    nacionalidad: String
});
const Pais = mongoose.model('Pais', pais, 'paises');

const cuentaBancariaSchema = new mongoose.Schema({
    banco: { type: String, required: true },
    tipoCuenta: { type: String, required: true },
    numeroCuenta: { type: String, required: true },
    moneda: { type: String, default: 'CLP' },
    saldo: { type: Number, default: 0 },
    fechaApertura: { type: Date, default: Date.now },
    estado: { type: String, default: 'Activa' },
    sucursal: String,
    titular: String,
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
});
const CuentaBancaria = mongoose.model('CuentaBancaria', cuentaBancariaSchema, 'cuentas_bancarias');

// ==========================================
// ENDPOINTS / RUTAS DE LA API
// ==========================================

// Guardar un nuevo usuario
app.post('/guardarUsuario', async (req, res) => {
    try {
        const { nombre, rut, correo, telefono, fechaNacimiento, nacionalidad, genero, direccion, contrasena, tecnologias } = req.body;
        const hash = await bcrypt.hash(contrasena, 10);

        const nuevoUsuario = new Usuario({
            nombre, rut, correo, telefono, fechaNacimiento, nacionalidad, genero, direccion, contrasena: hash, tecnologias
        });

        await nuevoUsuario.save();
        res.status(200).json({ message: 'Datos almacenados correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible almacenar los datos.', error: err.message });
    }
});

// Guardar una nueva cuenta bancaria
app.post('/guardarCuentaBancaria', async (req, res) => {
    try {
        const { banco, tipoCuenta, numeroCuenta, moneda, saldo, sucursal, titular, usuarioId } = req.body;
        
        const nuevaCuenta = new CuentaBancaria({
            banco, tipoCuenta, numeroCuenta, moneda, saldo: Number(saldo) || 0, sucursal, titular,
            usuarioId: new mongoose.Types.ObjectId(usuarioId)
        });

        await nuevaCuenta.save();
        res.status(200).json({ message: 'Cuenta bancaria registrada correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al almacenar la cuenta bancaria.', error: err.message });
    }
});

// Obtener listado de usuarios (con cruce de País y Cuenta Bancaria mediante $lookup)
app.get('/listadoUsuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.aggregate([
            {
                // Cruza con la colección de países para obtener el gentilicio completo
                $lookup: { from: 'paises', localField: 'nacionalidad', foreignField: 'iso2', as: 'gentilicio' }
            },
            {
                $unwind: { path: '$gentilicio', preserveNullAndEmptyArrays: true }
            },
            {
                // Cruza con la colección de cuentas bancarias asociadas a este usuario
                $lookup: { from: 'cuentas_bancarias', localField: '_id', foreignField: 'usuarioId', as: 'cuentaInfo' }
            },
            {
                $unwind: { path: '$cuentaInfo', preserveNullAndEmptyArrays: true }
            }
        ]);
        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos.', error: err.message });
    }
});

// Obtener listado separado de cuentas bancarias
app.get('/listadoCuentasBancarias', async (req, res) => {
    try {
        const cuentas = await CuentaBancaria.aggregate([
            {
                $lookup: { from: 'usuarios', localField: 'usuarioId', foreignField: '_id', as: 'usuarioInfo' }
            },
            {
                $unwind: { path: '$usuarioInfo', preserveNullAndEmptyArrays: true }
            }
        ]);
        res.status(200).json(cuentas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos.', error: err.message });
    }
});

// Listado de países para los selects del formulario
app.get('/listadoPaises', async (req, res) => {
    try {
        const paises = await Pais.find();
        res.status(200).json(paises);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos.', error: err.message });
    }
});

// Listado de comunas para los selects del formulario
app.get('/listadoComunas', async (req, res) => {
    try {
        const comunas = await Comuna.find();
        res.status(200).json(comunas);
    } catch (err) {
        res.status(500).json({ message: 'No ha sido posible obtener los datos.', error: err.message });
    }
});