import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

export interface Character {
  name: string
  about: string
  image_url: string
  favorites: number
  [key: string]: string | number
}

// Cargar y parsear el CSV
function loadCharacters(): Character[] {
  const csvPath = path.join(process.cwd(), 'data', 'processed_characters.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  })
  
  return records.map((record: Record<string, string>) => ({
    ...record,
    favorites: parseInt(record.favorites) || 0,
  })) as Character[]
}

// Cache de personajes
let charactersCache: Character[] | null = null

export function getCharacters(): Character[] {
  if (!charactersCache) {
    charactersCache = loadCharacters()
  }
  return charactersCache
}

// Obtener columnas de preguntas (excluyendo metadata)
export function getQuestionColumns(): string[] {
  const characters = getCharacters()
  if (characters.length === 0) return []
  
  const excludedColumns = ['name', 'about', 'image_url', 'favorites']
  return Object.keys(characters[0]).filter(col => !excludedColumns.includes(col))
}

// Motor del Akinator
export class AkinatorEngine {
  private currentData: Character[]
  private questions: string[]

  constructor() {
    this.currentData = [...getCharacters()]
    this.questions = getQuestionColumns()
  }

  getBestQuestion(): string | null {
    let bestGain = -1
    let bestQuestion: string | null = null

    for (const q of this.questions) {
      // Si todos los personajes tienen el mismo valor, ignorar
      const values = new Set(this.currentData.map(c => c[q]))
      if (values.size <= 1) continue

      const yesCount = this.currentData.filter(c => c[q] === 1 || c[q] === '1').length
      const noCount = this.currentData.filter(c => c[q] === 0 || c[q] === '0').length

      const score = Math.min(yesCount, noCount) / Math.max(yesCount, noCount + 1e-9)

      if (score > bestGain) {
        bestGain = score
        bestQuestion = q
      }
    }

    return bestQuestion
  }

  updateData(question: string, answer: number): void {
    this.currentData = this.currentData.filter(c => {
      const value = c[question]
      return value === answer || value === String(answer)
    })
  }

  getResult(): Character | null {
    if (this.currentData.length === 0) return null

    if (this.currentData.length > 1) {
      // Ordenar por favoritos y tomar el más popular
      return [...this.currentData].sort((a, b) => b.favorites - a.favorites)[0]
    }

    return this.currentData[0]
  }

  getRemainingCount(): number {
    return this.currentData.length
  }

  toJSON() {
    return {
      currentData: this.currentData,
      questions: this.questions,
    }
  }

  static fromJSON(data: { currentData: Character[]; questions: string[] }): AkinatorEngine {
    const engine = new AkinatorEngine()
    engine.currentData = data.currentData
    engine.questions = data.questions
    return engine
  }
}
