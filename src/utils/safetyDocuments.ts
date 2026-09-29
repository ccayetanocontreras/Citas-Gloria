import { jsPDF } from 'jspdf';

export interface ChockPositioningCase {
  id: string;
  status: 'correcto' | 'incorrecto';
  title: string;
  description: string;
}

export interface SlopePlacementCase {
  id: string;
  condition: string;
  instruction: string;
  chockSide: 'both' | 'front' | 'rear';
}

export interface MandatorySafetyDocument {
  id: string;
  code: string;
  version: string;
  title: string;
  fileName: string;
  category: string;
  area: string;
  summary: string;
  objective: string;
  mandatoryRules: string[];
  criticalControls: string[];
  declarationText: string;
  technicalSpecs?: {
    label: string;
    value: string;
  }[];
  slopePlacements?: SlopePlacementCase[];
  positioningCases?: ChockPositioningCase[];
}

export const MANDATORY_SAFETY_DOCUMENTS: MandatorySafetyDocument[] = [
  {
    id: 'doc-cunas',
    code: 'DP.SSO.ES.001',
    version: 'VE 02',
    title: 'Estándar de Uso de Cuñas',
    fileName: 'Estándar de Uso de Cuñas..pdf',
    category: 'Estándar de Seguridad y Salud Ocupacional',
    area: 'Seguridad y Salud Ocupacional (SSO) - Leche Gloria S.A. / Deprodeca',
    summary: 'Estándar oficial DP.SSO.ES.001 (Versión 02) que define las características técnicas de las cuñas de seguridad, ubicación según pendiente y los 4 criterios gráficos de colocación correcta e incorrecta en los neumáticos.',
    objective: 'Establecer los lineamientos obligatorios para el uso, características técnicas y correcta colocación de las cuñas (tacos) de seguridad en todas las unidades de transporte durante su estacionamiento, carga y descarga en las instalaciones de Leche Gloria S.A., previniendo el desplazamiento involuntario del vehículo.',
    technicalSpecs: [
      { label: 'Código / Versión Oficial', value: 'DP.SSO.ES.001 • Versión 02' },
      { label: 'Cantidad Mínima por Unidad', value: '02 cuñas de seguridad certificadas en óptimo estado' },
      { label: 'Material Reglamentario', value: 'Poliuretano de alta densidad, caucho macizo vulcanizado o metal estriado (Prohibido madera rota, piedras o ladrillos)' },
      { label: 'Dimensiones de la Cuña', value: 'Altura: 15 a 20 cm • Ancho: 15 a 20 cm • Largo de base: 20 a 26 cm • Ángulo: 45°' },
      { label: 'Dispositivo de Manipulación', value: 'Asa o agarradera posterior ergonómica obligatoria (evita atrapamiento de manos)' },
      { label: 'Superficie y Base', value: 'Cara inclinada estriada adaptable al radio de la llanta y base antideslizante de alto agarre' }
    ],
    slopePlacements: [
      {
        id: 'slope-flat',
        condition: '1. En Terreno Plano / Bahía de Carga y Descarga',
        instruction: 'Colocar las dos (02) cuñas en la llanta del eje posterior (delante y detrás del neumático, o bloqueando ambas ruedas traseras hacia el sentido de salida).',
        chockSide: 'both'
      },
      {
        id: 'slope-down',
        condition: '2. En Pendiente de Bajada (Cuesta Abajo)',
        instruction: 'Colocar las dos (02) cuñas en la parte DELANTERA de las llantas del eje posterior, oponiéndose al sentido de caída de la pendiente.',
        chockSide: 'front'
      },
      {
        id: 'slope-up',
        condition: '3. En Pendiente de Subida (Cuesta Arriba)',
        instruction: 'Colocar las dos (02) cuñas en la parte POSTERIOR (trasera) de las llantas del eje trasero, bloqueando el retroceso de la unidad.',
        chockSide: 'rear'
      }
    ],
    positioningCases: [
      {
        id: 'pos-1',
        status: 'correcto',
        title: 'CORRECTO: Centrada y a Tope',
        description: 'La cuña se coloca centrada respecto al ancho de la llanta y haciendo contacto firme ("a tope") contra la banda de rodadura.'
      },
      {
        id: 'pos-2',
        status: 'incorrecto',
        title: 'INCORRECTO: Separada de la Llanta',
        description: 'No dejar espacio ni separación entre la cuña y el neumático; pierde efectividad de bloqueo ante el movimiento inicial.'
      },
      {
        id: 'pos-3',
        status: 'incorrecto',
        title: 'INCORRECTO: Colocada en Ángulo / Chueca',
        description: 'No colocar la cuña torcida, en diagonal o descentrada respecto a la banda de rodadura del neumático.'
      },
      {
        id: 'pos-4',
        status: 'incorrecto',
        title: 'INCORRECTO: Invertida o Sin Usar el Asa',
        description: 'No colocar la cuña volteada/de costado ni manipularla por los bordes laterales exponiendo las manos bajo la llanta.'
      }
    ],
    mandatoryRules: [
      'Toda unidad de transporte (camión, furgón, remolque, semirremolque o cisterna) debe portar obligatoriamente un mínimo de dos (02) cuñas de seguridad certificadas con asa de manipulación.',
      'Queda terminantemente prohibido el uso de tacos de madera partidos o artesanales, piedras, ladrillos, trozos de palet u otros objetos improvisados para inmovilizar el vehículo.',
      'Secuencia obligatoria al estacionar en bahía o patio: 1) Detener totalmente el vehículo, 2) Activar el freno de parqueo (Maxi Brake), 3) Apagar el motor y retirar la llave, 4) Colocar las 02 cuñas tomándolas únicamente por el asa posterior.',
      'La cuña debe instalarse centrada al neumático y en contacto directo y firme ("a tope") con la banda de rodadura, verificando la inclinación del terreno (plano, subida o bajada).',
      'Ningún montacarguista ni operario iniciará la carga o descarga en rampa si no se verifica visualmente que ambas cuñas estén correctamente instaladas. Solo se retirarán al finalizar la operación con autorización de Recepción.'
    ],
    criticalControls: [
      'Mínimo 02 cuñas reglamentarias (DP.SSO.ES.001) con asa posterior en óptimo estado',
      'Colocación centrada y haciendo contacto firme a tope con la banda de rodadura del eje posterior',
      'Prohibido iniciar carga/descarga o abrir rampa sin bloqueo mecánico de llantas verificado'
    ],
    declarationText: 'Confirmo haber leído y comprendido el documento oficial "Estándar de Uso de Cuñas" (DP.SSO.ES.001 - Versión 02) y garantizo que la unidad ingresará a Planta Gloria con mínimo dos (02) cuñas reglamentarias y las colocará correctamente.'
  },
  {
    id: 'doc-cutter',
    code: 'GLGS00055',
    version: 'VE 01',
    title: 'GLGS00055 VE 01 Cartilla de seguridad - Cutter de seguridad auto retráctil',
    fileName: 'GLGS00055 VE 01 Cartilla de seguridad - Cutter de seguridad auto retráctil.pdf',
    category: 'Cartilla de Seguridad - Uso de Herramientas (Revisado: Enero 2021)',
    area: 'Leche Gloria S.A. • Cultura de Prevención y Capacitación en Seguridad',
    summary: 'Cartilla oficial GLGS00055 VE 01 (2 páginas) sobre características, partes, modo de uso, aplicaciones, procedimiento de cambio de navaja de 4 puntos y responsabilidades en el uso del Cutter de seguridad auto retráctil.',
    objective: 'Esta cartilla busca promover una cultura de prevención en el trabajador así como brindar información y capacitación oportuna sobre el uso del Cutter de seguridad de auto retráctil en Leche Gloria S.A.',
    mandatoryRules: [
      'DEFINICIÓN Y CARACTERÍSTICAS: Cutter de seguridad con navaja auto retráctil de punta redondeada y mango de metal resistente al impacto (aprox. 2,5 cm de ancho y 7,5 a 10 cm de largo) de fácil sujeción. La mano se encuentra protegida de cortes ya que la navaja se retrae automáticamente al soltar el accionador.',
      'PARTES DEL CUTTER AUTO RETRÁCTIL: 1) Navaja auto retráctil de punta redondeada, 2) Mango de metal resistente al impacto, 3) Ranuras antideslizantes, 4) Soporte en pulgar para mejor sujeción, 5) Rajador de cinta, 6) Accionador de navaja, 7) Compartimiento de navaja, y 8) Seguro de compartimiento de navaja (tornillo).',
      'MODO DE USO Y APLICACIONES (Corte de cartones y corte de cintas): Sujete del mango según su mano dominante (izquierda o derecha), asegúrese antes del uso que no presente rajaduras y que el compartimiento de la navaja se encuentre asegurado, y utilícelo con las manos limpias a fin de evitar resbalamientos. Presione el accionador para aperturar cajas; suelte el accionador y la navaja se retraerá.',
      'MODO DE CAMBIO DE NAVAJA (4 Puntos de Corte): 1.- Desentornillar y aperturar el seguro del compartimiento de navaja. 2.- Deslizar el compartimiento de navaja hacia arriba. 3.- Sujetar la navaja del lado sin filo, moverla hacia su próximo punto de corte (Puntos 1 y 2, o girar del lado sin filo para Puntos 3 y 4) y colocarla en las clavijas de posición; finalmente colocar el compartimiento y asegurar con el tornillo.',
      'RESPONSABILIDADES DE LOS TRABAJADORES: Realizar un mantenimiento correcto de las herramientas, elegir las herramientas correctas para el trabajo a realizar, uso y manejo correcto en un espacio adecuado y preparado, almacenar y guardar en espacios destinados para esa función, y transportar las herramientas con medios específicos que garanticen la seguridad.'
    ],
    criticalControls: [
      'Verificar antes del uso que no presente rajaduras y que el seguro (tornillo) del compartimiento esté asegurado',
      'Presionar el accionador solo al cortar cartones/cintas y soltarlo para que la navaja de punta redondeada se retraiga automáticamente',
      'Cambiar o girar la navaja (4 puntos de corte) sujetándola únicamente del lado sin filo cuando se aprecie desgaste'
    ],
    declarationText: 'Confirmo haber leído y comprendido las 2 páginas de la Cartilla de Seguridad GLGS00055 VE 01 (Cutter de seguridad auto retráctil - Leche Gloria S.A.) y me comprometo a cumplir su modo de uso y medidas preventivas.'
  },
  {
    id: 'doc-medidas-generales',
    code: 'MED-SEG-GEN',
    version: 'ORIGINAL',
    title: 'MEDIDAS DE SEGURIDAD GENERALES DENTRO DE PLANTA GLORIA',
    fileName: 'MEDIDAS DE SEGURIDAD GENERALES DENTRO DE PLANTA GLORIA.PDF',
    category: 'DISPOSICIONES DE SEGURIDAD Y RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE',
    area: 'Leche Gloria S.A.',
    summary: 'Documento original de Medidas de Seguridad Generales dentro de Planta Gloria (Ítems 1 al 12: Disposiciones de Seguridad; Ítems 13 al 15: Recomendaciones de Protección al Medioambiente).',
    objective: 'DISPOSICIONES DE SEGURIDAD Y RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE DENTRO DE PLANTA GLORIA.',
    mandatoryRules: [
      'La velocidad máxima de vehículos dentro de la planta es de 20 km/h.',
      'Está prohibido el uso de celulares y dispositivos de hands free (manos libres), audífonos o altavoz durante la operación de vehículos y equipo móviles.',
      'Respetar la señal de PARE si está conduciendo un vehículo y realizar una parada de 3 segundos en cada cruce peatonal.',
      'Si es peatón, respetar los semáforos y vías peatonales, además transitar solamente por las áreas o zonas autorizadas',
      "Uso obligatorio de EPP's según cada zona de operación donde se va a transitar.",
      'No debe emplearse el celular mientras camina y está totalmente prohibido tomar fotos dentro de planta.',
      'Respetar todas las señales de seguridad que se encuentren dentro de planta.',
      'Mantener cuidado con los vehículos en movimiento en las zonas de operación y siempre transitar caminando, prohibido correr.',
      'No obstaculizar: Vías peatonales, ingresos / salidas, Salidas de emergencia, Extintores, Gabinetes contra incendio',
      'Si dentro de la actividad a realizar se requiere el uso de cuchilla, esta herramienta debe ser auto retráctil, son sólo las autorizadas para el manejo dentro de las instalaciones de Gloria S.A.',
      'Reportar cualquier incidente, acto o condición que ponga en riesgo tu seguridad o la de otras personas',
      'En caso de emergencias o evacuación sigue las instrucciones del personal de la Empresa Gloria S.A',
      'Coloca los residuos sólidos en los tachos respetando su clasificación y rótulo indicado en la parte exterior.',
      'Prohibido arrojar cualquier tipo de fluidos en las canaletas de desagüe, recipientes abiertos, áreas verdes o veredas',
      'Asegurar que los caños se encuentren después de cada uso'
    ],
    criticalControls: [
      'La velocidad máxima de vehículos dentro de la planta es de 20 km/h.',
      "Uso obligatorio de EPP's según cada zona de operación donde se va a transitar.",
      'Prohibido el uso de celulares y tomar fotos dentro de planta; uso exclusivo de cuchilla auto retráctil.'
    ],
    declarationText: 'Confirmo la lectura del documento original MEDIDAS DE SEGURIDAD GENERALES DENTRO DE PLANTA GLORIA.'
  },
  {
    id: 'doc-protocolo-ingreso',
    code: 'PRO-ING-PAR',
    version: 'ORIGINAL',
    title: 'PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES - GLORIA',
    fileName: 'PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES - GLORIA.pdf',
    category: 'INGRESO DE VEHICULOS Y PARQUEO EN MUELLES DE CARGA / DESCARGA',
    area: 'Leche Gloria S.A.',
    summary: 'Protocolo original para Ingreso de Vehículos (Ítems 1 al 4) y Parqueo en Muelles de Carga / Descarga (Ítems 1 al 7) dentro de las instalaciones de Gloria S.A.',
    objective: 'PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES.',
    mandatoryRules: [
      'INGRESO 1: Detenga el vehículo por completo, accione el freno de estacionamiento. Presente los documentos requeridos y permita la inspección por parte del personal de seguridad.',
      'INGRESO 2: Evite permanecer espacios prolongados en lugares no autorizados.',
      'INGRESO 3: En caso de realizar maniobras en retroceso, solicite el apoyo de personal Gloria autorizado. Transite siempre bajo los límites de velocidad establecido por planta, el uso del cinturón de seguridad es obligatorio mientras conduzca.',
      'INGRESO 4: Mantener distancia segura de los vehículos y equipos en operación, además el tránsito de camiones debe ser por el lado derecho de la vía.',
      'PARQUEO 1: Estacione el vehículo únicamente en lugares autorizados y siempre en posición de salida. Las operaciones en reversa deben ser apoyadas por personal Gloria autorizado. Apague el vehículo y active el freno de estacionamiento.',
      'PARQUEO 2: El personal de almacén entregara el letrero de advertencia al conductor quien lo colocará sobre el parabrisas delantero, obstruyendo la visibilidad.',
      'PARQUEO 3: El conductor del vehículo debe retirar la llave de contacto, descender del vehículo, colocar tacos y conos de seguridad.',
      'PARQUEO 4: El conductor debe ubicarse dentro su cabina o zona segura establecidos de tal forma que no esté en riesgo de atropello durante el proceso de carga y descarga.',
      'PARQUEO 5: El conductor apertura las cortinas solo cuando cumplió el punto 2. La atención de parte del montacargas solo se realizará si se cumplió con los puntos indicados.',
      'PARQUEO 6: El personal de almacén debe avisar al conductor que la carga/ descarga ha finalizado (si aplica procederá a cerrar las puertas o cortinas) y retirar el letrero de advertencia que fue colocado en el parabrisas.',
      'PARQUEO 7: El conductor del vehículo reinicia la marcha retirándose del muelle. En todo momento debe utilizar el cinturón de seguridad respetando los límites de velocidad.'
    ],
    criticalControls: [
      'Detener el vehículo, accionar freno de estacionamiento, retirar llave y colocar tacos y conos de seguridad',
      'Colocar el letrero de advertencia entregado por almacén sobre el parabrisas delantero antes de aperturar cortinas',
      'Ubicarse en cabina o zona segura establecida y usar siempre cinturón de seguridad respetando límites de velocidad'
    ],
    declarationText: 'Confirmo la lectura del documento original PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES - GLORIA.'
  }
];

