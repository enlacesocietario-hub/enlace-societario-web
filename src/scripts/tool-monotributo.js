/**
 * Configuración de límites y parámetros del Monotributo y Sociedades (Proyectado 2026)
 */
const REGIMEN_CONFIG = {
    monotributo: {
        facturacion_anual_max_servicios: 68000000,
        facturacion_anual_max_bienes: 68000000, // Ajustar según escalas vigentes
        superficie_max: 200,
        energia_max: 20000,
        alquiler_anual_max: 4500000,
        precio_unitario_max: 385000,
    },
    scoring_economico: {
        margen: {
            'bajo': -3,       // < 15%
            'medio-bajo': -1, // 15-25%
            'medio-alto': 2,  // 25-40%
            'alto': 3         // > 40%
        },
        costos_iva: {
            'bajo': 3,        // < 15%
            'medio-bajo': 1,  // 15-25%
            'medio-alto': -2, // 25-40%
            'alto': -4        // > 40%
        },
        clientes: {
            'consumidores-finales': 3,
            'pymes': 0,
            'grandes-empresas': -3
        }
    },
    scoring_sociedad: {
        socios: {
            '1': 0,
            '2': 1,
            '3': 2,
            '4+': 4
        },
        empleados: {
            '0': 0,
            '1-5': 1,
            '6-10': 2,
            '10+': 4
        },
        crecimiento: {
            'no': 0,
            'moderado': 1,
            'alto': 3
        },
        patrimonio: {
            'no': 0,
            'si': 3
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tool-form');
    const resultsSection = document.getElementById('tool-results');
    const activitySelect = document.getElementById('tipo_actividad');
    const precioUnitarioGroup = document.getElementById('precio_unitario_group');

    if (!form) return;

    // Mostrar/Ocultar Precio Unitario según actividad
    activitySelect.addEventListener('change', () => {
        if (activitySelect.value === 'bienes') {
            precioUnitarioGroup.style.display = 'block';
            document.getElementById('precio_unitario').required = true;
        } else {
            precioUnitarioGroup.style.display = 'none';
            document.getElementById('precio_unitario').required = false;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Procesar inputs numéricos
        const facturacion_mensual = parseFloat(data.facturacion_mensual) || 0;
        const facturacion_anual = facturacion_mensual * 12;
        const superficie = parseFloat(data.superficie) || 0;
        const energia = parseFloat(data.energia) || 0;
        const alquiler = parseFloat(data.alquiler) || 0;
        const precio_unitario = parseFloat(data.precio_unitario) || 0;

        // 1. EVALUACIÓN LEGAL MONOTRIBUTO
        let erroresLegales = [];
        const limitFacturacion = data.tipo_actividad === 'servicios'
            ? REGIMEN_CONFIG.monotributo.facturacion_anual_max_servicios
            : REGIMEN_CONFIG.monotributo.facturacion_anual_max_bienes;

        if (facturacion_anual > limitFacturacion) {
            erroresLegales.push(`Tu facturación anual estimada ($${facturacion_anual.toLocaleString()}) supera el límite permitido para el Monotributo ($${limitFacturacion.toLocaleString()}).`);
        }
        if (superficie > REGIMEN_CONFIG.monotributo.superficie_max) {
            erroresLegales.push(`La superficie afectada (${superficie} m²) supera el límite de ${REGIMEN_CONFIG.monotributo.superficie_max} m².`);
        }
        if (energia > REGIMEN_CONFIG.monotributo.energia_max) {
            erroresLegales.push(`El consumo eléctrico anual (${energia} kWh) supera el límite de ${REGIMEN_CONFIG.monotributo.energia_max} kWh.`);
        }
        if (alquiler > REGIMEN_CONFIG.monotributo.alquiler_anual_max) {
            erroresLegales.push(`El alquiler anual ($${alquiler.toLocaleString()}) supera el límite de $${REGIMEN_CONFIG.monotributo.alquiler_anual_max.toLocaleString()}.`);
        }
        if (data.tipo_actividad === 'bienes' && precio_unitario > REGIMEN_CONFIG.monotributo.precio_unitario_max) {
            erroresLegales.push(`El precio unitario máximo ($${precio_unitario.toLocaleString()}) supera el límite permitido de $${REGIMEN_CONFIG.monotributo.precio_unitario_max.toLocaleString()}.`);
        }

        // 2. SCORING ECONÓMICO
        let scoreEconomico = 0;
        scoreEconomico += REGIMEN_CONFIG.scoring_economico.margen[data.margen] || 0;
        scoreEconomico += REGIMEN_CONFIG.scoring_economico.costos_iva[data.costos_iva] || 0;
        scoreEconomico += REGIMEN_CONFIG.scoring_economico.clientes[data.tipo_clientes] || 0;

        // 3. SCORING SOCIEDAD
        let scoreSociedad = 0;
        scoreSociedad += REGIMEN_CONFIG.scoring_sociedad.socios[data.cantidad_socios] || 0;
        scoreSociedad += REGIMEN_CONFIG.scoring_sociedad.empleados[data.cantidad_empleados] || 0;
        scoreSociedad += REGIMEN_CONFIG.scoring_sociedad.crecimiento[data.crecimiento_esperado] || 0;
        scoreSociedad += REGIMEN_CONFIG.scoring_sociedad.patrimonio[data.separacion_patrimonio] || 0;

        displayResults(erroresLegales, scoreEconomico, scoreSociedad);
    });

    function displayResults(errores, scoreEcon, scoreSoc) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        const encuadreBlock = document.getElementById('res-encuadre');
        const convenienciaBlock = document.getElementById('res-conveniencia');
        const estructuraBlock = document.getElementById('res-estructura');
        const mainConclusion = document.getElementById('main-conclusion');
        const ctaWhatApp = document.getElementById('cta-whatsapp');

        // Resultado 1: Encuadre
        if (errores.length > 0) {
            encuadreBlock.innerHTML = `
                <div class="res-card res-bad">
                    <i class="fas fa-times-circle"></i>
                    <h4>Encuadre Legal</h4>
                    <p><strong>Excluido del Monotributo.</strong></p>
                    <ul>${errores.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>
            `;
        } else {
            encuadreBlock.innerHTML = `
                <div class="res-card res-good">
                    <i class="fas fa-check-circle"></i>
                    <h4>Encuadre Legal</h4>
                    <p>Tus parámetros están dentro de los límites permitidos para el régimen de Monotributo.</p>
                </div>
            `;
        }

        // Resultado 2: Conveniencia Fiscal
        let diagFiscal = "";
        let classFiscal = "";
        if (scoreEcon >= 4) {
            diagFiscal = "Monotributo muy conveniente";
            classFiscal = "res-good";
        } else if (scoreEcon >= 0) {
            diagFiscal = "Monotributo viable";
            classFiscal = "res-mid";
        } else if (scoreEcon >= -3) {
            diagFiscal = "Analizar Responsable Inscripto";
            classFiscal = "res-mid";
        } else {
            diagFiscal = "Responsable Inscripto recomendable";
            classFiscal = "res-bad";
        }

        convenienciaBlock.innerHTML = `
            <div class="res-card ${classFiscal}">
                <i class="fas fa-chart-line"></i>
                <h4>Conveniencia Fiscal</h4>
                <p><strong>${diagFiscal}</strong></p>
                <p>Basado en tu margen, costos con IVA y tipo de clientes.</p>
            </div>
        `;

        // Resultado 3: Estructura
        let diagSoc = "";
        let classSoc = "";
        if (scoreSoc >= 6) {
            diagSoc = "Sociedad recomendable";
            classSoc = "res-bad"; // Using bad color for "Society" as it's the most complex/expensive
        } else if (scoreSoc >= 3) {
            diagSoc = "Podría convenir una sociedad";
            classSoc = "res-mid";
        } else {
            diagSoc = "No parece necesario crear una sociedad";
            classSoc = "res-good";
        }

        estructuraBlock.innerHTML = `
            <div class="res-card ${classSoc}">
                <i class="fas fa-sitemap"></i>
                <h4>Estructura de Negocio</h4>
                <p><strong>${diagSoc}</strong></p>
                <p>Evaluado según cantidad de socios, empleados y planes de crecimiento.</p>
            </div>
        `;

        // Conclusión General
        let finalTitle = "";
        let finalDesc = "";

        if (errores.length > 0 || scoreEcon <= -4) {
            if (scoreSoc >= 4) {
                finalTitle = "Sociedad recomendada";
                finalDesc = "Dada tu escala de negocio y estructura operativa, una SRL o SA te brindará la protección patrimonial y el marco fiscal adecuado para seguir creciendo.";
            } else {
                finalTitle = "Responsable Inscripto recomendable";
                finalDesc = "Tu nivel de facturación o estructura de costos supera los beneficios del Monotributo. Operar como Responsable Inscripto te permitirá deducir gastos y IVA.";
            }
        } else {
            finalTitle = "Monotributo recomendado";
            finalDesc = "Es la opción más simplificada y económica para tu situación actual. Te recomendamos monitorear tus límites semestralmente para no ser excluido.";
        }

        mainConclusion.innerHTML = `
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">${finalTitle}</h3>
            <p style="font-size: 1.1rem; color: var(--color-text-body); max-width: 800px; margin: 0 auto;">${finalDesc}</p>
        `;

        // Ajustar Link WhatsApp según resultado
        const waBase = "https://wa.me/549116705489?text=";
        const waMsg = encodeURIComponent(`Hola Enlace Societario, hice el test y el resultado fue: ${finalTitle}. Me gustaría recibir asesoramiento.`);
        ctaWhatApp.href = waBase + waMsg;
    }

    // Feedback visual para el formulario de guía
    const leadForm = document.getElementById('lead-form');
    const leadSuccess = document.getElementById('lead-success');
    if (leadForm && leadSuccess) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            leadForm.querySelector('button').style.display = 'none';
            leadSuccess.style.display = 'block';
        });
    }
});
