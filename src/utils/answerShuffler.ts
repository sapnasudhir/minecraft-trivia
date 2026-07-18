export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return shuffleArray([...array])
  }

  const result: T[] = []
  const used = new Set<number>()

  while (result.length < count) {
    const index = Math.floor(Math.random() * array.length)
    if (!used.has(index)) {
      used.add(index)
      result.push(array[index])
    }
  }

  return result
}