function buildCunasStandardPdf(docItem: MandatorySafetyDocument, supplierName?: string, supplierRuc?: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Outer Document Border (Official Control Table Frame)
  doc.setDrawColor(0, 38, 77);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  // Header Table (10, 10, 190, 24)
  doc.setFillColor(0, 38, 77);
  doc.rect(10, 10, 45, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('GLORIA', 32.5, 21, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPRODECA / SSO', 32.5, 27, { align: 'center' });

  // Center Title Cell
  doc.setDrawColor(0, 38, 77);
  doc.rect(55, 10, 95, 24);
  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ESTÁNDAR DE USO DE CUÑAS', 102.5, 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(211, 47, 47);
  doc.text('SEGURIDAD Y SALUD OCUPACIONAL - UNIDADES DE TRANSPORTE', 102.5, 27, { align: 'center' });

  // Right Metadata Table Cell
  doc.rect(150, 10, 50, 24);
  doc.line(150, 18, 200, 18);
  doc.line(150, 26, 200, 26);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Código: DP.SSO.ES.001', 153, 15.5);
  doc.text('Versión: 02', 153, 23.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Página: 1 de 1', 153, 31.5);

  let y = 39;

  // Section 1: Especificaciones Técnicas y Diseño de la Cuña
  doc.setFillColor(0, 38, 77);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. CARACTERÍSTICAS TÉCNICAS Y DIMENSIONES REGLAMENTARIAS DE LA CUÑA (TACO)', 18, y + 4.8);
  y += 9;

  // Left Box: Technical Illustration of Wheel Chock
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 72, 46, 2, 2, 'FD');

  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ESQUEMA TÉCNICO DE LA CUÑA', 50, y + 5, { align: 'center' });

  // Draw Tire Arc (left top of diagram)
  doc.setFillColor(51, 65, 85);
  doc.circle(32, y + 18, 9, 'F');
  doc.setFillColor(148, 163, 184);
  doc.circle(32, y + 18, 4.5, 'F');

  // Draw Yellow/Orange Safety Chock Wedge touching tire
  doc.setFillColor(245, 158, 11); // Amber/Yellow safety chock
  doc.setDrawColor(180, 83, 9);
  doc.triangle(36, y + 27, 60, y + 27, 43, y + 15, 'FD');

  // Draw Rear Handle (Asa posterior)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(55, y + 22, 66, y + 22);
  doc.line(66, y + 22, 66, y + 26);
  doc.setLineWidth(0.3);

  // Ground line
  doc.setDrawColor(71, 85, 105);
  doc.line(20, y + 27.5, 78, y + 27.5);

  // Dimension Callouts
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Altura: 15 - 20 cm', 48, y + 13);
  doc.text('Asa ergonómica', 60, y + 19.5);
  doc.text('Base antideslizante: 20 - 26 cm (Ancho: 15 - 20 cm)', 20, y + 33);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28);
  doc.text('Mínimo 02 cuñas certificadas por unidad', 22, y + 38);
  doc.text('Prohibido usar piedras, ladrillos o madera rota', 20, y + 42.5);

  // Right Box: Technical Specs List
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(89, y, 107, 46, 2, 2, 'FD');

  let sy = y + 6;
  (docItem.technicalSpecs || []).forEach((spec) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 38, 77);
    doc.text(`• ${spec.label}:`, 92, sy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const valLines = doc.splitTextToSize(spec.value, 100);
    doc.text(valLines, 94, sy + 3.4);
    sy += 3.4 + valLines.length * 3.3;
  });

  y += 50;

  // Section 2: Ubicación de Cuñas según Condición de Vía / Rampa
  doc.setFillColor(0, 38, 77);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. UBICACIÓN DE LAS CUÑAS SEGÚN LA CONDICIÓN DEL TERRENO / BAHÍA', 18, y + 4.8);
  y += 9;

  const colW = 58.6;
  (docItem.slopePlacements || []).forEach((sp, idx) => {
    const cx = 14 + idx * (colW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cx, y, colW, 38, 2, 2, 'FD');

    doc.setTextColor(0, 38, 77);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    const condLines = doc.splitTextToSize(sp.condition, colW - 6);
    doc.text(condLines, cx + 3, y + 5);

    // Mini Wheel + Chock Diagram
    const wheelX = cx + colW / 2;
    const wheelY = y + 17;
    doc.setDrawColor(100, 116, 139);
    doc.line(cx + 8, wheelY + 6, cx + colW - 8, wheelY + 6);
    doc.setFillColor(51, 65, 85);
    doc.circle(wheelX, wheelY, 5.5, 'F');
    doc.setFillColor(203, 213, 225);
    doc.circle(wheelX, wheelY, 2.5, 'F');

    doc.setFillColor(245, 158, 11);
    if (sp.chockSide === 'both' || sp.chockSide === 'front') {
      doc.triangle(wheelX - 10, wheelY + 6, wheelX - 4, wheelY + 6, wheelX - 5, wheelY + 2, 'F');
    }
    if (sp.chockSide === 'both' || sp.chockSide === 'rear') {
      doc.triangle(wheelX + 4, wheelY + 6, wheelX + 10, wheelY + 6, wheelX + 5, wheelY + 2, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.7);
    const instLines = doc.splitTextToSize(sp.instruction, colW - 6);
    doc.text(instLines, cx + 3, y + 27);
  });

  y += 42;

  // Section 3: 4 Columnas Oficiales de Posicionamiento Correcto vs Incorrecto en la Llanta
  doc.setFillColor(0, 38, 77);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. CRITERIOS VISUALES DE COLOCACIÓN EN EL NEUMÁTICO (CORRECTO VS. INCORRECTO)', 18, y + 4.8);
  y += 9;

  const pColW = 43.2;
  (docItem.positioningCases || []).forEach((pc, idx) => {
    const px = 14 + idx * (pColW + 3);
    const isOk = pc.status === 'correcto';
    if (isOk) {
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
    } else {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(239, 68, 68);
    }
    doc.roundedRect(px, y, pColW, 44, 2, 2, 'FD');

    // Status Header Badge
    if (isOk) {
      doc.setFillColor(5, 150, 105);
    } else {
      doc.setFillColor(220, 38, 38);
    }
    doc.rect(px, y, pColW, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(isOk ? '✔ CORRECTO' : '✘ INCORRECTO', px + pColW / 2, y + 4.5, { align: 'center' });

    // Visual diagram of tire & chock
    const tx = px + pColW / 2;
    const ty = y + 16;
    doc.setFillColor(51, 65, 85);
    doc.roundedRect(tx - 7, ty - 7, 14, 10, 1.5, 1.5, 'F'); // Tire tread view
    doc.setFillColor(245, 158, 11);
    doc.setDrawColor(180, 83, 9);

    if (idx === 0) {
      // Centered & touching firmly
      doc.rect(tx - 6, ty + 3, 12, 4.5, 'FD');
    } else if (idx === 1) {
      // Separated from tire (gap)
      doc.rect(tx - 6, ty + 6.5, 12, 4.5, 'FD');
    } else if (idx === 2) {
      // Angled / skewed
      doc.triangle(tx - 8, ty + 4, tx + 3, ty + 8, tx + 2, ty + 3, 'FD');
    } else {
      // Shifted / off-center / inverted
      doc.rect(tx + 1, ty + 3, 9, 4.5, 'FD');
    }

    doc.setTextColor(isOk ? 6 : 127, isOk ? 95 : 29, isOk ? 70 : 29);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    const tLines = doc.splitTextToSize(pc.title, pColW - 4);
    doc.text(tLines, px + 2, y + 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(30, 41, 59);
    const dLines = doc.splitTextToSize(pc.description, pColW - 4);
    doc.text(dLines, px + 2, y + 34);
  });

  y += 48;

  // Section 4: Reglas Obligatorias de Operación
  doc.setFillColor(0, 38, 77);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('4. DISPOSICIONES OBLIGATORIAS DE SEGURIDAD PARA EL CONDUCTOR Y PROVEEDOR', 18, y + 4.8);
  y += 10;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  docItem.mandatoryRules.forEach((rule, index) => {
    const ruleLines = doc.splitTextToSize(`${index + 1}. ${rule}`, 176);
    doc.text(ruleLines, 16, y);
    y += ruleLines.length * 3.6 + 1.2;
  });

  y += 2;

  // Supplier Acceptance Block
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, y, 182, 21, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('CONSTANCIA DE LECTURA Y COMPROMISO DEL PROVEEDOR (DP.SSO.ES.001 VE 02):', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const declLines = doc.splitTextToSize(docItem.declarationText, 174);
  doc.text(declLines, 18, y + 9.5);
  if (supplierName) {
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Proveedor: ${supplierName} ${supplierRuc ? `(RUC: ${supplierRuc})` : ''}  |  Fecha: ${new Date().toLocaleString('es-PE')}`,
      18,
      y + 18
    );
  }

  return doc;
}

function drawCartillaHeader(doc: jsPDF, subtitle: string, introText: string): void {
  // Trapezoid / Banner Background (Orange #ED7D31)
  doc.setFillColor(237, 125, 49);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.lines(
    [
      [152, 0],
      [19, 22],
      [-190, 0],
      [19, -22]
    ],
    29,
    8,
    [1, 1],
    'FD',
    true
  );

  // Center White Title Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(42, 10, 118, 17.5, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CARTILLA DE SEGURIDAD', 101, 15, { align: 'center' });
  doc.setFontSize(9);
  doc.text(subtitle, 101, 20.5, { align: 'center' });
  doc.setFontSize(8.8);
  doc.text('Leche Gloria S.A.', 101, 25.5, { align: 'center' });

  // Right GLORIA Logo Box
  doc.setFillColor(255, 255, 255);
  doc.rect(164, 9.5, 19, 14, 'FD');
  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GLORIA', 173.5, 15, { align: 'center' });
  doc.setFillColor(211, 47, 47);
  doc.circle(173.5, 19.5, 2.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.text('Revisado: Enero 2021', 173.5, 26.8, { align: 'center' });

  // Sub-banner (White box with black border)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(10, 33, 190, 11.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.2);
  const introLines = doc.splitTextToSize(introText, 182);
  doc.text(introLines, 105, 37.8, { align: 'center' });
}

function buildCutterCartillaPdf(docItem: MandatorySafetyDocument, supplierName?: string, supplierRuc?: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // ==================== PÁGINA 1 DE 2 ====================
  drawCartillaHeader(
    doc,
    'Uso de herramientas: Cutter de seguridad auto retráctil',
    'Esta cartilla busca promover una cultura de prevención en el trabajador así como brindar información y capacitación oportuna sobre el uso del Cutter de seguridad de auto retráctil'
  );

  // Green Definition Box (Left)
  doc.setFillColor(74, 222, 128);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.4);
  doc.rect(10, 48, 134, 37, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cutter :', 13, 54);
  doc.setFont('helvetica', 'normal');
  const defP1 = doc.splitTextToSize(
    '             Es un tipo de navaja que consta de un mango plano, simple y económico, de aproximadamente 2,5 cm de ancho y de 7,5 a 10 cm de largo, fabricado con metal o plástico. Pueden contar con un sistema para ajustar hasta qué punto la cuchilla sobresale de la agarradera.',
    128
  );
  doc.text(defP1, 13, 54);

  const defP2 = doc.splitTextToSize(
    'Cuando la hoja, consistente en una navaja corrediza, delgada, filosa y reemplazable, pierde el filo, puede rápidamente partirse para aprovechar los tramos que aún no han sido usados o ser sustituida por una nueva.',
    128
  );
  doc.text(defP2, 13, 71);

  // Right Top Cutter Angled Vector Illustration
  doc.setFillColor(234, 88, 12);
  doc.setDrawColor(154, 52, 18);
  doc.lines(
    [
      [24, -36],
      [8, 5],
      [-24, 36],
      [-8, -5]
    ],
    158,
    82,
    [1, 1],
    'FD',
    true
  );
  // Blade tip at top-right of mini cutter
  doc.setFillColor(148, 163, 184);
  doc.triangle(182, 46, 188, 42, 186, 49, 'F');
  // Lanyard hole at bottom-left
  doc.setFillColor(255, 255, 255);
  doc.circle(162, 80, 1.5, 'F');

  // Middle Section Left: Yellow Header + Características + Partes
  doc.setFillColor(255, 255, 0);
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 89, 68, 11, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.2);
  doc.text('CUTTER DE SEGURIDAD AUTO', 44, 93.8, { align: 'center' });
  doc.text('RETRÁCTIL', 44, 98.2, { align: 'center' });

  // Características Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 102, 68, 36, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Características:', 12.5, 107);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const caractList = [
    '• Cutter de seguridad con navaja auto retráctil',
    '• La mano se encuentra protegida de cortes ya que la navaja se retrae automáticamente',
    '• Mango de cutter de metal',
    '• De fácil sujeción por el diseño'
  ];
  let cy = 111.5;
  caractList.forEach((item) => {
    const lines = doc.splitTextToSize(item, 63);
    doc.text(lines, 12.5, cy);
    cy += lines.length * 3.5 + 1;
  });

  // Partes Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 141, 68, 39, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Partes:', 12.5, 146);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('• Navaja auto retráctil', 12.5, 150.5);
  doc.text('• Mango de metal resistente al impacto', 12.5, 154.5);
  doc.text('• Ranuras antideslizantes', 12.5, 158.5);
  doc.setTextColor(185, 28, 28);
  doc.text('• Soporte en pulgar para mejor sujeción', 12.5, 162.5);
  doc.setTextColor(0, 0, 0);
  doc.text('• Compartimiento de navaja', 12.5, 166.5);
  const segLines = doc.splitTextToSize('• Seguro de compartimiento de navaja (tornillo)', 63);
  doc.text(segLines, 12.5, 170.5);

  // Middle Section Right: Detailed Diagram of Auto-Retractable Cutter with Yellow Callouts
  // Rounded-tip Blade protruding left-top
  doc.setFillColor(148, 163, 184);
  doc.setDrawColor(71, 85, 105);
  doc.triangle(86, 111, 98, 105, 98, 118, 'FD');

  // Orange Metal Body of Cutter (diagonal from top-left 95,103 to bottom-right 182,168)
  doc.setFillColor(234, 88, 12);
  doc.setDrawColor(154, 52, 18);
  doc.lines(
    [
      [82, 46],
      [-10, 17],
      [-82, -46],
      [10, -17]
    ],
    98,
    102,
    [1, 1],
    'FD',
    true
  );

  // Brass Screw (Seguro de compartimiento)
  doc.setFillColor(250, 204, 21);
  doc.setDrawColor(113, 63, 18);
  doc.circle(140, 136, 3.2, 'FD');
  doc.line(138, 136, 142, 136);

  // Rear Lanyard Hole
  doc.setFillColor(255, 255, 255);
  doc.circle(172, 158, 2.5, 'FD');

  // Yellow Callout Helper
  const drawCallout = (bx: number, by: number, bw: number, bh: number, lines: string[], ax: number, ay: number) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.7);
    doc.line(bx + bw / 2, by + bh / 2, ax, ay);
    doc.setFillColor(255, 255, 0);
    doc.setDrawColor(21, 128, 61);
    doc.setLineWidth(0.35);
    doc.rect(bx, by, bw, bh, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    lines.forEach((l, idx) => {
      doc.text(l, bx + bw / 2, by + 4.2 + idx * 3.6, { align: 'center' });
    });
  };

  drawCallout(108, 88, 34, 7, ['Rajador de cinta'], 102, 104);
  drawCallout(128, 98, 34, 9.5, ['Accionador de', 'navaja'], 118, 114);
  drawCallout(150, 116, 48, 11, ['Seguro de compartimiento', 'de navaja (tornillo)'], 142, 135);
  drawCallout(81, 132, 33, 9.5, ['Navaja auto', 'retráctil'], 91, 113);
  drawCallout(105, 154, 33, 9.5, ['Compartimiento', 'de navaja'], 124, 131);
  drawCallout(129, 168, 31, 9.5, ['Ranuras', 'antideslizantes'], 156, 152);

  // Lower Middle Section: MODO DE USO & APLICACIONES
  // Left: MODO DE USO
  doc.setFillColor(220, 38, 38);
  doc.rect(10, 184, 90, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('MODO DE USO', 55, 188.6, { align: 'center' });

  doc.setFillColor(255, 255, 0);
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 192, 90, 31, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  const modoUsoLines = doc.splitTextToSize(
    '• Sujete del mango, se puede utilizar dependiendo de su mano dominante (izquierda o derecha)\n• Asegúrese antes del uso que no presente rajaduras y que el compartimiento de la navaja se encuentre asegurado\n• Utilícelo con las manos limpias a fin de evitar resbalamientos',
    85
  );
  doc.text(modoUsoLines, 12.5, 197);

  // Right: APLICACIONES
  doc.setFillColor(220, 38, 38);
  doc.rect(108, 184, 92, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('APLICACIONES', 154, 188.6, { align: 'center' });

  doc.setFillColor(255, 255, 0);
  doc.setDrawColor(234, 88, 12);
  doc.rect(108, 192, 92, 31, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('• Corte de cartones', 113, 205);
  doc.text('• Corte de cintas', 113, 211);

  // Bottom 3 Action Panels (Page 1)
  const bPanels = [
    { x: 11, text1: 'Presione el accionador para', text2: 'aperturar cajas', bladeOut: true },
    { x: 74, text1: 'Suelte el accionador y la', text2: 'navaja se retraerá', bladeOut: false },
    { x: 137, text1: 'Navaja de punta', text2: 'redondeada', roundedCloseUp: true }
  ];

  bPanels.forEach((bp) => {
    // Illustration Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(bp.x, 227, 56, 32, 'FD');
    // Cardboard box base
    doc.setFillColor(214, 181, 136);
    doc.rect(bp.x + 2, 246, 52, 12, 'F');
    // Cutter body in hand
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(bp.x + 14, 233, 28, 10, 2, 2, 'F');
    if (bp.bladeOut || bp.roundedCloseUp) {
      doc.setFillColor(148, 163, 184);
      doc.roundedRect(bp.x + 39, 236, 9, 5, 2, 2, 'F');
    }

    // Caption Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(30, 58, 138);
    doc.rect(bp.x, 260, 56, 13, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.text(bp.text1, bp.x + 28, 265.5, { align: 'center' });
    doc.text(bp.text2, bp.x + 28, 270, { align: 'center' });
  });

  // Page 1 Footer
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('GLGS00055 VE 01', 12, 285);
  doc.text('Página 1 de 2', 198, 285, { align: 'right' });

  // ==================== PÁGINA 2 DE 2 ====================
  doc.addPage();

  drawCartillaHeader(
    doc,
    'Uso de herramientas: Cutter de seguridad de estilo gancho',
    'Esta cartilla busca promover una cultura de prevención en el trabajador así como brindar información y capacitación oportuna sobre el uso del Cutter de seguridad de estilo gancho'
  );

  // Yellow Full-Width Banner: MODO DE CAMBIO DE NAVAJA
  doc.setFillColor(255, 255, 0);
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 47, 190, 7.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.8);
  doc.text('MODO DE CAMBIO DE NAVAJA DE CUTTER DE SEGURIDAD AUTO RETRÁCTIL', 105, 52.2, { align: 'center' });

  // 3 Columns for Blade Replacement
  const stepsP2 = [
    {
      x: 10,
      w: 56,
      callout: ['Seguro de', 'compartimiento de navaja'],
      stepText: '1.- desentornillar y aperturar el compartimiento de navaja'
    },
    {
      x: 72,
      w: 58,
      callout: ['Compartimiento', 'de navaja'],
      stepText: '2.- Deslizar el compartimiento de navaja hacia arriba (según imagen)'
    },
    {
      x: 136,
      w: 64,
      callout: ['Clavijas de', 'posición'],
      stepText:
        '3.- Sujeta la navaja del lado sin filo, mueve la navaja hacia su próximo punto de corte y colóquelo en las clavijas de posición de navaja. Al finalizar coloque el compartimiento y asegure con el tornillo'
    }
  ];

  stepsP2.forEach((st, idx) => {
    // Yellow Callout Box at top
    const cw = 42;
    const cx = st.x + (st.w - cw) / 2;
    doc.setFillColor(255, 255, 0);
    doc.setDrawColor(21, 128, 61);
    doc.rect(cx, 58, cw, 10, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    st.callout.forEach((cl, i) => {
      doc.text(cl, cx + cw / 2, 62 + i * 3.8, { align: 'center' });
    });

    // Illustration of Cutter Compartment
    const iy = 73;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(st.x, iy, st.w, 22, 1.5, 1.5, 'FD');

    // Cutter body inside illustration
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(st.x + 8, iy + 8, st.w - 16, 10, 2, 2, 'F');
    // Metal insert / blade carrier
    doc.setFillColor(148, 163, 184);
    doc.rect(st.x + 10, iy + (idx === 0 ? 9 : 4), 18, 7, 'F');
    // Screw / pins
    doc.setFillColor(250, 204, 21);
    doc.circle(st.x + st.w / 2 + 4, iy + 13, 2, 'F');

    // Arrow from callout to cutter part
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.7);
    doc.line(cx + cw / 2, 68, st.x + st.w / 2, iy + 10);
    doc.setLineWidth(0.35);

    // Light-blue Instruction Box below
    doc.setFillColor(189, 215, 238);
    doc.setDrawColor(30, 58, 138);
    const boxH = idx === 2 ? 22 : 13;
    doc.rect(st.x, 98, st.w, boxH, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.9);
    const sLines = doc.splitTextToSize(st.stepText, st.w - 4);
    doc.text(sLines, st.x + 2, 102.5);
  });

  // Orange-Bordered Box: Puntos de corte (posición de la navaja)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.45);
  doc.rect(10, 125, 124, 36, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Puntos de corte (posición de la navaja:', 13, 131);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.text('La navaja cuenta con 4 puntos de corte o posiciones:', 13, 135.5);
  doc.text('•   Punto 1 y puntos 2', 13, 140);
  const p34Lines = doc.splitTextToSize(
    '•   Puntos 3 y 4, en este caso se tiene que girar la navaja sujetando del lado sin filo',
    118
  );
  doc.text(p34Lines, 13, 144.5);
  const cambioNote = doc.splitTextToSize(
    'Este cambio de posición de navaja se hace solamente cuando se aprecia desgaste de filo y es necesario el cambio.',
    118
  );
  doc.text(cambioNote, 13, 154);

  // Visual 4-point Rounded Blade Diagram on the right of Puntos de Corte
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(138, 125, 62, 36, 2, 2, 'FD');
  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('ESQUEMA DE 4 PUNTOS DE CORTE', 169, 130.5, { align: 'center' });
  // Blade rectangle with rounded corners & 4 numbered corners
  doc.setFillColor(203, 213, 225);
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(149, 134, 40, 18, 3, 3, 'FD');
  doc.setFillColor(255, 255, 255);
  doc.circle(163, 143, 2.2, 'FD');
  doc.circle(175, 143, 2.2, 'FD');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(6.8);
  doc.text('Pto 1', 141, 137);
  doc.text('Pto 2', 190, 137);
  doc.text('Pto 3', 141, 151);
  doc.text('Pto 4', 190, 151);
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(6.2);
  doc.text('Sujetar siempre del lado sin filo', 169, 157.5, { align: 'center' });

  // Bottom Section: RESPONSABILIDADES DE LOS TRABAJADORES
  doc.setFillColor(220, 38, 38);
  doc.rect(10, 172, 124, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RESPONSABILIDADES DE LOS TRABAJADORES', 72, 176.5, { align: 'center' });

  doc.setFillColor(217, 234, 211); // Light green #D9EAD3
  doc.setDrawColor(234, 88, 12);
  doc.rect(10, 180, 124, 58, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const respIntro = doc.splitTextToSize(
    'La mayoría de las lesiones producidas por las herramientas es por un uso inadecuado, dado por sentado que la persona que va a utilizar la herramienta sabe cómo utilizarla correctamente, las medidas preventivas propuestas son:',
    118
  );
  doc.text(respIntro, 13, 185.5);

  const respBullets = [
    '• Realizar un mantenimiento correcto de las herramientas.',
    '• Elegir las herramientas correctas para el trabajo a realizar.',
    '• Uso y manejo correcto de las herramientas.',
    '• Realizar las operaciones donde se utilicen herramientas en un espacio adecuado y preparado para su uso.',
    '• Almacenar y guardar las herramientas en espacios destinados para esa función.',
    '• Transportar las herramientas con medios específicos que garanticen la seguridad.'
  ];
  let ry = 199;
  respBullets.forEach((b) => {
    const bLines = doc.splitTextToSize(b, 118);
    doc.text(bLines, 13, ry);
    ry += bLines.length * 3.6 + 0.8;
  });

  // Supplier Acceptance Box at Bottom of Page 2
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(10, 244, 190, 24, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('CONSTANCIA DE LECTURA Y ACEPTACIÓN DEL PROVEEDOR (GLGS00055 VE 01):', 14, 249.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const declLines = doc.splitTextToSize(docItem.declarationText, 182);
  doc.text(declLines, 14, 254.5);
  if (supplierName) {
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Proveedor: ${supplierName} ${supplierRuc ? `(RUC: ${supplierRuc})` : ''}  |  Fecha: ${new Date().toLocaleString('es-PE')}`,
      14,
      264
    );
  }

  // Page 2 Footer
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('GLGS00055 VE 01', 12, 285);
  doc.text('Página 2 de 2', 198, 285, { align: 'right' });

  return doc;
}

function drawMedidasWatermarkAndFooter(doc: jsPDF, pageNum: number): void {
  // Faint GLORIA Watermark in center of page
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(46);
  doc.text('GLORIA', 105, 130, { align: 'center' });
  doc.setFillColor(248, 225, 225);
  doc.circle(105, 148, 14, 'F');

  // Footer with horizontal lines and { pageNum }
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);
  doc.line(28, 276, 96, 276);
  doc.line(114, 276, 182, 276);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('{', 98.5, 277.2);
  doc.setFontSize(8.5);
  doc.text(`${pageNum}`, 105, 277, { align: 'center' });
  doc.setFontSize(11);
  doc.text('}', 110, 277.2);
}

function drawMedidasRelatedGraphic(doc: jsPDF, itemNum: number, x: number, y: number, w: number, h: number): void {
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (itemNum) {
    case 1: {
      // 20 Km/h VELOCIDAD MÁXIMA sign
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.rect(cx - 9, y + 2, 18, h - 4, 'FD');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1.5);
      doc.circle(cx, y + 9.5, 6.2, 'D');
      doc.setLineWidth(0.3);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('20', cx, y + 9.8, { align: 'center' });
      doc.setFontSize(4.2);
      doc.text('Km/h', cx, y + 12.8, { align: 'center' });
      doc.setFontSize(4.8);
      doc.text('VELOCIDAD', cx, y + 18.2, { align: 'center' });
      doc.text('MÁXIMA', cx, y + 20.8, { align: 'center' });
      break;
    }
    case 2: {
      // NO UTILICES EL CELULAR MIENTRAS MANEJAS
      doc.setFillColor(229, 231, 235);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.rect(cx + 1, y + 3, 14, h - 6, 'FD');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.8);
      doc.circle(cx + 8, y + 7, 2.8, 'D');
      doc.line(cx + 6, y + 5, cx + 10, y + 9);
      doc.setLineWidth(0.3);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text('NO', cx + 8, y + 13, { align: 'center' });
      doc.setFontSize(3.6);
      doc.text('UTILICES', cx + 8, y + 15.2, { align: 'center' });
      doc.text('EL CELULAR', cx + 8, y + 17.2, { align: 'center' });
      doc.text('MIENTRAS', cx + 8, y + 19.2, { align: 'center' });
      doc.text('MANEJAS', cx + 8, y + 21.2, { align: 'center' });
      break;
    }
    case 3: {
      // Truck stopped at crosswalk
      doc.setFillColor(226, 232, 240);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(100, 116, 139);
      doc.rect(x + 2, y + h - 7, w - 4, 5.5, 'F');
      // Crosswalk stripes
      doc.setFillColor(255, 255, 255);
      for (let i = 0; i < 5; i++) {
        doc.rect(x + 6 + i * 7, y + h - 5.5, 4, 3, 'F');
      }
      // Red truck cab
      doc.setFillColor(220, 38, 38);
      doc.rect(cx - 7, y + 4, 14, 12, 'F');
      doc.setFillColor(191, 219, 254);
      doc.rect(cx - 5.5, y + 5.5, 11, 4.5, 'F');
      break;
    }
    case 4: {
      // Blue sign: RESPETA EL SEMÁFORO Y LAS VÍAS PEATONALES
      doc.setFillColor(37, 99, 235);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.8);
      doc.text('RESPETA EL', x + 12, y + 8, { align: 'center' });
      doc.text('SEMÁFORO Y', x + 12, y + 10.5, { align: 'center' });
      doc.text('LAS VÍAS', x + 12, y + 13, { align: 'center' });
      doc.text('PEATONALES', x + 12, y + 15.5, { align: 'center' });
      // Traffic light
      doc.setFillColor(30, 41, 59);
      doc.rect(cx + 2, y + 3, 4, 10, 'F');
      doc.setFillColor(239, 68, 68);
      doc.circle(cx + 4, y + 5, 1, 'F');
      doc.setFillColor(34, 197, 94);
      doc.circle(cx + 4, y + 10.5, 1, 'F');
      break;
    }
    case 5: {
      // USO OBLIGATORIO DE EQUIPO DE PROTECCION PERSONAL (EPP)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(37, 99, 235);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'FD');
      doc.setFillColor(37, 99, 235);
      doc.rect(x + 3, y + 2.5, w - 6, 4.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.3);
      doc.text('USO OBLIGATORIO DE EQUIPO', cx, y + 4.3, { align: 'center' });
      doc.text('DE PROTECCION PERSONAL (EPP)', cx, y + 6.3, { align: 'center' });
      // 8 blue PPE circles (2 rows x 4 cols)
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          doc.setFillColor(29, 78, 216);
          doc.circle(x + 8.5 + c * 9, y + 11 + r * 7.5, 3, 'F');
          doc.setFillColor(255, 255, 255);
          doc.circle(x + 8.5 + c * 9, y + 11 + r * 7.5, 1.4, 'F');
        }
      }
      break;
    }
    case 6: {
      // NO ESTÁN PERMITIDAS: (Cámaras / Celulares)
      doc.setFillColor(30, 64, 175);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.8);
      doc.text('NO ESTÁN PERMITIDAS:', cx, y + 5, { align: 'center' });
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1.1);
      doc.circle(x + 8, cy + 1, 4.2, 'D');
      doc.line(x + 5, cy - 2, x + 11, cy + 4);
      doc.setLineWidth(0.3);
      doc.setFillColor(255, 255, 255);
      doc.rect(x + 15, cy - 2, 6, 5, 'F');
      doc.rect(x + 23, cy - 2.5, 4.5, 6, 'F');
      doc.rect(x + 30, cy - 2, 7, 5, 'F');
      break;
    }
    case 7: {
      // Señales de seguridad en planta
      doc.setFillColor(203, 213, 225);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(34, 197, 94);
      doc.rect(x + 6, y + 4, 10, 4, 'F');
      doc.setFillColor(234, 179, 8);
      doc.rect(x + 28, y + 10, 6, 5, 'F');
      doc.setDrawColor(71, 85, 105);
      doc.line(x + 4, y + h - 4, x + w - 4, y + 8);
      break;
    }
    case 8: {
      // ! CUIDADO + Prohibido correr
      doc.setFillColor(250, 204, 21);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x + 2, y + 1.5, 19, h - 3, 'FD');
      doc.triangle(x + 11.5, y + 4, x + 4.5, y + 17, x + 18.5, y + 17, 'FD');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('!', x + 11.5, y + 15, { align: 'center' });
      doc.setFontSize(4.2);
      doc.text('CUIDADO', x + 11.5, y + 21.5, { align: 'center' });

      // Right half: No running
      doc.setFillColor(226, 232, 240);
      doc.rect(x + 22, y + 1.5, w - 24, h - 3, 'F');
      doc.setFillColor(220, 38, 38);
      doc.circle(x + w - 5, y + 4.5, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4.5);
      doc.text('X', x + w - 5, y + 5.5, { align: 'center' });
      break;
    }
    case 9: {
      // NO OBSTACULICES blue poster
      doc.setFillColor(23, 37, 84);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(220, 38, 38);
      doc.circle(x + 15, y + 7.5, 3.2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('X', x + 15, y + 9.2, { align: 'center' });
      doc.setFontSize(4.2);
      doc.text('NO OBSTACULICES', x + 30, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(3.2);
      doc.text('• Vías peatonales', x + 21, y + 11);
      doc.text('• Ingresos / Salidas', x + 21, y + 14);
      doc.text('• Salidas de Emergencia', x + 21, y + 17);
      doc.text('• Extintores', x + 21, y + 20);
      doc.text('• Gabinetes contra incendio', x + 21, y + 23);
      break;
    }
    case 10: {
      // Cutter auto retráctil con etiquetas amarillas
      doc.setFillColor(255, 255, 255);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(234, 88, 12);
      doc.lines([[24, 11], [-3, 5], [-24, -11], [3, -5]], x + 10, y + 9, [1, 1], 'F', true);
      doc.setFillColor(255, 255, 0);
      doc.setDrawColor(21, 128, 61);
      doc.rect(x + 15, y + 3, 11, 3, 'FD');
      doc.rect(x + 28, y + 6, 12, 3.5, 'FD');
      doc.rect(x + 4, y + 16, 11, 3.5, 'FD');
      doc.rect(x + 16, y + 22, 12, 3.5, 'FD');
      break;
    }
    case 11: {
      // Dos trabajadores reportando condición
      doc.setFillColor(226, 232, 240);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      // Worker 1 (left)
      doc.setFillColor(71, 85, 105);
      doc.circle(x + 13, y + 9, 3, 'F');
      doc.rect(x + 9, y + 12.5, 8, 11, 'F');
      // Worker 2 (right with orange vest)
      doc.setFillColor(245, 158, 11);
      doc.circle(x + 31, y + 8.5, 3, 'F');
      doc.setFillColor(234, 88, 12);
      doc.rect(x + 27, y + 12, 8, 11.5, 'F');
      break;
    }
    case 12: {
      // Zona de seguridad / Evacuación
      doc.setFillColor(226, 232, 240);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(30, 58, 138);
      doc.rect(x + 3, y + 5, 28, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(2.8);
      doc.text('ESPERA LAS INDICACIONES UBICADO', x + 17, y + 7.2, { align: 'center' });
      doc.text('EN LA ZONA DE SEGURIDAD', x + 17, y + 9.2, { align: 'center' });
      doc.setFillColor(34, 197, 94);
      doc.rect(x + 32, y + 4, 8, 18, 'F');
      break;
    }
    case 13: {
      // Tachos de clasificación de residuos sólidos
      doc.setFillColor(241, 245, 249);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      const binColors: [number, number, number][] = [
        [220, 38, 38],
        [255, 255, 255],
        [37, 99, 235],
        [120, 53, 15],
        [30, 41, 59]
      ];
      binColors.forEach((col, idx) => {
        doc.setFillColor(col[0], col[1], col[2]);
        doc.setDrawColor(100, 116, 139);
        doc.rect(x + 5 + idx * 5.5, y + 12, 4.8, 10, 'FD');
      });
      break;
    }
    case 14: {
      // Prohibido arrojar fluidos en canaletas
      doc.setFillColor(226, 232, 240);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setFillColor(30, 58, 138);
      doc.rect(x + 12, y + 8, 18, 11, 'F');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1);
      doc.circle(x + 34, y + 13.5, 4.5, 'D');
      doc.line(x + 31, y + 10.5, x + 37, y + 16.5);
      doc.setLineWidth(0.3);
      break;
    }
    case 15: {
      // CIERRA LOS CAÑOS DESPUÉS DE CADA USO
      doc.setFillColor(30, 64, 175);
      doc.rect(x + 2, y + 1.5, w - 4, h - 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.2);
      doc.text('CIERRA LOS', x + 33, y + 7, { align: 'center' });
      doc.text('CAÑOS DESPUÉS', x + 33, y + 9.2, { align: 'center' });
      doc.text('DE CADA USO', x + 33, y + 11.4, { align: 'center' });
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1);
      doc.circle(x + 33, y + 18, 4.5, 'D');
      doc.line(x + 30, y + 15, x + 36, y + 21);
      doc.setLineWidth(0.3);
      break;
    }
  }
}

function buildMedidasGeneralesPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // ==================== PÁGINA 1 ====================
  drawMedidasWatermarkAndFooter(doc, 1);

  // Top Header Box (25, 16, 160, 21)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(25, 16, 160, 21, 'FD');

  // GLORIA Logo inside Header Box (Left)
  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GLORIA', 40, 23.5, { align: 'center' });
  doc.setFillColor(211, 47, 47);
  doc.circle(40, 30.5, 4.5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(40, 30.5, 2, 'F');

  // Title inside Header Box
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MEDIDAS DE SEGURIDAD GENERALES DENTRO DE', 114, 24, { align: 'center' });
  doc.text('PLANTA GLORIA', 105, 30.5, { align: 'center' });

  // Table Geometry: x=18 (width 11), x=29 (width 119), x=148 (width 45) -> Total width = 175 (from 18 to 193)
  const col1X = 18;
  const col1W = 11;
  const col2X = 29;
  const col2W = 119;
  const col3X = 148;
  const col3W = 45;
  const tableW = col1W + col2W + col3W;

  let y = 41;

  // Header Row 1: ITEM | DESCRIPCION | IMAGEN RELACIONADA
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.25);
  doc.rect(col1X, y, col1W, 7.5, 'FD');
  doc.rect(col2X, y, col2W, 7.5, 'FD');
  doc.rect(col3X, y, col3W, 7.5, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('ITEM', col1X + col1W / 2, y + 5, { align: 'center' });
  doc.text('DESCRIPCION', col2X + col2W / 2, y + 5, { align: 'center' });
  doc.text('IMAGEN RELACIONADA', col3X + col3W / 2, y + 5, { align: 'center' });
  y += 7.5;

  // Subheader Row 2: DISPOSICIONES DE SEGURIDAD
  doc.setFillColor(217, 217, 217);
  doc.rect(col1X, y, tableW, 7.5, 'FD');
  doc.text('DISPOSICIONES DE SEGURIDAD', col1X + tableW / 2, y + 5, { align: 'center' });
  y += 7.5;

  const page1Items = [
    {
      num: 1,
      h: 24,
      text: 'La velocidad máxima de vehículos dentro de la planta es de 20 km/h.'
    },
    {
      num: 2,
      h: 26,
      text: 'Está prohibido el uso de celulares y dispositivos de hands free (manos libres), audífonos o altavoz durante la operación de vehículos y equipo móviles.'
    },
    {
      num: 3,
      h: 24,
      text: 'Respetar la señal de PARE si está conduciendo un vehículo y realizar una parada de 3 segundos en cada cruce peatonal.'
    },
    {
      num: 4,
      h: 25,
      text: 'Si es peatón, respetar los semáforos y vías peatonales, además transitar solamente por las áreas o zonas autorizadas'
    },
    {
      num: 5,
      h: 25,
      text: "Uso obligatorio de EPP's según cada zona de operación donde se va a transitar."
    },
    {
      num: 6,
      h: 25,
      text: 'No debe emplearse el celular mientras camina y está totalmente prohibido tomar fotos dentro de planta.'
    },
    {
      num: 7,
      h: 24,
      text: 'Respetar todas las señales de seguridad que se encuentren dentro de planta.'
    },
    {
      num: 8,
      h: 25,
      text: 'Mantener cuidado con los vehículos en movimiento en las zonas de operación y siempre transitar caminando, prohibido correr.'
    }
  ];

  page1Items.forEach((item) => {
    doc.setDrawColor(80, 80, 80);
    doc.rect(col1X, y, col1W, item.h, 'D');
    doc.rect(col2X, y, col2W, item.h, 'D');
    doc.rect(col3X, y, col3W, item.h, 'D');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`${item.num}`, col1X + col1W / 2, y + 5.5, { align: 'center' });

    const lines = doc.splitTextToSize(item.text, col2W - 4);
    doc.text(lines, col2X + 2, y + 5.5);

    drawMedidasRelatedGraphic(doc, item.num, col3X, y, col3W, item.h);
    y += item.h;
  });

  // ==================== PÁGINA 2 ====================
  doc.addPage();
  drawMedidasWatermarkAndFooter(doc, 2);

  y = 25;

  const page2Group1 = [
    {
      num: 9,
      h: 31,
      lines: [
        'No obstaculizar:',
        'Vías peatonales, ingresos / salidas',
        'Salidas de emergencia',
        'Extintores',
        'Gabinetes contra incendio'
      ]
    },
    {
      num: 10,
      h: 29,
      text: 'Si dentro de la actividad a realizar se requiere el uso de cuchilla, esta herramienta debe ser auto retráctil, son sólo las autorizadas para el manejo dentro de las instalaciones de Gloria S.A.'
    },
    {
      num: 11,
      h: 27,
      text: 'Reportar cualquier incidente, acto o condición que ponga en riesgo tu seguridad o la de otras personas'
    },
    {
      num: 12,
      h: 27,
      text: 'En caso de emergencias o evacuación sigue las instrucciones del personal de la Empresa Gloria S.A'
    }
  ];

  page2Group1.forEach((item) => {
    doc.setDrawColor(80, 80, 80);
    doc.rect(col1X, y, col1W, item.h, 'D');
    doc.rect(col2X, y, col2W, item.h, 'D');
    doc.rect(col3X, y, col3W, item.h, 'D');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`${item.num}`, col1X + col1W / 2, y + 5.5, { align: 'center' });

    if (item.lines) {
      item.lines.forEach((ln, idx) => {
        doc.text(ln, col2X + 2, y + 5.5 + idx * 5.2);
      });
    } else if (item.text) {
      const lines = doc.splitTextToSize(item.text, col2W - 4);
      doc.text(lines, col2X + 2, y + 5.5);
    }

    drawMedidasRelatedGraphic(doc, item.num, col3X, y, col3W, item.h);
    y += item.h;
  });

  // Subheader Row: RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(80, 80, 80);
  doc.rect(col1X, y, tableW, 9, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.text('RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE', col1X + tableW / 2, y + 6, { align: 'center' });
  y += 9;

  const page2Group2 = [
    {
      num: 13,
      h: 29,
      text: 'Coloca los residuos sólidos en los tachos respetando su clasificación y rótulo indicado en la parte exterior.'
    },
    {
      num: 14,
      h: 29,
      text: 'Prohibido arrojar cualquier tipo de fluidos en las canaletas de desagüe, recipientes abiertos, áreas verdes o veredas'
    },
    {
      num: 15,
      h: 28,
      text: 'Asegurar que los caños se encuentren después de cada uso'
    }
  ];

  page2Group2.forEach((item) => {
    doc.setDrawColor(80, 80, 80);
    doc.rect(col1X, y, col1W, item.h, 'D');
    doc.rect(col2X, y, col2W, item.h, 'D');
    doc.rect(col3X, y, col3W, item.h, 'D');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`${item.num}`, col1X + col1W / 2, y + 5.5, { align: 'center' });

    const lines = doc.splitTextToSize(item.text, col2W - 4);
    doc.text(lines, col2X + 2, y + 5.5);

    drawMedidasRelatedGraphic(doc, item.num, col3X, y, col3W, item.h);
    y += item.h;
  });

  return doc;
}

