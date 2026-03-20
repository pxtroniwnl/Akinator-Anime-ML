from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.engine import AkinatorEngine
import pandas as pd

app = FastAPI()

# Cargar datos de personajes para el endpoint de galería
characters_df = pd.read_csv('data/processed_characters.csv')

# Permitir que el frontend (v0/Next.js) se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Diccionario para guardar partidas activas (en memoria para el MVP)
games = {}

@app.get("/start")
def start_game():
    game_id = "user_1" # En producción usarías un ID único
    games[game_id] = AkinatorEngine('data/processed_characters.csv')
    first_q = games[game_id].get_best_question()
    return {"question": first_q, "status": "playing"}

@app.post("/answer")
def handle_answer(question: str, ans: int):
    engine = games["user_1"]
    engine.update_data(question, ans)
    
    # ¿Ya tenemos ganador?
    if len(engine.current_data) <= 1:
        winner = engine.get_result()
        return {"status": "finished", "winner": winner}
    
    next_q = engine.get_best_question()
    return {"question": next_q, "status": "playing", "remaining": len(engine.current_data)}

@app.get("/characters")
def get_characters():
    """Retorna todos los personajes disponibles para que el usuario pueda ver quién está en el juego"""
    characters = characters_df[['name', 'image_url', 'favorites', 'about']].to_dict('records')
    return {"characters": characters, "total": len(characters)}
