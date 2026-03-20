<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<h1 align="center">Anime Akinator ML</h1>

<p align="center">
  <strong>Un motor de inferencia inteligente que adivina personajes de anime usando Arboles de Decision y Entropia de Shannon</strong>
</p>

<p align="center">
  <a href="#-descripcion">Descripcion</a> •
  <a href="#-como-funciona">Como Funciona</a> •
  <a href="#-estructura-del-proyecto">Estructura</a> •
  <a href="#-instalacion">Instalacion</a> •
  <a href="#-uso">Uso</a>
</p>

---

## Descripcion

**Anime Akinator ML** es un sistema de adivinacion de personajes de anime inspirado en el clasico juego Akinator. A diferencia de una simple base de datos, este proyecto utiliza **algoritmos de Machine Learning** para determinar la pregunta optima en cada turno, minimizando el numero de preguntas necesarias para adivinar el personaje.

### Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Motor de Inferencia** | Algoritmo basado en Ganancia de Informacion para seleccionar preguntas |
| **+1,250 Personajes** | Base de datos extraida de MyAnimeList con los personajes mas populares |
| **Interfaz Moderna** | Frontend en Next.js con animaciones fluidas usando Framer Motion |
| **Galeria de Personajes** | Explora todos los personajes disponibles antes de jugar |
| **API RESTful** | Backend desacoplado con FastAPI para facil integracion |

---

## Como Funciona

El sistema utiliza conceptos fundamentales de **Teoria de la Informacion**:

### 1. Entropia de Shannon

Mide la incertidumbre del conjunto actual de personajes. A mayor cantidad de personajes posibles, mayor entropia.

```
H(S) = log2(|S|)
```

### 2. Ganancia de Informacion

Para cada pregunta, calculamos que tan bien divide el conjunto de personajes. La pregunta ideal es aquella que divide el dataset en dos mitades iguales:

```
Ganancia = min(Si, No) / max(Si, No)
```

### 3. Prior Bayesiano

Cuando quedan multiples personajes posibles, usamos la **popularidad** (numero de favoritos en MyAnimeList) como prior para seleccionar el ganador mas probable.

### Flujo del Juego

```
┌─────────────────┐
│  Inicio Juego   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calcular Mejor  │◄────────────────┐
│    Pregunta     │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│  Usuario        │                 │
│  Responde Si/No │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐      No         │
│ ¿Queda 1 solo   │─────────────────┘
│   personaje?    │
└────────┬────────┘
         │ Si
         ▼
┌─────────────────┐
│   Resultado!    │
└─────────────────┘
```

---

## Estructura del Proyecto

```
Akinator-Anime-ML/
│
├── app/                          # Frontend Next.js
│   ├── globals.css               # Estilos globales con Tailwind
│   ├── layout.tsx                # Layout principal de la app
│   └── page.tsx                  # Pagina principal del juego
│
├── data/                         # Datos del proyecto
│   ├── processed_characters.csv  # Dataset de personajes procesado
│   └── tree_logic.txt            # Logica del arbol de decision
│
├── src/                          # Codigo fuente Python
│   ├── engine.py                 # Motor de inferencia (Akinator)
│   ├── data_ingestion.py         # Extraccion de datos de Jikan API
│   ├── processor.py              # Procesamiento de datos
│   └── train_model.py            # Entrenamiento del modelo
│
├── main.py                       # Servidor FastAPI (Backend)
├── package.json                  # Dependencias de Node.js
├── requirements.txt              # Dependencias de Python
├── tailwind.config.ts            # Configuracion de Tailwind CSS
├── next.config.ts                # Configuracion de Next.js
└── CHARACTERS.md                 # Lista de personajes disponibles
```

### Descripcion de Archivos Clave

