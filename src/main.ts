import { createApp } from 'vue';
import App from './App.vue';
import { SeedService } from './services/SeedService.js';
import '@/styles/main.css';

// Sembrar datos de prueba iniciales
SeedService.ejecutar();

// Crear y montar la aplicación Vue
createApp(App).mount('#app');
