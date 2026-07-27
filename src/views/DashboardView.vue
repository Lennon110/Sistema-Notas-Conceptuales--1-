<template>
  <div class="dashboard-view">
    <!-- Selector de Convocatoria -->
    <div class="card selector-card">
      <div class="selector-container">
        <label for="convocatoria-select" class="selector-label">
          <span class="icon">📅</span> Seleccione una Convocatoria Obligatoria
        </label>
        <select 
          id="convocatoria-select" 
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

    <!-- Contenido del Dashboard (Solo si hay una convocatoria seleccionada) -->
    <div v-if="selectedConvocatoriaId" class="dashboard-content animate-fade-in">
      <div class="convocatoria-info-badge">
        <h3>{{ selectedConvocatoria.nombre }}</h3>
        <p>Vigencia: {{ formatearFecha(selectedConvocatoria.fechaInicio) }} al {{ formatearFecha(selectedConvocatoria.fechaFin) }}</p>
      </div>

      <!-- Fila de Tarjetas de Métricas -->
      <div class="metrics-grid">
        <div class="metric-card budget-card">
          <div class="card-icon">💰</div>
          <div class="card-info">
            <span class="card-title">Presupuesto Aprobado</span>
            <span class="card-value">${{ stats.presupuestoTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</span>
            <span class="card-subtitle">Solo notas aprobadas</span>
          </div>
        </div>

        <div class="metric-card total-card">
          <div class="card-icon">📁</div>
          <div class="card-info">
            <span class="card-title">Notas Registradas</span>
            <span class="card-value">{{ stats.numeroNotas }}</span>
            <span class="card-subtitle">Total en esta convocatoria</span>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Estados -->
      <h3 class="section-title">Distribución por Estados</h3>
      <div class="states-grid">
        <div class="state-card aprobada">
          <div class="state-header">
            <span class="state-dot"></span>
            <span class="state-name">Aprobadas</span>
          </div>
          <div class="state-body">
            <span class="state-count">{{ stats.notasAprobadas }}</span>
          </div>
        </div>

        <div class="state-card revision">
          <div class="state-header">
            <span class="state-dot"></span>
            <span class="state-name">En Revisión</span>
          </div>
          <div class="state-body">
            <span class="state-count">{{ stats.notasEnRevision }}</span>
          </div>
        </div>

        <div class="state-card registrada">
          <div class="state-header">
            <span class="state-dot"></span>
            <span class="state-name">Registradas</span>
          </div>
          <div class="state-body">
            <span class="state-count">{{ stats.notasRegistradas }}</span>
          </div>
        </div>

        <div class="state-card rechazada">
          <div class="state-header">
            <span class="state-dot"></span>
            <span class="state-name">Rechazadas</span>
          </div>
          <div class="state-body">
            <span class="state-count">{{ stats.notasRechazadas }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div v-else class="empty-state card">
      <div class="empty-icon">📅</div>
      <h3>Selección Obligatoria de Convocatoria</h3>
      <p>Por favor, seleccione una convocatoria en el menú superior para poder visualizar las estadísticas y métricas del proyecto asociadas.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { SistemaGestion } from '../models/SistemaGestion';
import { FormatUtils } from '../utils/FormatUtils';

const sistema = SistemaGestion.obtenerInstancia();
const convocatorias = shallowRef(sistema.convocatorias);
const selectedConvocatoriaId = ref('');

// Auto-seleccionar si solo hay una convocatoria
if (convocatorias.value.length > 0) {
  selectedConvocatoriaId.value = convocatorias.value[0].id;
}

const selectedConvocatoria = computed(() => {
  return convocatorias.value.find(c => c.id === selectedConvocatoriaId.value)!;
});

const stats = computed(() => {
  if (!selectedConvocatoriaId.value) {
    return {
      numeroNotas: 0,
      presupuestoTotal: 0,
      notasAprobadas: 0,
      notasRechazadas: 0,
      notasEnRevision: 0,
      notasRegistradas: 0
    };
  }
  return sistema.obtenerEstadisticas(selectedConvocatoriaId.value);
});

function formatearFecha(fecha: Date): string {
  return FormatUtils.formatearFecha(fecha);
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.selector-card {
  padding: var(--espaciado-lg);
  border-left: 5px solid var(--color-dorado);
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

.convocatoria-info-badge {
  background-color: var(--color-primario-oscuro);
  color: #ffffff;
  padding: var(--espaciado-md) var(--espaciado-lg);
  border-radius: var(--radio-md);
  margin-bottom: var(--espaciado-lg);
}

.convocatoria-info-badge h3 {
  margin: 0 0 var(--espaciado-xs) 0;
  color: var(--color-dorado-claro);
  font-size: 1.25rem;
}

.convocatoria-info-badge p {
  margin: 0;
  font-size: 0.88rem;
  opacity: 0.8;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--espaciado-lg);
  margin-bottom: var(--espaciado-xl);
}

.metric-card {
  background-color: var(--color-superficie);
  padding: var(--espaciado-lg);
  border-radius: var(--radio-md);
  box-shadow: var(--sombra-md);
  display: flex;
  align-items: center;
  gap: var(--espaciado-lg);
  transition: transform var(--transicion-normal), box-shadow var(--transicion-normal);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sombra-lg);
}

.card-icon {
  font-size: 2.5rem;
  background-color: var(--color-fondo);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radio-sm);
}

.budget-card {
  border-top: 4px solid var(--color-primario);
}

.total-card {
  border-top: 4px solid var(--color-dorado);
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primario-oscuro);
  margin: 4px 0;
}

.card-subtitle {
  font-size: 0.78rem;
  color: var(--color-texto-suave);
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--espaciado-md);
}

.state-card {
  background-color: var(--color-superficie);
  padding: var(--espaciado-md);
  border-radius: var(--radio-sm);
  box-shadow: var(--sombra-sm);
  border-left: 4px solid #ccc;
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
}

.state-card.aprobada {
  border-left-color: var(--color-exito);
}
.state-card.aprobada .state-dot {
  background-color: var(--color-exito);
}

.state-card.revision {
  border-left-color: var(--color-advertencia);
}
.state-card.revision .state-dot {
  background-color: var(--color-advertencia);
}

.state-card.registrada {
  border-left-color: var(--color-info);
}
.state-card.registrada .state-dot {
  background-color: var(--color-info);
}

.state-card.rechazada {
  border-left-color: var(--color-error);
}
.state-card.rechazada .state-dot {
  background-color: var(--color-error);
}

.state-header {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
}

.state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.state-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-texto-suave);
}

.state-count {
  font-size: 1.8rem;
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

.animate-fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
