document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('Calculadora');
    const btnLimpiar = document.getElementById('limpiar');
    const ctx = document.getElementById('myChart');
    let myChart = null;

    btnCalcular.addEventListener('click', (e) => {
        e.preventDefault();
        calcularSimulacion();
    });

    btnLimpiar.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('form-1').reset();
        document.getElementById('vida').reset();
        document.getElementById('resultado').innerText = "";
        document.getElementById('sugerencia').innerText = "";
        document.getElementById('sinProyecto').innerText = "";
        document.getElementById('conProyecto').innerText = "";
        document.getElementById('myChart').classList.add('hidden');
        if(myChart) myChart.destroy();
    });

    function calcularSimulacion() {
        const potenciaW = parseFloat(document.getElementById('kwp').value) || 0;
        const mesesIds = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        let consumoAnual = 0;
        let consumoMensualArr = [];

        mesesIds.forEach(id => {
            let val = parseFloat(document.getElementById(id).value) || 0;
            consumoMensualArr.push(val);
            consumoAnual += val;
        });

        const generacionMensualPromedio = (potenciaW * 4.5 * 30 * 0.80) / 1000;
        const generacionAnual = generacionMensualPromedio * 12;
        let porcentajeAhorro = 0;
        if (consumoAnual > 0) {
            porcentajeAhorro = (generacionAnual / consumoAnual) * 100;
            if (porcentajeAhorro > 100) porcentajeAhorro = 100;
        }

        const tarifaPromedio = 3.0; 
        const pagoAnualActual = consumoAnual * tarifaPromedio;
        const pagoAnualNuevo = (consumoAnual - generacionAnual) * tarifaPromedio;
        const pagoFinal = pagoAnualNuevo < 600 ? 600 : pagoAnualNuevo; 

        document.getElementById('resultado').innerText = `Generación Est: ${generacionAnual.toFixed(0)} kWh/año`;
        document.getElementById('sugerencia').innerText = `Cobertura solar estimada: ${porcentajeAhorro.toFixed(1)}%`;
        document.getElementById('sinProyecto').innerText = `Gasto anual actual (est): $${pagoAnualActual.toFixed(2)}`;
        document.getElementById('conProyecto').innerText = `Gasto anual con paneles (est): $${pagoFinal.toFixed(2)}`;

        generarGrafica(consumoMensualArr, generacionMensualPromedio);
    }

    function generarGrafica(consumoArr, generacionPromedio) {
        const canvas = document.getElementById('myChart');
        canvas.classList.remove('hidden');
        if (myChart) myChart.destroy();

        const generacionArr = new Array(12).fill(generacionPromedio);

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    { label: 'Tu Consumo (kWh)', data: consumoArr, backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 },
                    { label: 'Generación Solar (kWh)', data: generacionArr, type: 'line', borderColor: '#FBD433', backgroundColor: 'rgba(251, 212, 51, 0.5)', borderWidth: 3, pointRadius: 4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
});
