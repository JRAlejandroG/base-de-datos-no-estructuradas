use("NoSQL");

const bcrypt = require("bcrypt");

function generarRut(i) {
    return `${10000000 + i}-K`;
}

const nacionalidades = [
    "CL", "AR", "PE", "CO", "MX",
    "BR", "UY", "VE", "EC", "BO",
    "US", "ES"
];

const tecnologiasDisponibles = [
    "JavaScript", "TypeScript", "Python", "Java", "C#",
    "PHP", "Node.js", "React", "Angular", "Vue",
    "MongoDB", "MySQL", "PostgreSQL", "Docker", "Git",
    "Django", "Flask", "Spring Boot", "Laravel", "AWS"
];

const generos = ["M", "F", "O"];

function obtenerTecnologiasAleatorias() {
    const cantidad = Math.floor(Math.random() * 5) + 2;
    return [...tecnologiasDisponibles]
        .sort(() => Math.random() - 0.5)
        .slice(0, cantidad);
}

async function poblarBaseDeDatos() {
    const usuarios = [];
    const saltRounds = 10;

    for (let i = 1; i <= 50; i++) {
        const anio = Math.floor(Math.random() * 20) + 1985;
        const mes = Math.floor(Math.random() * 12);
        const dia = Math.floor(Math.random() * 28) + 1;

        const contrasenaPlana = `Password${i}@2026`;
        const contrasenaHash = await bcrypt.hash(contrasenaPlana, saltRounds);

        usuarios.push({
            nombre: `Usuario ${i}`,
            rut: generarRut(i),
            correo: `usuario${i}@correo.com`,
            telefono: `+5699${String(i).padStart(7, "0")}`,
            fechaNacimiento: new Date(anio, mes, dia),
            nacionalidad: nacionalidades[
                Math.floor(Math.random() * nacionalidades.length)
            ],
            genero: generos[
                Math.floor(Math.random() * generos.length)
            ],
            direccion: {
                comuna: "Santiago",
                calle: `Calle ${i}`,
                numero: Math.floor(Math.random() * 9000) + 100,
                departamentoOficina: `Depto ${i}`
            },
            contrasena: contrasenaHash,
            fechaRegistro: new Date(),
            activo: true,
            tecnologias: obtenerTecnologiasAleatorias()
        });
    }

    db.usuarios.insertMany(usuarios);
    print(`${usuarios.length} usuarios insertados correctamente.`);
}

poblarBaseDeDatos();