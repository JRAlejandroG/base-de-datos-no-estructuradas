window.onload = function () {
    obtenerCuentasBancarias();
}

async function obtenerCuentasBancarias() {
    try {
        const respuesta = await fetch("http://localhost:3000/listadoCuentasBancarias");
        if (!respuesta.ok) throw new Error("Error en la respuesta del servidor");
        
        const datos = await respuesta.json();
        const tbody = $('#tablaCuentas');
        tbody.empty();

        datos.forEach(item => {
            const nombreUser = item.usuarioInfo ? item.usuarioInfo.nombre : 'No asignado';
            const rutUser = item.usuarioInfo ? item.usuarioInfo.rut : 'No asignado';
            const saldoFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: item.moneda }).format(item.saldo);

            const fila = `
                <tr>
                    <td><strong>${item.banco}</strong></td>
                    <td>${item.tipoCuenta}</td>
                    <td>${item.numeroCuenta}</td>
                    <td>${item.titular || 'N/A'}</td>
                    <td>${saldoFormateado}</td>
                    <td><span class="badge bg-info">${item.estado}</span></td>
                    <td><strong>${nombreUser}</strong></td>
                    <td>${rutUser}</td>
                </tr>
            `;
            tbody.append(fila);
        });
    } catch (error) {
        console.error('Error al cargar las cuentas bancarias:', error);
    }
}