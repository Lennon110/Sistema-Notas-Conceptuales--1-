<template>
  <div class="reportes-view">
    <!-- Selector Obligatorio de Convocatoria -->
    <div class="card selector-card">
      <div class="selector-container">
        <label for="reporte-convocatoria-select" class="selector-label">
          <span class="icon">📅</span> Seleccione una Convocatoria Obligatoria
        </label>
        <select 
          id="reporte-convocatoria-select" 
          v-model="selectedConvocatoriaId" 
          class="custom-select"
        >
          <option value="" disabled>-- Seleccione una convocatoria --</option>
          <option 
            v-for="convocatoria in convocatorias" 
            :key="convocatoria.id" 
            :value="convocatoria.id"
          >
            {{ convocatoria.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Detalle de Notas Conceptuales (Solo si hay una convocatoria seleccionada) -->
    <div v-if="selectedConvocatoriaId" class="reporte-content animate-fade-in">
      <div class="card table-card">
        <div class="table-header">
          <h3>Detalle de Notas Conceptuales</h3>
          <span class="count-indicator">
            Total notas: <strong>{{ notasFiltradas.length }}</strong>
          </span>
        </div>

        <div v-if="notasFiltradas.length === 0" class="tabla-vacia">
          No hay notas conceptuales registradas en esta convocatoria.
        </div>
        
        <div v-else class="table-responsive">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Proyecto</th>
                <th>Sede/Unidad</th>
                <th>Estado</th>
                <th class="number-header">Actividades</th>
                <th class="number-header">Presupuesto Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in notasFiltradas" :key="n.id">
                <td class="font-bold code-column">{{ n.codigo }}</td>
                <td>{{ n.nombre }}</td>
                <td>{{ n.sedeUnidadAcademica }}</td>
                <td>
                  <span class="badge" :class="'badge-' + n.estado.toLowerCase()">
                    {{ n.estado }}
                  </span>
                </td>
                <td class="number-cell">{{ n.cronograma?.actividades?.length || 0 }}</td>
                <td class="font-bold number-cell price-tag">
                  ${{ n.calcularPresupuestoTotal().toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
              
              <!-- Fila de Totales Generales de la Convocatoria -->
              <tr class="totales-row">
                <td colspan="4" class="font-bold">TOTAL GENERAL SOLICITADO</td>
                <td class="font-bold number-cell">{{ totalActividades }}</td>
                <td class="font-bold number-cell price-tag">${{ totalPresupuestoGeneral.toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumen rápido en tarjetas pequeñas -->
      <div class="summary-cards margin-top-md">
        <div class="summary-box">
          <span class="summary-title">Presupuesto Promedio</span>
          <span class="summary-value">${{ presupuestoPromedio.toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="summary-box">
          <span class="summary-title">Porcentaje de Aprobación</span>
          <span class="summary-value">{{ porcentajeAprobacion.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div v-else class="empty-state card">
      <div class="empty-icon">📈</div>
      <h3>Selección Obligatoria de Convocatoria</h3>
      <p>Por favor, seleccione una convocatoria en el menú superior para poder generar y visualizar el detalle de notas conceptuales.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { SistemaGestion } from '../models/SistemaGestion';
import { ConvocatoriaService } from '../services/ConvocatoriaService';
import { FormatUtils } from '../utils/FormatUtils';
import { EstadoNota } from '../enums/EstadoNota';

const sistema = SistemaGestion.obtenerInstancia();
const convService = new ConvocatoriaService();

const convocatorias = shallowRef(convService.listar());
const selectedConvocatoriaId = ref('');

// Auto-seleccionar si solo hay una convocatoria
if (convocatorias.value.length > 0) {
  selectedConvocatoriaId.value = convocatorias.value[0].id;
}

const notasFiltradas = computed(() => {
  if (!selectedConvocatoriaId.value) return [];
  return sistema.notasConceptuales.filter(n => n.convocatoriaId === selectedConvocatoriaId.value);
});

const totalPresupuestoGeneral = computed(() => {
  return notasFiltradas.value.reduce((sum, n) => sum + n.calcularPresupuestoTotal(), 0);
});

const totalActividades = computed(() => {
  return notasFiltradas.value.reduce((sum, n) => sum + (n.cronograma?.actividades?.length || 0), 0);
});

const presupuestoPromedio = computed(() => {
  if (notasFiltradas.value.length === 0) return 0;
  return totalPresupuestoGeneral.value / notasFiltradas.value.length;
});

const porcentajeAprobacion = computed(() => {
  if (notasFiltradas.value.length === 0) return 0;
  const aprobadas = notasFiltradas.value.filter(n => n.estado === EstadoNota.APROBADA).length;
  return (aprobadas / notasFiltradas.value.length) * 100;
});
</script>

<style scoped>
.reportes-view {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.selector-card {
  padding: var(--espaciado-lg);
  border-left: 5px solid var(--color-primario);
}

.selector-container {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
}

.selector-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primario-oscuro);
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
}

.custom-select {
  padding: 12px var(--espaciado-md);
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-sm);
  background-color: var(--color-superficie);
  color: var(--color-texto);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transicion-rapida);
}

.custom-select:focus {
  border-color: var(--color-primario);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.table-header {
  padding: var(--espaciado-lg);
  border-bottom: 1px solid var(--color-borde);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-fondo);
}

.table-header h3 {
  margin: 0;
  color: var(--color-primario-oscuro);
}

.count-indicator {
  font-size: 0.9rem;
  color: var(--color-texto-suave);
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

.number-header {
  text-align: right;
}

.number-cell {
  text-align: right;
}

.totales-row {
  background-color: var(--color-fondo);
}

.totales-row td {
  border-bottom: 2px solid var(--color-primario);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--espaciado-md);
}

.summary-box {
  background-color: var(--color-superficie);
  padding: var(--espaciado-md) var(--espaciado-lg);
  border-radius: var(--radio-md);
  box-shadow: var(--sombra-sm);
  border-left: 4px solid var(--color-dorado);
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-xs);
}

.summary-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primario-oscuro);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px var(--espaciado-xl);
  color: var(--color-texto-suave);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--espaciado-md);
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--color-primario-oscuro);
  margin-bottom: var(--espaciado-sm);
  font-size: 1.3rem;
}

.empty-state p {
  max-width: 450px;
  font-size: 0.95rem;
}

.font-bold {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--color-texto-suave);
}

.text-xs {
  font-size: 0.78rem;
}

.margin-top-md {
  margin-top: var(--espaciado-md);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
