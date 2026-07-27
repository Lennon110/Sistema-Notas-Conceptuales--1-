<template>
  <div class="consultas-view">

    <!-- VISTA 1: LISTADO Y FILTROS (Cuando NO hay una nota seleccionada) -->
    <div v-if="!notaSeleccionada" class="animate-fade-in">
      <!-- Panel de Filtros -->
      <div class="card filters-card">
        <h3 class="filters-title">Filtros de Búsqueda</h3>
        <div class="filters-grid">
          <div class="campo-formulario">
            <label for="filtro-codigo">Buscar por Código</label>
            <input 
              type="text" 
              id="filtro-codigo" 
              v-model="filtroCodigo" 
              placeholder="Ej. NC-2026-0001" 
            />
          </div>
          
          <div class="campo-formulario">
            <label for="filtro-estado">Filtrar por Estado</label>
            <select id="filtro-estado" v-model="filtroEstado" class="custom-select">
              <option value="">Todos los estados</option>
              <option v-for="est in estados" :key="est" :value="est">
                {{ est }}
              </option>
            </select>
          </div>
          
          <div class="campo-formulario">
            <label for="filtro-convocatoria">Filtrar por Convocatoria</label>
            <select id="filtro-convocatoria" v-model="filtroConvocatoriaId" class="custom-select">
              <option value="">Todas las convocatorias</option>
              <option v-for="c in convocatorias" :key="c.id" :value="c.id">
                {{ c.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="card table-card margin-top-md">
        <div v-if="notasFiltradas.length === 0" class="tabla-vacia">
          No se encontraron notas conceptuales con los criterios de búsqueda seleccionados.
        </div>
        <div v-else class="table-responsive">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Proyecto</th>
                <th>Convocatoria</th>
                <th>Docente Responsable</th>
                <th>Estado</th>
                <th>Presupuesto Total</th>
                <th class="acciones-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in notasFiltradas" :key="n.id">
                <td class="font-bold code-column">{{ n.codigo }}</td>
                <td>{{ n.nombre }}</td>
                <td>{{ obtenerNombreConvocatoria(n.convocatoriaId) }}</td>
                <td>{{ n.director ? n.director.obtenerNombreCompleto() : 'Sin asignar' }}</td>
                <td>
                  <span class="badge" :class="'badge-' + n.estado.toLowerCase().replace(/\s+/g, '_')">
                    {{ n.estado }}
                  </span>
                </td>
                <td class="font-bold price-tag">${{ n.calcularPresupuestoTotal().toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</td>
                <td class="acciones-celda">
                  <button 
                    class="btn btn-secundario btn-ver" 
                    @click="abrirDetalle(n)"
                  >
                    👁️ Ver Detalle completo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VISTA 2: DETALLE COMPLETO DE LA NOTA SELECCIONADA (EN LA MISMA PÁGINA) -->
    <div v-else class="card detail-container-card animate-scale-up">
      <!-- Header con Botón de Regresar -->
      <div class="detail-top-bar">
        <button class="btn btn-secundario" @click="cerrarDetalle">
          ← Volver a la lista de notas
        </button>
        <span class="badge badge-lg" :class="'badge-' + notaSeleccionada.estado.toLowerCase().replace(/\s+/g, '_')">
          {{ notaSeleccionada.estado }}
        </span>
      </div>

      <div class="detail-header-title">
        <span class="modal-code">{{ notaSeleccionada.codigo }}</span>
        <h2>{{ notaSeleccionada.nombre }}</h2>
      </div>

      <!-- SECCIÓN DE CAMBIO DE ESTADO -->
      <div class="status-modifier-section margin-top-md">
        <label for="cambio-estado-select" class="font-bold">Modificar Estado de la Nota Conceptual:</label>
        <div class="status-modifier-row">
          <select 
            id="cambio-estado-select" 
            v-model="nuevoEstado" 
            class="custom-select select-status"
          >
            <option v-for="est in estados" :key="est" :value="est">{{ est }}</option>
          </select>
          <button class="btn btn-primario" @click="guardarEstado">
            ✔ Actualizar Estado
          </button>
        </div>
        <span class="help-text">El cambio de estado actualizará automáticamente las estadísticas del Dashboard e Informes.</span>
      </div>

      <!-- SECCIÓN 1: DATOS GENERALES -->
      <div class="detail-section margin-top-lg">
        <h3>1. Datos Generales</h3>
        <div class="grid-details-2">
          <p><strong>Sede/Unidad Académica:</strong> {{ notaSeleccionada.sedeUnidadAcademica }}</p>
          <p><strong>Departamento:</strong> {{ notaSeleccionada.departamento || 'Sin registrar' }}</p>
          <p><strong>Plazo de ejecución:</strong> Desde {{ formatearFecha(notaSeleccionada.fechaInicioPlanificada) }} hasta {{ formatearFecha(notaSeleccionada.fechaFinPlanificada) }}</p>
          <p><strong>Convocatoria asociada:</strong> {{ obtenerNombreConvocatoria(notaSeleccionada.convocatoriaId) }}</p>
        </div>

        <!-- Director -->
        <div class="sub-detail-box margin-top-sm">
          <p class="box-title">Director / Docente responsable</p>
          <div class="grid-details-3">
            <p><strong>Nombre:</strong> {{ notaSeleccionada.director?.obtenerNombreCompleto() }}</p>
            <p><strong>Correo electrónico:</strong> {{ notaSeleccionada.director?.correo }}</p>
            <p><strong>Teléfono celular:</strong> {{ notaSeleccionada.director?.telefono }}</p>
          </div>
        </div>

        <div class="grid-details-2 margin-top-sm">
          <p><strong>Cobertura registrada:</strong> {{ notaSeleccionada.cobertura.join(', ') || 'Ninguna' }}</p>
          <p><strong>Sector de población beneficiaria:</strong> {{ notaSeleccionada.sectorBeneficiario.join(', ') || 'Ninguno' }}</p>
        </div>
        <p class="margin-top-xs">
          <strong>Localización:</strong> 
          Provincia: {{ notaSeleccionada.localizacion?.provincia || '-' }} | 
          Cantón: {{ notaSeleccionada.localizacion?.canton || '-' }} | 
          Parroquia: {{ notaSeleccionada.localizacion?.parroquia || '-' }} | 
          Barrio/Comunidad: {{ notaSeleccionada.localizacion?.barrioComunidad || '-' }}
        </p>
      </div>

      <!-- SECCIÓN 2: ALINEAMIENTO -->
      <div class="detail-section margin-top-lg">
        <h3>2. Alineamiento</h3>
        <p><strong>Ámbitos prioritarios de actuación:</strong></p>
        <ul class="clean-list">
          <li v-for="a in ambitosAplica" :key="a.nombre">
            ✅ {{ a.nombre }}
          </li>
          <li v-if="ambitosAplica.length === 0" class="text-muted">Ningún ámbito prioritario aplica.</li>
        </ul>

        <p class="margin-top-sm"><strong>Objetivos de desarrollo sostenible ODS alinea:</strong></p>
        <ul class="clean-list">
          <li v-for="o in notaSeleccionada.alineamiento?.ods" :key="o.codigo">
            📌 ODS {{ o.codigo }}: {{ o.metaSeleccionada }}
          </li>
          <li v-if="!notaSeleccionada.alineamiento?.ods || notaSeleccionada.alineamiento.ods.length === 0" class="text-muted">Sin alinear a ODS.</li>
        </ul>

        <div class="grid-details-2 margin-top-sm">
          <p>
            <strong>CINE-UNESCO:</strong> 
            Amplio: {{ notaSeleccionada.alineamiento?.cineAmplio || '-' }} | 
            Específico: {{ notaSeleccionada.alineamiento?.cineEspecifico || '-' }} | 
            Detallado: {{ notaSeleccionada.alineamiento?.cineDetallado || '-' }}
          </p>
          <p>
            <strong>Plan Nacional de Desarrollo:</strong> 
            Objetivo: {{ notaSeleccionada.alineamiento?.pnd?.codigoObjetivo || '-' }} | 
            Política: {{ notaSeleccionada.alineamiento?.pnd?.politicaSeleccionada || '-' }}
          </p>
        </div>

        <div class="sub-detail-box margin-top-sm">
          <p class="box-title">Alineamiento Territorial y GADs</p>
          <p><strong>Objetivo GAD Provincial:</strong> {{ notaSeleccionada.alineamiento?.objetivosGAD?.find(g => g.nivel === 'Provincial')?.objetivo || 'No registrado' }}</p>
          <p><strong>Objetivo GAD Cantonal:</strong> {{ notaSeleccionada.alineamiento?.objetivosGAD?.find(g => g.nivel === 'Cantonal')?.objetivo || 'No registrado' }}</p>
          <p><strong>Objetivo GAD Parroquial:</strong> {{ notaSeleccionada.alineamiento?.objetivosGAD?.find(g => g.nivel === 'Parroquial')?.objetivo || 'No registrado' }}</p>
          <p><strong>Objetivo de Entidad Auspiciante/Comunidad:</strong> {{ notaSeleccionada.alineamiento?.objetivoEntidadCooperante || 'No registrado' }}</p>
        </div>

        <div class="grid-details-2 margin-top-sm">
          <p>
            <strong>PEI Plan Estratégico:</strong> 
            Objetivo: {{ notaSeleccionada.alineamiento?.objetivoPlanEstrategico || '-' }} | 
            Estrategia: {{ notaSeleccionada.alineamiento?.estrategiaPlanEstrategico || '-' }}
          </p>
          <p><strong>Líneas de investigación:</strong> {{ notaSeleccionada.alineamiento?.lineasInvestigacion?.join(', ') || 'Ninguna' }}</p>
          <p><strong>Dominio Institucional:</strong> {{ notaSeleccionada.alineamiento?.dominioInstitucional || '-' }}</p>
          <p><strong>Dominio Académico:</strong> {{ notaSeleccionada.alineamiento?.dominioAcademico || '-' }}</p>
        </div>
      </div>

      <!-- SECCIÓN 3: DEPARTAMENTOS Y CARRERAS PARTICIPANTES -->
      <div class="detail-section margin-top-lg">
        <h3>3. Departamentos y Carreras Participantes</h3>
        <p class="font-bold">Departamentos Participantes</p>
        <table class="tabla sub-tabla">
          <thead>
            <tr>
              <th>Sede/Unidad</th>
              <th>Departamento</th>
              <th>Objetivo</th>
              <th>Nro. docentes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in notaSeleccionada.departamentosParticipantes" :key="idx">
              <td>{{ d.sedeUnidadAcademica }}</td>
              <td class="font-bold">{{ d.nombre }}</td>
              <td>{{ d.objetivoNota }}</td>
              <td>{{ d.nroDocentesPlanificados }}</td>
            </tr>
            <tr v-if="!notaSeleccionada.departamentosParticipantes || notaSeleccionada.departamentosParticipantes.length === 0">
              <td colspan="4" class="text-center text-muted text-xs">Sin departamentos participantes.</td>
            </tr>
          </tbody>
        </table>

        <p class="font-bold margin-top-md">Carreras Participantes</p>
        <table class="tabla sub-tabla">
          <thead>
            <tr>
              <th>Sede/Unidad</th>
              <th>Carrera</th>
              <th>Objetivo</th>
              <th>Nro. estudiantes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in notaSeleccionada.carrerasParticipantes" :key="idx">
              <td>{{ c.sedeUnidadAcademica }}</td>
              <td class="font-bold">{{ c.nombre }}</td>
              <td>{{ c.objetivoNota }}</td>
              <td>{{ c.nroEstudiantesPlanificados }}</td>
            </tr>
            <tr v-if="!notaSeleccionada.carrerasParticipantes || notaSeleccionada.carrerasParticipantes.length === 0">
              <td colspan="4" class="text-center text-muted text-xs">Sin carreras participantes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SECCIÓN 4: IMPACTOS Y POBLACIÓN -->
      <div class="detail-section margin-top-lg">
        <h3>4. Impactos y Caracterización de Población</h3>
        <p class="font-bold">Impactos Esperados</p>
        <div class="impacts-details">
          <div 
            v-for="imp in impactosFiltradosConDescripcion" 
            :key="imp.tipo"
            class="impact-item-box"
          >
            <strong>Impacto {{ imp.tipo }}:</strong>
            <p>{{ imp.descripcion }}</p>
          </div>
          <p v-if="impactosFiltradosConDescripcion.length === 0" class="text-muted text-xs">Ninguna descripción de impacto cargada.</p>
        </div>

        <div class="sub-detail-box margin-top-sm">
          <p class="box-title">Población Objetivo / Beneficiarios</p>
          <div class="grid-details-3">
            <p><strong>Población de Referencia:</strong> {{ notaSeleccionada.poblacionBeneficiaria?.poblacionReferencia?.toLocaleString('es-EC') || 0 }}</p>
            <p><strong>Población Potencial:</strong> {{ notaSeleccionada.poblacionBeneficiaria?.poblacionPotencial?.toLocaleString('es-EC') || 0 }}</p>
            <p><strong>Población Objetivo (Directa):</strong> {{ notaSeleccionada.poblacionBeneficiaria?.poblacionObjetivo?.toLocaleString('es-EC') || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 5: FINANCIAMIENTO Y PRESUPUESTO -->
      <div class="detail-section margin-top-lg">
        <h3>5. Financiamiento y Presupuesto</h3>
        <p class="font-bold">Presupuesto del Proyecto</p>
        <table class="tabla sub-tabla">
          <thead>
            <tr>
              <th>Nro. ítem</th>
              <th>Descripción</th>
              <th>Bien / Servicio</th>
              <th>Cantidad</th>
              <th>V. Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in notaSeleccionada.presupuesto?.items" :key="item.id">
              <td>{{ item.nroItem }}</td>
              <td class="font-bold">{{ item.descripcionItem }}</td>
              <td>{{ item.nombreBienServicio }}</td>
              <td>{{ item.cantidad }}</td>
              <td>${{ item.valorUnitario.toFixed(2) }}</td>
              <td class="font-bold">${{ item.calcularSubtotal().toFixed(2) }}</td>
            </tr>
            <tr class="totales-row">
              <td colspan="5" class="font-bold">TOTAL PRESUPUESTO</td>
              <td class="font-bold">${{ notaSeleccionada.calcularPresupuestoTotal().toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="notaSeleccionada.presupuesto?.entidadCooperante" class="cooperante-details margin-top-md">
          <p class="font-bold">Entidad Auspiciante: {{ notaSeleccionada.presupuesto.entidadCooperante.nombre }}</p>
          <table class="tabla sub-tabla">
            <thead>
              <tr>
                <th>Detalle del bien o servicio del aporte de la entidad auspiciante/cooperante</th>
                <th>Cantidad</th>
                <th>V.U $</th>
                <th>V. Total $</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cItem in notaSeleccionada.presupuesto.entidadCooperante.items" :key="cItem.id">
                <td class="font-bold">{{ cItem.descripcionItem }}</td>
                <td>{{ cItem.cantidad }}</td>
                <td>${{ cItem.valorUnitario.toFixed(2) }}</td>
                <td class="font-bold">${{ cItem.calcularSubtotal().toFixed(2) }}</td>
              </tr>
              <tr class="totales-row">
                <td colspan="3" class="font-bold">Total Aporte</td>
                <td class="font-bold">${{ notaSeleccionada.presupuesto.entidadCooperante.calcularTotalAporte().toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCIÓN 6: CRONOGRAMA -->
      <div class="detail-section margin-top-lg">
        <h3>6. Cronograma de Ejecución (Actividades)</h3>
        <table class="tabla sub-tabla">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Duración (días)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="act in notaSeleccionada.cronograma?.actividades" :key="act.id">
              <td class="font-bold">{{ act.nombre }}</td>
              <td>{{ formatearFecha(act.fechaInicio) }}</td>
              <td>{{ formatearFecha(act.fechaFin) }}</td>
              <td>{{ act.duracionDias() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer inferior -->
      <div class="detail-bottom-bar margin-top-xl">
        <button class="btn btn-secundario" @click="cerrarDetalle">
          ← Volver a la lista de notas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, triggerRef, computed } from 'vue';
import { SistemaGestion } from '../models/SistemaGestion';
import { ConvocatoriaService } from '../services/ConvocatoriaService';
import { NotaConceptualService } from '../services/NotaConceptualService';
import { FormatUtils } from '../utils/FormatUtils';
import { EstadoNota } from '../enums/EstadoNota';
import { NotaConceptual } from '../models/NotaConceptual';
import { TipoImpacto, ETIQUETAS_TIPO_IMPACTO } from '../enums/TipoImpacto';

const sistema = SistemaGestion.obtenerInstancia();
const convService = new ConvocatoriaService();
const notaService = new NotaConceptualService();

const convocatorias = shallowRef(convService.listar());
const estados = Object.values(EstadoNota);

// Filtros reactivos
const filtroCodigo = ref('');
const filtroEstado = ref('');
const filtroConvocatoriaId = ref('');

// Detalle inline
const notaSeleccionada = shallowRef<NotaConceptual | null>(null);
const nuevoEstado = ref<EstadoNota>(EstadoNota.REGISTRADA);

const notasFiltradas = computed(() => {
  return sistema.notasConceptuales.filter(n => {
    const cumpleCodigo = !filtroCodigo.value || n.codigo.toLowerCase().includes(filtroCodigo.value.toLowerCase().trim());
    const cumpleEstado = !filtroEstado.value || n.estado === filtroEstado.value;
    const cumpleConvocatoria = !filtroConvocatoriaId.value || n.convocatoriaId === filtroConvocatoriaId.value;
    return cumpleCodigo && cumpleEstado && cumpleConvocatoria;
  });
});

const ambitosAplica = computed(() => {
  if (!notaSeleccionada.value || !notaSeleccionada.value.alineamiento) return [];
  return notaSeleccionada.value.alineamiento.ambitosPrioritarios.filter(a => a.aplica);
});

const impactosFiltradosConDescripcion = computed(() => {
  if (!notaSeleccionada.value || !notaSeleccionada.value.impactosEsperados) return [];
  return notaSeleccionada.value.impactosEsperados
    .filter(i => i.descripcion.trim().length > 0)
    .map(i => ({
      tipo: ETIQUETAS_TIPO_IMPACTO[i.tipo],
      descripcion: i.descripcion
    }));
});

function obtenerNombreConvocatoria(id: string): string {
  const c = convocatorias.value.find(conv => conv.id === id);
  return c ? c.nombre : 'Desconocida';
}

function formatearFecha(date?: Date): string {
  if (!date) return '';
  return FormatUtils.formatearFecha(date);
}

function abrirDetalle(n: NotaConceptual) {
  notaSeleccionada.value = n;
  nuevoEstado.value = n.estado;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cerrarDetalle() {
  notaSeleccionada.value = null;
}

function guardarEstado() {
  if (!notaSeleccionada.value) return;
  const res = notaService.cambiarEstado(notaSeleccionada.value.id, nuevoEstado.value);
  if (res.valido) {
    triggerRef(notaSeleccionada);
    alert("Estado de la nota conceptual actualizado correctamente.");
  } else {
    alert(res.mensaje || "Error al actualizar el estado");
  }
}
</script>

<style scoped>
.consultas-view {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.filters-card {
  padding: var(--espaciado-lg);
  border-left: 5px solid var(--color-primario);
}

.filters-title {
  margin: 0 0 var(--espaciado-md) 0;
  color: var(--color-primario-oscuro);
  font-size: 1.15rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--espaciado-md);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla th, .tabla td {
  padding: var(--espaciado-md);
  border-bottom: 1px solid var(--color-borde);
  font-size: 0.9rem;
}

.tabla th {
  background-color: var(--color-fondo);
  color: var(--color-primario-oscuro);
  font-weight: 600;
}

.code-column {
  color: var(--color-primario);
}

.price-tag {
  color: var(--color-primario-oscuro);
}

.acciones-header {
  text-align: right;
}

.acciones-celda {
  display: flex;
  justify-content: flex-end;
}

.btn-ver {
  font-size: 0.82rem;
  padding: 6px 12px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-lg {
  padding: 6px 14px;
  font-size: 0.85rem;
}

.badge-registrada {
  background-color: var(--color-info-fondo);
  color: var(--color-info);
}

.badge-en_revision {
  background-color: var(--color-advertencia-fondo);
  color: var(--color-advertencia);
}

.badge-aprobada {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}

.badge-rechazada {
  background-color: var(--color-error-fondo);
  color: var(--color-error);
}

/* VISTA DE DETALLE INLINE EN LA MISMA PÁGINA */
.detail-container-card {
  padding: var(--espaciado-xl);
  border-top: 5px solid var(--color-dorado);
  display: flex;
  flex-direction: column;
}

.detail-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--espaciado-md);
}

.detail-bottom-bar {
  display: flex;
  justify-content: flex-start;
  padding-top: var(--espaciado-lg);
  border-top: 1px solid var(--color-borde);
}

.detail-header-title {
  display: flex;
  flex-direction: column;
}

.modal-code {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primario);
  letter-spacing: 0.5px;
}

.detail-header-title h2 {
  margin: 4px 0 0 0;
  font-size: 1.5rem;
  color: var(--color-primario-oscuro);
}

/* Modificador de Estado */
.status-modifier-section {
  background-color: var(--color-fondo);
  padding: var(--espaciado-md);
  border-radius: var(--radio-sm);
  border: 1px solid var(--color-borde);
}

.status-modifier-row {
  display: flex;
  gap: var(--espaciado-md);
  margin-top: 8px;
  align-items: center;
}

.select-status {
  width: 220px;
}

.help-text {
  font-size: 0.78rem;
  color: var(--color-texto-suave);
  margin-top: 6px;
  display: block;
}

/* Secciones de detalle */
.detail-section {
  border-top: 1px solid var(--color-borde);
  padding-top: var(--espaciado-md);
}

.detail-section h3 {
  margin: 0 0 var(--espaciado-md) 0;
  color: var(--color-primario-oscuro);
  font-size: 1.15rem;
}

.grid-details-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--espaciado-sm) var(--espaciado-lg);
  font-size: 0.9rem;
}

.grid-details-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--espaciado-sm) var(--espaciado-lg);
  font-size: 0.9rem;
}

.sub-detail-box {
  background-color: var(--color-fondo);
  padding: var(--espaciado-md);
  border-radius: var(--radio-sm);
  border: 1px solid var(--color-borde);
}

.box-title {
  font-weight: 700;
  color: var(--color-primario);
  margin: 0 0 var(--espaciado-sm) 0;
  font-size: 0.92rem;
}

.clean-list {
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-tabla {
  margin-top: var(--espaciado-sm);
}

.sub-tabla th, .sub-tabla td {
  padding: 8px var(--espaciado-md);
  font-size: 0.85rem;
}

.totales-row {
  background-color: var(--color-fondo);
}

.totales-row td {
  border-bottom: 2px solid var(--color-primario);
}

.impacts-details {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
  margin-top: 6px;
}

.impact-item-box {
  background-color: var(--color-fondo);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: var(--radio-sm);
  border-left: 3px solid var(--color-dorado);
  font-size: 0.9rem;
}

.impact-item-box p {
  margin: 4px 0 0 0;
  color: var(--color-texto);
}

.font-bold {
  font-weight: 600;
}

.text-muted {
  color: var(--color-texto-suave);
}

.text-xs {
  font-size: 0.78rem;
}

.margin-top-xs {
  margin-top: var(--espaciado-xs);
}
.margin-top-sm {
  margin-top: var(--espaciado-sm);
}
.margin-top-md {
  margin-top: var(--espaciado-md);
}
.margin-top-lg {
  margin-top: var(--espaciado-lg);
}
.margin-top-xl {
  margin-top: var(--espaciado-xl);
}

.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
