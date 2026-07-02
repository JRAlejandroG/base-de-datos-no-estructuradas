window.onload = function () {
    obtenerUsuarios();
}

async function obtenerUsuarios() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoUsuarios");
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }

        new DataTable('#tablaUsuarios', {
            data: datos,
            columns: [
                { data: 'nombre' },
                { data: 'rut' },
                { data: 'correo' },
                { 
                    data: 'fechaNacimiento',
                    render: function (data) {
                        if (!data) return 'N/A';
                        return new Date(data).toLocaleDateString('es-CL');
                    }
                },
                { data: 'gentilicio.nombre', defaultContent: 'N/A' },
                { 
                    data: 'genero', 
                    render: function (data) {
                        return data === 'M' ? 'Masculino' : data === 'F' ? 'Femenino' : 'Otro';
                    }
                },
                {
                    data: 'direccion',
                    render: function (data) {
                        if (!data) return 'N/A';
                        let depto = data.departamento ? `, Depto: ${data.departamento}` : '';
                        return `${data.calle} ${data.numero}${depto}, ${data.comuna}`;
                    }
                },
                // --- Mapeo de la Información Bancaria desde la relación ---
                { data: 'cuentaInfo.banco', defaultContent: '<span class="text-muted">Sin Cuenta</span>' },
                { data: 'cuentaInfo.tipoCuenta', defaultContent: 'N/A' },
                { data: 'cuentaInfo.numeroCuenta', defaultContent: 'N/A' },
                { 
                    data: 'cuentaInfo.saldo',
                    defaultContent: '$0',
                    render: function (data, type, row) {
                        if (data === undefined || data === null) return '$0';
                        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data);
                    }
                },
                {
                    data: 'activo',
                    render: function (data) {
                        return data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>';
                    }
                }
            ]
        });

    } catch (error) {
        console.log('Ha ocurrido el siguiente error: ', error);
    }
}