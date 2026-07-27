<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="espe-brand">
          <div class="brand-escudo">ESPE</div>
          <div class="brand-text">
            <h2>ESPE</h2>
            <span>Convocatoria de Notas Conceptuales</span>
          </div>
        </div>
      </div>
      
      <nav class="sidebar-menu">
        <button 
          class="menu-item" 
          :class="{ active: currentView === 'dashboard' }" 
          @click="currentView = 'dashboard'"
        >
          <span class="icon">📊</span> Panel de Métricas
        </button>
        
        <button 
          class="menu-item" 
          :class="{ active: currentView === 'convocatorias' }" 
          @click="currentView = 'convocatorias'"
        >
          <span class="icon">📅</span> Convocatorias
        </button>
        
        <button 
          class="menu-item" 
          :class="{ active: currentView === 'notas' }" 
          @click="currentView = 'notas'"
        >
          <span class="icon">📝</span> Notas Conceptuales
        </button>
        
        <button 
          class="menu-item" 
          :class="{ active: currentView === 'consultas' }" 
          @click="currentView = 'consultas'"
        >
          <span class="icon">🔍</span> Consultas
        </button>
      </nav>
      
      <div class="sidebar-footer">
        <span class="version">Versión 2.0.0</span>
      </div>
    </aside>
    
    <!-- Main Content Area -->
    <div class="main-container">
      <header class="topbar">
        <div class="topbar-left">
          <h1>{{ viewTitle }}</h1>
        </div>
        <div class="topbar-right">
          <div class="user-badge">
            <span class="user-avatar">👤</span>
            <span class="user-name">Administrador ESPE</span>
          </div>
        </div>
      </header>
      
      <main class="content-wrapper">
        <component :is="activeComponent" @change-view="currentView = $event" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardView from './views/DashboardView.vue';
import ConvocatoriasView from './views/ConvocatoriasView.vue';
import NotasView from './views/NotasView.vue';
import ConsultasView from './views/ConsultasView.vue';

const currentView = ref('dashboard');

const activeComponent = computed(() => {
  switch (currentView.value) {
    case 'dashboard': return DashboardView;
    case 'convocatorias': return ConvocatoriasView;
    case 'notas': return NotasView;
    case 'consultas': return ConsultasView;
    default: return DashboardView;
  }
});

const viewTitle = computed(() => {
  switch (currentView.value) {
    case 'dashboard': return 'Panel de Control y Métricas';
    case 'convocatorias': return 'Gestión de Convocatorias';
    case 'notas': return 'Convocatorias de Notas Conceptuales';
    case 'consultas': return 'Búsqueda e Inspección de Estado';
    default: return '';
  }
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-fondo);
}

.sidebar {
  width: 280px;
  background-color: var(--color-primario-oscuro);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: var(--sombra-lg);
  flex-shrink: 0;
  z-index: 10;
}

.sidebar-header {
  padding: var(--espaciado-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.espe-brand {
  display: flex;
  align-items: center;
  gap: var(--espaciado-md);
}

.brand-escudo {
  width: 48px;
  height: 48px;
  background-color: var(--color-dorado);
  color: var(--color-primario-oscuro);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-radius: var(--radio-sm);
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.brand-text h2 {
  font-size: 1.3rem;
  margin: 0;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-text span {
  font-size: 0.78rem;
  color: var(--color-dorado-claro);
  font-weight: 500;
}

.sidebar-menu {
  flex-grow: 1;
  padding: var(--espaciado-lg) var(--espaciado-md);
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--espaciado-md);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 12px var(--espaciado-md);
  border-radius: var(--radio-sm);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all var(--transicion-rapida);
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.menu-item.active {
  background-color: var(--color-primario-claro);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid var(--color-dorado);
}

.sidebar-footer {
  padding: var(--espaciado-md);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.topbar {
  background-color: var(--color-superficie);
  height: 70px;
  padding: 0 var(--espaciado-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-borde);
  box-shadow: var(--sombra-sm);
}

.topbar-left h1 {
  font-size: 1.4rem;
  color: var(--color-primario-oscuro);
  margin: 0;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  background-color: var(--color-fondo);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 30px;
  border: 1px solid var(--color-borde);
}

.user-avatar {
  font-size: 1.1rem;
}

.user-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-primario-oscuro);
}

.content-wrapper {
  padding: var(--espaciado-xl);
  flex-grow: 1;
}
</style>
