import pandas as pd

df = pd.read_csv('/vercel/share/v0-project/data/processed_characters.csv')
names = df['name'].tolist()

print(f"Total characters: {len(names)}")
print("---")
for i, name in enumerate(names, 1):
    print(f"{i}. {name}")
