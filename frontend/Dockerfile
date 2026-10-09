# frontend/Dockerfile

# --- ETAPA 1: Compilación (Build) ---
# FROM node:18-alpine AS builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json para cachear dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto (genera la carpeta 'dist' o 'build')
RUN npm run build

# --- ETAPA 2: Servidor Web (Nginx) ---
FROM nginx:alpine

# Eliminamos la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copiamos los archivos compilados de la etapa anterior
# NOTA: Cambiar 'dist' por 'build' si usan Create React App en lugar de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]