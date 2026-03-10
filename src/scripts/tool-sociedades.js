/**
 * Lógica del Test de Sociedades - Enlace Societario
 */

const SOCIEDAD_SCORES = {
    q1: {
        'A': { SAS: 3, SRL: 3, SA: 2 },
        'B': { SOCIEDAD_HECHO: 3, SAS: 1 },
        'C': { ASOCIACION_CIVIL: 4 },
        'D': { FUNDACION: 5, ASOCIACION_CIVIL: 1 }
    },
    q2: {
        'A': { SAS: 3, FUNDACION: 1 },
        'B': { SRL: 3, SAS: 2, SOCIEDAD_HECHO: 1 },
        'C': { SRL: 3, SA: 2, ASOCIACION_CIVIL: 2 },
        'D': { SA: 4, ASOCIACION_CIVIL: 3 }
    },
    q3: {
        'A': { SAS: 3, SRL: 3, SA: 3, SOCIEDAD_HECHO: -3 },
        'B': { SAS: 2, SRL: 2, SA: 2, SOCIEDAD_HECHO: -1 },
        'C': { SOCIEDAD_HECHO: 2 }
    },
    q4: {
        'A': { SOCIEDAD_HECHO: 3, SAS: 2 },
        'B': { SAS: 3, SRL: 3 },
        'C': { SRL: 3, SA: 2 },
        'D': { SA: 4, SOCIEDAD_HECHO: -3 }
    },
    q5: {
        'A': { SA: 4, SAS: 3, SOCIEDAD_HECHO: -2 },
        'B': { SA: 2, SAS: 2, SRL: 1 },
        'C': { SRL: 2, SOCIEDAD_HECHO: 1 }
    },
    q6: {
        'A': { SAS: 3, SOCIEDAD_HECHO: 3, SRL: 2, SA: -2 },
        'B': { SAS: 2, SRL: 2 },
        'C': { SA: 2 }
    },
    q7: {
        'A': { SAS: 4, SRL: 1 },
        'B': { SRL: 4, SAS: 2 },
        'C': { SA: 4 },
        'D': { ASOCIACION_CIVIL: 5 },
        'E': { FUNDACION: 5 }
    },
    q8: {
        'A': { FUNDACION: 5 },
        'B': { ASOCIACION_CIVIL: 2, SAS: 1, SRL: 1 },
        'C': { ASOCIACION_CIVIL: 1, FUNDACION: 1 }
    }
};

