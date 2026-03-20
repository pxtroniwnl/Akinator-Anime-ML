import pandas as pd
import numpy as np

class AkinatorEngine:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        # Solo usamos las columnas de preguntas (desde la 4ta en adelante)
        self.questions = [col for col in self.df.columns if col not in ['name', 'about', 'image_url']]
        self.current_data = self.df.copy()

    def calculate_entropy(self, data):
        """Calcula qué tan incierto es el set actual de personajes."""
        if len(data) <= 1:
            return 0
        # En Akinator, queremos reducir la cantidad de personajes
        # La entropía máxima es cuando hay muchos personajes posibles
        return np.log2(len(data))

    def get_best_question(self):
        best_gain = -1
        best_q = None

        for q in self.questions:
            # SKEW CHECK: Si todos los personajes restantes tienen el mismo valor en esta pregunta,
            # la ganancia es 0. La ignoramos.
            values = self.current_data[q].unique()
            if len(values) <= 1:
                continue

            yes_count = len(self.current_data[self.current_data[q] == 1])
            no_count = len(self.current_data[self.current_data[q] == 0])
            
            score = min(yes_count, no_count) / max(yes_count, no_count + 1e-9)
            
            if score > best_gain:
                best_gain = score
                best_q = q
        
        return best_q

    def update_data(self, question, answer):
        """
        Filtra el dataset según la respuesta del usuario.
        answer: 1 para 'Sí', 0 para 'No'
        """
        self.current_data = self.current_data[self.current_data[question] == answer]

    def get_result(self):
        """Devuelve el ganador usando la lógica de probabilidad (Favoritos)."""
        if self.current_data.empty:
            return None
        
        # Si el árbol no pudo distinguir entre los que quedan:
        if len(self.current_data) > 1:
            # Ordenamos por favoritos de mayor a menor y tomamos el primero
            # Esto es lo que llamamos un 'Bayesian Prior' en estadística
            winner = self.current_data.sort_values(by='favorites', ascending=False).iloc[0]
            return winner.to_dict()
        
        return self.current_data.iloc[0].to_dict()