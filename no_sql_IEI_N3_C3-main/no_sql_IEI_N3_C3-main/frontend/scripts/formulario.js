window.onload = function () {
    cargarPaises();
    cargarComunas();
}

function validar_fomulario() {
    let inputNombre = $("#inputNombre");
    let inputRut = $('#inputRut');
    let inputEmail = $('#inputEmail');
    let fechaNacimiento = $('#inputFechaNac');
    let nacionalidad = $('#selectNacionalidad');
    let contrasena = $('#inputContrasena');
    let repetirContrasena = $('#inputRepetirContrasena');
    
    let inputBanco = $('#inputBanco');
    let inputTipoCuenta = $('#inputTipoCuenta');
    let inputNumeroCuenta = $('#inputNumeroCuenta');

    let formularioValido = true;

    if (!validarInput(inputNombre)) formularioValido = false;
    if (!validarInput(inputRut)) formularioValido = false;
    if (!validarEmail(inputEmail)) formularioValido = false;
    if (!validarInput(fechaNacimiento)) formularioValido = false;
    if (!validarInput(nacionalidad)) formularioValido = false;
    if (!validarContrasena(contrasena)) formularioValido = false;
    if (!validarRepetirContrasena(repetirContrasena, contrasena)) formularioValido = false;
    
    if (!validarInput(inputBanco)) formularioValido = false;
    if (!validarInput(inputTipoCuenta)) formularioValido = false;
    if (!validarInput(inputNumeroCuenta)) formularioValido = false;

    if (formularioValido === true) {
        alert('Formulario Válido, enviando datos al servidor...');

        let tecnologiasSeleccionadas = $('input[name="checkTecnologias"]:checked').map(function () {
            return $(this).val();
        }).get();

        let generoSeleccionado = $('input[name="radioGenero"]:checked').val() || "O";

        const datosUsuario = {
            nombre: inputNombre.val(),
            rut: inputRut.val(),
            correo: inputEmail.val(),
            telefono: $('#inputTelefono').val() || "",
            fechaNacimiento: fechaNacimiento.val(),
            nacionalidad: nacionalidad.val(),
            genero: generoSeleccionado,
            direccion: {
                comuna: $('#selectComuna option:selected').text(),
                calle: $('#inputCalle').val() || "",
                numero: Number($('#inputNumero').val()) || 0,
                departamento: $('#inputDepartamento').val() || ""
            },
            contrasena: contrasena.val(),
            tecnologias: tecnologiasSeleccionadas
        };

        const enviarFomulario = async () => {
            try {
                const resUsuario = await fetch("http://localhost:3000/guardarUsuario", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosUsuario)
                });

                if (resUsuario.ok) {
                    const resLista = await fetch("http://localhost:3000/listadoUsuarios");
                    const usuarios = await resLista.json();
                    const usuarioCreado = usuarios.find(u => u.rut === datosUsuario.rut);

                    if (usuarioCreado && usuarioCreado._id) {
                        const datosCuenta = {
                            banco: inputBanco.val(),
                            tipoCuenta: inputTipoCuenta.val(),
                            numeroCuenta: inputNumeroCuenta.val(),
                            saldo: Number($('#inputSaldo').val()) || 0,
                            titular: datosUsuario.nombre,
                            sucursal: "Casa Central",
                            usuarioId: usuarioCreado._id
                        };

                        const resCuenta = await fetch("http://localhost:3000/guardarCuentaBancaria", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(datosCuenta)
                        });

                        if (resCuenta.ok) {
                            window.location.href = './cuentas.html';
                        }
                    }
                }
            } catch (error) {
                console.log('Ha ocurrido el siguiente error: ', error);
            }
        }
        enviarFomulario();
    } else {
        alert('Complete todos los campos del formulario.');
    }
}

function validarInput(input) {
    if (!input.val() || input.val() === '') {
        input.addClass('is-invalid');
        return false;
    } else {
        input.removeClass('is-invalid');
        return true;
    }
}

function validarEmail(input) {
    if (validarInput(input)) {
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
        if (regexEmail.test(input.val())) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

function validarContrasena(input) {
    if (validarInput(input)) {
        const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
        if (regexContrasena.test(input.val())) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

function validarRepetirContrasena(input, input2) {
    if (validarInput(input)) {
        if (input.val() === input2.val()) {
            input.removeClass('is-invalid');
            return true;
        } else {
            input.addClass('is-invalid');
            return false;
        }
    }
    return false;
}

async function cargarPaises() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoPaises");
        const datos = await respuesta.json();
        const select = $('#selectNacionalidad');
        
        datos.forEach(pais => {
            const option = $("<option></option>", { 'text': pais.nombre, 'value': pais.iso2 });
            select.append(option.css("text-transform", "capitalize"));            
        });
    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error);
    }
}

async function cargarComunas() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoComunas");
        const datos = await respuesta.json();
        const select = $('#selectComuna');
        
        datos.forEach(comuna => {
            const option = $("<option></option>", { 'text': comuna.nombre_comuna, 'value': comuna.codigo_comuna });
            select.append(option.css("text-transform", "capitalize"));            
        });
    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error);
    }
}
