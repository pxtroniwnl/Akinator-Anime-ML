from src.engine import AkinatorEngine

engine = AkinatorEngine('data/processed_characters.csv')

print("🔮 ¡Bienvenido al Akinator de Anime! 🔮")

while len(engine.current_data) > 1:
    q = engine.get_best_question()
    ans = input(f"¿Tu personaje tiene el atributo '{q}'? (s/n): ").lower()
    
    val = 1 if ans == 's' else 0
    engine.update_data(q, val)
    
    if len(engine.current_data) == 0:
        print("😱 No encontré a nadie con esas características...")
        break

result = engine.get_result()
if result:
    print(f"\n✨ ¡Tu personaje es: {result['name']}! ✨")
    print(f"Imagen: {result['image_url']}")