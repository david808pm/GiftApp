# GiftApp - Selección de Regalos Corporativos

Aplicación web desarrollada con React y Vite para gestionar campañas de selección de regalos corporativos.

## Tecnologías

- React
- Vite
- React Router
- ESLint

## Requisitos

- Node.js compatible con las versiones requeridas por Vite
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Demo Data

This project currently uses localStorage-based demo data. Set:

```
VITE_ENABLE_DEMO_DATA=true
```

## Important Notice

Current authentication and persistence are for demo/prototype purposes only.
Before production, replace localStorage persistence and demo authentication with a backend API, secure authentication, authorization, server-side validation, and transactional stock handling.

## Project Structure

```
src/
  api/
  components/
  constants/
  pages/
  routes/
  styles/
  utils/
```

## Available Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza la compilación de producción
- `npm run lint` - Ejecuta ESLint
