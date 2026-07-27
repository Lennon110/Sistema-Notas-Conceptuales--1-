<template>
  <div class="convocatorias-view">
    <div class="header-actions">
      <h2>Convocatorias Registradas</h2>
      <button class="btn btn-primario" @click="abrirFormulario()">
        ➕ Nueva Convocatoria
      </button>
    </div>

    <!-- Formulario para Crear / Editar (Modal o tarjeta colapsable) -->
    <div v-if="mostrarFormulario" class="card form-card animate-fade-in">
      <div class="form-header">
        <h3>{{ editandoId ? 'Editar Convocatoria' : 'Nueva Convocatoria' }}</h3>
        <button class="btn-close" @click="cerrarFormulario">✕</button>
      </div>
      <form @submit.prevent="guardar">
        <div class="campo-formulario">
          <label for="nombre">Nombre de la Convocatoria <span class="obligatorio">*</span></label>
          <input 
            type="text" 
            id="nombre" 
            v-model="form.nombre" 
            placeholder="Ej. Convocatoria de Notas Conceptuales 2026-II"
            required
          />
        </div>
        <div class="fila-campos">
          <div class="campo-formulario">
            <label for="fechaInicio">Fecha de Inicio <span class="obligatorio">*</span></label>
            <input 
              type="date" 
              id="fechaInicio" 
              v-model="form.fechaInicio" 
              required
            />
          </div>
          <div class="campo-formulario">
            <label for="fechaFin">Fecha de Finalización <span class="obligatorio">*</span></label>
            <input 
              type="date" 
              id="fechaFin" 
              v-model="form.fechaFin" 
              required
            />
          </div>
        </div>
        <div class="acciones-formulario">
          <button type="button" class="btn btn-secundario" @click="cerrarFormulario">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primario">
            {{ editandoId ? 'Actualizar Convocatoria' : 'Crear Convocatoria' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Listado de Convocatorias -->
    <div class="card table-card">
      <div v-if="lista.length === 0" class="tabla-vacia">
        No hay convocatorias registradas en el sistema.
      </div>
      <div v-else class="table-responsive">
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Notas</th>
              <th class="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in lista" :key="c.id">
              <td class="font-bold">{{ c.nombre }}</td>
              <td>{{ formatearFecha(c.fechaInicio) }}</td>
              <td>{{ formatearFecha(c.fechaFin) }}</td>
              <td>
                <span class="badge" :class="'badge-' + c.estado.toLowerCase()">
                  {{ c.estado }}
                </span>
              </td>
              <td>
                <span class="count-badge">{{ c.notas.length }}</span>
              </td>
              <td class="acciones-celda">
                <button 
                  class="btn-icon btn-edit" 
                  title="Editar"
                  @click="abrirFormulario(c)"
                >
                  ✏️
                </button>
                <button 
                  v-if="c.estado === 'ABIERTA'" 
                  class="btn-icon btn-close-conv" 
                  title="Cerrar Convocatoria"
                  @click="cerrarConvocatoria(c.id)"
                >
                  🔒
                </button>
                <button 
                  class="btn-icon btn-delete" 
                  title="Eliminar"
                  @click="eliminarConvocatoria(c.id)"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { ConvocatoriaService } from '../services/ConvocatoriaService';
import { FormatUtils } from '../utils/FormatUtils';
import { Convocatoria } from '../models/Convocatoria';

const service = new ConvocatoriaService();
const lista = shallowRef<Convocatoria[]>(service.listar());

const mostrarFormulario = ref(false);
const editandoId = ref<string | null>(null);

const form = ref({
  nombre: '',
  fechaInicio: '',
  fechaFin: ''
});

function refrescar() {
  lista.value = service.listar();
}

function formatearFecha(fecha: Date): string {
  return FormatUtils.formatearFecha(fecha);
}

function abrirFormulario(c?: Convocatoria) {
  if (c) {
    editandoId.value = c.id;
    form.value = {
      nombre: c.nombre,
      fechaInicio: FormatUtils.aFechaInput(c.fechaInicio),
      fechaFin: FormatUtils.aFechaInput(c.fechaFin)
    };
  } else {
    editandoId.value = null;
    form.value = {
      nombre: '',
      fechaInicio: '',
      fechaFin: ''
    };
  }
  mostrarFormulario.value = true;
}

function cerrarFormulario() {
  mostrarFormulario.value = false;
  editandoId.value = null;
}

function guardar() {
  const inicioDate = FormatUtils.desdeFechaInput(form.value.fechaInicio);
  const finDate = FormatUtils.desdeFechaInput(form.value.fechaFin);

  if (editandoId.value) {
    const res = service.editar(editandoId.value, form.value.nombre, inicioDate, finDate);
    if (!res.valido) {
      alert(res.mensaje || 'Error al actualizar');
      return;
    }
  } else {
    const res = service.crear(form.value.nombre, inicioDate, finDate);
    if (!res.valido) {
      alert(res.mensaje || 'Error al crear');
      return;
    }
  }

  cerrarFormulario();
  refrescar();
}

function cerrarConvocatoria(id: string) {
  if (confirm('¿Está seguro de cerrar esta convocatoria? Esta acción no se puede deshacer.')) {
    const res = service.cerrar(id);
    if (!res.valido) {
      alert(res.mensaje);
    }
    refrescar();
  }
}

function eliminarConvocatoria(id: string) {
  if (confirm('¿Está seguro de eliminar esta convocatoria?')) {
    const res = service.eliminar(id);
    if (!res.valido) {
      alert(res.mensaje);
    }
    refrescar();
  }
}
</script>

<style scoped>
.convocatorias-view {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
  color: var(--color-primario-oscuro);
  font-size: 1.5rem;
}

.form-card {
  padding: var(--espaciado-lg);
  border-top: 4px solid var(--color-primario);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--espaciado-md);
}

.form-header h3 {
  margin: 0;
  color: var(--color-primario-oscuro);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-texto-suave);
  padding: 4px;
}

.btn-close:hover {
  color: var(--color-error);
}

.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaciado-md);
  margin-top: var(--espaciado-lg);
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
  font-size: 0.92rem;
}

.tabla th {
  background-color: var(--color-fondo);
  color: var(--color-primario-oscuro);
  font-weight: 600;
}

.font-bold {
  font-weight: 600;
  color: var(--color-primario-oscuro);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-abierta {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}

.badge-cerrada {
  background-color: var(--color-error-fondo);
  color: var(--color-error);
}

.badge-vencida {
  background-color: var(--color-advertencia-fondo);
  color: var(--color-advertencia);
}

.count-badge {
  background-color: var(--color-fondo);
  color: var(--color-primario-oscuro);
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.acciones-header {
  text-align: right;
}

.acciones-celda {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaciado-sm);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radio-sm);
  transition: background-color var(--transicion-rapida);
}

.btn-icon:hover {
  background-color: var(--color-fondo);
}

.btn-edit:hover {
  filter: brightness(1.2);
}

.btn-close-conv:hover {
  filter: brightness(1.2);
}

.btn-delete:hover {
  filter: brightness(0.8);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
