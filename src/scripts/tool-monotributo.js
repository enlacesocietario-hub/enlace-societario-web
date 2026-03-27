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

        if (facturacion_anual > limitFacturacion) erroresLegales.push(`Facturación anual excede el tope ($${limitFacturacion.toLocaleString()}).`);
        if (superficie > REGIMEN_CONFIG.monotributo.superficie_max) erroresLegales.push(`Superficie supera los ${REGIMEN_CONFIG.monotributo.superficie_max} m².`);
        if (energia > REGIMEN_CONFIG.monotributo.energia_max) erroresLegales.push(`Consumo eléctrico supera ${REGIMEN_CONFIG.monotributo.energia_max} kWh.`);
        if (alquiler > REGIMEN_CONFIG.monotributo.alquiler_anual_max) erroresLegales.push(`Alquiler anual excede $${REGIMEN_CONFIG.monotributo.alquiler_anual_max.toLocaleString()}.`);
        if (data.tipo_actividad === 'bienes' && precio_unitario > REGIMEN_CONFIG.monotributo.precio_unitario_max) erroresLegales.push(`Precio unitario mayor a $${REGIMEN_CONFIG.monotributo.precio_unitario_max.toLocaleString()}.`);

        // 2. VARIABLES CLAVE
        const isExcludedFromMono = erroresLegales.length > 0;
        
        let scoreEcon = 0;
        scoreEcon += REGIMEN_CONFIG.scoring_economico.margen[data.margen] || 0;
        scoreEcon += REGIMEN_CONFIG.scoring_economico.costos_iva[data.costos_iva] || 0;
        scoreEcon += REGIMEN_CONFIG.scoring_economico.clientes[data.tipo_clientes] || 0;
        const isRIAcademicallyBetter = scoreEcon <= -2;

        const isPlural = data.cantidad_socios !== '1';
        const wantsSeparation = data.separacion_patrimonio === 'si';
        const hasHighComplexity = data.cantidad_empleados === '10+';
        const hasModerateComplexity = data.cantidad_empleados === '6-10';
        const expectsHighGrowth = data.crecimiento_esperado === 'alto';

        // 3. ÁRBOL DE DECISIÓN
        let resultType = "";
        let contextBullets = [];

        if (isPlural || wantsSeparation || hasHighComplexity) {
            resultType = "SOCIEDAD";
            if (isPlural) contextBullets.push("El proyecto involucra a más de un socio, lo que exige reglas claras y formales.");
            if (wantsSeparation) contextBullets.push("Priorizás la separación de tu patrimonio personal del riesgo comercial.");
            if (hasHighComplexity) contextBullets.push("Tu estructura operativa y de nómina ya requiere una organización corporativa.");
        } else if (isExcludedFromMono || isRIAcademicallyBetter) {
            if (expectsHighGrowth || hasModerateComplexity) {
                resultType = "ANALISIS";
                if (isExcludedFromMono) contextBullets.push("Tus parámetros actuales te excluyen del Monotributo.");
                contextBullets.push("Además, tenés una estructura operativa en crecimiento que podría hacer ineficiente tributar como persona física.");
            } else {
                resultType = "RI";
                if (isExcludedFromMono) contextBullets.push("Tus parámetros actuales superan los topes legales del Monotributo.");
                if (isRIAcademicallyBetter) contextBullets.push("Tu estructura de costos y tipo de clientes hacen más eficiente deducir IVA y Ganancias.");
            }
        } else if (scoreEcon >= 0 && !expectsHighGrowth && !hasModerateComplexity) {
            resultType = "MONOTRIBUTO";
            contextBullets.push("Tus parámetros legales (facturación, superficie, etc.) están dentro de los límites permitidos.");
            contextBullets.push("Tu estructura de costos y clientes hace conveniente aprovechar este régimen simplificado.");
        } else {
            resultType = "ANALISIS";
            contextBullets.push("Estás dentro de los parámetros legales del Monotributo o en un límite fronterizo.");
            if (expectsHighGrowth) contextBullets.push("Sin embargo, tu expectativa de crecimiento indica que pronto necesitarás escalar tu estructura fiscal.");
            if (scoreEcon < 0) contextBullets.push("Tus márgenes cambiantes o clientes B2B sugieren que el Monotributo podría empezar a ser un tope para tus operaciones.");
        }

        displayUnifiedResult(resultType, contextBullets);
    });

    function displayUnifiedResult(type, bullets) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        const singleResultContainer = document.getElementById('single-result-container');
        if (!singleResultContainer) return;

        let title = "";
        let desc = "";
        let warning = "";
        let ctaText = "";
        let waMessage = "";

        switch(type) {
            case "MONOTRIBUTO":
                title = "Monotributo Recomendado";
                desc = "La estructura ideal para tu etapa actual: ágil, simplificada y con menor carga administrativa.";
                warning = "Deberás hacer un seguimiento proactivo de tu facturación y categorización de forma semestral para evitar una exclusión de oficio por parte de AFIP.";
                ctaText = "Asesoramiento preventivo mensual";
                waMessage = `Hola, hice el test y mi resultado fue: ${title}. Me gustaría conversar sobre el mantenimiento impositivo mensual.`;
                break;
            case "RI":
                title = "Responsable Inscripto Recomendado";
                desc = "Una estructura impositiva general que acompaña tu volumen de operación y te permite optimizar costos deduciendo crédito fiscal.";
                warning = "Operar como Responsable Inscripto requiere liquidaciones mensuales de IVA y una planificación más estricta de Ganancias. La carga administrativa es mayor que en el Monotributo.";
                ctaText = "Consultar sobre liquidación de impuestos";
                waMessage = `Hola, hice el test y mi resultado fue: ${title}. Necesito asesoramiento sobre la inscripción y liquidaciones mensuales.`;
                break;
            case "SOCIEDAD":
                title = "Sociedad Comercial Recomendable";
                desc = "Dada tu estructura o requerimientos de responsabilidad, constituir una Sociedad (SRL o SAS) es el camino más seguro para proteger tu patrimonio y operar formalmente.";
                warning = "Las sociedades tienen costos de constitución y mantenimiento mayores. Es vital elegir el tipo societario (SAS, SRL, SA) adecuado para no asumir más rigidez de la necesaria.";
                ctaText = "Consultar sobre constitución de sociedades";
                waMessage = `Hola, hice el test y mi resultado fue: ${title}. Me gustaría asesorarme sobre qué tipo de sociedad crear y los costos asociados.`;
                break;
            case "ANALISIS":
                title = "Escenario en Transición / Requiere Análisis";
                desc = "Tu situación actual presenta grises operativos o legales. Una decisión automatizada tiene alto margen de error para tu caso.";
                warning = "Estás en un punto donde tributar como independiente podría volverse ineficiente rápido, pero crear una sociedad quizás aún sea costoso. Necesitamos armar una proyección financiera breve.";
                ctaText = "Agendar análisis personalizado";
                waMessage = `Hola, hice el test y mi resultado fue: ${title}. Estoy en un punto de crecimiento/transición y necesito evaluar si me conviene ser RI o armar una sociedad.`;
                break;
        }

        let html = `
            <div style="background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid var(--color-border); max-width: 800px; margin: 0 auto;">
                <div style="background: var(--color-bg-alt); padding: 2.5rem; text-align: center; border-bottom: 1px solid var(--color-border);">
                    <span style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 1rem;">DIAGNÓSTICO FINAL</span>
                    <h3 style="color: var(--color-primary); font-size: 2.2rem; margin-bottom: 1rem; line-height: 1.2;">${title}</h3>
                    <p style="font-size: 1.15rem; color: var(--color-text-body); max-width: 600px; margin: 0 auto;">${desc}</p>
                </div>
                
                <div style="padding: 2.5rem; background: white;">
                    <div style="margin-bottom: 2.5rem;">
                        <h4 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check-circle" style="color: #25D366;"></i> Por qué llegamos a esta conclusión:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${bullets.map(b => `<li style="margin-bottom: 0.85rem; padding-left: 1.75rem; position: relative;"><i class="fas fa-caret-right" style="position: absolute; left: 0; top: 0.25rem; color: var(--color-accent);"></i> ${b}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="background: rgba(255, 185, 56, 0.1); border-left: 4px solid var(--color-accent); padding: 1.5rem; border-radius: 0 8px 8px 0; margin-bottom: 2.5rem;">
                        <h4 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;"><i class="fas fa-exclamation-triangle" style="color: var(--color-accent);"></i> Factor de Riesgo / A tener en cuenta</h4>
                        <p style="font-size: 0.95rem; color: var(--color-text-body); line-height: 1.5; margin: 0;">${warning}</p>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="/contacto" class="btn btn-primary" style="padding: 1rem 2rem;">${ctaText}</a>
                        <a href="https://wa.me/5491167805489?text=${encodeURIComponent(waMessage)}" target="_blank" class="btn btn-secondary" style="padding: 1rem 2rem; background-color: #25D366; border-color: #25D366; color: white; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fab fa-whatsapp"></i> Hablar por WhatsApp
                        </a>
                    </div>
                    <div id="share-container" style="margin-top: 1.5rem; text-align: center;"></div>
                </div>
            </div>
        `;

        singleResultContainer.innerHTML = html;
        addShareFeature(title);
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
