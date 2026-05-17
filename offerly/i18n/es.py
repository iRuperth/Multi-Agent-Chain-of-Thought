"""Spanish locale bundle for Offerly."""
from __future__ import annotations

CODE = "es"
NAME = "Espanol"

# ---------------------------------------------------------------------------
# Chain-of-Thought scaffolding
# ---------------------------------------------------------------------------

COT_PREAMBLE = ""

COT_BACKSTORY_SUFFIX = ""

OUTPUT_LANGUAGE_NOTE = "Idioma: responde en espanol."

# ---------------------------------------------------------------------------
# Agents
# ---------------------------------------------------------------------------

AGENTS = {
    "interviewer": {
        "role": "Entrevistador de comerciantes Offerly",
        "goal": (
            "Entender que quiere promocionar el comerciante: tipo de "
            "negocio, ubicacion, servicio, publico objetivo y objetivo de "
            "la campana. Hacer preguntas de clarificacion cuando falte "
            "algo critico, y guardar lo aprendido en la campana."
        ),
        "backstory": (
            "Veterano del equipo de Merchant Success. Sabe que los "
            "comerciantes llegan con ideas vagas y hay que aterrizarlas "
            "en datos concretos: categoria, precio publico, capacidad "
            "semanal, exclusiones."
        ),
    },
    "copywriter": {
        "role": "Creativo de copy de ofertas",
        "goal": (
            "Escribir un titulo (<=70 chars) y una descripcion "
            "(150-600 chars) atractivos, honestos y conformes a las "
            "politicas de Offerly. Guardarlos en la campana."
        ),
        "backstory": (
            "Copywriter especializado en ofertas locales. Evita "
            "superlativos falsos y mayusculas; favorece gancho concreto + "
            "beneficio claro."
        ),
    },
    "market_analyst": {
        "role": "Analista de mercado de Offerly",
        "goal": (
            "Recomendar descuento, precio Offerly y stock razonables "
            "segun los benchmarks de la categoria y la capacidad del "
            "comerciante. Actualizar pricing y stock en la campana."
        ),
        "backstory": (
            "Analista con datos historicos de miles de campanas por "
            "categoria y ciudad. Sabe que un descuento demasiado bajo no "
            "convierte y uno demasiado alto destruye margen."
        ),
    },
    "demand_simulator": {
        "role": "Simulador de demanda (Monte Carlo)",
        "goal": (
            "Ejecutar la simulacion sobre la campana actual y registrar "
            "p10/p50/p90 de unidades y beneficio, ademas de la "
            "probabilidad de ser rentable."
        ),
        "backstory": (
            "Equivalente moderno del 'tirar dados': miles de escenarios "
            "con ruido sobre la conversion para acotar el rango realista "
            "de resultados."
        ),
    },
    "policy_validator": {
        "role": "Validador de politicas de Offerly",
        "goal": (
            "Comprobar que la campana cumple todas las politicas: "
            "descuentos, validez del cupon, copy, stock, categorias "
            "reguladas. Devolver errores y warnings explicitos."
        ),
        "backstory": (
            "Antiguo responsable de cumplimiento. Su no es no: si la "
            "campana tiene errores, no se publica hasta corregirlos."
        ),
    },
    "archivist": {
        "role": "Archivista de campanas",
        "goal": (
            "Asegurar que la campana esta completa, exportarla a JSON y "
            "Markdown, y devolver las rutas de los ficheros."
        ),
        "backstory": (
            "Cierra el ciclo: revisa que todos los campos criticos estan "
            "rellenos y persiste la ficha final."
        ),
    },
}

# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


def task_intake(merchant_input: str, cat_list: str) -> tuple[str, str]:
    description = (
        "OBLIGATORIO: DEBES invocar la tool update_campaign. No produzcas "
        "Final Answer hasta que update_campaign haya devuelto con exito.\n\n"
        "Llama a update_campaign exactamente una vez con los datos del "
        "comerciante de este pitch. Incluye estos campos cuando se "
        "mencionen: merchant_name (nombre del negocio), business_type "
        "(tipo), city, neighborhood (barrio), category (uno de: "
        f"{cat_list}), goal, target_audience, weekly_capacity (int), "
        "pricing.pvp_eur (precio completo, numero), "
        "pricing.variable_cost_eur (numero). "
        "Si un campo no esta en el pitch, omitelo — no inventes.\n\n"
        f"Pitch: {merchant_input}"
    )
    expected = (
        "El objeto JSON devuelto por update_campaign tras una llamada "
        "exitosa, mostrando los campos guardados. Si no llamaste a "
        "update_campaign, la tarea ha fallado."
    )
    return description, expected