const RESULT_INFO = {
    SAS: {
        name: "SAS",
        title: "Sociedad por Acciones Simplificada",
        desc: "proyectos que buscan una estructura ágil, moderna y flexible.",
        details: "Ideal para startups y emprendedores que valoran la rapidez administrativa y la digitalización.",
        icon: "fas fa-rocket",
        class: "res-good",
        cta: "Consultar sobre constitución de SAS",
        wa: "Hola! Hice el test y el resultado fue SAS. Me interesa constituir una Sociedad por Acciones Simplificada."
    },
    SRL: {
        name: "SRL",
        title: "Sociedad de Responsabilidad Limitada",
        desc: "una de las estructuras más robustas y utilizadas por PyMEs.",
        details: "Ofrece excelente protección patrimonial con costos de mantenimiento equilibrados para negocios estables.",
        icon: "fas fa-shield-alt",
        class: "res-good",
        cta: "Solicitar asesoramiento para SRL",
        wa: "Hola! Hice el test y mi resultado fue SRL. Me gustaría recibir información para crear una Sociedad de Responsabilidad Limitada."
    },
    SA: {
        name: "SA",
        title: "Sociedad Anónima",
        desc: "proyectos con proyección corporativa o necesidad de grandes inversores.",
        details: "La estructura institucional por excelencia para el crecimiento a gran escala y la formalidad absoluta.",
        icon: "fas fa-building",
        class: "res-good",
        cta: "Hablar con especialista en SA",
        wa: "Hola! Mi resultado en el test fue SA. Necesito asesoramiento profesional para la constitución de una Sociedad Anónima."
    },
    SOCIEDAD_HECHO: {
        name: "Sociedad Simple",
        title: "Sociedad Simple o de Hecho",
        desc: "proyectos pequeños, informales o en etapas de prueba.",
        details: "Es la vía más rápida pero recordá que la protección patrimonial es limitada. Recomendamos formalizar si el negocio crece.",
        icon: "fas fa-handshake",
        class: "res-mid",
        cta: "Regularizar mi sociedad de hecho",
        wa: "Hola! El test me recomendó una Sociedad Simple/de Hecho, pero me gustaría saber si me conviene formalizar hacia una SRL o SAS."
    },
    ASOCIACION_CIVIL: {
        name: "Asociación Civil",
        title: "Asociación Civil",
        desc: "actividades sociales, culturales o comunitarias sin fines de lucro.",
        details: "La estructura adecuada para organizar grupos de personas tras un objetivo de bienestar común o deportivo.",
        icon: "fas fa-users",
        class: "res-good",
        cta: "Consultar sobre Asociación Civil",
        wa: "Hola! Estoy lanzando un proyecto social y el test me recomendó una Asociación Civil. ¿Cómo son los pasos para constituirla?"
    },
    FUNDACION: {
        name: "Fundación",
        title: "Fundación",
        desc: "proyectos institucionales con un patrimonio destinado al bien común.",
        details: "Ideal cuando existe una asignación específica de bienes para sostener una causa filantrópica a largo plazo.",
        icon: "fas fa-heart",
        class: "res-good",
        cta: "Asesoramiento para Fundaciones",
        wa: "Hola! Hice el test y el resultado fue Fundación. Tengo un proyecto filantrópico y me gustaría recibir asesoramiento legal."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tool-form');
    const resultsSection = document.getElementById('tool-results');
    const resultsGrid = document.getElementById('results-grid');
    const resultsMeta = document.getElementById('results-meta');
    const mainConclusion = document.getElementById('main-conclusion');
    const ctaPrincipal = document.getElementById('cta-principal');
    const ctaWhatsApp = document.getElementById('cta-whatsapp');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Inicializar scores
        let scores = {
            SAS: 0,
            SRL: 0,
            SA: 0,
            SOCIEDAD_HECHO: 0,
            ASOCIACION_CIVIL: 0,
            FUNDACION: 0
        };

        // Respuestas
        const answers = {
            q1: data.q1_objetivo,
            q2: data.q2_socios,
            q3: data.q3_responsabilidad,
            q4: data.q4_escala,
            q5: data.q5_inversores,
            q6: data.q6_simplicidad,
            q7: data.q7_descripcion,
            q8: data.q8_patrimonio
        };

        // Calcular scores base
        Object.keys(answers).forEach(qKey => {
            const val = answers[qKey];
            if (SOCIEDAD_SCORES[qKey] && SOCIEDAD_SCORES[qKey][val]) {
                const points = SOCIEDAD_SCORES[qKey][val];
                Object.keys(points).forEach(socType => {
                    scores[socType] += points[socType];
                });
            }
        });

        // REGLAS DE DESCARTE (Exclusión estricta)
        let excludedTypes = new Set();

        // 1. Objetivo social/filantrópico -> Descarta comerciales
        if (answers.q1 === 'C' || answers.q1 === 'D') {
            excludedTypes.add('SAS');
            excludedTypes.add('SRL');
            excludedTypes.add('SA');
            excludedTypes.add('SOCIEDAD_HECHO');
        }
        // 2. Objetivo de ganancias -> Descarta sociales
        if (answers.q1 === 'A') {
            excludedTypes.add('ASOCIACION_CIVIL');
            excludedTypes.add('FUNDACION');
        }
        // 3. Patrimonio para causa -> Potencia Fundación, inclina Balanza
        if (answers.q8 === 'A') {
            // No excluye pero hace muy difícil que gane una comercial
        }

        // Ordenar resultados filtrando los excluidos
        const rankedResults = Object.keys(scores)
            .filter(type => !excludedTypes.has(type))
            .map(type => ({ type, score: scores[type] }))
            .sort((a, b) => b.score - a.score);

        if (rankedResults.length > 0) {
            const best = rankedResults[0];
            const second = rankedResults[1];

            // Diferencia para determinar si mostramos alternativa
            const diff = second ? (best.score - second.score) : 10;

            displayResults(best, (diff < 3 && second ? second : null));
        }
    });

    function displayResults(primary, alternative) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        const pData = RESULT_INFO[primary.type];

        // Results Meta (Dual Explanation)
        resultsMeta.innerHTML = '';
        if (alternative) {
            resultsMeta.innerHTML = `
                <div class="dual-explanation">
                    <i class="fas fa-info-circle"></i> 
                    <strong>Análisis de viabilidad:</strong> Tu perfil presenta características compatibles con ambas estructuras. La elección final dependerá de factores específicos como costos de mantenimiento vs. agilidad operativa que evaluaremos en una consulta.
                </div>
            `;
            resultsGrid.classList.add('dual-results');
            const aData = RESULT_INFO[alternative.type];
            resultsGrid.innerHTML = `
                ${renderResultCard(pData, "Opción Recomendada")}
                ${renderResultCard(aData, "Alternativa Viable")}
            `;
        } else {
            resultsGrid.classList.remove('dual-results');
            resultsGrid.innerHTML = renderResultCard(pData, "Recomendación");
        }

        // Final Conclusion
        mainConclusion.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--color-primary); font-size: 1.75rem; margin-bottom: 1rem;">
                    Estructura sugerida: ${pData.title}
                </h3>
                <p style="font-size: 1.1rem; color: var(--color-text-body); max-width: 800px; margin: 0 auto; line-height: 1.6;">
                    Elegir el tipo societario correcto es el primer paso para proteger tu patrimonio y asegurar el crecimiento de tu proyecto. En <strong>Enlace Societario</strong> te acompañamos en todo el proceso de constitución y registro.
                </p>
            </div>
        `;

        // Dynamic CTAs
        ctaPrincipal.textContent = pData.cta;

        const waBase = "https://wa.me/5491167805489?text=";
        const msg = encodeURIComponent(pData.wa + (alternative ? " También vi como alternativa la " + RESULT_INFO[alternative.type].title + "." : ""));
        ctaWhatsApp.href = waBase + msg;

        // Share Feature
        addShareFeature(pData.title);
    }

    function renderResultCard(data, label) {
        return `
            <div class="res-card ${data.class}">
                <i class="${data.icon}"></i>
                <span style="font-size: 0.65rem; font-weight: 800; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">${label}</span>
                <h4 style="margin-bottom: 0.25rem;">${data.name}</h4>
                <p style="font-weight: 700; color: var(--color-primary);"><strong>${data.title}</strong></p>
                <div style="margin-top: 1rem; flex-grow: 1;">
                    <p style="font-size: 0.85rem; line-height: 1.4; color: #4A5568;">Ideal para ${data.desc}</p>
                    <p style="margin-top: 0.75rem; font-size: 0.75rem; opacity: 0.8; font-style: italic;">${data.details}</p>
                </div>
            </div>
        `;
    }

    function addShareFeature(result) {
        let shareContainer = document.getElementById('share-container');
        if (!shareContainer) {
            shareContainer = document.createElement('div');
            shareContainer.id = 'share-container';
            shareContainer.style.marginTop = '1.5rem';
            document.querySelector('.main-result-box').appendChild(shareContainer);
        }

        const shareText = encodeURIComponent(`¡Hice el test de Enlace Societario! Mi resultado fue ${result}. Podés hacerlo gratis acá: `);
        const shareUrl = encodeURIComponent(window.location.href);

        shareContainer.innerHTML = `
            <button onclick="window.open('https://api.whatsapp.com/send?text=${shareText}${shareUrl}', '_blank')" 
                    style="background: none; border: none; color: #4A5568; font-size: 0.85rem; cursor: pointer; text-decoration: underline; display: flex; align-items: center; gap: 0.5rem; margin: 0 auto; opacity: 0.8;">
                <i class="fas fa-share-nodes"></i> Compartir resultado
            </button>
        `;
    }
});
