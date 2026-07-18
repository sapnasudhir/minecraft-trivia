export interface TriviaHook {
  category: 'mechanical' | 'generation' | 'crafting' | 'special' | 'variants'
  difficulty: 'easy' | 'medium' | 'hard'
  questionSeed: string
  answer: string
}

export interface MechanicalProperties {
  hardness: number
  blastResistance: number
  miningTime: {
    hand: number | null
    wooden: number
    stone: number
    iron: number
    diamond: number
    netherite: number
  }
  toolRequired: string
  minToolTier: 'wood' | 'stone' | 'iron' | 'diamond' | 'netherite'
  stackable: boolean
  maxStackSize: number
  silkTouchRequired?: boolean
}

export interface GenerationProperties {
  renewable: boolean
  rarity: 'Common' | 'Uncommon' | 'Rare'
  yLevelMin: number | null
  yLevelMax: number | null
  peakYLevel: number | null
  biomes: string[]
  spawnRate: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  veinsPerChunk?: number
  oresPerVein?: number
}

export interface VariantsProperties {
  hasVariants: boolean
  types: string[]
  colors: string[]
}

export interface CraftingRecipe {
  type: 'mining' | 'smelting' | 'crafting' | 'other'
  input: string
  output: string
  yield: number
  experience?: string | number
}

export interface CraftingProperties {
  recipes: CraftingRecipe[]
  fortuneCompatible: boolean
  fortuneMaxDrop?: number
  fortuneLevelForMax?: number
  experienceDrop?: string | number
}

export interface SpecialProperties {
  luminous: boolean
  lightLevel?: number
  transparent: boolean
  flammable: boolean
  catchesFireFromLava: boolean
  affectedByGravity: boolean
  soundType?: string
  resistanceToPistons?: boolean
  [key: string]: any
}

export interface BlockProperties {
  mechanical: MechanicalProperties
  generation: GenerationProperties
  variants: VariantsProperties
  crafting: CraftingProperties
  special: SpecialProperties
}

export interface MinecraftBlock {
  id: string
  name: string
  category: string
  textureUrl: string
  properties: BlockProperties
  trivia_hooks: TriviaHook[]
}

export interface CorpusMetadata {
  title: string
  description: string
  version: string
  createdDate: string
  sourceWiki: string
  totalBlocks: number
  edition: string
  note?: string
  categories: Record<string, number>
}

export interface MinecraftCorpus {
  metadata: CorpusMetadata
  blocks: MinecraftBlock[]
}

export interface CorpusFile {
  corpus: MinecraftCorpus
  usage_guide?: any
}