function drawProtocoloRelatedGraphic(doc: jsPDF, section: 'ingreso' | 'parqueo', itemNum: number, x: number, y: number, w: number, h: number): void {
  const cx = x + w / 2;

  if (section === 'ingreso') {
    switch (itemNum) {
      case 1: {
        // Red semi-truck stopped at checkpoint with cone
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(100, 116, 139);
        doc.rect(x + 1.5, y + h - 7, w - 3, 6, 'F');
        doc.setFillColor(185, 28, 28);
        doc.rect(x + 12, y + 5, 22, 10, 'F');
        doc.setFillColor(234, 88, 12);
        doc.triangle(cx, y + 12, cx - 2, y + 18, cx + 2, y + 18, 'F');
        break;
      }
      case 2: {
        // White truck on plant road
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(71, 85, 105);
        doc.rect(x + 1.5, y + h - 8, w - 3, 7, 'F');
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(100, 116, 139);
        doc.rect(cx - 8, y + 5, 18, 9, 'FD');
        break;
      }
      case 3: {
        // Red truck with signalman holding PARE sign
        doc.setFillColor(224, 242, 254);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(100, 116, 139);
        doc.rect(x + 1.5, y + h - 6, w - 3, 5, 'F');
        doc.setFillColor(185, 28, 28);
        doc.rect(cx - 4, y + 4, 14, 12, 'F');
        // PARE paddle
        doc.setFillColor(220, 38, 38);
        doc.circle(x + 12, y + 12, 3.2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(3);
        doc.text('PARE', x + 12, y + 12.8, { align: 'center' });
        break;
      }
      case 4: {
        // Two trucks maintaining distance with arrow
        doc.setFillColor(226, 232, 240);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(100, 116, 139);
        doc.rect(x + 3, y + 5, 13, 11, 'FD');
        doc.rect(x + 25, y + 5, 15, 11, 'FD');
        doc.setFillColor(234, 88, 12);
        doc.rect(x + 17, y + 9.5, 7, 2.5, 'F');
        break;
      }
    }
  } else {
    switch (itemNum) {
      case 1:
      case 7: {
        // Aerial view of 3 diagonal yellow parking bays
        doc.setFillColor(229, 231, 235);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.7);
        for (let b = 0; b < 3; b++) {
          const bx = x + 6 + b * 11;
          doc.line(bx, y + 17, bx + 5, y + 3);
          doc.line(bx + 5, y + 3, bx + 10, y + 3);
          doc.line(bx + 10, y + 3, bx + 5, y + 17);
        }
        doc.setLineWidth(0.25);
        doc.setFillColor(220, 38, 38);
        doc.lines([[4, -11], [3.5, 1], [-4, 11], [-3.5, -1]], x + 18, y + 16, [1, 1], 'F', true);
        break;
      }
      case 2: {
        // Windshield + Warning Sign with Red Triangle !
        doc.setFillColor(241, 245, 249);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        // Truck cab front windshield
        doc.setFillColor(30, 41, 59);
        doc.rect(x + 4, y + 5, 20, 11, 'F');
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 38, 38);
        doc.rect(x + 17, y + 6.5, 5, 5, 'FD');
        // Right zoom of warning sign
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.8);
        doc.rect(x + 28, y + 3, 12, 14, 'FD');
        doc.triangle(x + 34, y + 5, x + 30, y + 12, x + 38, y + 12, 'D');
        doc.setLineWidth(0.25);
        break;
      }
      case 3: {
        // Removing ignition key (left) + Truck with cones & wheel chocks (right)
        doc.setFillColor(30, 41, 59);
        doc.rect(x + 2, y + 1.5, 17, h - 3, 'F');
        doc.setFillColor(203, 213, 225);
        doc.circle(x + 7, y + h / 2, 3.5, 'F');
        // Right half: truck with cones
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 20, y + 1.5, w - 22, h - 3, 'F');
        doc.setFillColor(234, 179, 8);
        doc.rect(x + 25, y + 4, 12, 9, 'F');
        doc.setFillColor(234, 88, 12);
        doc.triangle(x + 24, y + 13, x + 22.5, y + 17, x + 25.5, y + 17, 'F');
        doc.triangle(x + 38, y + 13, x + 36.5, y + 17, x + 39.5, y + 17, 'F');
        break;
      }
      case 4: {
        // White semi-truck parked at bay
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(71, 85, 105);
        doc.rect(x + 1.5, y + h - 6, w - 3, 5, 'F');
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(100, 116, 139);
        doc.rect(x + 6, y + 4, 28, 11, 'FD');
        break;
      }
      case 5: {
        // Red truck with side curtains open
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(185, 28, 28);
        doc.rect(x + 4, y + 3, 12, 13, 'F');
        doc.setFillColor(226, 232, 240);
        doc.rect(x + 16, y + 3, 20, 13, 'F');
        doc.setFillColor(185, 28, 28);
        doc.rect(x + 36, y + 3, 5, 13, 'F');
        break;
      }
      case 6: {
        // Windshield with arrows removing the warning sign
        doc.setFillColor(203, 213, 225);
        doc.rect(x + 1.5, y + 1, w - 3, h - 2, 'F');
        doc.setFillColor(30, 58, 138);
        doc.rect(x + 4, y + 3, w - 8, 11, 'F');
        doc.setFillColor(255, 255, 255);
        doc.rect(cx - 4, y + 5, 8, 6, 'F');
        break;
      }
    }
  }
}

function buildProtocoloIngresoPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Faint GLORIA Watermark in center of page
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(46);
  doc.text('GLORIA', 105, 122, { align: 'center' });
  doc.setFillColor(248, 225, 225);
  doc.circle(105, 142, 14, 'F');

  // Top Header: GLORIA Logo (left) + Bold Title (center/right)
  doc.setTextColor(0, 38, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GLORIA', 29, 13.5, { align: 'center' });
  doc.setFillColor(211, 47, 47);
  doc.circle(29, 18.5, 3.6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(29, 18.5, 1.5, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.3);
  doc.text('PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES', 115, 17, { align: 'center' });

  // Main Table Geometry
  const col1X = 19;
  const col1W = 12;
  const col2X = 31;
  const col2W = 114;
  const col3X = 145;
  const col3W = 45;
  const tableW = col1W + col2W + col3W;

  let y = 22.5;

  // Header Row 1: ITEM | DESCRIPCION | IMAGEN RELACIONADA
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.25);
  doc.rect(col1X, y, col1W, 6.5, 'FD');
  doc.rect(col2X, y, col2W, 6.5, 'FD');
  doc.rect(col3X, y, col3W, 6.5, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('ITEM', col1X + col1W / 2, y + 4.5, { align: 'center' });
  doc.text('DESCRIPCION', col2X + col2W / 2, y + 4.5, { align: 'center' });
  doc.text('IMAGEN RELACIONADA', col3X + col3W / 2, y + 4.5, { align: 'center' });
  y += 6.5;

  // Subheader Row: INGRESO DE VEHICULOS
  doc.setFillColor(217, 217, 217);
  doc.rect(col1X, y, tableW, 6.2, 'FD');
  doc.setFontSize(7.8);
  doc.text('INGRESO DE VEHICULOS', col1X + tableW / 2, y + 4.3, { align: 'center' });
  y += 6.2;

  const ingresoItems = [
    {
      num: 1,
      h: 21,
      lines: [
        'Detenga el vehículo por completo, accione el freno de estacionamiento.',
        'Presente los documentos requeridos y permita la inspección por parte del personal de seguridad.'
      ]
    },
    {
      num: 2,
      h: 19,
      lines: ['Evite permanecer espacios prolongados en lugares no autorizados.']
    },
    {
      num: 3,
      h: 22,
      lines: [
        'En caso de realizar maniobras en retroceso, solicite el apoyo de personal Gloria autorizado.',
        'Transite siempre bajo los límites de velocidad establecido por planta, el uso del cinturón de seguridad es obligatorio mientras conduzca.'
      ]
    },
    {
      num: 4,
      h: 20,
      lines: [
        'Mantener distancia segura de los vehículos y equipos en operación, además el tránsito de camiones debe ser por el lado derecho de la vía.'
      ]
    }
  ];

  ingresoItems.forEach((item) => {
    doc.setDrawColor(80, 80, 80);
    doc.rect(col1X, y, col1W, item.h, 'D');
    doc.rect(col2X, y, col2W, item.h, 'D');
    doc.rect(col3X, y, col3W, item.h, 'D');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.num}`, col1X + col1W / 2, y + 4.2, { align: 'center' });

    let ty = y + 4.2;
    item.lines.forEach((paragraph) => {
      const pLines = doc.splitTextToSize(paragraph, col2W - 3);
      doc.text(pLines, col2X + 1.5, ty);
      ty += pLines.length * 3.6;
    });

    drawProtocoloRelatedGraphic(doc, 'ingreso', item.num, col3X, y, col3W, item.h);
    y += item.h;
  });

  // Subheader Row: PARQUEO EN MUELLES DE CARGA / DESCARGA
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(80, 80, 80);
  doc.rect(col1X, y, tableW, 6.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('PARQUEO EN MUELLES DE CARGA / DESCARGA', col1X + tableW / 2, y + 4.5, { align: 'center' });
  y += 6.5;

  const parqueoItems = [
    {
      num: 1,
      h: 22,
      lines: [
        'Estacione el vehículo únicamente en lugares autorizados y siempre en posición de salida. Las operaciones en reversa deben ser apoyadas por personal Gloria autorizado.',
        'Apague el vehículo y active el freno de estacionamiento.'
      ]
    },
    {
      num: 2,
      h: 22,
      lines: [
        'El personal de almacén entregara el letrero de advertencia al conductor quien lo colocará sobre el parabrisas delantero, obstruyendo la visibilidad.'
      ]
    },
    {
      num: 3,
      h: 21,
      lines: [
        'El conductor del vehículo debe retirar la llave de contacto, descender del vehículo, colocar tacos y conos de seguridad.'
      ]
    },
    {
      num: 4,
      h: 21,
      lines: [
        'El conductor debe ubicarse dentro su cabina o zona segura establecidos de tal forma que no esté en riesgo de atropello durante el proceso de carga y descarga.'
      ]
    },
    {
      num: 5,
      h: 20,
      lines: [
        'El conductor apertura las cortinas solo cuando cumplió el punto 2.',
        'La atención de parte del montacargas solo se realizará si se cumplió con los puntos indicados.'
      ]
    },
    {
      num: 6,
      h: 21,
      lines: [
        'El personal de almacén debe avisar al conductor que la carga/ descarga ha finalizado (si aplica procederá a cerrar las puertas o cortinas) y retirar el letrero de advertencia que fue colocado en el parabrisas.'
      ]
    },
    {
      num: 7,
      h: 20,
      lines: [
        'El conductor del vehículo reinicia la marcha retirándose del muelle. En todo momento debe utilizar el cinturón de seguridad respetando los límites de velocidad.'
      ]
    }
  ];

  parqueoItems.forEach((item) => {
    doc.setDrawColor(80, 80, 80);
    doc.rect(col1X, y, col1W, item.h, 'D');
    doc.rect(col2X, y, col2W, item.h, 'D');
    doc.rect(col3X, y, col3W, item.h, 'D');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.num}`, col1X + col1W / 2, y + 4.2, { align: 'center' });

    let ty = y + 4.2;
    item.lines.forEach((paragraph) => {
      const pLines = doc.splitTextToSize(paragraph, col2W - 3);
      doc.text(pLines, col2X + 1.5, ty);
      ty += pLines.length * 3.6;
    });

    drawProtocoloRelatedGraphic(doc, 'parqueo', item.num, col3X, y, col3W, item.h);
    y += item.h;
  });

  return doc;
}

