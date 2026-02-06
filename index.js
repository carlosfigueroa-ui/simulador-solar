/* index.js */

// Esperamos a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias a botones
    const btnCalcular = document.getElementById('Calculadora');
    const btnLimpiar = document.getElementById('limpiar');
    
    // Referencia a la gráfica
    const ctx = document.getElementById('myChart');
    let myChart = null;

    // --- EVENTO CALCULAR ---
    btnCalcular.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que se recargue la página si está dentro de un form
        calcularSimulacion();
    });

    // --- EVENTO LIMPIAR ---
    btnLimpiar.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('form-1').reset();
        document.getElementById('vida').reset();
        
        // Limpiar textos
        document.getElementById('resultado').innerText = "";
        document.getElementById('sugerencia').innerText = "";
        document.getElementById('sinProyecto').innerText = "";
        document.getElementById('conProyecto').innerText = "";
        
        // Ocultar gráfica
        document.getElementById('myChart').classList.add('hidden');
        if(myChart) {
            myChart.destroy();
        }
    });

    // --- FUNCIÓN PRINCIPAL ---
    function calcularSimulacion() {
        // 1. OBTENER DATOS
        // Potencia instalada (Watts) del select
        const potenciaW = parseFloat(document.getElementById('kwp').value) || 0;
        
        // Consumo mensual (Suma de los 12 inputs)
        const mesesIds = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        let consumoAnual = 0;
        let consumoMensualArr = [];

        mesesIds.forEach(id => {
            let val = parseFloat(document.getElementById(id).value) || 0;
            consumoMensualArr.push(val);
            consumoAnual += val;
        });

        // 2. CÁLCULOS (Lógica estimada)
        
        // Generación estimada: Potencia * Horas Sol (aprox 4.5) * Días * Eficiencia (0.8)
        // Dividimos entre 1000 para pasar de Watts a kWh
        const generacionMensualPromedio = (potenciaW * 4.5 * 30 * 0.80) / 1000;
        const generacionAnual = generacionMensualPromedio * 12;

        // Porcentaje de ahorro
        let porcentajeAhorro = 0;
        if (consumoAnual > 0) {
            porcentajeAhorro = (generacionAnual / consumoAnual) * 100;
            if (porcentajeAhorro > 100) porcentajeAhorro = 100;
        }

        // Costo estimado (Sin Proyecto) vs (Con Proyecto)
        // Nota: Aquí deberías poner la tarifa real de CFE. Usaré un promedio de $3.00 MXN por kWh
        const tarifaPromedio = 3.0; 
        const pagoAnualActual = consumoAnual * tarifaPromedio;
        const pagoAnualNuevo = (consumoAnual - generacionAnual) * tarifaPromedio;
        // Si genera más de lo que consume, el pago es el mínimo (ej. 50 pesos al mes)
        const pagoFinal = pagoAnualNuevo < 600 ? 600 : pagoAnualNuevo; 

        // 3. MOSTRAR RESULTADOS EN TEXTO
        const resultadoLabel = document.getElementById('resultado');
        resultadoLabel.innerText = `Generación Est: ${generacionAnual.toFixed(0)} kWh/año`;

        document.getElementById('sugerencia').innerText = `Cobertura solar estimada: ${porcentajeAhorro.toFixed(1)}%`;
        document.getElementById('sinProyecto').innerText = `Gasto anual actual (est): $${pagoAnualActual.toFixed(2)}`;
        document.getElementById('conProyecto').innerText = `Gasto anual con paneles (est): $${pagoFinal.toFixed(2)}`;

        // 4. GENERAR GRÁFICA
        generarGrafica(consumoMensualArr, generacionMensualPromedio);
    }

    function generarGrafica(consumoArr, generacionPromedio) {
        const canvas = document.getElementById('myChart');
        canvas.classList.remove('hidden');

        // Si ya existe una gráfica, la destruimos para crear una nueva
        if (myChart) {
            myChart.destroy();
        }

        // Creamos un array con la generación constante (promedio) para graficar la línea
        const generacionArr = new Array(12).fill(generacionPromedio);

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    {
                        label: 'Tu Consumo (kWh)',
                        data: consumoArr,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Generación Solar (kWh)',
                        data: generacionArr,
                        type: 'line', // Línea superpuesta a las barras
                        borderColor: '#FBD433', // Amarillo
                        backgroundColor: 'rgba(251, 212, 51, 0.5)',
                        borderWidth: 3,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kWh'
                        }
                    }
                }
            }
        });
    }
});