| Archivo | Descripcion |
|---------|-------------|
| `src/engine.py` | Contiene la clase `AkinatorEngine` con la logica de entropia y seleccion de preguntas |
| `main.py` | Servidor FastAPI con endpoints `/start`, `/answer` y `/characters` |
| `app/page.tsx` | Interfaz de usuario completa con estados de juego, galeria y animaciones |
| `data/processed_characters.csv` | Dataset con +1,250 personajes y sus atributos binarios |

---

## Instalacion

### Requisitos Previos

- **Python 3.10+**
- **Node.js 18+**
- **npm** o **pnpm**

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/pxtroniwnl/Akinator-Anime-ML.git
cd Akinator-Anime-ML
```

### Paso 2: Instalar Dependencias de Python

```bash
# Opcion 1: Usando pip
pip install -r requirements.txt

# Opcion 2: Solo las dependencias esenciales
pip install fastapi uvicorn pandas numpy
```

### Paso 3: Instalar Dependencias de Node.js

```bash
# Usando npm
npm install

# O usando pnpm (recomendado)
pnpm install
```

---

## Uso

El proyecto requiere ejecutar **dos servidores** simultaneamente: el backend (Python) y el frontend (Next.js).

### Paso 1: Iniciar el Backend (FastAPI)

Abre una terminal y ejecuta:

```bash
uvicorn main:app --reload
```

Veras algo como:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

El backend estara disponible en `http://localhost:8000`

### Paso 2: Iniciar el Frontend (Next.js)

Abre **otra terminal** y ejecuta:

```bash
npm run dev
```

Veras algo como:

```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### Paso 3: Jugar

1. Abre tu navegador en `http://localhost:3000`
2. Haz clic en **"View Characters"** para explorar los personajes disponibles
3. Haz clic en **"Start Game"** para comenzar a jugar
4. Responde las preguntas con **SI** o **NO**
5. El sistema adivinara tu personaje

---

## Endpoints de la API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/start` | Inicia una nueva partida y devuelve la primera pregunta |
| `POST` | `/answer?question=...&ans=0\|1` | Envia una respuesta (0=No, 1=Si) |
| `GET` | `/characters` | Lista todos los personajes disponibles |

### Ejemplo de Uso con cURL

```bash
# Iniciar juego
curl http://localhost:8000/start

# Responder "Si" a una pregunta
curl -X POST "http://localhost:8000/answer?question=is_male&ans=1"

# Ver todos los personajes
curl http://localhost:8000/characters
```

---

## Atributos de Personajes

El sistema utiliza los siguientes atributos binarios para las preguntas:

| Categoria | Atributos |
|-----------|-----------|
| **Genero** | `is_male`, `is_female` |
| **Color de Pelo** | `has_black_hair`, `has_blonde_hair`, `has_blue_hair`, `has_red_hair`, `has_white_hair`, `has_pink_hair`, `has_brown_hair`, `has_green_hair`, `has_purple_hair`, `has_orange_hair`, `has_gray_hair` |
| **Color de Ojos** | `has_blue_eyes`, `has_red_eyes`, `has_brown_eyes`, `has_green_eyes`, `has_black_eyes`, `has_purple_eyes`, `has_yellow_eyes`, `has_golden_eyes`, `has_orange_eyes`, `has_pink_eyes`, `has_gray_eyes` |
| **Caracteristicas** | `has_powers`, `is_human`, `is_student`, `is_villain`, `is_protagonist`, `is_side_character`, `has_tragic_past`, `is_from_isekai`, `wears_school_uniform`, `has_animal_features` |

---

## Tecnologias Utilizadas

### Backend
- **Python 3.10+** - Lenguaje principal
- **FastAPI** - Framework web moderno y rapido
- **Pandas** - Manipulacion de datos
- **NumPy** - Calculos matematicos

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estatico
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos

---

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Agregar nueva caracteristica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

## Licencia

Este proyecto esta bajo la Licencia MIT. Ver el archivo `LICENSE` para mas detalles.

---

<p align="center">
  Hecho con masa madre por <a href="https://github.com/pxtroniwnl">pxtroniwnl</a>
</p>
