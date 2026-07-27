# Compilación
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json tsconfig.json vite.config.ts index.html ./
RUN npm install --no-audit --no-fund

# Copiar código fuente y recursos públicos
COPY public ./public
COPY src ./src

# Compilar la aplicación (Vite genera la carpeta dist/)
RUN npm run build

# Servidor nginx para producción
FROM nginx:1.27-alpine

# Copiar los archivos compilados al directorio raíz de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1