def task_pricing() -> tuple[str, str]:
    description = (
        "OBLIGATORIO: DEBES invocar la tool update_campaign. No produzcas "
        "Final Answer hasta que update_campaign haya devuelto con exito.\n\n"
        "Paso 1: llama a category_benchmarks con la categoria del contexto.\n"
        "Paso 2: llama a update_campaign exactamente una vez con patch_json "
        "que contenga: offerly_price_eur (menor que pvp_eur, usa un "
        "descuento dentro del rango del benchmark), stock (entre 20 y 10x "
        "weekly_capacity), voucher_validity_days (60 a 365, defecto 120), "
        "weekly_slots (lista de al menos 3 strings tipo 'Martes 17-20'). "
        "Manten pricing.commission_pct en 40."
    )
    expected = (
        "El objeto JSON devuelto por update_campaign confirmando que "
        "pricing/stock/slots se guardaron. Si no llamaste a "
        "update_campaign, la tarea ha fallado."
    )
    return description, expected


def task_copy() -> tuple[str, str]:
    description = (
        "OBLIGATORIO: DEBES invocar la tool update_campaign. No produzcas "
        "Final Answer hasta que update_campaign haya devuelto con exito.\n\n"
        "merchant_name y business_type estan fijados al inicio de tu "
        "contexto — escribe copy SOLO sobre ese negocio exacto. El "
        "servicio que describas DEBE coincidir literalmente con "
        "business_type.\n\n"
        "Llama a update_campaign exactamente una vez con patch_json que "
        "contenga: offer_name (corto, incluye merchant_name), title "
        "(max 70 chars), description (150-600 chars), fine_print "
        "(lista de 2-4 strings cortos)."
    )
    expected = (
        "El objeto JSON devuelto por update_campaign confirmando que "
        "offer_name/title/description/fine_print se guardaron. Si no "
        "llamaste a update_campaign, la tarea ha fallado."
    )
    return description, expected


def task_simulate() -> tuple[str, str]:
    description = (
        "Lanza simulate_demand con impressions=20000, runs=2000, seed=42. "
        "Resume el resultado en bullets (p10/p50/p90 de unidades y "
        "beneficio, y probabilidad de ser rentable)."
    )
    expected = "Bullets con los percentiles y la probabilidad."
    return description, expected


def task_validate() -> tuple[str, str]:
    description = (
        "Primero llama a retrieve_policy_clauses con una consulta breve que "
        "resuma la campana (categoria, angulo del titular, lo que pueda "
        "estar regulado). Despues llama a validate_policies. Si ok=true, "
        "indica que la campana es publicable. Si ok=false, lista los "
        "errores tal cual, sugiere una correccion concreta para cada uno y "
        "cita el section_title de la clausula recuperada que se incumple. "
        "No corrijas tu mismo: solo informa."
    )
    expected = (
        "Veredicto (ok/no) + lista de errores y warnings + sugerencias, "
        "cada error citando el section_title de la politica que incumple."
    )
    return description, expected


def task_archive() -> tuple[str, str]:
    description = (
        "Invoca export_campaign con out_dir='out'. Eso es todo. El tool lee "
        "el estado actual y escribe los archivos JSON y Markdown por ti. "
        "No describas lo que vas a hacer: solo llama al tool."
    )
    expected = (
        "Las rutas exactas devueltas por export_campaign, seguidas de una "
        "linea: 'Campana guardada.'"
    )
    return description, expected


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

CLI = {
    "panel_title": "Offerly",
    "welcome": (
        "# Offerly — Onboarding de campanas\n\n"
        "Hola, soy el asistente de onboarding. Describeme tu negocio y "
        "que oferta te gustaria lanzar. Incluye el nombre del negocio, "
        "el tipo, la ciudad, el precio completo, tu coste variable por "
        "unidad, la capacidad semanal, el publico objetivo y el objetivo "
        "de la campana.\n\n"
        "Escribe tu peticion (varias lineas; termina con una linea en "
        "blanco):"
    ),
    "no_input": "Sin entrada. Saliendo.",
    "launching": "Lanzando la Crew...",
    "crew_error": "Error ejecutando la Crew:",
    "final_sheet": "Ficha final",
    "crew_summary": "Resumen de la Crew",
}

