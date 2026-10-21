/**
 * Educational Scientific Capsules for Environmental Science & Clean Energy
 * Curated for student fairs, competitions, and STEM literacy.
 */

export interface ScienceCapsule {
  id: string;
  title: string;
  badge: string;
  category: 'contaminacion' | 'energia_limpia' | 'meteorologia' | 'reforestacion';
  iconName: string;
  summary: string;
  scientificConcept: string;
  didYouKnow: string;
  actionTip: string;
}

export const SCIENCE_CAPSULES: ScienceCapsule[] = [
  {
    id: 'pm25-smog',
    title: 'Material Particulado Fino (PM2.5) y Esmog Ácido',
    badge: 'Toxicología Ambiental',
    category: 'contaminacion',
    iconName: 'Biohazard',
    summary: 'Las partículas PM2.5 tienen un diámetro menor a 2.5 micrómetros (30 veces más delgadas que un cabello humano).',
    scientificConcept: 'Al inhalarse, su tamaño microscópico les permite sortear los cilios nasales y penetrar profundamente en los alvéolos pulmonares e incluso ingresar al torrente sanguíneo, transportando metales pesados y compuestos sulfurados de combustión fósil.',
    didYouKnow: 'La OMS estima que reducir la exposición a PM2.5 a los niveles recomendados previene más de 4 millones de muertes prematuras al año en el planeta.',
    actionTip: 'Fomenta el transporte público electrificado, la movilidad en bicicleta y la transición a calderas y estufas sin combustión de biomasa o diésel.'
  },
  {
    id: 'wind-kinetic',
    title: 'Energía Eólica y Turbinas Aerodinámicas',
    badge: 'Energías Renovables',
    category: 'energia_limpia',
    iconName: 'Wind',
    summary: 'El viento es aire en movimiento impulsado por la radiación solar desigual sobre la superficie terrestre.',
    scientificConcept: 'Los aerogeneradores aprovechan la sustentación aerodinámica de sus palas para convertir la energía cinética del viento en energía mecánica rotatoria, y luego en electricidad mediante un generador magnético. El límite físico teórico de extracción de potencia está dictado por la Ley de Betz (59.3%).',
    didYouKnow: 'Un solo aerogenerador marino moderno de 15 MW puede generar suficiente energía limpia para abastecer a más de 20,000 hogares al año, evitando miles de toneladas de CO2.',
    actionTip: 'El soplido que realizas en el juego simboliza cómo corrientes de aire forzado aumentan la ventilación y diluyen micro-contaminantes en cañones urbanos.'
  },
  {
    id: 'solar-photovoltaic',
    title: 'Energía Solar Fotovoltaica y el Efecto Fotoeléctrico',
    badge: 'Física Cuántica Aplicada',
    category: 'energia_limpia',
    iconName: 'Sun',
    summary: 'La luz del sol es un flujo continuo de fotones que transportan paquetes cuánticos de energía electromagnética.',
    scientificConcept: 'En las celdas fotovoltaicas compuestas por silicio dopado (semiconductor tipo P y N), los fotones incidentes excitan electrones hacia la banda de conducción, creando una diferencia de potencial eléctrico que genera corriente continua sin partes móviles ni ruidos.',
    didYouKnow: 'La energía solar que llega a la Tierra en apenas una hora y media equivale a todo el consumo energético de la humanidad durante un año completo.',
    actionTip: 'Instalar paneles solares y microinversores en tejados reduce pérdidas en redes de transmisión y democratiza la generación limpia distribuida.'
  },
  {
    id: 'reforestation-sink',
    title: 'Reforestación: Los Pulmones Biológicos del Planeta',
    badge: 'Ecología y Ciclo de Carbono',
    category: 'reforestacion',
    iconName: 'Sprout',
    summary: 'Las plantas y árboles son biorreactores naturales que capturan carbono y restauran la humedad atmosférica.',
    scientificConcept: 'A través de la fotosíntesis: 6CO2 + 6H2O + luz solar → C6H12O6 (glucosa) + 6O2. El carbono queda fijado químicamente en la madera, corteza y suelo forestal a largo plazo (sumidero de carbono), mientras que las raíces evitan la erosión y la transpiración vegetal enfría el microclima.',
    didYouKnow: 'Un árbol maduro puede absorber entre 15 y 22 kg de CO2 cada año y liberar suficiente oxígeno limpio para sostener a dos seres humanos.',
    actionTip: 'Participa en brigadas de plantación con especies nativas adaptadas a tu cuenca hidrográfica para maximizar la resiliencia ecológica.'
  },
  {
    id: 'acid-rain',
    title: 'Lluvia Ácida y Deposición Húmeda',
    badge: 'Química de la Atmósfera',
    category: 'contaminacion',
    iconName: 'CloudRain',
    summary: 'Reacciones químicas entre emisiones industriales y gotas de agua en las nubes tornan las precipitaciones corrosivas.',
    scientificConcept: 'Gases como el dióxido de azufre (SO2) y los óxidos de nitrógeno (NOx) reaccionan con el vapor de agua y radicales hidroxilo formando ácido sulfúrico (H2SO4) y ácido nítrico (HNO3). Esto baja el pH del agua de lluvia de 5.6 a menos de 4.0, acidificando lagos y lixiviando aluminio tóxico en el suelo.',
    didYouKnow: 'Gracias a tratados internacionales como el Protocolo de Gotemburgo y filtros lavadores de gases (scrubbers) en chimeneas, la lluvia ácida se ha reducido en un 80% en varias regiones industriales desde los años 90.',
    actionTip: 'Vigila el pH del agua en proyectos de huertos escolares y utiliza compost orgánico para amortiguar la acidez del suelo.'
  },
  {
    id: 'thermal-inversion',
    title: 'Inversión Térmica y Meteorología de Valles',
    badge: 'Meteorología Dinámica',
    category: 'meteorologia',
    iconName: 'Compass',
    summary: 'Fenómeno meteorológico donde una capa de aire caliente atrapa aire frío cargado de contaminación cerca de la superficie.',
    scientificConcept: 'Normalmente, la temperatura disminuye con la altitud, permitiendo que el aire caliente ascienda por convección y disperse contaminantes. En noches invernales despejadas, el suelo se enfría rápidamente por radiación infrarroja, creando una "tapadera" de aire cálido sobre una capa fría que atrapa el esmog.',
    didYouKnow: 'Ciudades situadas en cuencas rodeadas de montañas como Santiago de Chile o Ciudad de México experimentan episodios severos de inversión térmica en otoño e invierno.',
    actionTip: 'Consultar la velocidad del viento en Open-Meteo te permite anticipar días de estancamiento atmosférico y alertas de contingencia ambiental.'
  }
];

export function getRandomCapsule(): ScienceCapsule {
  const index = Math.floor(Math.random() * SCIENCE_CAPSULES.length);
  return SCIENCE_CAPSULES[index];
}
