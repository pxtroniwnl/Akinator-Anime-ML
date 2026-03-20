# 🧠 Anime-Akinator ML: Motor de Inferencia con Árboles de Decisión

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)

## 📌 Descripción del Proyecto
Este proyecto es un motor de búsqueda dicotómica inspirado en **Akinator**, especializado exclusivamente en personajes de **Anime**. A diferencia de una base de datos estática, este sistema utiliza **Árboles de Decisión** y el concepto de **Entropía de Shannon** para determinar qué pregunta reduce más la incertidumbre en cada paso, logrando adivinar el personaje en el menor número de intentos posible.

---

## 🚀 Fases de Desarrollo

### 🔹 Fase 1: Configuración e Infraestructura 🛠️
* **Entorno:** Configuración de un entorno profesional usando `uv` o `conda` para gestión de dependencias.
* **Arquitectura:** Diseño de un sistema desacoplado (Backend en FastAPI y Frontend en Streamlit).
* **Control de Versiones:** Estructura de Git siguiendo estándares de la industria.

### 🔹 Fase 2: Ingeniería de Datos (Data Engineering) 📊
* **Extracción:** Consumo de datos desde la API de **Jikan (MyAnimeList)** para obtener los 500 personajes más populares.
* **Feature Engineering:** Creación de una matriz binaria de características (Ej: *¿Tiene pelo azul?*, *¿Es de género Shonen?*, *¿Usa espada?*).
* **Limpieza:** Tratamiento de valores nulos y normalización de etiquetas de personajes.

### 🔹 Fase 3: El Motor de Inteligencia Artificial 🤖
* **Algoritmo de Selección:** Implementación de un selector de preguntas basado en **Information Gain** (Ganancia de Información).
* **Cálculo de Entropía:** El sistema evalúa en tiempo real cuál pregunta divide el dataset de la manera más óptima.
* **Manejo de Errores:** Lógica probabilística para permitir que el usuario responda "No lo sé" o "Probablemente" sin romper el árbol.

### 🔹 Fase 4: Despliegue y UI (MLOps) 🌐
* **API:** Creación de endpoints para manejar el estado del juego.
* **Dashboard:** Interfaz interactiva donde el usuario puede jugar y ver cómo cambian las probabilidades de los personajes.
* **Contenerización:** Creación de un `Dockerfile` para asegurar que el proyecto corra en cualquier lugar.

---

## 🧬 Conceptos de Data Science Aplicados
Para este proyecto, el enfoque principal no es solo usar una librería, sino entender la matemática detrás:

1.  **Entropía ($H$):** Medimos el desorden o la incertidumbre de los datos actuales.
2.  **Ganancia de Información:** Seleccionamos la característica $A$ que minimice la entropía después de realizar la partición.
    > *"¿Qué pregunta descarta a la mayor cantidad de personajes posibles con mayor certeza?"*

---

## 🛠️ Requisitos Técnicos
```bash
# Instalar dependencias
pip install -r requirements.txt

# Correr el Backend
uvicorn src.api:app --reload

# Correr la Interfaz
streamlit run app/main.py