# ---------------------------------------------------------------------------
# Markdown labels for Campaign.render_markdown
# ---------------------------------------------------------------------------

MD = {
    "campaign": "Campana",
    "unnamed": "(sin nombre)",
    "merchant": "Comerciante",
    "location": "Ubicacion",
    "category": "Categoria",
    "goal": "Objetivo",
    "target_audience": "Publico objetivo",
    "copy": "Copy",
    "title": "Titulo",
    "description": "Descripcion",
    "pending": "(pendiente)",
    "conditions": "Condiciones",
    "voucher_validity": "Validez del cupon",
    "days": "dias",
    "stock": "Stock",
    "weekly_capacity": "Capacidad semanal",
    "weekly_slots": "Franjas semanales",
    "undefined": "(sin definir)",
    "fine_print": "Letra pequena",
    "none": "(ninguna)",
    "pricing_margin": "Precios y margen",
    "rrp": "PVP",
    "offerly_price": "Precio Offerly",
    "discount": "Descuento",
    "variable_cost": "Coste variable",
    "commission": "Comision Offerly",
    "merchant_revenue_unit": "Ingreso comerciante / unidad",
    "margin_unit": "Margen / unidad",
    "demand_simulation": "Simulacion de demanda",
    "units_sold": "Unidades vendidas (p10/p50/p90)",
    "profit_eur": "Beneficio EUR (p10/p50/p90)",
    "probability_profitable": "Probabilidad de ser rentable",
    "note": "Nota",
    "stock_saturated": (
        "la demanda mediana satura el stock ({stock}); considera aumentar "
        "inventario para capturar mas ingresos."
    ),
}

# ---------------------------------------------------------------------------
# Validator messages
# ---------------------------------------------------------------------------

VALIDATOR = {
    "unknown_category": "Categoria desconocida: {category!r}.",
    "discount_below_min": "Descuento {d}% < minimo {min}%.",
    "discount_above_hard_cap": "Descuento {d}% > tope absoluto {cap}%.",
    "discount_above_recommended": "Descuento {d}% por encima del recomendado {max}%.",
    "negative_margin": "Margen por unidad negativo ({m} EUR): la campana destruye valor.",
    "voucher_below_min": "Validez del cupon {v}d < minimo {min}d.",
    "voucher_above_max": "Validez del cupon {v}d > maximo {max}d.",
    "few_slots": "Solo {n} franjas semanales declaradas; minimo {min}.",
    "title_too_long": "Titulo de {n} chars > maximo {max}.",
    "title_all_caps": "Titulo en mayusculas no permitido.",
    "multi_exclamations": "Evita exclamaciones multiples en el titulo.",
    "banned_claim_title": "Claim prohibido en titulo: {bad!r}.",
    "desc_too_short": "Descripcion de {n} chars < minimo {min}.",
    "desc_too_long": "Descripcion de {n} chars > maximo {max}.",
    "banned_claim_health": "Claim de salud prohibido: {bad!r}.",
    "regulated_disclaimer_missing": (
        "Categoria regulada: anade un disclaimer sobre resultados / no "
        "garantia medica."
    ),
    "stock_below_min": "Stock {s} < minimo publicable {min}.",
    "stock_overbooking": (
        "Stock {s} > 10x capacidad semanal ({cap}). Riesgo de overbooking."
    ),
    "non_standard_commission": (
        "Comision {c}% fuera de los tramos estandar ({default}% o {negotiated}%)."
    ),
}

# ---------------------------------------------------------------------------
# Banned-claim patterns (Spanish copy)
# ---------------------------------------------------------------------------

BANNED_CLAIMS_HEALTH = [
    "cura",
    "garantizado",
    "100% efectivo",
    "adelgaza",
    "elimina toda la grasa",
    "milagroso",
]

BANNED_SUPERLATIVES = [
    "el mejor",
    "la mejor",
    "unico en",
    "numero 1",
    "#1",
]

# ---------------------------------------------------------------------------
# Category labels
# ---------------------------------------------------------------------------

CATEGORY_LABELS = {
    "spa_beauty": "Spa y belleza",
    "food_drink": "Restauracion",
    "leisure_activities": "Ocio y actividades",
    "health": "Salud",
    "fitness": "Fitness",
    "home_services": "Hogar y servicios",
    "travel_getaways": "Viajes y escapadas",
}
