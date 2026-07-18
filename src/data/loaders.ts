import corpusData from './minecraft_block_trivia_corpus.json'
import { CorpusFile, MinecraftCorpus } from '@/types/block'

let cachedCorpus: MinecraftCorpus | null = null

export function loadCorpus(): MinecraftCorpus {
  if (cachedCorpus) {
    return cachedCorpus
  }

  const data = corpusData as CorpusFile
  cachedCorpus = data.corpus

  if (!cachedCorpus.blocks || cachedCorpus.blocks.length === 0) {
    throw new Error('Corpus file is empty or invalid')
  }

  return cachedCorpus
}

export function getCorpusBlocks() {
  return loadCorpus().blocks
}

export function getBlockById(id: string) {
  const blocks = getCorpusBlocks()
  return blocks.find((block) => block.id === id)
}

export function getBlocksByCategory(category: string) {
  const blocks = getCorpusBlocks()
  return blocks.filter((block) => block.category === category)
}

export function getTotalBlockCount() {
  return getCorpusBlocks().length
}
