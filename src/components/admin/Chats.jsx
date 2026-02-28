import { useState, useMemo } from 'react'
import styles from './Chats.module.css'
import logo from '../../../logo.png'

/* ── Mock data ── */

const MOCK_CHATS = [
  {
    id: 'c1',
    title: 'Garantía nevera Samsung RF25 - no enfría',
    type: 'garantia',
    country: 'Colombia',
    date: new Date('2026-02-27T10:14:00'),
    messages: [
      { role: 'user', content: 'Buenas, mi nevera Samsung RF25 lleva 3 días sin enfriar correctamente.' },
      { role: 'bot',  content: '¿Cuánto tiempo lleva con el producto? ¿Tiene el número de serie a mano?' },
      { role: 'user', content: 'Sí, lleva 8 meses. El serial es SRF25-8842-COL.' },
      { role: 'bot',  content: 'Perfecto. Su garantía está vigente. Le asignaremos un técnico en las próximas 48 horas.' },
      { role: 'user', content: '¿El técnico me llama antes de llegar o simplemente aparece?' },
      { role: 'bot',  content: 'El técnico le contactará con al menos 2 horas de anticipación para confirmar la visita.' },
      { role: 'user', content: 'Perfecto. ¿Tienen algún horario específico de atención?' },
      { role: 'bot',  content: 'Las visitas técnicas se realizan de lunes a sábado entre 8am y 6pm.' },
      { role: 'user', content: 'Ok, ¿y si no estoy en casa en ese momento?' },
      { role: 'bot',  content: 'Puede reprogramar la visita hasta con 1 hora de anticipación sin ningún costo adicional.' },
      { role: 'user', content: '¿El técnico trae los repuestos o los tiene que pedir?' },
      { role: 'bot',  content: 'El técnico lleva herramientas de diagnóstico. Si necesita repuesto, se solicita y se agenda una segunda visita.' },
      { role: 'user', content: '¿Esa segunda visita también tiene costo?' },
      { role: 'bot',  content: 'No, todo el proceso está cubierto por garantía sin costo para usted.' },
      { role: 'user', content: '¿Cuánto tiempo toma el proceso completo de reparación?' },
      { role: 'bot',  content: 'El diagnóstico es en la primera visita. Si hay repuesto disponible, la reparación tarda 3 a 5 días hábiles adicionales.' },
      { role: 'user', content: '¿Y si no tiene solución y hay que cambiar el equipo?' },
      { role: 'bot',  content: 'Si el equipo no tiene reparación posible dentro del período de garantía, procedemos con el reemplazo por un modelo equivalente.' },
      { role: 'user', content: 'Excelente. Gracias, quedo pendiente entonces.' },
      { role: 'bot',  content: 'Con gusto. Recibirá un SMS de confirmación con el número de caso #88421-COL. ¿Hay algo más en que pueda ayudarle?' },
      { role: 'user', content: 'No, con eso es suficiente. Muchas gracias.' },
      { role: 'bot',  content: 'A sus órdenes. Que tenga un excelente día.' },
    ],
  },
  {
    id: 'c2',
    title: 'Consulta sobre lavadora LG WM5 doble carga',
    type: 'consulta',
    country: 'Venezuela',
    date: new Date('2026-02-27T08:52:00'),
    messages: [
      { role: 'user', content: '¿La lavadora LG WM5 tiene función de doble carga?' },
      { role: 'bot',  content: 'Sí, el modelo WM5 cuenta con la función TurboWash 360 que permite doble carga.' },
      { role: 'user', content: 'Perfecto, ¿cuál es el precio?' },
      { role: 'bot',  content: 'El precio actual es de $1.250.000 COP. ¿Desea más información sobre formas de pago?' },
      { role: 'user', content: '¿Tienen cuotas sin intereses?' },
      { role: 'bot',  content: 'Sí, ofrecemos hasta 12 cuotas sin intereses con tarjetas Visa y Mastercard.' },
      { role: 'user', content: '¿Y con tarjeta débito?' },
      { role: 'bot',  content: 'Con débito el pago es de contado, pero aplica un descuento adicional del 3%.' },
      { role: 'user', content: '¿Hacen envío a domicilio?' },
      { role: 'bot',  content: 'Sí, envío gratis a cualquier ciudad principal. En ciudades intermedias tiene un costo según distancia.' },
      { role: 'user', content: 'Estoy en Barranquilla, ¿aplica envío gratis?' },
      { role: 'bot',  content: 'Barranquilla sí aplica para envío gratis. Tiempo estimado de entrega: 3 a 5 días hábiles.' },
      { role: 'user', content: '¿La lavadora viene con instalación incluida?' },
      { role: 'bot',  content: 'La entrega incluye conexión básica sin costo. Si necesita tuberías adicionales, tiene un cargo extra.' },
      { role: 'user', content: '¿Qué capacidad tiene en kilos?' },
      { role: 'bot',  content: 'El modelo WM5 tiene capacidad de 20kg, ideal para uso familiar intensivo.' },
      { role: 'user', content: '¿Cuántos programas de lavado trae?' },
      { role: 'bot',  content: 'Cuenta con 14 programas preconfigurados: algodón, delicados, rápido, bebés, deportivo y más.' },
      { role: 'user', content: '¿Consume mucha agua?' },
      { role: 'bot',  content: 'No, es de carga frontal con tecnología inverter. Consume hasta 40% menos agua que modelos convencionales.' },
      { role: 'user', content: '¿Tiene garantía de fábrica?' },
      { role: 'bot',  content: 'Sí, garantía oficial LG de 2 años para partes y mano de obra.' },
      { role: 'user', content: 'Perfecto, creo que me decido. ¿Cómo hago el pedido?' },
      { role: 'bot',  content: 'Puede hacerlo desde nuestra web o llamando al 01-8000-DIST. Un asesor le acompañará en el proceso.' },
    ],
  },
  {
    id: 'c3',
    title: 'Garantía aire acondicionado Carrier 12K - fuga gas',
    type: 'garantia',
    country: 'Ecuador',
    date: new Date('2026-02-26T16:30:00'),
    messages: [
      { role: 'user', content: 'Mi aire Carrier 12K tiene una fuga de gas refrigerante.' },
      { role: 'bot',  content: 'Lamentamos el inconveniente. ¿Cuánto tiempo lleva instalado el equipo?' },
      { role: 'user', content: 'Apenas 4 meses.' },
      { role: 'bot',  content: 'Está dentro de garantía. Escalamos el caso al equipo técnico. Recibirá contacto en 24h.' },
      { role: 'user', content: '¿La fuga puede causar algún peligro en casa?' },
      { role: 'bot',  content: 'El gas R-410A no es tóxico, pero recomendamos ventilar el ambiente y apagar el equipo por precaución.' },
      { role: 'user', content: 'Entendido, ya lo apagué. ¿El técnico trae el gas o debo comprarlo?' },
      { role: 'bot',  content: 'El técnico lleva el gas y todos los materiales necesarios. No debe comprar nada.' },
      { role: 'user', content: '¿También revisarán por qué se produjo la fuga?' },
      { role: 'bot',  content: 'Sí, el técnico hará un diagnóstico completo para identificar el origen y evitar que se repita.' },
      { role: 'user', content: '¿Qué pasa si la fuga se repite después de la reparación?' },
      { role: 'bot',  content: 'Si el problema persiste en menos de 30 días, se cubre nuevamente sin costo bajo garantía de servicio.' },
      { role: 'user', content: '¿Me darán algún documento de la reparación?' },
      { role: 'bot',  content: 'Sí, recibirá un informe técnico firmado con el diagnóstico y los trabajos realizados.' },
      { role: 'user', content: '¿A qué número puedo llamar si no me contactan en 24 horas?' },
      { role: 'bot',  content: 'Puede llamar al 01-800-CARRIER o escribirnos al chat con su número de caso #CR-4421-EC.' },
      { role: 'user', content: 'Gracias, quedo atento.' },
      { role: 'bot',  content: 'Con gusto. Le pedimos disculpas por los inconvenientes y le aseguramos una pronta solución.' },
    ],
  },
  {
    id: 'c4',
    title: 'Consulta TV Samsung 55" compatibilidad con Netflix',
    type: 'consulta',
    country: 'Colombia',
    date: new Date('2026-02-26T14:05:00'),
    messages: [
      { role: 'user', content: '¿El TV Samsung 55 pulgadas es Smart TV y tiene Netflix?' },
      { role: 'bot',  content: 'Sí, el modelo incluye Tizen OS con Netflix, YouTube, Prime Video y más.' },
      { role: 'user', content: '¿Y tiene Bluetooth para parlantes?' },
      { role: 'bot',  content: 'Correcto, incluye Bluetooth 5.2 para conexión de parlantes y audífonos.' },
      { role: 'user', content: '¿Qué resolución tiene?' },
      { role: 'bot',  content: 'Es 4K UHD con tecnología QLED, resolución 3840x2160 píxeles.' },
      { role: 'user', content: '¿Tiene HDR?' },
      { role: 'bot',  content: 'Sí, compatible con HDR10+, HLG y Dolby Vision para imagen de alta gama.' },
      { role: 'user', content: '¿Cuántos puertos HDMI tiene?' },
      { role: 'bot',  content: 'Cuenta con 4 puertos HDMI 2.1, ideales para consolas y reproductores de última generación.' },
      { role: 'user', content: '¿Se puede conectar a la PC como monitor?' },
      { role: 'bot',  content: 'Sí, tiene modo PC nativo que reduce el lag de entrada a menos de 5ms.' },
      { role: 'user', content: '¿Tiene control por voz?' },
      { role: 'bot',  content: 'Incluye Bixby integrado y es compatible con Alexa y Google Assistant.' },
      { role: 'user', content: '¿El soporte de pared viene incluido?' },
      { role: 'bot',  content: 'No, el soporte de pared es opcional. Tenemos kits compatibles desde $85.000 COP.' },
      { role: 'user', content: '¿Cuánto cuesta el televisor?' },
      { role: 'bot',  content: 'El precio actual del Samsung 55" QLED 4K es $2.890.000 COP con garantía de 2 años.' },
      { role: 'user', content: 'Está un poco fuera de mi presupuesto. ¿Tienen algo similar más económico?' },
      { role: 'bot',  content: 'Sí, el Samsung 55" Crystal UHD tiene características similares a $1.990.000 COP.' },
    ],
  },
  {
    id: 'c5',
    title: 'Garantía microondas Haceb 28L no calienta',
    type: 'garantia',
    country: 'Colombia',
    date: new Date('2026-02-26T11:20:00'),
    messages: [
      { role: 'user', content: 'El microondas Haceb que compré hace 2 meses dejó de calentar.' },
      { role: 'bot',  content: '¿El equipo enciende pero no calienta, o no enciende en absoluto?' },
      { role: 'user', content: 'Enciende normalmente pero no calienta nada.' },
      { role: 'bot',  content: 'Posiblemente el magnetrón. Dentro de garantía cubrimos reemplazo o reparación sin costo.' },
      { role: 'user', content: '¿Puedo llevar el equipo directamente al servicio técnico?' },
      { role: 'bot',  content: 'Puede llevarlo a cualquiera de nuestros centros autorizados Haceb con su factura original.' },
      { role: 'user', content: '¿Cuál es el más cercano en Bogotá norte?' },
      { role: 'bot',  content: 'El centro autorizado más cercano está en la Calle 127 con Autopista, abierto L-S 8am-5pm.' },
      { role: 'user', content: '¿Debo pedir cita o puedo ir directamente?' },
      { role: 'bot',  content: 'Para garantía se recomienda cita previa. Puede solicitarla al 601-555-0192.' },
      { role: 'user', content: '¿Cuánto tarda la reparación?' },
      { role: 'bot',  content: 'Si hay repuesto disponible, de 3 a 7 días hábiles. Si debe importarse, puede demorar hasta 15 días.' },
      { role: 'user', content: '¿Me prestan un equipo mientras tanto?' },
      { role: 'bot',  content: 'Actualmente no contamos con equipo de reemplazo temporal, pero podemos agilizar el proceso.' },
      { role: 'user', content: '¿Y si definitivamente no tiene solución?' },
      { role: 'bot',  content: 'Si el equipo es declarado irreparable, se realiza cambio por uno nuevo del mismo modelo o superior.' },
      { role: 'user', content: 'Perfecto. Llamaré para la cita. Gracias.' },
      { role: 'bot',  content: 'Con mucho gusto. Recuerde llevar la factura y el empaque si lo tiene. ¡Hasta pronto!' },
    ],
  },
  {
    id: 'c6',
    title: 'Consulta catálogo de aires acondicionados Daikin',
    type: 'consulta',
    country: 'Perú',
    date: new Date('2026-02-25T17:44:00'),
    messages: [
      { role: 'user', content: '¿Tienen aires Daikin inverter para espacios de 30m²?' },
      { role: 'bot',  content: 'Sí, tenemos el Daikin 18K BTU inverter, ideal para ese espacio.' },
      { role: 'user', content: '¿Incluye la instalación?' },
      { role: 'bot',  content: 'La instalación básica está incluida en el precio de venta.' },
      { role: 'user', content: '¿Qué incluye la instalación básica?' },
      { role: 'bot',  content: 'Incluye soporte metálico, cañería de hasta 3 metros, conexión eléctrica y carga de gas.' },
      { role: 'user', content: '¿Y si necesito más de 3 metros de cañería?' },
      { role: 'bot',  content: 'Cada metro adicional tiene un costo de S/ 35. El instalador evaluará la distancia en el momento.' },
      { role: 'user', content: '¿El Daikin 18K consume mucha energía?' },
      { role: 'bot',  content: 'No, es inverter con clasificación A+++. Consume hasta 50% menos que un equipo convencional.' },
      { role: 'user', content: '¿Tiene modo calefacción también?' },
      { role: 'bot',  content: 'Sí, es frío/calor. Funciona hasta -15°C exterior, ideal para zonas andinas.' },
      { role: 'user', content: '¿Cuánto ruido hace?' },
      { role: 'bot',  content: 'La unidad interior emite solo 19 dB en modo silencioso, prácticamente imperceptible.' },
      { role: 'user', content: '¿Tiene WiFi para controlarlo desde el celular?' },
      { role: 'bot',  content: 'Sí, compatible con la app Daikin Mobile Controller para iOS y Android.' },
      { role: 'user', content: '¿Cuánto cuesta en total con instalación?' },
      { role: 'bot',  content: 'El equipo Daikin 18K con instalación básica es S/ 2.850 con garantía de 3 años.' },
      { role: 'user', content: '¿Tienen opciones de financiamiento?' },
      { role: 'bot',  content: 'Sí, hasta 24 cuotas con BCP, Interbank y Scotiabank. Pregúntenos por la tasa vigente.' },
    ],
  },
  {
    id: 'c7',
    title: 'Garantía TV LG OLED 65" pantalla con líneas',
    type: 'garantia',
    country: 'Venezuela',
    date: new Date('2026-02-25T09:10:00'),
    messages: [
      { role: 'user', content: 'Mi TV LG OLED de 65 pulgadas tiene líneas verticales en la pantalla.' },
      { role: 'bot',  content: '¿Desde cuándo presenta el problema? ¿Recibió algún golpe el equipo?' },
      { role: 'user', content: 'Apareció de la nada hace una semana, sin golpes.' },
      { role: 'bot',  content: 'Puede ser un defecto de fabricación. Con 6 meses de uso aplica garantía total.' },
      { role: 'user', content: '¿Qué debo hacer para activar la garantía?' },
      { role: 'bot',  content: 'Necesita la factura de compra y el número de serie del equipo. ¿Los tiene a mano?' },
      { role: 'user', content: 'Sí, el serial es OLED65C2-VE-00291.' },
      { role: 'bot',  content: 'Perfecto. El equipo está registrado. Procedo a abrir el caso de garantía #LG-7742-VE.' },
      { role: 'user', content: '¿El TV debe ser enviado al servicio técnico o vienen a casa?' },
      { role: 'bot',  content: 'Por el tamaño del equipo, un técnico especializado va a domicilio. No debe moverlo.' },
      { role: 'user', content: '¿Cuándo puede venir el técnico?' },
      { role: 'bot',  content: 'La visita se agenda en los próximos 3 días hábiles. Recibirá confirmación por WhatsApp.' },
      { role: 'user', content: '¿Si la pantalla no tiene solución me reemplazan el TV?' },
      { role: 'bot',  content: 'Si el panel OLED es defectuoso y no tiene reparación viable, se gestiona el reemplazo del equipo completo.' },
      { role: 'user', content: '¿El reemplazo sería por el mismo modelo?' },
      { role: 'bot',  content: 'Sería por el mismo modelo o uno de especificaciones equivalentes o superiores según disponibilidad.' },
      { role: 'user', content: 'Está bien. Quedo esperando la llamada del técnico.' },
      { role: 'bot',  content: 'Perfecto. Tiene su caso abierto. Si en 72h no recibe contacto, escríbanos con el número #LG-7742-VE.' },
    ],
  },
  {
    id: 'c8',
    title: 'Consulta nevera Mabe 400L side-by-side',
    type: 'consulta',
    country: 'Bolivia',
    date: new Date('2026-02-24T15:30:00'),
    messages: [
      { role: 'user', content: '¿La Mabe 400L side-by-side tiene dispensador de agua?' },
      { role: 'bot',  content: 'Sí, el modelo Mabe 400L SS incluye dispensador de agua y hielos en la puerta.' },
      { role: 'user', content: '¿Tiene consumo eficiente?' },
      { role: 'bot',  content: 'Cuenta con certificación A++ de eficiencia energética, 40% menos consumo que modelos estándar.' },
      { role: 'user', content: '¿El dispensador de agua necesita instalación de tubería?' },
      { role: 'bot',  content: 'Sí, requiere conexión a tubería de agua fría. El instalador lo deja listo en la visita de entrega.' },
      { role: 'user', content: '¿Tiene compartimento de congelador independiente?' },
      { role: 'bot',  content: 'Sí, el lado izquierdo es congelador de 160L con cierre independiente y cajones organizadores.' },
      { role: 'user', content: '¿Cuáles son las dimensiones?' },
      { role: 'bot',  content: 'Mide 178cm de alto, 91cm de ancho y 72cm de profundidad. Pesa 105kg.' },
      { role: 'user', content: '¿Tiene panel táctil o botones físicos?' },
      { role: 'bot',  content: 'Panel digital táctil en la puerta con pantalla LED para control de temperatura y modo vacaciones.' },
      { role: 'user', content: '¿Qué garantía tiene?' },
      { role: 'bot',  content: 'Garantía Mabe de 2 años en partes y 5 años en compresor.' },
      { role: 'user', content: '¿Cuánto cuesta?' },
      { role: 'bot',  content: 'El precio es Bs. 18.900 con entrega e instalación incluida en ciudades principales.' },
      { role: 'user', content: '¿Tienen disponibilidad inmediata en Santa Cruz?' },
      { role: 'bot',  content: 'Sí, hay stock disponible en Santa Cruz. Entrega estimada en 48 horas hábiles.' },
      { role: 'user', content: 'Perfecto, ¿cómo puedo coordinar la compra?' },
      { role: 'bot',  content: 'Puede llamar al 800-100-MABE o visitar nuestra tienda en Av. Roca y Coronado. Le atenderemos con gusto.' },
    ],
  },
  {
    id: 'c9',
    title: 'Garantía lavadora Whirlpool vibra mucho en centrifugado',
    type: 'garantia',
    country: 'Colombia',
    date: new Date('2026-02-24T10:05:00'),
    messages: [
      { role: 'user', content: 'La lavadora Whirlpool que compré vibra muchísimo al centrifugar.' },
      { role: 'bot',  content: '¿Está instalada en superficie nivelada? ¿Las patas de apoyo están ajustadas?' },
      { role: 'user', content: 'Ya revisé eso, está bien nivelada pero sigue igual.' },
      { role: 'bot',  content: 'Entendido. Procederemos con revisión técnica bajo garantía. ¿Cuál es su ciudad?' },
      { role: 'user', content: 'Estoy en Medellín, barrio El Poblado.' },
      { role: 'bot',  content: 'Perfecto. Tenemos técnicos disponibles en Medellín. ¿Cuándo le conviene la visita?' },
      { role: 'user', content: '¿Puede ser el próximo miércoles en la mañana?' },
      { role: 'bot',  content: 'Queda agendado el miércoles entre 8am y 12pm. Recibirá confirmación al número registrado.' },
      { role: 'user', content: '¿El técnico puede tardar? ¿Debo esperar todo el día?' },
      { role: 'bot',  content: 'Le enviaremos un mensaje 30 minutos antes de la llegada para que no deba esperar todo el día.' },
      { role: 'user', content: '¿Puede ser que la vibración dañe el piso o la estructura?' },
      { role: 'bot',  content: 'Una vibración excesiva puede generar desgaste. Le recomendamos una almohadilla antivibración mientras tanto.' },
      { role: 'user', content: '¿Venden esas almohadillas ustedes?' },
      { role: 'bot',  content: 'Sí, las tenemos en tienda a $35.000 COP. También puede pedirla en el momento de la visita técnica.' },
      { role: 'user', content: '¿El problema puede ser el tambor?' },
      { role: 'bot',  content: 'Posiblemente. Un desbalance en el tambor o un contrapeso suelto son causas comunes. El técnico lo determinará.' },
      { role: 'user', content: 'Ok, quedo esperando la confirmación entonces.' },
      { role: 'bot',  content: 'Perfecto. Caso registrado con número #WP-3301-MED. Cualquier consulta, estamos a su disposición.' },
    ],
  },
  {
    id: 'c10',
    title: 'Consulta sobre garantía extendida productos Distrivalto',
    type: 'consulta',
    country: 'Ecuador',
    date: new Date('2026-02-23T13:00:00'),
    messages: [
      { role: 'user', content: '¿Venden garantía extendida para los electrodomésticos?' },
      { role: 'bot',  content: 'Sí, ofrecemos planes de garantía extendida de 1, 2 y 3 años adicionales.' },
      { role: 'user', content: '¿Cómo se contrata?' },
      { role: 'bot',  content: 'Se puede contratar al momento de la compra o hasta 30 días después. Un asesor puede orientarle.' },
      { role: 'user', content: '¿Qué cubre exactamente la garantía extendida?' },
      { role: 'bot',  content: 'Cubre fallas eléctricas, mecánicas y de fabricación. No incluye daños por mal uso o accidentes.' },
      { role: 'user', content: '¿Incluye visitas a domicilio?' },
      { role: 'bot',  content: 'Sí, todas las visitas técnicas y mano de obra están incluidas sin costo adicional.' },
      { role: 'user', content: '¿Tiene algún límite de reclamaciones por año?' },
      { role: 'bot',  content: 'No hay límite de reclamaciones, siempre que sean por fallas cubiertas por el plan.' },
      { role: 'user', content: '¿Cuánto cuesta el plan de 3 años?' },
      { role: 'bot',  content: 'Depende del producto. Para una nevera grande, el plan de 3 años cuesta aproximadamente $180.000 COP.' },
      { role: 'user', content: '¿Y para un televisor de 55 pulgadas?' },
      { role: 'bot',  content: 'Para TV 55" el plan de 3 años es $145.000 COP. Incluye protección contra sobretensión eléctrica.' },
      { role: 'user', content: '¿Si me mudo de ciudad sigue vigente la garantía?' },
      { role: 'bot',  content: 'Sí, la garantía extendida es válida en todo el territorio nacional sin importar el cambio de dirección.' },
      { role: 'user', content: '¿Puedo contratar la garantía extendida para un producto que ya compré hace 20 días?' },
      { role: 'bot',  content: 'Sí, está dentro del plazo de 30 días. Solo necesita la factura original para activarla.' },
      { role: 'user', content: 'Qué bien. ¿Cómo la activo?' },
      { role: 'bot',  content: 'Puede hacerlo en nuestra web en la sección "Mi Garantía" o llamando al 1800-DIST-EC. ¡Es muy fácil!' },
    ],
  },
]

