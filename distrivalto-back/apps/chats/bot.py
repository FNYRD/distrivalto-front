"""
Mock bot response engine.

Simulates a chatbot reply until the real chatbot integration is added.
Responses are selected based on chat type and a simple hash of the message
so the same input always returns the same reply (deterministic and testable).
"""

import hashlib

CONSULTA_RESPONSES = [
    (
        "Gracias por tu consulta. He revisado la información disponible sobre el producto. "
        "Puedo confirmar que está disponible en nuestro catálogo actual y cuenta con todas "
        "las especificaciones técnicas que describes."
    ),
    (
        "Entiendo tu consulta. El producto solicitado se encuentra disponible y puede ser "
        "despachado en un plazo de 3 a 5 días hábiles. ¿Deseas más información sobre las "
        "condiciones de envío o una cotización formal?"
    ),
    (
        "He procesado tu solicitud de información. El artículo que mencionas tiene "
        "disponibilidad inmediata en nuestras bodegas de Bogotá y Medellín. Nuestro equipo "
        "comercial puede enviarte una propuesta detallada si lo requieres."
    ),
    (
        "Con gusto te ayudo con esta consulta. Según nuestro sistema, el producto cumple con "
        "todos los requisitos técnicos que describes. ¿Necesitas los certificados técnicos o "
        "la ficha de seguridad del producto?"
    ),
    (
        "Gracias por contactarnos. La información que necesitas está disponible. El producto "
        "cuenta con certificación técnica y puede ser entregado a nivel nacional con un tiempo "
        "de tránsito de 2 a 4 días hábiles según tu ciudad."
    ),
    (
        "He revisado tu consulta en nuestro sistema. El producto que solicitas está incluido en "
        "nuestro portafolio de distribución. ¿Te gustaría que un asesor comercial te contacte "
        "para brindar una cotización personalizada?"
    ),
]

GARANTIA_RESPONSES = [
    (
        "Hemos recibido tu solicitud de garantía. El proceso de revisión tomará entre 5 y 10 "
        "días hábiles. Te notificaremos al correo registrado sobre el estado de tu caso una vez "
        "que nuestro equipo técnico complete el diagnóstico."
    ),
    (
        "Tu caso de garantía ha sido registrado en nuestro sistema. Un técnico especializado se "
        "pondrá en contacto contigo en las próximas 24 horas para coordinar la revisión del "
        "producto y determinar el proceso de reparación o reposición."
    ),
    (
        "Entendemos la situación que describes. He registrado tu solicitud de garantía con "
        "prioridad. Para agilizar el proceso, necesitaremos la factura de compra y una "
        "descripción detallada del defecto presentado. ¿Podrías enviarnos esa información?"
    ),
    (
        "Gracias por reportar esta situación. El producto que describes está dentro del período "
        "de garantía vigente. Procederemos con el proceso de evaluación y te informaremos si "
        "aplica cambio, reparación o crédito según las condiciones del fabricante."
    ),
    (
        "Tu solicitud de garantía ha sido recibida exitosamente en nuestra plataforma. Nuestro "
        "equipo técnico evaluará el caso y te informará sobre el diagnóstico en un plazo máximo "
        "de 5 días hábiles. El número de tu caso es el que aparece en esta conversación."
    ),
    (
        "He registrado la novedad que reportas. Para procesar tu garantía necesitamos verificar "
        "algunos datos del producto. ¿Tienes a la mano el número de serie o código de barras "
        "del artículo afectado?"
    ),
]


def get_bot_response(chat_type: str, message: str) -> str:
    """Return a deterministic mock bot response based on chat type and message hash."""
    pool = GARANTIA_RESPONSES if chat_type == "garantia" else CONSULTA_RESPONSES
    # Use a hash so the same message always yields the same index
    digest = int(hashlib.md5(message.encode()).hexdigest(), 16)
    return pool[digest % len(pool)]