export function buildSafetyDocumentPdf(docItem: MandatorySafetyDocument, supplierName?: string, supplierRuc?: string): jsPDF {
  if (docItem.id === 'doc-cunas') {
    return buildCunasStandardPdf(docItem, supplierName, supplierRuc);
  }
  if (docItem.id === 'doc-cutter') {
    return buildCutterCartillaPdf(docItem, supplierName, supplierRuc);
  }
  if (docItem.id === 'doc-medidas-generales') {
    return buildMedidasGeneralesPdf();
  }
  if (docItem.id === 'doc-protocolo-ingreso') {
    return buildProtocoloIngresoPdf();
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Gloria
  doc.setFillColor(0, 38, 77); // #00264d
  doc.rect(0, 0, 210, 34, 'F');

  // Red accent bar
  doc.setFillColor(211, 47, 47); // #D32F2F
  doc.rect(0, 34, 210, 3, 'F');

  // Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GLORIA', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LECHE GLORIA S.A. • SISTEMA DE GESTIÓN SST Y LOGÍSTICA', 55, 13);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${docItem.area}`, 55, 19);
  doc.text(`Código Documento: ${docItem.code}  |  Versión: ${docItem.version}  |  Cumplimiento Obligatorio Proveedores`, 55, 25);

  // Title Block
  doc.setTextColor(0, 38, 77);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(docItem.title.toUpperCase(), 180);
  doc.text(titleLines, 15, 47);

  let y = 47 + titleLines.length * 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Archivo Oficial: ${docItem.fileName}`, 15, y);
  y += 5;
  doc.text(`Categoría: ${docItem.category}`, 15, y);
  y += 7;

  // Objective Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  const objLines = doc.splitTextToSize(docItem.objective, 170);
  const objBoxHeight = 12 + objLines.length * 4.5;
  doc.roundedRect(15, y, 180, objBoxHeight, 2, 2, 'FD');

  doc.setTextColor(0, 38, 77);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. OBJETIVO DEL DOCUMENTO:', 20, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(objLines, 20, y + 11);

  y += objBoxHeight + 8;

  // Mandatory Rules Header
  doc.setFillColor(0, 38, 77);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DISPOSICIONES Y ESTÁNDARES DE CUMPLIMIENTO OBLIGATORIO', 20, y + 5.5);

  y += 13;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);

  docItem.mandatoryRules.forEach((rule, index) => {
    const ruleLines = doc.splitTextToSize(`${index + 1}. ${rule}`, 174);
    const blockH = ruleLines.length * 4.5 + 4;
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 3.5, 180, blockH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.text(ruleLines, 18, y);
    y += blockH + 1.5;
  });

  y += 4;

  // Critical Controls Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  const controlsBoxH = 12 + docItem.criticalControls.length * 5.5;
  doc.roundedRect(15, y, 180, controlsBoxH, 2, 2, 'FD');

  doc.setTextColor(185, 28, 28);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CONTROLES CRÍTICOS DE VERIFICACIÓN EN GARITA Y BAHÍA:', 20, y + 6);

  doc.setTextColor(127, 29, 29);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  let cy = y + 12;
  docItem.criticalControls.forEach((ctrl) => {
    doc.text(`• ${ctrl}`, 22, cy);
    cy += 5.2;
  });

  y += controlsBoxH + 8;

  // Supplier Acceptance Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(110, 231, 183);
  doc.roundedRect(15, y, 180, 28, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROMISO Y DECLARACIÓN DE LECTURA DEL PROVEEDOR:', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const declLines = doc.splitTextToSize(docItem.declarationText, 170);
  doc.text(declLines, 20, y + 11);
  if (supplierName) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Proveedor: ${supplierName} ${supplierRuc ? `(RUC: ${supplierRuc})` : ''} • Fecha consulta: ${new Date().toLocaleString('es-PE')}`, 20, y + 23);
  }

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Leche Gloria S.A. - Documento normativo oficial para proveedores y transportistas. Prohibida su alteración.', 28, 286);

  return doc;
}

export function getSafetyDocumentPdfDataUrl(docItem: MandatorySafetyDocument, supplierName?: string, supplierRuc?: string): string {
  const doc = buildSafetyDocumentPdf(docItem, supplierName, supplierRuc);
  return doc.output('datauristring');
}

export function downloadSafetyDocumentPdf(docItem: MandatorySafetyDocument, supplierName?: string, supplierRuc?: string): void {
  const doc = buildSafetyDocumentPdf(docItem, supplierName, supplierRuc);
  doc.save(docItem.fileName);
}