/* ── Helpers ── */

function formatDate(date) {
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  if (days === 1) return 'ayer'
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

/* ── Chat card ── */

function ChatCard({ chat, onClick, onDelete, isActive }) {
  const lastMsg = chat.messages[chat.messages.length - 1]
  return (
    <div
      className={`${styles.chatCard} ${isActive ? styles.chatCardActive : ''}`}
      onClick={() => onClick(chat.id)}
    >
      <div className={styles.cardTop}>
        <span className={`${styles.typeBadge} ${chat.type === 'garantia' ? styles.typeBadgeGarantia : styles.typeBadgeConsulta}`}>
          {chat.type === 'garantia' ? 'Garantía' : 'Consulta'}
        </span>
        <div className={styles.cardTopRight}>
          <span className={styles.cardDate}>{formatDate(chat.date)}</span>
          <button
            className={styles.deleteBtn}
            onClick={e => { e.stopPropagation(); onDelete(chat.id) }}
            aria-label="Eliminar chat"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <p className={styles.cardTitle}>{chat.title}</p>
      <div className={styles.cardMeta}>
        <span className={styles.cardCountry}>{chat.country}</span>
        <span className={styles.cardMsgCount}>
          <MessageIcon />
          {chat.messages.length}
        </span>
      </div>
      {lastMsg && (
        <p className={styles.cardLastMsg}>
          <span className={styles.lastMsgRole}>{lastMsg.role === 'user' ? 'Cliente:' : 'IA:'}</span>
          {' '}{lastMsg.content}
        </p>
      )}
    </div>
  )
}

/* ── Chat detail ── */

function ChatDetail({ chat }) {
  if (!chat) {
    return (
      <div className={styles.detailEmpty}>
        <p>Selecciona un chat para ver la conversación</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailMeta}>
          <span className={`${styles.typeBadge} ${chat.type === 'garantia' ? styles.typeBadgeGarantia : styles.typeBadgeConsulta}`}>
            {chat.type === 'garantia' ? 'Garantía' : 'Consulta'}
          </span>
          <span className={styles.detailCountry}>{chat.country}</span>
          <span className={styles.detailDate}>{chat.date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <h3 className={styles.detailTitle}>{chat.title}</h3>
      </div>
      <div className={styles.messagesWrapper}>
        <img src={logo} className={styles.watermark} alt="" aria-hidden="true" />
        <div className={styles.messages}>
          {chat.messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgBot}`}>
              <span className={styles.msgRole}>{msg.role === 'user' ? 'Cliente' : 'IA'}</span>
              <p className={styles.msgContent}>{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function Chats() {
  const [query, setQuery]       = useState('')
  const [activeId, setActiveId] = useState(null)
  const [chats, setChats]       = useState(MOCK_CHATS)

  const handleDelete = (id) => {
    setChats(prev => prev.filter(c => c.id !== id))
    setActiveId(prev => prev === id ? null : prev)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? chats.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.messages.some(m => m.content.toLowerCase().includes(q))
        )
      : chats
    return [...list].sort((a, b) => b.date - a.date)
  }, [query, chats])

  const activeChat = chats.find(c => c.id === activeId) ?? null

  return (
    <div className={styles.container}>

      {/* Left panel */}
      <div className={styles.listPanel}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por palabra, país o tipo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')}>×</button>
          )}
        </div>

        <p className={styles.listCount}>
          {filtered.length} {filtered.length === 1 ? 'conversación' : 'conversaciones'}
        </p>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p className={styles.emptyMsg}>No se encontraron resultados</p>
          ) : (
            filtered.map(chat => (
              <ChatCard
                key={chat.id}
                chat={chat}
                onClick={setActiveId}
                onDelete={handleDelete}
                isActive={chat.id === activeId}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.detailPanel}>
        <ChatDetail chat={activeChat} />
      </div>

    </div>
  )
}
