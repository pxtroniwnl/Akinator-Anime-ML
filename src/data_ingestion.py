import requests
import pandas as pd
import time
import os
import re

# --- Función de Procesamiento (Fase 2) ---
def extract_features(df):
    processed_df = df.copy()
    
    # --- 1. DATOS DEMOGRÁFICOS Y FISIOLOGÍA ---
    processed_df['is_male'] = processed_df['about'].str.contains('he |him|his|male', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_human'] = processed_df['about'].str.contains('human', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_alien_or_creature'] = processed_df['about'].str.contains('alien|monster|demon|creature|vampire|ghoul', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_cyborg_or_robot'] = processed_df['about'].str.contains('cyborg|android|robot|mechanical', flags=re.IGNORECASE, na=False).astype(int)

    # --- 2. APARIENCIA DETALLADA ---
    processed_df['has_black_hair'] = processed_df['about'].str.contains('black hair', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_blonde_hair'] = processed_df['about'].str.contains('blonde|yellow hair', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_blue_hair'] = processed_df['about'].str.contains('blue hair', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_red_hair'] = processed_df['about'].str.contains('red hair|crimson hair', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['wears_glasses'] = processed_df['about'].str.contains('glasses|spectacles|megane', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_scar'] = processed_df['about'].str.contains('scar |facial scar', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['wears_hat_or_mask'] = processed_df['about'].str.contains('hat |cap |mask |helmet', flags=re.IGNORECASE, na=False).astype(int)

    # --- 3. COMBATE Y HABILIDADES ---
    processed_df['uses_swords'] = processed_df['about'].str.contains('sword|katana|blade|swordsman', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['uses_guns'] = processed_df['about'].str.contains('gun|pistol|rifle|shooter|firearm', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['has_superpowers'] = processed_df['about'].str.contains('magic|power|ability|energy|chakra|fruit|quirk|nen|bankai', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['can_fly'] = processed_df['about'].str.contains('fly |flight|wings', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['elemental_powers'] = processed_df['about'].str.contains('fire |ice |thunder|lightning|water |wind ', flags=re.IGNORECASE, na=False).astype(int)

    # --- 4. ROL, PERSONALIDAD Y STATUS ---
    processed_df['is_student'] = processed_df['about'].str.contains('student|school|academy|high school', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_captain_or_leader'] = processed_df['about'].str.contains('captain|leader|commander|head of|king|emperor|hokage', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_villain_or_antagonist'] = processed_df['about'].str.contains('villain|antagonist|enemy|criminal|assassin', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_intelligent'] = processed_df['about'].str.contains('smart|genius|strategist|intellectual|detective|brilliant', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_orphan'] = processed_df['about'].str.contains('orphan|parents died|lost his parents', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_cold_or_stoic'] = processed_df['about'].str.contains('cold|stoic|emotionless|silent|calm', flags=re.IGNORECASE, na=False).astype(int)

    # --- 5. AFILIACIÓN / UNIVERSO ---
    processed_df['is_pirate'] = processed_df['about'].str.contains('pirate', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_ninja'] = processed_df['about'].str.contains('ninja|shinobi', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_detective_or_police'] = processed_df['about'].str.contains('detective|police|investigator', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['from_popular_shonen'] = processed_df['about'].str.contains('One Piece|Naruto|Bleach|Dragon Ball|Hunter x Hunter', flags=re.IGNORECASE, na=False).astype(int)
    processed_df['is_isekai'] = processed_df['about'].str.contains('reincarnated|another world|transported to', flags=re.IGNORECASE, na=False).astype(int)

    return processed_df

# --- Función de Descarga (Fase 1) ---
def run_full_pipeline(pages=50):
    all_characters = []
    
    print(f"Descargando {pages} páginas de personajes...")
    for page in range(1, pages + 1):
        url = f"https://api.jikan.moe/v4/top/characters?page={page}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()['data']
            for char in data:
                # AQUÍ SE AGREGA LA COLUMNA FAVORITES
                all_characters.append({
                    'name': char['name'],
                    'about': char['about'] if char['about'] else "",
                    'image_url': char['images']['jpg']['image_url'],
                    'favorites': char.get('favorites', 0) # <--- NUEVA COLUMNA
                })
            time.sleep(1) 
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
    run_full_pipeline()