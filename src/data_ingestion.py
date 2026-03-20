import requests
import pandas as pd
import time
import os
import re

# --- Función de Procesamiento (Fase 2) ---
def extract_features(df):
    processed_df = df.copy()
    
    # Lógica de etiquetado por palabras clave
    processed_df['is_male'] = processed_df['about'].str.contains('he |him|his|male', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['uses_weapons'] = processed_df['about'].str.contains('sword|weapon|blade|katana|gun|pistol', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_superpowers'] = processed_df['about'].str.contains('magic|power|ability|energy|chakra|fruit|quirk', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_student'] = processed_df['about'].str.contains('student|school|academy', flags=re.IGNORECASE, na=False).astype(int)
    
    return processed_df

# --- Función de Descarga (Fase 1) ---
def run_full_pipeline(pages=5):
    all_characters = []
    
    print(f"Descargando {pages} páginas de personajes...")
    for page in range(1, pages + 1):
        url = f"https://api.jikan.moe/v4/top/characters?page={page}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()['data']
            for char in data:
                all_characters.append({
                    'name': char['name'],
                    'about': char['about'] if char['about'] else "",
                    'image_url': char['images']['jpg']['image_url']
                })
            time.sleep(1) # Importante para evitar que la API nos bloquee
        else:
            print(f"Error en página {page}")

    # 1. Crear DataFrame
    df = pd.DataFrame(all_characters)
    
    # 2. Procesar (Feature Engineering)
    print("Procesando características (ML Ready)...")
    df_processed = extract_features(df)
    
    # 3. Guardar
    if not os.path.exists('data'):
        os.makedirs('data')
        
    path = 'data/processed_characters.csv'
    df_processed.to_csv(path, index=False)
    print(f"Dataset guardado en: {path}")
    return df_processed

if __name__ == "__main__":
    run_full_pipeline(5) # Descarga unos 125 personajes para empezar