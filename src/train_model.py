import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
import os

def train_akinator_tree():
    # 1. Cargar el dataset procesado
    path = 'data/processed_characters.csv'
    if not os.path.exists(path):
        print(f"Error: No se encuentra {path}. Ejecuta primero data_ingestion.py")
        return

    df = pd.read_csv(path)

    # 2. Preparar los datos (X = preguntas, y = nombre del personaje)
    # Excluimos columnas que no son preguntas de Sí/No
    exclude_cols = ['name', 'about', 'image_url', 'favorites']
    X = df.drop(columns=exclude_cols)
    y = df['name']

    # 3. Entrenar el modelo
    # Usamos 'entropy' para que se comporte como el Akinator real
    clf = DecisionTreeClassifier(criterion='entropy', random_state=42)
    clf.fit(X, y)

    # 4. Análisis de Importancia (Feature Importance)
    importances = pd.DataFrame({
        'Atributo': X.columns,
        'Importancia': clf.feature_importances_
    }).sort_values(by='Importancia', ascending=False)

    print("\nTOP 10 PREGUNTAS MÁS IMPORTANTES:")
    print(importances.head(10))

    # 5. Exportar la lógica del árbol a un archivo de texto
    tree_rules = export_text(clf, feature_names=list(X.columns))
    with open('data/tree_logic.txt', 'w') as f:
        f.write(tree_rules)
    
    print("\nLógica del árbol guardada en 'data/tree_logic.txt'")
    return clf

if __name__ == "__main__":
    train_akinator_tree()