"""
Management command: python manage.py seed_data

Creates:
  - 2 admin users
  - 3 client users from different countries
  - 20 mock chats (mix of consulta / garantia) with messages
  - SiteSettings default record

Safe to run multiple times — skips existing records.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

USERS = [
    {
        "email": "admin@distrivalto.com",
        "name": "Admin Principal",
        "password": "admin123",
        "is_admin": True,
        "is_client": False,
        "is_staff": True,
        "country": "Colombia",
        "city": "Bogotá",
    },
    {
        "email": "soporte@distrivalto.com",
        "name": "Soporte Técnico",
        "password": "admin123",
        "is_admin": True,
        "is_client": False,
        "is_staff": True,
        "country": "Colombia",
        "city": "Medellín",
    },
    {
        "email": "carlos.rodriguez@example.com",
        "name": "Carlos Rodríguez",
        "password": "cliente123",
        "is_client": True,
        "country": "Colombia",
        "city": "Bogotá",
        "age": 34,
    },
    {
        "email": "maria.garcia@example.com",
        "name": "María García",
        "password": "cliente123",
        "is_client": True,
        "country": "México",
        "city": "Ciudad de México",
        "age": 28,
    },
    {
        "email": "pedro.lopez@example.com",
        "name": "Pedro López",
        "password": "cliente123",
        "is_client": True,
        "country": "Venezuela",
        "city": "Caracas",
        "age": 41,
    },
    {
        "email": "ana.martinez@example.com",
        "name": "Ana Martínez",
        "password": "cliente123",
        "is_client": True,
        "country": "Ecuador",
        "city": "Quito",
        "age": 31,
    },
    {
        "email": "luis.perez@example.com",
        "name": "Luis Pérez",
        "password": "cliente123",
        "is_client": True,
        "country": "Perú",
        "city": "Lima",
        "age": 45,
    },
]

MOCK_CHATS = [
    # (type, title, messages[(role, content), ...])
    (
        "consulta",
        "Consulta sobre refrigerador industrial 600L",
        [
            ("user", "Buenas tardes, necesito información sobre el refrigerador industrial de 600 litros. ¿Está disponible para Colombia?"),
            ("bot", "Buenas tardes. El refrigerador industrial de 600 litros está disponible en nuestro catálogo para distribución en Colombia. Contamos con stock en Bogotá y Cali. ¿Requiere la ficha técnica o una cotización formal?"),
            ("user", "Sí, me gustaría la ficha técnica y el precio por unidad para un pedido de 5 equipos."),
            ("bot", "Perfecto. Le haré llegar la ficha técnica al correo registrado. Para un pedido de 5 unidades aplicamos descuento por volumen del 8%. Un asesor comercial le contactará dentro de las próximas 2 horas hábiles con la cotización detallada."),
        ],
    ),
    (
        "garantia",
        "Garantía compresor de aire 2HP falla eléctrica",
        [
            ("user", "Mi compresor de aire de 2HP presenta una falla eléctrica, se traba el motor al arrancar. Lo compré hace 4 meses."),
            ("bot", "Lamentamos el inconveniente. El compresor de 2HP tiene garantía de 12 meses por defectos de fabricación. La falla que describe puede ser un problema con el capacitor de arranque o la bobina del motor. Registraremos el caso inmediatamente."),
            ("user", "Gracias. ¿Qué documentos necesito presentar?"),
            ("bot", "Para procesar la garantía necesitamos: (1) Factura de compra, (2) Foto o video del problema, (3) Número de serie del equipo (ubicado en la placa trasera). Una vez recibamos esta información, un técnico se desplazará a su ubicación en un plazo máximo de 48 horas hábiles."),
        ],
    ),
    (
        "consulta",
        "Disponibilidad motor eléctrico trifásico 5HP",
        [
            ("user", "Necesito saber si tienen motores eléctricos trifásicos de 5HP en stock. Es para una urgencia de producción."),
            ("bot", "Sí, tenemos disponibilidad inmediata de motores trifásicos de 5HP marca WEG y Siemens. Para urgencias de producción podemos gestionar despacho el mismo día si el pedido se confirma antes de las 2 PM. ¿Cuál es su ubicación?"),
            ("user", "Estamos en Cali. ¿El despacho llega hoy?"),
            ("bot", "Para Cali podemos garantizar despacho hoy con llegada mañana antes del mediodía via courier expreso. El costo de flete adicional por servicio express es de $45.000 COP. ¿Confirmo el pedido?"),
        ],
    ),
    (
        "garantia",
        "Garantía bomba de agua sumergible, no enciende",
        [
            ("user", "Tengo una bomba sumergible que compré hace 2 meses y ya no enciende. Revisé el cableado y todo está bien."),
            ("bot", "Entendemos la situación. Una bomba que no enciende a los 2 meses de uso es un defecto cubierto por garantía. Las causas más comunes son: quemado del bobinado por variación de voltaje, o falla en el capacitor. Procesaremos el cambio o revisión técnica sin costo."),
            ("user", "¿Cuánto tiempo tarda el proceso de garantía?"),
            ("bot", "El proceso de garantía para bombas sumergibles toma entre 7 y 12 días hábiles: recepción del equipo (2 días), diagnóstico técnico (3-5 días), reparación o reposición (2-5 días). Si el diagnóstico confirma defecto de fabricación, el equipo se repara o reemplaza sin costo adicional."),
        ],
    ),
    (
        "consulta",
        "Catálogo generadores de emergencia",
        [
            ("user", "Hola, estoy interesado en generadores de emergencia para una clínica. ¿Qué opciones manejan?"),
            ("bot", "Buenas. Para aplicaciones críticas como clínicas manejamos generadores industriales de 15 kVA hasta 500 kVA de marcas Cummins, Kohler y Caterpillar. Todos incluyen transferencia automática (ATS) y pueden configurarse con arranque automático ante corte de energía. ¿Cuál es la carga total en kVA de la clínica?"),
            ("user", "Tenemos una carga aproximada de 80 kVA. ¿Qué generador recomiendan?"),
            ("bot", "Para 80 kVA de carga real recomendamos instalar un generador de 100 kVA para tener un 25% de margen de seguridad, especialmente en ambientes hospitalarios. El Cummins C100D5 es nuestra opción más popular para este tipo de instalación. Incluimos instalación, puesta en marcha y capacitación al personal técnico sin costo adicional."),
        ],
    ),
    (
        "consulta",
        "Precio tableros eléctricos distribución",
        [
            ("user", "Buenos días, necesito cotizar tableros de distribución eléctrica para un proyecto residencial de 24 apartamentos."),
            ("bot", "Buenos días. Para proyectos residenciales de 24 apartamentos generalmente se requiere un tablero general de medida (TGM) y tableros individuales por apartamento. ¿El proyecto es trifásico o monofásico? ¿Ya tienen la carga calculada por electricista?"),
            ("user", "Es monofásico, 110V. El calculista indicó 30A por apartamento."),
            ("bot", "Con esa especificación recomendamos: TGM con breaker principal de 200A + 24 circuitos de 30A, más 24 tableros individuales de 4 circuitos. Tenemos en stock la línea Schneider Electric y ABB. Le preparo cotización formal con precios por unidad y descuento por proyecto."),
        ],
    ),
    (
        "garantia",
        "Garantía UPS 3kVA, batería dañada",
        [
            ("user", "Tengo un UPS de 3kVA que tiene 8 meses de uso y la batería ya no carga. El equipo muestra error de batería."),
            ("bot", "El error de batería en un UPS de 8 meses indica posiblemente una falla prematura de la batería sellada, que puede ser por: ciclos de carga irregulares, temperatura ambiental elevada, o defecto del banco de baterías. La garantía cubre este tipo de falla."),
            ("user", "¿El reemplazo de batería es cubierto por garantía?"),
            ("bot", "Sí, las baterías de UPS tienen garantía de 12 meses por defecto de fabricación. Si el diagnóstico confirma falla prematura no atribuible al uso incorrecto, el reemplazo del banco de baterías es sin costo. Necesitamos que nos envíe el número de serie del UPS para verificar fecha de compra en nuestro sistema."),
        ],
    ),
    (
        "consulta",
        "Cable THHN calibre 12 disponibilidad",
        [
            ("user", "¿Tienen cable THHN calibre 12 en rollo de 100 metros? Necesito 20 rollos de varios colores."),
            ("bot", "Sí, tenemos cable THHN calibre 12 AWG en rollos de 100 metros en todos los colores estándar (negro, rojo, blanco, verde, azul, amarillo). Para un pedido de 20 rollos aplicamos precio de distribuidor. ¿Los necesita para entrega inmediata o tiene fecha programada?"),
            ("user", "Los necesito para el viernes. Estoy en Medellín."),
            ("bot", "Para el viernes en Medellín es completamente factible. Procesando el pedido hoy o mañana al mediodía, el despacho llega el jueves por la tarde o el viernes en la mañana. ¿Le envío la cotización al correo o prefiere confirmar aquí mismo?"),
        ],
    ),
    (
        "garantia",
        "Falla en variador de velocidad 5HP primer uso",
        [
            ("user", "Acabo de instalar el variador de velocidad de 5HP que compré la semana pasada y al encenderlo por primera vez muestra error E-04 y no arranca el motor."),
            ("bot", "El código E-04 en variadores de velocidad generalmente indica un error de comunicación entre el variador y el motor, o sobrecorriente en el arranque. Como el equipo es nuevo, esto está cubierto por garantía. Antes de procesar la devolución, ¿podría confirmar el calibre del cable entre variador y motor y los parámetros configurados?"),
            ("user", "El cable es calibre 10 y seguí exactamente el manual de instalación. Los parámetros están en configuración de fábrica."),
            ("bot", "Con esa información y siendo un equipo nuevo, procesaremos el cambio directo sin necesidad de diagnóstico técnico previo. Emitiremos una orden de cambio y coordinaremos la recolección del equipo defectuoso y entrega del reemplazo en su misma dirección dentro de 3 días hábiles."),
        ],
    ),
    (
        "consulta",
        "Transformadores de distribución 45 kVA",
        [
            ("user", "Necesito información de transformadores de distribución 13.2/0.22 kV de 45 kVA para un proyecto industrial."),
            ("bot", "Manejamos transformadores de distribución 13.2kV/220V de 45 kVA de tipo pad-mounted y poste, con certificación RETIE. Las principales marcas disponibles son ABB, Trafosbel y SEC. ¿El proyecto requiere transformador convencional en aceite o seco tipo cast-resin?"),
            ("user", "Tipo seco, es para instalación en interior de planta."),
            ("bot", "Para interior de planta industrial el transformador seco es la elección correcta por seguridad y mantenimiento. Tenemos el ABB de 45 kVA tipo RESIBLOC en stock con clase de aislamiento F. Incluimos garantía de 3 años, planos eléctricos y asistencia en la puesta en marcha."),
        ],
    ),
    (
        "consulta",
        "Luminarias LED industriales para bodega",
        [
            ("user", "Necesito luminarias LED para una bodega de 2000 m2, altura de 8 metros. ¿Qué opciones tienen?"),
            ("bot", "Para una bodega de 2000 m2 a 8 metros de altura recomendamos luminarias LED tipo High Bay de 150W o 200W con óptica de 90° para distribución uniforme. Necesitaría saber: ¿cuántas zonas tiene la bodega y cuál es el nivel de iluminación requerido (lux)?"),
            ("user", "Necesitamos 300 lux en área de trabajo. La bodega tiene 3 zonas."),
            ("bot", "Con 300 lux en 2000m2 a 8m de altura, calculamos aproximadamente 40 luminarias LED High Bay de 200W distribuidas en las 3 zonas. Le elaboramos el plano luminotécnico sin costo con simulación en DIALux para que pueda ver la distribución de iluminación antes de comprar."),
        ],
    ),
    (
        "garantia",
        "Motor quemado a los 3 meses de instalación",
        [
            ("user", "El motor de 3HP que compré hace 3 meses se quemó. Hubo un pico de tensión en la red eléctrica del edificio pero el motor tiene garantía."),
            ("bot", "Lamentamos la situación. Para evaluar la cobertura de garantía en caso de daño por pico de tensión, nuestro equipo técnico necesita hacer un diagnóstico del bobinado quemado. En muchos casos, si el pico fue extraordinario, la póliza de garantía del fabricante puede cubrir la reparación total."),
            ("user", "¿Cómo procedo? ¿Lo llevo directamente al servicio técnico?"),
            ("bot", "Le recomendamos no mover el motor hasta que nuestro técnico lo evalúe en sitio, ya que moverlo podría dificultar el diagnóstico de la causa. Agendaremos una visita técnica dentro de las próximas 48 horas. Por favor tenga disponible la factura de compra y cualquier registro eléctrico del evento (factura de energía con histórico, si tiene)."),
        ],
    ),
    (
        "consulta",
        "Consulta breakers industriales Schneider",
        [
            ("user", "¿Tienen breakers industriales Schneider EasyPact de 100A y 250A en stock?"),
            ("bot", "Sí, tenemos en stock la línea Schneider EasyPact EZC en ambas referencias: 100A y 250A, en versión fija y extraíble, tripolar. ¿Los necesita con o sin diferencial incorporado?"),
            ("user", "Sin diferencial, solo magneto-térmico. Necesito 10 de 100A y 5 de 250A."),
            ("bot", "Disponemos de esas cantidades en stock inmediato. Precio lista con descuento canal distribuidor: EZC100 x10 unidades a $285.000 c/u, EZC250 x5 unidades a $485.000 c/u. Descuento adicional del 5% por volumen aplicable a este pedido. ¿Le genero la factura proforma?"),
        ],
    ),
    (
        "consulta",
        "Sensores de temperatura para proceso industrial",
        [
            ("user", "Necesito sensores de temperatura PT100 para medir entre 0 y 200°C en proceso de secado industrial. ¿Tienen?"),
            ("bot", "Sí, trabajamos con sensores PT100 de inmersión y superficie en rangos de -50°C hasta 400°C, con conexión a 2, 3 y 4 hilos. Para proceso de secado industrial recomendamos el PT100 de inmersión en vaina de acero inoxidable 316L. ¿Cuántas unidades necesita y cuál es el medio de medición (aire, líquido, sólido)?"),
            ("user", "Son para medir temperatura de aire en 6 puntos del secador."),
            ("bot", "Para 6 puntos de medición de temperatura de aire recomendamos el PT100 de conexión rápida con cabeza de aluminio y vaina de ½\" NPT, fácil de cambiar sin herramienta. Incluimos los transmisores 4-20mA para integración con su sistema SCADA o PLC. ¿Ya tiene definido el protocolo de comunicación del sistema de control?"),
        ],
    ),
    (
        "garantia",
        "Cargador industrial defectuoso, no carga baterías",
        [
            ("user", "El cargador industrial de 48V/30A que compré el mes pasado no carga correctamente las baterías. El indicador muestra carga completa pero las baterías siguen descargadas."),
            ("bot", "Este comportamiento puede indicar un fallo en el módulo de medición de voltaje del cargador, que presenta lectura incorrecta del estado de carga. Dado que el equipo tiene menos de un mes de uso, esto está cubierto por la garantía completa del fabricante."),
            ("user", "¿Puedo traerlo directamente o debo esperar técnico?"),
            ("bot", "Puede traerlo directamente a cualquiera de nuestros centros de servicio en Bogotá (Cl. 17 #68-50) o Medellín (Cra. 50 #50-50), de lunes a viernes de 8 AM a 5 PM. Lleve la factura de compra. El diagnóstico es inmediato y si se confirma falla del equipo, el cambio se hace en el mismo momento si hay stock disponible."),
        ],
    ),
]


class Command(BaseCommand):
    help = "Populate database with mock users, chats and messages for testing."

    def handle(self, *args, **options):
        from apps.accounts.models import User
        from apps.chats.models import Chat, Message
        from apps.panel.models import SiteSettings

        self.stdout.write("Seeding data...")

        # ── Users ────────────────────────────────────────────────────────────
        created_users = {}
        for udata in USERS:
            email = udata["email"]
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"  skip user {email} (already exists)")
                created_users[email] = User.objects.get(email=email)
                continue
            user = User.objects.create_user(
                email=email,
                name=udata["name"],
                password=udata["password"],
                age=udata.get("age"),
                country=udata.get("country", ""),
                city=udata.get("city", ""),
                is_admin=udata.get("is_admin", False),
                is_client=udata.get("is_client", True),
                is_staff=udata.get("is_staff", False),
            )
            created_users[email] = user
            self.stdout.write(f"  created user {email}")

        # Assign client users for distributing chats
        client_emails = [
            "carlos.rodriguez@example.com",
            "maria.garcia@example.com",
            "pedro.lopez@example.com",
            "ana.martinez@example.com",
            "luis.perez@example.com",
        ]
        clients = [created_users[e] for e in client_emails]

        # ── Chats ────────────────────────────────────────────────────────────
        now = timezone.now()
        for idx, (chat_type, title, messages) in enumerate(MOCK_CHATS):
            # Distribute among clients
            owner = clients[idx % len(clients)]
            # Spread creation dates over last 6 months
            days_ago = (idx + 1) * 10 + random.randint(0, 5)
            created_at = now - timedelta(days=days_ago)

            chat, created = Chat.objects.get_or_create(
                title=title,
                user=owner,
                defaults={"type": chat_type},
            )
            if not created:
                self.stdout.write(f"  skip chat '{title[:40]}' (already exists)")
                continue

            # Manually set created_at via queryset update (auto_now_add bypasses save)
            Chat.objects.filter(pk=chat.pk).update(created_at=created_at)

            msg_time = created_at
            for role, content in messages:
                msg_time += timedelta(minutes=random.randint(1, 5))
                msg = Message.objects.create(chat=chat, role=role, content=content)
                Message.objects.filter(pk=msg.pk).update(created_at=msg_time)

            self.stdout.write(f"  created chat '{title[:40]}' for {owner.email}")

        # ── SiteSettings singleton ────────────────────────────────────────────
        settings_obj = SiteSettings.load()
        if not settings_obj.email:
            settings_obj.email = "contacto@distrivalto.com"
            settings_obj.phone = "+57 601 234 5678"
            settings_obj.link = "https://distrivalto.com"
            settings_obj.api_key = ""
            settings_obj.save()
            self.stdout.write("  created SiteSettings defaults")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
