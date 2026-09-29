import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Download,
  Check,
  AlertTriangle,
  FileText,
  Eye,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  MandatorySafetyDocument,
  downloadSafetyDocumentPdf,
  getSafetyDocumentPdfDataUrl
} from '../utils/safetyDocuments';

interface SafetyDocumentReaderModalProps {
  docItem: MandatorySafetyDocument | null;
  onClose: () => void;
  onAccept?: (docId: string) => void;
  isAccepted?: boolean;
  supplierName?: string;
  supplierRuc?: string;
}

export const SafetyDocumentReaderModal: React.FC<SafetyDocumentReaderModalProps> = ({
  docItem,
  onClose,
  onAccept,
  isAccepted,
  supplierName,
  supplierRuc
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');

  const pdfDataUrl = useMemo(() => {
    if (!docItem) return '';
    return getSafetyDocumentPdfDataUrl(docItem, supplierName, supplierRuc);
  }, [docItem, supplierName, supplierRuc]);

  if (!docItem) return null;

  const isCunasDoc = docItem.id === 'doc-cunas';
  const isCutterDoc = docItem.id === 'doc-cutter';
  const isMedidasDoc = docItem.id === 'doc-medidas-generales';
  const isProtocoloDoc = docItem.id === 'doc-protocolo-ingreso';

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Reader Header */}
        <div className="bg-[#00264d] text-white px-5 py-3.5 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-blue-200">
                <span className="font-mono font-bold text-white">{docItem.code}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold">{docItem.version}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{docItem.category}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold truncate">
                {docItem.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition shrink-0"
            title="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader Toolbar: File name, View Switcher, and Direct Download */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-[#D32F2F] shrink-0" />
            <span className="text-xs font-mono text-slate-700 truncate">
              Documento Oficial: <strong>{docItem.fileName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'interactive'
                    ? 'bg-white text-[#00264d] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lectura Estándar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'pdf'
                    ? 'bg-white text-[#00264d] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visor PDF</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => downloadSafetyDocumentPdf(docItem, supplierName, supplierRuc)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D32F2F] hover:bg-red-700 text-white font-bold text-xs transition shadow-2xs shrink-0"
              title={`Descargar ${docItem.fileName}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Reader Body */}
        {viewMode === 'pdf' ? (
          <div className="flex-1 bg-slate-800 p-2 sm:p-4 flex flex-col min-h-[480px]">
            <iframe
              src={pdfDataUrl}
              title={docItem.fileName}
              className="w-full flex-1 rounded-lg border border-slate-700 bg-white min-h-[450px]"
            />
          </div>
        ) : isMedidasDoc ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-8 text-slate-950 flex-1 bg-slate-200/70">
            {/* ==================== PÁGINA 1 ORIGINAL ({ 1 }) ==================== */}
            <div className="bg-white border border-slate-300 shadow-md max-w-3xl mx-auto p-6 sm:p-10 relative overflow-hidden">
              {/* Faint GLORIA Watermark in center */}
              <div className="pointer-events-none select-none absolute inset-0 flex flex-col items-center justify-center opacity-10">
                <span className="text-7xl sm:text-8xl font-black text-[#00264d] tracking-wider">
                  GLORIA
                </span>
                <div className="w-24 h-24 rounded-full bg-[#D32F2F] mt-2" />
              </div>

              <div className="relative z-10 space-y-4">
                {/* Original Top Header Box */}
                <div className="border border-slate-900 px-4 py-3 flex items-center gap-4 max-w-2xl mx-auto bg-white">
                  <div className="flex flex-col items-center shrink-0 pl-2">
                    <span className="text-lg sm:text-xl font-black text-[#00264d] tracking-tight leading-none">
                      GLORIA
                    </span>
                    <span className="w-5 h-5 rounded-full bg-[#D32F2F] inline-flex items-center justify-center mt-1">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="flex-1 text-center">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase leading-snug">
                      MEDIDAS DE SEGURIDAD GENERALES DENTRO DE
                      <br />
                      PLANTA GLORIA
                    </h4>
                  </div>
                </div>

                {/* Original Page 1 Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-xs sm:text-sm bg-white/90">
                    <thead>
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <th className="border border-slate-600 py-1.5 px-2 w-12 text-center">ITEM</th>
                        <th className="border border-slate-600 py-1.5 px-3 text-center">DESCRIPCION</th>
                        <th className="border border-slate-600 py-1.5 px-2 w-40 text-center">IMAGEN RELACIONADA</th>
                      </tr>
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <th colSpan={3} className="border border-slate-600 py-1.5 px-3 text-center">
                          DISPOSICIONES DE SEGURIDAD
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-950">
                      {/* Item 1 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top font-normal">1</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          La velocidad máxima de vehículos dentro de la planta es de 20 km/h.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="inline-flex flex-col items-center border-2 border-slate-900 px-2.5 py-1.5 bg-white">
                            <div className="w-11 h-11 rounded-full border-4 border-red-600 flex flex-col items-center justify-center leading-none">
                              <span className="text-sm font-black text-slate-950">20</span>
                              <span className="text-[8px] font-bold text-slate-900">Km/h</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-950 mt-1 leading-tight">
                              VELOCIDAD
                              <br />
                              MÁXIMA
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Item 2 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">2</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Está prohibido el uso de celulares y dispositivos de hands free (manos libres), audífonos o altavoz durante la operación de vehículos y equipo móviles.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-200 p-1.5 rounded border border-slate-400">
                            <div className="bg-white border border-slate-800 px-2 py-1 text-center">
                              <div className="w-6 h-6 mx-auto rounded-full border-2 border-red-600 flex items-center justify-center text-[9px] font-black text-red-600">
                                📵
                              </div>
                              <span className="text-[7px] font-black block leading-tight mt-0.5">
                                NO UTILICES EL CELULAR MIENTRAS MANEJAS
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Item 3 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">3</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Respetar la señal de PARE si está conduciendo un vehículo y realizar una parada de 3 segundos en cada cruce peatonal.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <svg viewBox="0 0 120 65" className="w-28 h-16 mx-auto border border-slate-300 bg-slate-100">
                            <rect x="0" y="46" width="120" height="19" fill="#64748b" />
                            <rect x="12" y="50" width="14" height="10" fill="#fff" />
                            <rect x="36" y="50" width="14" height="10" fill="#fff" />
                            <rect x="60" y="50" width="14" height="10" fill="#fff" />
                            <rect x="84" y="50" width="14" height="10" fill="#fff" />
                            <rect x="38" y="12" width="44" height="34" rx="3" fill="#dc2626" />
                            <rect x="43" y="16" width="34" height="13" fill="#bfdbfe" />
                          </svg>
                        </td>
                      </tr>

                      {/* Item 4 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">4</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Si es peatón, respetar los semáforos y vías peatonales, además transitar solamente por las áreas o zonas autorizadas
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-blue-700 text-white p-2 rounded flex items-center justify-between gap-2 text-[8px] font-bold">
                            <span className="leading-tight text-left">
                              RESPETA EL SEMÁFORO Y LAS VÍAS PEATONALES
                            </span>
                            <div className="bg-slate-900 p-1 rounded flex flex-col gap-0.5 shrink-0">
                              <span className="w-2 h-2 rounded-full bg-red-500 block" />
                              <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                              <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Item 5 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">5</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Uso obligatorio de EPP&apos;s según cada zona de operación donde se va a transitar.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="border border-blue-700 bg-white p-1.5">
                            <div className="bg-blue-700 text-white text-[7px] font-bold py-0.5 px-1 mb-1">
                              USO OBLIGATORIO DE EQUIPO DE PROTECCION PERSONAL (EPP)
                            </div>
                            <div className="grid grid-cols-4 gap-1 justify-items-center">
                              {['🪖', '🥾', '🥽', '🎧', '🦺', '😷', '🪢', '🛡️'].map((ic, i) => (
                                <span
                                  key={i}
                                  className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center"
                                >
                                  {ic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Item 6 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">6</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          No debe emplearse el celular mientras camina y está totalmente prohibido tomar fotos dentro de planta.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-blue-900 text-white p-2 rounded text-center space-y-1">
                            <span className="text-[7px] font-bold block">NO ESTÁN PERMITIDAS:</span>
                            <div className="flex items-center justify-center gap-1.5 text-xs">
                              <span className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                                🚫
                              </span>
                              <span>📷</span>
                              <span>📱</span>
                              <span>💻</span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Item 7 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">7</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Respetar todas las señales de seguridad que se encuentren dentro de planta.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-slate-200 border border-slate-400 p-2 rounded flex items-center justify-around">
                            <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                              SALIDA →
                            </span>
                            <span className="bg-amber-400 text-slate-950 text-[8px] font-bold px-1.5 py-0.5 rounded">
                              ⚠️ SEÑAL
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Item 8 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">8</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Mantener cuidado con los vehículos en movimiento en las zonas de operación y siempre transitar caminando, prohibido correr.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="grid grid-cols-2 gap-1 items-center">
                            <div className="bg-amber-400 border border-slate-900 p-1 text-center">
                              <span className="text-sm font-black block leading-none">⚠️</span>
                              <span className="text-[7px] font-black bg-slate-900 text-amber-400 px-1 block mt-0.5">
                                CUIDADO
                              </span>
                            </div>
                            <div className="bg-slate-200 border border-slate-400 p-1 text-center relative">
                              <span className="text-sm">🏃</span>
                              <span className="text-[9px] font-bold text-red-600 block">✘ Correr</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Page 1 Original Footer: { 1 } */}
                <div className="pt-6 flex items-center justify-center gap-3 text-slate-600">
                  <div className="h-px bg-slate-400 flex-1 max-w-[200px]" />
                  <span className="text-sm font-serif text-slate-800">{'{  1  }'}</span>
                  <div className="h-px bg-slate-400 flex-1 max-w-[200px]" />
                </div>
              </div>
            </div>

            {/* ==================== PÁGINA 2 ORIGINAL ({ 2 }) ==================== */}
            <div className="bg-white border border-slate-300 shadow-md max-w-3xl mx-auto p-6 sm:p-10 relative overflow-hidden">
              {/* Faint GLORIA Watermark in center */}
              <div className="pointer-events-none select-none absolute inset-0 flex flex-col items-center justify-center opacity-10">
                <span className="text-7xl sm:text-8xl font-black text-[#00264d] tracking-wider">
                  GLORIA
                </span>
                <div className="w-24 h-24 rounded-full bg-[#D32F2F] mt-2" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-xs sm:text-sm bg-white/90">
                    <tbody className="text-slate-950">
                      {/* Item 9 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 w-12 text-center align-top">9</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          <p>No obstaculizar:</p>
                          <p>Vías peatonales, ingresos / salidas</p>
                          <p>Salidas de emergencia</p>
                          <p>Extintores</p>
                          <p>Gabinetes contra incendio</p>
                        </td>
                        <td className="border border-slate-600 p-2 w-40 align-middle text-center">
                          <div className="bg-blue-950 text-white p-2 rounded text-left text-[7px] space-y-0.5">
                            <div className="flex items-center gap-1 font-bold text-[8px] text-white mb-1">
                              <span className="bg-red-600 text-white rounded-full w-3.5 h-3.5 inline-flex items-center justify-center">
                                X
                              </span>
                              <span>NO OBSTACULICES</span>
                            </div>
                            <p>• Vías peatonales</p>
                            <p>• Ingresos / Salidas</p>
                            <p>• Salidas de Emergencia</p>
                            <p>• Extintores</p>
                            <p>• Gabinetes contra incendio</p>
                          </div>
                        </td>
                      </tr>

                      {/* Item 10 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">10</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Si dentro de la actividad a realizar se requiere el uso de cuchilla, esta herramienta debe ser auto retráctil, son sólo las autorizadas para el manejo dentro de las instalaciones de Gloria S.A.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <svg viewBox="0 0 140 80" className="w-32 h-18 mx-auto bg-white">
                            <g transform="rotate(26 70 40)">
                              <polygon points="22,36 34,32 34,44" fill="#94a3b8" />
                              <rect x="32" y="30" width="76" height="18" rx="3" fill="#ea580c" />
                              <circle cx="78" cy="39" r="3" fill="#facc15" />
                            </g>
                            <rect x="48" y="4" width="38" height="10" fill="#ffff00" stroke="#15803d" strokeWidth="1" />
                            <rect x="92" y="18" width="44" height="12" fill="#ffff00" stroke="#15803d" strokeWidth="1" />
                            <rect x="8" y="46" width="36" height="12" fill="#ffff00" stroke="#15803d" strokeWidth="1" />
                            <rect x="52" y="64" width="42" height="12" fill="#ffff00" stroke="#15803d" strokeWidth="1" />
                          </svg>
                        </td>
                      </tr>

                      {/* Item 11 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">11</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Reportar cualquier incidente, acto o condición que ponga en riesgo tu seguridad o la de otras personas
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-slate-200 border border-slate-400 p-2 rounded flex items-center justify-center gap-2 text-xs">
                            <span>👷‍♂️📋</span>
                            <span>👷‍♀️</span>
                          </div>
                        </td>
                      </tr>

                      {/* Item 12 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">12</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          En caso de emergencias o evacuación sigue las instrucciones del personal de la Empresa Gloria S.A
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-slate-100 border border-slate-400 p-1.5 rounded text-center space-y-1">
                            <span className="bg-blue-900 text-white text-[6.5px] font-bold px-1 py-0.5 block">
                              ESPERA LAS INDICACIONES UBICADO EN LA ZONA DE SEGURIDAD
                            </span>
                            <span className="inline-block bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded">
                              S ZONA SEGURA
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Subheader: RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE */}
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <td colSpan={3} className="border border-slate-600 py-2 px-3 text-center uppercase">
                          RECOMENDACIONES DE PROTECCIÓN AL MEDIOAMBIENTE
                        </td>
                      </tr>

                      {/* Item 13 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">13</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Coloca los residuos sólidos en los tachos respetando su clasificación y rótulo indicado en la parte exterior.
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-slate-100 border border-slate-300 p-2 rounded flex items-end justify-center gap-1">
                            <span className="w-4 h-7 bg-red-600 rounded-t inline-block border border-slate-400" />
                            <span className="w-4 h-7 bg-white rounded-t inline-block border border-slate-400" />
                            <span className="w-4 h-7 bg-blue-600 rounded-t inline-block border border-slate-400" />
                            <span className="w-4 h-7 bg-amber-800 rounded-t inline-block border border-slate-400" />
                            <span className="w-4 h-7 bg-slate-900 rounded-t inline-block border border-slate-400" />
                          </div>
                        </td>
                      </tr>

                      {/* Item 14 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">14</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Prohibido arrojar cualquier tipo de fluidos en las canaletas de desagüe, recipientes abiertos, áreas verdes o veredas
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-blue-900 text-white p-1.5 rounded flex items-center justify-between gap-1 text-[6.5px] font-bold">
                            <span className="leading-tight text-left">
                              PROHIBIDO ARROJAR CUALQUIER TIPO DE FLUIDO EN LAS CANALETAS DE DESAGÜE
                            </span>
                            <span className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0 text-xs">
                              🚫
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Item 15 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">15</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Asegurar que los caños se encuentren después de cada uso
                        </td>
                        <td className="border border-slate-600 p-2 align-middle text-center">
                          <div className="bg-blue-800 text-white p-1.5 rounded text-center space-y-1">
                            <span className="text-[7px] font-bold block leading-tight">
                              CIERRA LOS CAÑOS DESPUÉS DE CADA USO
                            </span>
                            <span className="w-6 h-6 mx-auto rounded-full border-2 border-red-500 flex items-center justify-center text-xs">
                              🚰
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Page 2 Original Footer: { 2 } */}
                <div className="pt-6 flex items-center justify-center gap-3 text-slate-600">
                  <div className="h-px bg-slate-400 flex-1 max-w-[200px]" />
                  <span className="text-sm font-serif text-slate-800">{'{  2  }'}</span>
                  <div className="h-px bg-slate-400 flex-1 max-w-[200px]" />
                </div>
              </div>
            </div>
          </div>
        ) : isProtocoloDoc ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-950 flex-1 bg-slate-200/70">
            {/* ==================== PÁGINA ÚNICA ORIGINAL: PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES ==================== */}
            <div className="bg-white border border-slate-300 shadow-md max-w-3xl mx-auto p-6 sm:p-10 relative overflow-hidden">
              {/* Faint GLORIA Watermark in center */}
              <div className="pointer-events-none select-none absolute inset-0 flex flex-col items-center justify-center opacity-10">
                <span className="text-7xl sm:text-8xl font-black text-[#00264d] tracking-wider">
                  GLORIA
                </span>
                <div className="w-24 h-24 rounded-full bg-[#D32F2F] mt-2" />
              </div>

              <div className="relative z-10 space-y-3">
                {/* Original Top Header (GLORIA logo left + Title right) */}
                <div className="flex items-center gap-3 pb-1">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-base sm:text-lg font-black text-[#00264d] tracking-tight leading-none">
                      GLORIA
                    </span>
                    <span className="w-4 h-4 rounded-full bg-[#D32F2F] inline-flex items-center justify-center mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-950 uppercase flex-1 text-center">
                    PROTOCOLO PARA INGRESO, PARQUEO, CARGA Y DESCARGA DE UNIDADES
                  </h4>
                </div>

                {/* Original Protocol Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-xs bg-white/90">
                    <thead>
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <th className="border border-slate-600 py-1.5 px-2 w-12 text-center">ITEM</th>
                        <th className="border border-slate-600 py-1.5 px-3 text-center">DESCRIPCION</th>
                        <th className="border border-slate-600 py-1.5 px-2 w-44 text-center">IMAGEN RELACIONADA</th>
                      </tr>
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <th colSpan={3} className="border border-slate-600 py-1.5 px-3 text-center">
                          INGRESO DE VEHICULOS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-950">
                      {/* INGRESO 1 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">1</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          <p>Detenga el vehículo por completo, accione el freno de estacionamiento.</p>
                          <p>Presente los documentos requeridos y permita la inspección por parte del personal de seguridad.</p>
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 68" className="w-36 h-16 mx-auto border border-slate-300 bg-slate-200">
                            <rect x="0" y="44" width="140" height="24" fill="#64748b" />
                            <rect x="36" y="16" width="68" height="30" rx="3" fill="#b91c1c" />
                            <rect x="42" y="20" width="28" height="10" fill="#bfdbfe" />
                            <polygon points="70,44 64,60 76,60" fill="#ea580c" />
                            <line x1="66" y1="53" x2="74" y2="53" stroke="#fff" strokeWidth="2" />
                          </svg>
                        </td>
                      </tr>

                      {/* INGRESO 2 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">2</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Evite permanecer espacios prolongados en lugares no autorizados.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 68" className="w-36 h-16 mx-auto border border-slate-300 bg-slate-300">
                            <rect x="0" y="42" width="140" height="26" fill="#475569" />
                            <rect x="44" y="18" width="54" height="26" rx="2" fill="#f8fafc" stroke="#64748b" />
                            <rect x="46" y="22" width="18" height="9" fill="#334155" />
                          </svg>
                        </td>
                      </tr>

                      {/* INGRESO 3 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">3</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          <p>En caso de realizar maniobras en retroceso, solicite el apoyo de personal Gloria autorizado.</p>
                          <p>Transite siempre bajo los límites de velocidad establecido por planta, el uso del cinturón de seguridad es obligatorio mientras conduzca.</p>
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 68" className="w-36 h-16 mx-auto border border-slate-300 bg-sky-100">
                            <rect x="0" y="48" width="140" height="20" fill="#64748b" />
                            <rect x="64" y="12" width="44" height="38" rx="3" fill="#b91c1c" />
                            <rect x="70" y="17" width="32" height="12" fill="#bfdbfe" />
                            <circle cx="34" cy="36" r="11" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
                            <text x="34" y="39" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">
                              PARE
                            </text>
                          </svg>
                        </td>
                      </tr>

                      {/* INGRESO 4 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">4</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          Mantener distancia segura de los vehículos y equipos en operación, además el tránsito de camiones debe ser por el lado derecho de la vía.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 68" className="w-36 h-16 mx-auto border border-slate-300 bg-slate-200">
                            <rect x="0" y="48" width="140" height="20" fill="#475569" />
                            <rect x="6" y="16" width="42" height="32" rx="2" fill="#ffffff" stroke="#475569" />
                            <polygon points="54,28 74,28 74,23 84,32 74,41 74,36 54,36" fill="#ea580c" />
                            <rect x="88" y="16" width="46" height="32" rx="2" fill="#ffffff" stroke="#475569" />
                          </svg>
                        </td>
                      </tr>

                      {/* SUBHEADER: PARQUEO EN MUELLES DE CARGA / DESCARGA */}
                      <tr className="bg-[#d9d9d9] text-slate-950 font-bold text-[11px] sm:text-xs">
                        <td colSpan={3} className="border border-slate-600 py-1.5 px-3 text-center uppercase">
                          PARQUEO EN MUELLES DE CARGA / DESCARGA
                        </td>
                      </tr>

                      {/* PARQUEO 1 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">1</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          <p>Estacione el vehículo únicamente en lugares autorizados y siempre en posición de salida. Las operaciones en reversa deben ser apoyadas por personal Gloria autorizado.</p>
                          <p>Apague el vehículo y active el freno de estacionamiento.</p>
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 68" className="w-36 h-16 mx-auto border border-slate-300 bg-slate-200">
                            <g transform="skewX(-24)">
                              <rect x="30" y="10" width="22" height="46" fill="none" stroke="#eab308" strokeWidth="2.5" />
                              <rect x="64" y="10" width="22" height="46" fill="#dc2626" stroke="#eab308" strokeWidth="2.5" />
                              <rect x="98" y="10" width="22" height="46" fill="none" stroke="#eab308" strokeWidth="2.5" />
                            </g>
                          </svg>
                        </td>
                      </tr>

                      {/* PARQUEO 2 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">2</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          El personal de almacén entregara el letrero de advertencia al conductor quien lo colocará sobre el parabrisas delantero, obstruyendo la visibilidad.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <div className="grid grid-cols-12 gap-1 items-center bg-slate-100 p-1 border border-slate-300">
                            <div className="col-span-7 bg-slate-800 h-12 rounded flex items-center justify-end pr-2">
                              <span className="bg-white border border-red-600 text-red-600 text-[8px] font-bold px-1 py-0.5">
                                ⚠️
                              </span>
                            </div>
                            <div className="col-span-5 border-2 border-red-600 bg-white h-12 flex flex-col items-center justify-center">
                              <span className="text-red-600 text-sm font-black leading-none">⚠️</span>
                              <span className="text-[6px] font-bold text-slate-800 mt-0.5">ADVERTENCIA</span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* PARQUEO 3 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">3</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          El conductor del vehículo debe retirar la llave de contacto, descender del vehículo, colocar tacos y conos de seguridad.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <div className="grid grid-cols-2 gap-1 items-center">
                            <div className="bg-slate-900 text-white h-14 rounded flex flex-col items-center justify-center text-xs">
                              <span>🔑</span>
                              <span className="text-[7px] text-slate-300 mt-0.5">Retirar llave</span>
                            </div>
                            <div className="bg-slate-300 h-14 rounded flex flex-col items-center justify-center text-xs">
                              <span>🚛</span>
                              <span className="text-[8px]">🔺 🔺</span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* PARQUEO 4 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">4</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          El conductor debe ubicarse dentro su cabina o zona segura establecidos de tal forma que no esté en riesgo de atropello durante el proceso de carga y descarga.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 65" className="w-36 h-15 mx-auto border border-slate-300 bg-slate-200">
                            <rect x="0" y="45" width="140" height="20" fill="#475569" />
                            <rect x="16" y="14" width="104" height="30" rx="2" fill="#f8fafc" stroke="#64748b" />
                            <circle cx="36" cy="46" r="6" fill="#1e293b" />
                            <circle cx="102" cy="46" r="6" fill="#1e293b" />
                          </svg>
                        </td>
                      </tr>

                      {/* PARQUEO 5 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">5</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          <p>El conductor apertura las cortinas solo cuando cumplió el punto 2.</p>
                          <p>La atención de parte del montacargas solo se realizará si se cumplió con los puntos indicados.</p>
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 65" className="w-36 h-15 mx-auto border border-slate-300 bg-slate-300">
                            <rect x="10" y="10" width="32" height="44" fill="#991b1b" />
                            <rect x="42" y="10" width="74" height="44" fill="#e2e8f0" stroke="#475569" />
                            <rect x="116" y="10" width="14" height="44" fill="#dc2626" />
                          </svg>
                        </td>
                      </tr>

                      {/* PARQUEO 6 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">6</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          El personal de almacén debe avisar al conductor que la carga/ descarga ha finalizado (si aplica procederá a cerrar las puertas o cortinas) y retirar el letrero de advertencia que fue colocado en el parabrisas.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 65" className="w-36 h-15 mx-auto border border-slate-300 bg-slate-200">
                            <rect x="14" y="10" width="112" height="38" rx="3" fill="#1e3a8a" />
                            <rect x="56" y="18" width="26" height="18" fill="#ffffff" stroke="#dc2626" />
                            <path d="M 32 42 L 48 32 M 108 42 L 92 32" stroke="#000" strokeWidth="2.5" />
                          </svg>
                        </td>
                      </tr>

                      {/* PARQUEO 7 */}
                      <tr>
                        <td className="border border-slate-600 py-2 px-2 text-center align-top">7</td>
                        <td className="border border-slate-600 py-2 px-3 align-top">
                          El conductor del vehículo reinicia la marcha retirándose del muelle. En todo momento debe utilizar el cinturón de seguridad respetando los límites de velocidad.
                        </td>
                        <td className="border border-slate-600 p-1.5 align-middle text-center">
                          <svg viewBox="0 0 140 65" className="w-36 h-15 mx-auto border border-slate-300 bg-slate-200">
                            <g transform="skewX(-24)">
                              <rect x="30" y="10" width="22" height="44" fill="none" stroke="#eab308" strokeWidth="2.5" />
                              <rect x="64" y="10" width="22" height="44" fill="#dc2626" stroke="#eab308" strokeWidth="2.5" />
                              <rect x="98" y="10" width="22" height="44" fill="none" stroke="#eab308" strokeWidth="2.5" />
                            </g>
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 flex-1 bg-slate-50/50">
            {/* Official Document Control Header Sheet */}
            <div className="bg-white border-2 border-[#00264d] rounded-xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#00264d]">
                <div className="sm:col-span-3 bg-[#00264d] text-white p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black tracking-wider">GLORIA</span>
                  <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">
                    {isCunasDoc ? 'DEPRODECA / SSO' : 'LECHE GLORIA S.A.'}
                  </span>
                </div>
                <div className="sm:col-span-6 p-3 flex flex-col items-center justify-center text-center bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D32F2F]">
                    {docItem.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-[#00264d] uppercase mt-0.5">
                    {docItem.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 mt-0.5">{docItem.area}</span>
                </div>
                <div className="sm:col-span-3 bg-slate-50 text-xs divide-y divide-slate-200 flex flex-col justify-center">
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Código:</span>
                    <span className="font-mono font-bold text-[#00264d]">{docItem.code}</span>
                  </div>
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Versión:</span>
                    <span className="font-mono font-bold text-slate-800">{docItem.version}</span>
                  </div>
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Carácter:</span>
                    <span className="font-bold text-emerald-700 text-[11px]">Obligatorio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Objective */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00264d] mb-1">
                1. Objetivo y Alcance del Estándar
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {docItem.objective}
              </p>
            </div>

            {/* SPECIAL 2-PAGE VISUAL LAYOUT FOR GLGS00055 VE 01 - CUTTER DE SEGURIDAD AUTO RETRÁCTIL */}
            {isCutterDoc && (
              <div className="space-y-6">
                {/* ==================== PÁGINA 1 DE 2 ==================== */}
                <div className="bg-white border-2 border-slate-800 rounded-xl overflow-hidden shadow-md">
                  {/* Top Orange Banner Header (Page 1) */}
                  <div className="bg-[#ED7D31] p-3 border-b-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="hidden sm:block w-20" />
                    <div className="bg-white border-2 border-slate-900 px-5 py-2 text-center shadow-2xs flex-1 max-w-lg">
                      <p className="text-xs sm:text-sm font-black text-slate-950 uppercase">
                        CARTILLA DE SEGURIDAD
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Uso de herramientas: Cutter de seguridad auto retráctil
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Leche Gloria S.A.
                      </p>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="bg-white border border-slate-800 px-2.5 py-1 rounded text-center">
                        <span className="text-xs font-black text-[#00264d] tracking-wider block">
                          GLORIA
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block" />
                      </div>
                      <span className="text-[10px] text-white font-semibold mt-0.5">
                        Revisado: Enero 2021
                      </span>
                    </div>
                  </div>

                  {/* Intro Sub-banner */}
                  <div className="mx-3 mt-3 p-2.5 bg-white border-2 border-slate-900 text-center">
                    <p className="text-xs font-bold italic text-slate-950">
                      Esta cartilla busca promover una cultura de prevención en el trabajador así como brindar información y capacitación oportuna sobre el uso del Cutter de seguridad de auto retráctil
                    </p>
                  </div>

                  {/* Page 1 Content Body */}
                  <div className="p-4 space-y-4">
                    {/* Green Definition Box + Cutter Top Right Illustration */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-9 bg-[#38ef7d]/50 border border-orange-500 p-3.5 text-xs text-slate-950 space-y-2 leading-relaxed">
                        <p>
                          <strong>Cutter :</strong> Es un tipo de navaja que consta de un mango plano, simple y económico, de aproximadamente 2,5 cm de ancho y de 7,5 a 10 cm de largo, fabricado con metal o plástico. Pueden contar con un sistema para ajustar hasta qué punto la cuchilla sobresale de la agarradera.
                        </p>
                        <p>
                          Cuando la hoja, consistente en una navaja corrediza, delgada, filosa y reemplazable, pierde el filo, puede rápidamente partirse para aprovechar los tramos que aún no han sido usados o ser sustituida por una nueva.
                        </p>
                      </div>
                      <div className="md:col-span-3 flex items-center justify-center p-2">
                        <svg viewBox="0 0 120 110" className="w-28 h-24">
                          <g transform="rotate(-52 60 58)">
                            <polygon points="16,48 28,44 28,56" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                            <rect x="26" y="42" width="76" height="20" rx="4" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
                            <circle cx="62" cy="52" r="3.5" fill="#facc15" stroke="#713f12" strokeWidth="1.2" />
                            <circle cx="95" cy="52" r="3" fill="#ffffff" stroke="#9a3412" strokeWidth="1.2" />
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Middle Section: Características / Partes (Left) + Detailed Callout Diagram (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                      <div className="lg:col-span-4 space-y-2.5 flex flex-col">
                        <div className="bg-[#ffff00] border border-orange-500 py-2 px-3 text-center">
                          <span className="text-xs font-black italic text-slate-950 uppercase block">
                            CUTTER DE SEGURIDAD AUTO RETRÁCTIL
                          </span>
                        </div>

                        <div className="bg-white border border-orange-400 p-3 text-xs space-y-1 flex-1">
                          <span className="font-bold text-slate-950 block">Características:</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-900">
                            <li>Cutter de seguridad con navaja auto retráctil</li>
                            <li>La mano se encuentra protegida de cortes ya que la navaja se retrae automáticamente</li>
                            <li>Mango de cutter de metal</li>
                            <li>De fácil sujeción por el diseño</li>
                          </ul>
                        </div>

                        <div className="bg-white border border-orange-400 p-3 text-xs space-y-1 flex-1">
                          <span className="font-bold text-slate-950 block">Partes:</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-900">
                            <li>Navaja auto retráctil</li>
                            <li>Mango de metal resistente al impacto</li>
                            <li>Ranuras antideslizantes</li>
                            <li className="text-red-700 font-semibold">Soporte en pulgar para mejor sujeción</li>
                            <li>Compartimiento de navaja</li>
                            <li>Seguro de compartimiento de navaja (tornillo)</li>
                          </ul>
                        </div>
                      </div>

                      {/* Right: SVG Diagram with 6 Yellow Callout Boxes */}
                      <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center">
                        <svg viewBox="0 0 500 310" className="w-full max-w-[500px] h-auto">
                          {/* Main Diagonal Orange Metal Cutter Body */}
                          <g transform="rotate(30 250 155)">
                            {/* Rounded-tip safety blade protruding left */}
                            <path
                              d="M 82 140 L 118 134 L 118 164 L 84 156 C 77 153, 77 143, 82 140 Z"
                              fill="#94a3b8"
                              stroke="#334155"
                              strokeWidth="2"
                            />
                            {/* Tape splitter notch (Rajador de cinta) */}
                            <polygon points="122,126 134,126 128,136" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                            {/* Metal Cutter Handle */}
                            <rect x="115" y="126" width="250" height="48" rx="8" fill="#ea580c" stroke="#9a3412" strokeWidth="2.5" />
                            {/* Blade slider actuator on top */}
                            <rect x="170" y="120" width="28" height="8" rx="2" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
                            {/* Stanley / Metal Grip Texture */}
                            <rect x="178" y="138" width="66" height="22" rx="2" fill="#c2410c" stroke="#9a3412" strokeWidth="1" />
                            {/* Brass Compartment Screw (Tornillo) */}
                            <circle cx="262" cy="150" r="9" fill="#facc15" stroke="#713f12" strokeWidth="2" />
                            <line x1="255" y1="150" x2="269" y2="150" stroke="#713f12" strokeWidth="2.5" />
                            {/* Anti-slip ribs (Ranuras antideslizantes) */}
                            <line x1="305" y1="132" x2="305" y2="168" stroke="#9a3412" strokeWidth="3" />
                            <line x1="316" y1="132" x2="316" y2="168" stroke="#9a3412" strokeWidth="3" />
                            <line x1="327" y1="132" x2="327" y2="168" stroke="#9a3412" strokeWidth="3" />
                            {/* Rear Lanyard Hole */}
                            <circle cx="348" cy="150" r="7" fill="#ffffff" stroke="#9a3412" strokeWidth="2" />
                          </g>

                          {/* Callout 1: Rajador de cinta */}
                          <line x1="230" y1="38" x2="175" y2="75" stroke="#000000" strokeWidth="2.5" />
                          <rect x="175" y="12" width="115" height="26" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="232" y="29" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">
                            Rajador de cinta
                          </text>

                          {/* Callout 2: Accionador de navaja */}
                          <line x1="315" y1="78" x2="232" y2="108" stroke="#000000" strokeWidth="2.5" />
                          <rect x="260" y="45" width="118" height="34" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="319" y="60" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            Accionador de
                          </text>
                          <text x="319" y="73" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            navaja
                          </text>

                          {/* Callout 3: Seguro de compartimiento de navaja (tornillo) */}
                          <line x1="415" y1="142" x2="275" y2="162" stroke="#000000" strokeWidth="2.5" />
                          <rect x="330" y="102" width="162" height="38" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="411" y="118" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            Seguro de compartimiento
                          </text>
                          <text x="411" y="132" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            de navaja (tornillo)
                          </text>

                          {/* Callout 4: Navaja auto retráctil */}
                          <line x1="82" y1="168" x2="128" y2="96" stroke="#000000" strokeWidth="2.5" />
                          <rect x="18" y="168" width="115" height="36" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="75" y="183" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            Navaja auto
                          </text>
                          <text x="75" y="197" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            retráctil
                          </text>

                          {/* Callout 5: Compartimiento de navaja */}
                          <line x1="175" y1="232" x2="215" y2="152" stroke="#000000" strokeWidth="2.5" />
                          <rect x="115" y="232" width="120" height="36" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="175" y="247" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            Compartimiento
                          </text>
                          <text x="175" y="261" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            de navaja
                          </text>

                          {/* Callout 6: Ranuras antideslizantes */}
                          <line x1="295" y1="262" x2="328" y2="205" stroke="#000000" strokeWidth="2.5" />
                          <rect x="235" y="262" width="120" height="36" fill="#ffff00" stroke="#15803d" strokeWidth="1.5" />
                          <text x="295" y="277" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            Ranuras
                          </text>
                          <text x="295" y="291" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                            antideslizantes
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Lower 2 Columns: MODO DE USO & APLICACIONES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 flex flex-col">
                        <div className="bg-[#dc2626] text-white py-1.5 px-3 text-center font-bold text-xs uppercase">
                          MODO DE USO
                        </div>
                        <div className="bg-[#ffff00] border border-orange-500 p-3 text-xs text-slate-950 flex-1">
                          <ul className="list-disc pl-4 space-y-1.5 leading-snug">
                            <li>Sujete del mango, se puede utilizar dependiendo de su mano dominante (izquierda o derecha)</li>
                            <li>Asegúrese antes del uso que no presente rajaduras y que el compartimiento de la navaja se encuentre asegurado</li>
                            <li>Utilícelo con las manos limpias a fin de evitar resbalamientos</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-1.5 flex flex-col">
                        <div className="bg-[#dc2626] text-white py-1.5 px-3 text-center font-bold text-xs uppercase">
                          APLICACIONES
                        </div>
                        <div className="bg-[#ffff00] border border-orange-500 p-3 text-xs text-slate-950 flex-1 flex items-center">
                          <ul className="list-disc pl-5 space-y-1.5 font-medium">
                            <li>Corte de cartones</li>
                            <li>Corte de cintas</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom 3 Action Cards (Page 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex flex-col">
                        <div className="p-3 flex items-center justify-center bg-amber-50/50 h-24">
                          <svg viewBox="0 0 140 70" className="w-32 h-16">
                            <rect x="10" y="45" width="120" height="20" fill="#d6b588" />
                            <line x1="25" y1="45" x2="115" y2="45" stroke="#78350f" strokeWidth="2" />
                            <g transform="rotate(20 70 30)">
                              <rect x="35" y="18" width="52" height="16" rx="3" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
                              <rect x="52" y="13" width="12" height="5" fill="#dc2626" />
                              <polygon points="87,22 102,26 87,32" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
                            </g>
                          </svg>
                        </div>
                        <div className="p-2.5 bg-white border-t border-blue-800 text-center text-xs text-slate-900 font-medium">
                          Presione el accionador para aperturar cajas
                        </div>
                      </div>

                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex flex-col">
                        <div className="p-3 flex items-center justify-center bg-amber-50/50 h-24">
                          <svg viewBox="0 0 140 70" className="w-32 h-16">
                            <rect x="10" y="45" width="120" height="20" fill="#d6b588" />
                            <g transform="rotate(15 70 30)">
                              <rect x="38" y="18" width="52" height="16" rx="3" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
                              <rect x="46" y="13" width="12" height="5" fill="#dc2626" />
                            </g>
                          </svg>
                        </div>
                        <div className="p-2.5 bg-white border-t border-blue-800 text-center text-xs text-slate-900 font-medium">
                          Suelte el accionador y la navaja se retraerá
                        </div>
                      </div>

                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex flex-col">
                        <div className="p-3 flex items-center justify-center bg-amber-50/50 h-24">
                          <svg viewBox="0 0 140 70" className="w-32 h-16">
                            <rect x="10" y="48" width="120" height="18" fill="#d6b588" />
                            <rect x="24" y="18" width="64" height="22" rx="4" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
                            <path d="M 88 22 L 108 25 C 113 27, 113 33, 108 35 L 88 38 Z" fill="#94a3b8" stroke="#334155" strokeWidth="1.8" />
                          </svg>
                        </div>
                        <div className="p-2.5 bg-white border-t border-blue-800 text-center text-xs text-slate-900 font-medium">
                          Navaja de punta redondeada
                        </div>
                      </div>
                    </div>

                    {/* Footer Page 1 */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-700">
                      <span>GLGS00055 VE 01</span>
                      <span>Página 1 de 2</span>
                    </div>
                  </div>
                </div>

                {/* ==================== PÁGINA 2 DE 2 ==================== */}
                <div className="bg-white border-2 border-slate-800 rounded-xl overflow-hidden shadow-md">
                  {/* Top Orange Banner Header (Page 2) */}
                  <div className="bg-[#ED7D31] p-3 border-b-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="hidden sm:block w-20" />
                    <div className="bg-white border-2 border-slate-900 px-5 py-2 text-center shadow-2xs flex-1 max-w-lg">
                      <p className="text-xs sm:text-sm font-black text-slate-950 uppercase">
                        CARTILLA DE SEGURIDAD
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Uso de herramientas: Cutter de seguridad de estilo gancho
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Leche Gloria S.A.
                      </p>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="bg-white border border-slate-800 px-2.5 py-1 rounded text-center">
                        <span className="text-xs font-black text-[#00264d] tracking-wider block">
                          GLORIA
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block" />
                      </div>
                      <span className="text-[10px] text-white font-semibold mt-0.5">
                        Revisado: Enero 2021
                      </span>
                    </div>
                  </div>

                  {/* Intro Sub-banner Page 2 */}
                  <div className="mx-3 mt-3 p-2.5 bg-white border-2 border-slate-900 text-center">
                    <p className="text-xs font-bold italic text-slate-950">
                      Esta cartilla busca promover una cultura de prevención en el trabajador así como brindar información y capacitación oportuna sobre el uso del Cutter de seguridad de estilo gancho
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Yellow Banner: MODO DE CAMBIO DE NAVAJA */}
                    <div className="bg-[#ffff00] border border-orange-500 py-2 px-3 text-center">
                      <span className="text-xs sm:text-sm font-black italic text-slate-950 uppercase">
                        MODO DE CAMBIO DE NAVAJA DE CUTTER DE SEGURIDAD AUTO RETRÁCTIL
                      </span>
                    </div>

                    {/* 3 Columns for Blade Replacement */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Step 1 */}
                      <div className="flex flex-col justify-between space-y-2">
                        <div className="bg-[#ffff00] border border-green-700 py-1.5 px-2 text-center text-xs font-bold text-slate-950">
                          Seguro de compartimiento de navaja
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center h-28">
                          <svg viewBox="0 0 160 70" className="w-36 h-16">
                            <line x1="80" y1="2" x2="88" y2="34" stroke="#000" strokeWidth="2.5" />
                            <rect x="22" y="24" width="116" height="26" rx="5" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
                            <polygon points="10,30 22,26 22,44" fill="#94a3b8" />
                            <circle cx="88" cy="37" r="6" fill="#facc15" stroke="#713f12" strokeWidth="1.8" />
                            <line x1="84" y1="37" x2="92" y2="37" stroke="#713f12" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="bg-[#bdd7ee] border border-blue-900 p-2.5 text-xs text-slate-950 flex-1">
                          1.- desentornillar y aperturar el compartimiento de navaja
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col justify-between space-y-2">
                        <div className="bg-[#ffff00] border border-green-700 py-1.5 px-2 text-center text-xs font-bold text-slate-950">
                          Compartimiento de navaja
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center h-28">
                          <svg viewBox="0 0 160 70" className="w-36 h-16">
                            <line x1="85" y1="2" x2="62" y2="32" stroke="#000" strokeWidth="2.5" />
                            <rect x="30" y="10" width="60" height="12" rx="3" fill="#ea580c" />
                            <rect x="22" y="32" width="116" height="24" rx="5" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
                            <rect x="30" y="28" width="48" height="16" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div className="bg-[#bdd7ee] border border-blue-900 p-2.5 text-xs text-slate-950 flex-1">
                          2.- Deslizar el compartimiento de navaja hacia arriba (según imagen)
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col justify-between space-y-2">
                        <div className="bg-[#ffff00] border border-green-700 py-1.5 px-2 text-center text-xs font-bold text-slate-950">
                          Clavijas de posición
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center h-28">
                          <svg viewBox="0 0 160 70" className="w-36 h-16">
                            <line x1="85" y1="2" x2="72" y2="34" stroke="#000" strokeWidth="2.5" />
                            <rect x="24" y="28" width="112" height="24" rx="5" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
                            <rect x="36" y="30" width="52" height="16" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                            <circle cx="66" cy="38" r="2.5" fill="#facc15" />
                            <circle cx="76" cy="38" r="2.5" fill="#facc15" />
                          </svg>
                        </div>
                        <div className="bg-[#bdd7ee] border border-blue-900 p-2.5 text-xs text-slate-950 flex-1">
                          3.- Sujeta la navaja del lado sin filo, mueve la navaja hacia su próximo punto de corte y colóquelo en las clavijas de posición de navaja. Al finalizar coloque el compartimiento y asegure con el tornillo
                        </div>
                      </div>
                    </div>

                    {/* Puntos de corte (posición de la navaja) Box */}
                    <div className="bg-white border border-orange-500 p-3.5 text-xs text-slate-950 space-y-1.5 max-w-2xl">
                      <p className="font-bold">Puntos de corte (posición de la navaja:</p>
                      <p>La navaja cuenta con 4 puntos de corte o posiciones:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Punto 1 y puntos 2</li>
                        <li>Puntos 3 y 4, en este caso se tiene que girar la navaja sujetando del lado sin filo</li>
                      </ul>
                      <p className="pt-1">
                        Este cambio de posición de navaja se hace solamente cuando se aprecia desgaste de filo y es necesario el cambio.
                      </p>
                    </div>

                    {/* RESPONSABILIDADES DE LOS TRABAJADORES */}
                    <div className="max-w-2xl space-y-1.5">
                      <div className="bg-[#dc2626] text-white py-1.5 px-3 text-center font-bold text-xs uppercase">
                        RESPONSABILIDADES DE LOS TRABAJADORES
                      </div>
                      <div className="bg-[#d9ead3] border border-orange-500 p-3.5 text-xs text-slate-950 space-y-2">
                        <p className="leading-relaxed">
                          La mayoría de las lesiones producidas por las herramientas es por un uso inadecuado, dado por sentado que la persona que va a utilizar la herramienta sabe cómo utilizarla correctamente, las medidas preventivas propuestas son:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Realizar un mantenimiento correcto de las herramientas.</li>
                          <li>Elegir las herramientas correctas para el trabajo a realizar.</li>
                          <li>Uso y manejo correcto de las herramientas.</li>
                          <li>Realizar las operaciones donde se utilicen herramientas en un espacio adecuado y preparado para su uso.</li>
                          <li>Almacenar y guardar las herramientas en espacios destinados para esa función.</li>
                          <li>Transportar las herramientas con medios específicos que garanticen la seguridad.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Footer Page 2 */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-700">
                      <span>GLGS00055 VE 01</span>
                      <span>Página 2 de 2</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isCunasDoc && (
              <>
                {/* Technical Specifications + Wheel Chock SVG Diagram */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00264d] border-b border-slate-100 pb-2">
                    2. Características Técnicas y Dimensiones de la Cuña de Seguridad ({docItem.code})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Technical SVG Diagram of the Wheel Chock */}
                    <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                      <span className="text-[11px] font-bold text-[#00264d] mb-1">
                        Diseño Reglamentario de Cuña con Asa
                      </span>
                      <svg viewBox="0 0 260 155" className="w-full max-w-[260px] h-auto">
                        {/* Ground surface */}
                        <line x1="15" y1="118" x2="245" y2="118" stroke="#475569" strokeWidth="3" />
                        <path d="M20 118 L12 126 M45 118 L37 126 M70 118 L62 126 M95 118 L87 126 M120 118 L112 126 M145 118 L137 126 M170 118 L162 126 M195 118 L187 126 M220 118 L212 126" stroke="#94a3b8" strokeWidth="1.5" />

                        {/* Truck Tire (Left side) */}
                        <circle cx="70" cy="68" r="48" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                        <circle cx="70" cy="68" r="24" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                        <circle cx="70" cy="68" r="8" fill="#475569" />

                        {/* Safety Wheel Chock (Yellow/Amber high-density wedge fit snugly against tire) */}
                        <path
                          d="M 96 116 L 178 116 L 178 104 L 122 56 C 115 78, 106 98, 96 116 Z"
                          fill="#f59e0b"
                          stroke="#b45309"
                          strokeWidth="2.5"
                        />
                        {/* Anti-slip ribs on chock face */}
                        <line x1="128" y1="68" x2="168" y2="102" stroke="#92400e" strokeWidth="2" strokeDasharray="4 3" />
                        <line x1="115" y1="88" x2="155" y2="114" stroke="#92400e" strokeWidth="2" strokeDasharray="4 3" />

                        {/* Ergonomic Rear Handle (Asa posterior) */}
                        <path
                          d="M 165 95 L 204 95 L 204 114 L 178 114"
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Dimension Annotations */}
                        <line x1="122" y1="48" x2="122" y2="116" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="2 2" />
                        <text x="126" y="46" fill="#dc2626" fontSize="9" fontWeight="bold">
                          Altura: 15-20 cm
                        </text>
                        <text x="182" y="86" fill="#00264d" fontSize="9" fontWeight="bold">
                          Asa de sujeción
                        </text>
                        <text x="90" y="140" fill="#0f172a" fontSize="9" fontWeight="bold">
                          Base antideslizante: 20-26 cm (Ángulo 45°)
                        </text>
                      </svg>
                      <span className="text-[10px] text-slate-600 text-center mt-1">
                        Contacto firme a tope con la banda de rodadura y manipulación exclusiva desde el asa posterior.
                      </span>
                    </div>

                    {/* Right: Technical Specs List */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(docItem.technicalSpecs || []).map((spec, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                            {spec.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 mt-0.5 block leading-snug">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slope & Bay Placement Visual Guide (3 Columns) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00264d] border-b border-slate-100 pb-2">
                    3. Ubicación Reglamentaria de las Cuñas según Condición de la Vía / Bahía
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(docItem.slopePlacements || []).map((sp) => (
                      <div key={sp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#00264d] block mb-2">
                            {sp.condition}
                          </span>
                          {/* Mini SVG of Wheel & Chocks on flat/slope */}
                          <div className="bg-white rounded-lg border border-slate-200 p-2 mb-2 flex items-center justify-center">
                            <svg viewBox="0 0 160 70" className="w-full max-w-[160px] h-14">
                              <g
                                transform={
                                  sp.chockSide === 'front'
                                    ? 'rotate(8 80 35)'
                                    : sp.chockSide === 'rear'
                                    ? 'rotate(-8 80 35)'
                                    : ''
                                }
                              >
                                <line x1="15" y1="54" x2="145" y2="54" stroke="#475569" strokeWidth="2.5" />
                                {/* Wheel */}
                                <circle cx="80" cy="34" r="19" fill="#1e293b" />
                                <circle cx="80" cy="34" r="8" fill="#cbd5e1" />
                                {/* Left / Front Chock */}
                                {(sp.chockSide === 'both' || sp.chockSide === 'front') && (
                                  <polygon points="44,53 66,53 62,39" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
                                )}
                                {/* Right / Rear Chock */}
                                {(sp.chockSide === 'both' || sp.chockSide === 'rear') && (
                                  <polygon points="94,53 116,53 98,39" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
                                )}
                              </g>
                            </svg>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          {sp.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Columns Visual Comparison: Correct vs Incorrect Placement on Tire */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00264d] border-b border-slate-100 pb-2">
                    4. Criterios Gráficos de Colocación en el Neumático (Correcto vs. Incorrecto)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(docItem.positioningCases || []).map((pc, idx) => {
                      const isOk = pc.status === 'correcto';
                      return (
                        <div
                          key={pc.id}
                          className={`rounded-xl border-2 overflow-hidden flex flex-col ${
                            isOk
                              ? 'border-emerald-500 bg-emerald-50/40'
                              : 'border-rose-400 bg-rose-50/40'
                          }`}
                        >
                          <div
                            className={`px-3 py-1.5 text-white text-xs font-bold flex items-center justify-center gap-1.5 ${
                              isOk ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {isOk ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 shrink-0" />
                            )}
                            <span>{isOk ? 'CORRECTO' : 'INCORRECTO'}</span>
                          </div>

                          {/* Top-down / Front Tire + Chock SVG */}
                          <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-center">
                            <svg viewBox="0 0 120 90" className="w-28 h-20">
                              {/* Tire Tread Block */}
                              <rect x="36" y="8" width="48" height="42" rx="5" fill="#1e293b" />
                              <line x1="48" y1="8" x2="48" y2="50" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
                              <line x1="60" y1="8" x2="60" y2="50" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
                              <line x1="72" y1="8" x2="72" y2="50" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />

                              {/* Chock Position Variants */}
                              {idx === 0 && (
                                /* 1: Centered & Snug against Tire */
                                <g>
                                  <rect x="38" y="50" width="44" height="18" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                                  <path d="M52 68 L52 78 L68 78 L68 68" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                                </g>
                              )}
                              {idx === 1 && (
                                /* 2: Separated / Gap between Tire and Chock */
                                <g>
                                  <line x1="34" y1="56" x2="86" y2="56" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2" />
                                  <rect x="38" y="63" width="44" height="17" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                                </g>
                              )}
                              {idx === 2 && (
                                /* 3: Skewed / Angled Chock */
                                <g transform="rotate(24 60 60)">
                                  <rect x="38" y="52" width="44" height="17" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                                </g>
                              )}
                              {idx === 3 && (
                                /* 4: Off-center / Inverted Chock */
                                <g>
                                  <rect x="62" y="50" width="42" height="17" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                                </g>
                              )}
                            </svg>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <span
                              className={`text-xs font-bold block mb-1 ${
                                isOk ? 'text-emerald-900' : 'text-rose-900'
                              }`}
                            >
                              {pc.title}
                            </span>
                            <p className="text-[11px] text-slate-700 leading-snug">
                              {pc.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Mandatory Rules */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00264d]">
                {isCunasDoc
                  ? '5. Disposiciones Obligatorias de Operación en Bahía y Patio de Maniobras'
                  : '2. Disposiciones y Normas de Cumplimiento Obligatorio'}
              </h4>
              <div className="space-y-2">
                {docItem.mandatoryRules.map((rule, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#00264d] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Controls */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Controles Críticos Verificados en Garita y Bahía Gloria
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-rose-900">
                {docItem.criticalControls.map((ctrl, i) => (
                  <li key={i} className="font-medium">
                    {ctrl}
                  </li>
                ))}
              </ul>
            </div>

            {/* Declaration */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  Declaración de Lectura y Compromiso del Proveedor ({docItem.code} {docItem.version}):
                </span>
                <p className="leading-relaxed">{docItem.declarationText}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reader Footer */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cerrar Visor
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => downloadSafetyDocumentPdf(docItem, supplierName, supplierRuc)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5 text-[#D32F2F]" />
              <span>Descargar {docItem.fileName}</span>
            </button>

            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept(docItem.id);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isAccepted
                    ? 'Lectura Confirmada y Aceptada'
                    : 'Confirmar Lectura y Aceptar Documento'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
