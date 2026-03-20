from src.data_ingestion import get_top_characters

print("Iniciando prueba de descarga...")
# Probamos solo con 1 página (25 personajes) para no gastar rate limits
df_test = get_top_characters(limit_pages=1)

if not df_test.empty:
    print(f"¡Éxito! Se descargaron {len(df_test)} personajes.")
    print("\n--- Primeros 3 registros ---")
    print(df_test[['name', 'mal_id']].head(3))
    
    # Comprobar que no hay nulos críticos
    print(f"\nNulos en 'about': {df_test['about'].isnull().sum()}")
else:
    print("Error: El DataFrame está vacío. Revisa la conexión o el Rate Limit de Jikan.")