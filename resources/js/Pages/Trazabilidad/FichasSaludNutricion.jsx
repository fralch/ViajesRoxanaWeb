import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

export default function FichasSaludNutricion({ hijo, padre, grupo, fichasSalud, fichasNutricion }) {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Simulate loading and trigger animations
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateIn(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleVolver = () => {
    setAnimateIn(false);
    setTimeout(() => {
      router.get(`/nfc/${hijo?.doc_numero}`);
    }, 200);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const CollapsibleSection = ({ id, title, icon, children, defaultExpanded = false, priority = 'normal' }) => {
    const isExpanded = expandedSections[id] !== undefined ? expandedSections[id] : defaultExpanded;
    
    const priorityColors = {
      critical: 'border-red-300 bg-red-50',
      warning: 'border-amber-300 bg-amber-50',
      normal: 'border-gray-200 bg-gray-50'
    };

    return (
      <div className={`mb-4 border rounded-xl transition-all duration-300 hover:shadow-md ${priorityColors[priority]}`}>
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-expanded={isExpanded}
          aria-controls={`section-${id}`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <h4 className="text-md font-semibold text-gray-800">{title}</h4>
            {priority === 'critical' && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                Crítico
              </span>
            )}
            {priority === 'warning' && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Importante
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div 
          id={`section-${id}`}
          className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );

  const renderFichaSalud = (ficha, index) => (
    <div 
      key={index} 
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ficha de Salud #{index + 1}</h3>
      </div>

      {/* Datos básicos */}
      <CollapsibleSection
        id={`salud-basicos-${index}`}
        title="Datos Básicos de Salud"
        icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>}
        defaultExpanded={true}
        priority={ficha.grupo_sanguineo || ficha.factor_rh ? 'warning' : 'normal'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-green-50 p-4 rounded-xl">
          <div className="group">
            <label className="text-sm font-medium text-gray-600 block mb-1">Grupo Sanguíneo</label>
            <p className="text-gray-900 font-semibold text-base sm:text-lg group-hover:text-green-700 transition-colors">
              {ficha.grupo_sanguineo || 'No especificado'}
            </p>
          </div>
          <div className="group">
            <label className="text-sm font-medium text-gray-600 block mb-1">Factor RH</label>
            <p className="text-gray-900 font-semibold text-base sm:text-lg group-hover:text-green-700 transition-colors">
              {ficha.factor_rh || 'No especificado'}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Tratamientos actuales */}
      <CollapsibleSection
        id={`salud-tratamientos-${index}`}
        title="Tratamientos Actuales"
        icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>}
        defaultExpanded={ficha.recibe_tratamientos === 'Sí'}
        priority={ficha.recibe_tratamientos === 'Sí' ? 'critical' : 'normal'}
      >
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">¿Recibe tratamientos?</label>
            <p className={`font-semibold ${ficha.recibe_tratamientos === 'Sí' ? 'text-purple-900' : 'text-gray-900'}`}>
              {ficha.recibe_tratamientos || 'No especificado'}
            </p>
          </div>
          {ficha.recibe_tratamientos === 'Sí' && (
            <div className="space-y-3 mt-3 pt-3 border-t border-purple-200 animate-fadeIn">
              {ficha.condicion_medica && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Condición Médica</label>
                  <p className="text-gray-900 group-hover:text-purple-800 transition-colors">{ficha.condicion_medica}</p>
                </div>
              )}
              {ficha.nombre_medicamento && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Medicamento</label>
                  <p className="text-gray-900 group-hover:text-purple-800 transition-colors font-medium">{ficha.nombre_medicamento}</p>
                </div>
              )}
              {ficha.frecuencia && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Frecuencia</label>
                  <p className="text-gray-900 group-hover:text-purple-800 transition-colors">{ficha.frecuencia}</p>
                </div>
              )}
              {ficha.quien_administra && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">¿Quién lo administra?</label>
                  <p className="text-gray-900 group-hover:text-purple-800 transition-colors">{ficha.quien_administra}</p>
                </div>
              )}
              {ficha.observaciones && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Observaciones</label>
                  <p className="text-gray-900 text-sm group-hover:text-purple-800 transition-colors">{ficha.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Enfermedades preexistentes */}
      {ficha.detalle_enfermedad && (
        <CollapsibleSection
          id={`salud-enfermedades-${index}`}
          title="Enfermedades Preexistentes"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>}
          defaultExpanded={true}
          priority="critical"
        >
          <div className="bg-blue-50 p-4 rounded-xl space-y-3">
            <div className="group">
              <label className="text-sm font-medium text-gray-600 block mb-1">Detalle</label>
              <p className="text-gray-900 group-hover:text-blue-800 transition-colors">{ficha.detalle_enfermedad}</p>
            </div>
            {ficha.medicamento_enfermedad && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Medicamento</label>
                <p className="text-gray-900 group-hover:text-blue-800 transition-colors font-medium">{ficha.medicamento_enfermedad}</p>
              </div>
            )}
            {ficha.frecuencia_enfermedad && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Frecuencia</label>
                <p className="text-gray-900 group-hover:text-blue-800 transition-colors">{ficha.frecuencia_enfermedad}</p>
              </div>
            )}
            {ficha.quien_administra_enfermedad && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">¿Quién lo administra?</label>
                <p className="text-gray-900 group-hover:text-blue-800 transition-colors">{ficha.quien_administra_enfermedad}</p>
              </div>
            )}
            {ficha.observaciones_enfermedad && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Observaciones</label>
                <p className="text-gray-900 text-sm group-hover:text-blue-800 transition-colors">{ficha.observaciones_enfermedad}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Alergias */}
      {ficha.detalle_alergia && (
        <CollapsibleSection
          id={`salud-alergias-${index}`}
          title="Alergias Médicas"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>}
          defaultExpanded={true}
          priority="critical"
        >
          <div className="bg-amber-50 p-4 rounded-xl space-y-3">
            <div className="group">
              <label className="text-sm font-medium text-gray-600 block mb-1">Detalle de Alergia</label>
              <p className="text-gray-900 group-hover:text-amber-800 transition-colors font-medium">{ficha.detalle_alergia}</p>
            </div>
            {ficha.medicamento_control && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Medicamento de Control</label>
                <p className="text-gray-900 group-hover:text-amber-800 transition-colors font-medium">{ficha.medicamento_control}</p>
              </div>
            )}
            {ficha.frecuencia_alergia && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Frecuencia</label>
                <p className="text-gray-900 group-hover:text-amber-800 transition-colors">{ficha.frecuencia_alergia}</p>
              </div>
            )}
            {ficha.quien_administra_alergia && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">¿Quién lo administra?</label>
                <p className="text-gray-900 group-hover:text-amber-800 transition-colors">{ficha.quien_administra_alergia}</p>
              </div>
            )}
            {ficha.observaciones_alergia && (
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Observaciones</label>
                <p className="text-gray-900 text-sm group-hover:text-amber-800 transition-colors">{ficha.observaciones_alergia}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Vacunas */}
      {ficha.vacunas_checklist && Array.isArray(ficha.vacunas_checklist) && ficha.vacunas_checklist.length > 0 && (
        <CollapsibleSection
          id={`salud-vacunas-${index}`}
          title="Vacunas Recibidas"
          icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>}
          defaultExpanded={false}
        >
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex flex-wrap gap-2 mb-3">
              {ficha.vacunas_checklist.map((vacuna, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium hover:bg-indigo-300 transition-colors cursor-default">
                  ✓ {vacuna}
                </span>
              ))}
            </div>
            {ficha.vacunas_checklist.includes('COVID-19') && (
              <div className="mt-3 pt-3 border-t border-indigo-200 space-y-2">
                {ficha.dosis_covid && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Dosis COVID-19</label>
                    <p className="text-gray-900 group-hover:text-indigo-800 transition-colors">{ficha.dosis_covid}</p>
                  </div>
                )}
                {ficha.efectos_covid && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Efectos Secundarios</label>
                    <p className="text-gray-900 group-hover:text-indigo-800 transition-colors">{ficha.efectos_covid}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Seguro médico */}
      {ficha.tiene_seguro_particular && (
        <CollapsibleSection
          id={`salud-seguro-${index}`}
          title="Seguro Médico"
          icon={<svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>}
          defaultExpanded={ficha.tiene_seguro_particular === 'Sí'}
          priority={ficha.tiene_seguro_particular === 'Sí' ? 'warning' : 'normal'}
        >
          <div className="bg-cyan-50 p-4 rounded-xl space-y-3">
            <div className="group">
              <label className="text-sm font-medium text-gray-600 block mb-1">¿Tiene seguro particular?</label>
              <p className={`font-semibold ${ficha.tiene_seguro_particular === 'Sí' ? 'text-cyan-900' : 'text-gray-900'}`}>
                {ficha.tiene_seguro_particular}
              </p>
            </div>
            {ficha.tiene_seguro_particular === 'Sí' && (
              <div className="space-y-3 mt-3 pt-3 border-t border-cyan-200">
                {ficha.nombre_seguro && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Nombre del Seguro</label>
                    <p className="text-gray-900 group-hover:text-cyan-800 transition-colors font-medium">{ficha.nombre_seguro}</p>
                  </div>
                )}
                {ficha.administradora && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Administradora</label>
                    <p className="text-gray-900 group-hover:text-cyan-800 transition-colors">{ficha.administradora}</p>
                  </div>
                )}
                {ficha.numero_poliza && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Nº de Póliza</label>
                    <p className="text-gray-900 group-hover:text-cyan-800 transition-colors font-mono">{ficha.numero_poliza}</p>
                  </div>
                )}
                {ficha.telefono_contacto && (
                  <div className="group">
                    <label className="text-sm font-medium text-gray-600 block mb-1">Teléfono de Contacto</label>
                    <p className="text-gray-900 group-hover:text-cyan-800 transition-colors font-mono">{ficha.telefono_contacto}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Información adicional */}
      {ficha.informacion_adicional && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <CollapsibleSection
            id={`salud-adicional-${index}`}
            title="Información Adicional"
            icon={<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>}
            defaultExpanded={false}
          >
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-900 text-sm leading-relaxed">{ficha.informacion_adicional}</p>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );

  const renderFichaNutricion = (ficha, index) => (
    <div 
      key={index} 
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${(index + (fichasSalud?.length || 0)) * 100}ms` }}
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ficha de Nutrición #{index + 1}</h3>
      </div>

      {/* Alergias alimentarias */}
      <CollapsibleSection
        id={`nutricion-alergias-${index}`}
        title="Alergias Alimentarias"
        icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>}
        defaultExpanded={ficha.tiene_alergia_alimentaria === 'Sí'}
        priority={ficha.tiene_alergia_alimentaria === 'Sí' ? 'critical' : 'normal'}
      >
        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">¿Tiene alergias alimentarias?</label>
            <p className={`font-semibold ${ficha.tiene_alergia_alimentaria === 'Sí' ? 'text-orange-900' : 'text-gray-900'}`}>
              {ficha.tiene_alergia_alimentaria || 'No especificado'}
            </p>
          </div>
          {ficha.tiene_alergia_alimentaria === 'Sí' && (
            <div className="space-y-3 mt-3 pt-3 border-t border-orange-200">
              {ficha.alimento_alergia && ficha.alimento_alergia !== '__NO_APLICA__' && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">¿A qué alimento?</label>
                  <p className="text-gray-900 group-hover:text-orange-800 transition-colors font-medium">{ficha.alimento_alergia}</p>
                </div>
              )}
              {ficha.reaccion_alergia && (
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 block mb-1">¿Qué reacción le produce?</label>
                  <p className="text-gray-900 group-hover:text-orange-800 transition-colors">{ficha.reaccion_alergia}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Alimentos que evita */}
      <CollapsibleSection
        id={`nutricion-restricciones-${index}`}
        title="Restricciones Alimentarias"
        icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>}
        defaultExpanded={ficha.evita_alimentos === 'Sí'}
        priority={ficha.evita_alimentos === 'Sí' ? 'warning' : 'normal'}
      >
        <div className="bg-red-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">¿Evita algún alimento?</label>
            <p className={`font-semibold ${ficha.evita_alimentos === 'Sí' ? 'text-red-900' : 'text-gray-900'}`}>
              {ficha.evita_alimentos || 'No especificado'}
            </p>
          </div>
          {ficha.evita_alimentos === 'Sí' && ficha.alimento_evitar && ficha.alimento_evitar !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Alimento(s) que evita</label>
                <p className="text-gray-900 group-hover:text-red-800 transition-colors font-medium">{ficha.alimento_evitar}</p>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Dieta especial */}
      <CollapsibleSection
        id={`nutricion-dieta-${index}`}
        title="Dieta Especial"
        icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>}
        defaultExpanded={ficha.tiene_dieta_especial === 'Sí'}
        priority={ficha.tiene_dieta_especial === 'Sí' ? 'warning' : 'normal'}
      >
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">¿Sigue alguna dieta especial?</label>
            <p className={`font-semibold ${ficha.tiene_dieta_especial === 'Sí' ? 'text-green-900' : 'text-gray-900'}`}>
              {ficha.tiene_dieta_especial || 'No especificado'}
            </p>
          </div>
          {ficha.tiene_dieta_especial === 'Sí' && ficha.especificar_dieta && ficha.especificar_dieta !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Tipo de dieta</label>
                <p className="text-gray-900 group-hover:text-green-800 transition-colors font-medium">{ficha.especificar_dieta}</p>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Preferencias alimentarias */}
      <CollapsibleSection
        id={`nutricion-preferencias-${index}`}
        title="Preferencias Alimentarias"
        icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>}
        defaultExpanded={ficha.tiene_preferencia_alimentaria === 'Sí'}
      >
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">¿Tiene preferencias alimentarias importantes?</label>
            <p className={`font-semibold ${ficha.tiene_preferencia_alimentaria === 'Sí' ? 'text-blue-900' : 'text-gray-900'}`}>
              {ficha.tiene_preferencia_alimentaria || 'No especificado'}
            </p>
          </div>
          {ficha.tiene_preferencia_alimentaria === 'Sí' && ficha.detalle_preferencia_alimentaria && ficha.detalle_preferencia_alimentaria !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="group">
                <label className="text-sm font-medium text-gray-600 block mb-1">Detalle</label>
                <p className="text-gray-900 group-hover:text-blue-800 transition-colors">{ficha.detalle_preferencia_alimentaria}</p>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Head title="Fichas de Salud y Nutrición" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-6 animate-pulse">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-white bg-opacity-20 rounded mx-auto mb-2 w-64"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded mx-auto w-48"></div>
              </div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-32"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-40"></div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="h-4 bg-blue-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-blue-200 rounded w-48"></div>
                </div>
              </div>
            </div>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Fichas de Salud y Nutrición" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-6 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-opacity-30 transition-all duration-300">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Fichas de Salud y Nutrición
                </h1>
                <p className="text-blue-100 text-sm">
                  Información médica y nutricional de {hijo?.nombres}
                </p>
              </div>
            </div>

            {/* Información del niño */}
            <div className="p-4 sm:p-6">
              <div className="text-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{hijo?.nombres} {hijo?.apellidos}</h2>
                <p className="text-sm text-gray-500 mb-1">DNI: <span className="font-mono">{hijo?.doc_numero}</span></p>
                <p className="text-sm text-gray-500">Fecha de Nacimiento: {formatearFecha(hijo?.fecha_nacimiento)}</p>
              </div>

              {/* Información del grupo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900">Grupo:</p>
                    <p className="text-base sm:text-lg font-semibold text-blue-700 truncate">{grupo?.nombre || 'Nombre del Grupo'}</p>
                    {grupo?.paquete && (
                      <p className="text-sm text-blue-600 truncate">{grupo.paquete.nombre} - {grupo.paquete.destino}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fichas de Salud */}
          <div className="mb-8">
            <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center transition-all duration-700 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              Fichas de Salud
              {fichasSalud && fichasSalud.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {fichasSalud.length}
                </span>
              )}
            </h2>
            {fichasSalud && fichasSalud.length > 0 ? (
              fichasSalud.map((ficha, index) => renderFichaSalud(ficha, index))
            ) : (
              <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className="text-gray-500 text-base sm:text-lg">No hay fichas de salud registradas</p>
                <p className="text-gray-400 text-sm mt-2">Las fichas de salud aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
          </div>

          {/* Fichas de Nutrición */}
          <div className="mb-8">
            <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center transition-all duration-700 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
              Fichas de Nutrición
              {fichasNutricion && fichasNutricion.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {fichasNutricion.length}
                </span>
              )}
            </h2>
            {fichasNutricion && fichasNutricion.length > 0 ? (
              fichasNutricion.map((ficha, index) => renderFichaNutricion(ficha, index))
            ) : (
              <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
                <p className="text-gray-500 text-base sm:text-lg">No hay fichas de nutrición registradas</p>
                <p className="text-gray-400 text-sm mt-2">Las fichas de nutrición aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
          </div>

          {/* Botón para volver */}
          <div className={`text-center transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
            <button 
              onClick={handleVolver}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 sm:px-8 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-gray-600 hover:to-gray-700 hover:scale-105 flex items-center justify-center mx-auto focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              aria-label="Volver a la página de trazabilidad"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Volver a Trazabilidad
            </button>
          </div>

          {/* Información adicional */}
          <div className={`mt-6 text-center transition-all duration-700 ${animateIn ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <p className="text-xs text-gray-500">
              Sistema de Trazabilidad • {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .group:hover .group-hover\\:text-green-700 { color: #15803d; }
        .group:hover .group-hover\\:text-purple-800 { color: #6b21a8; }
        .group:hover .group-hover\\:text-blue-800 { color: #1e40af; }
        .group:hover .group-hover\\:text-amber-800 { color: #92400e; }
        .group:hover .group-hover\\:text-indigo-800 { color: #3730a3; }
        .group:hover .group-hover\\:text-cyan-800 { color: #155e75; }
        .group:hover .group-hover\\:text-orange-800 { color: #9a3412; }
        .group:hover .group-hover\\:text-red-800 { color: #991b1b; }
      `}</style>
    </>
  );
}