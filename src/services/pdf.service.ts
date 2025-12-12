import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

if (typeof window !== 'undefined' && GlobalWorkerOptions) {
  GlobalWorkerOptions.workerSrc = pdfWorkerSrc
}

type PdfSource = File | string

const readFileAsArrayBuffer = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo PDF'))
    reader.readAsArrayBuffer(file)
  })

const fetchPdfAsArrayBuffer = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('No se pudo descargar el PDF')
  return await response.arrayBuffer()
}

export const extractTextFromPdf = async (source: PdfSource): Promise<string> => {
  let arrayBuffer: ArrayBuffer
  if (typeof source === 'string') {
    arrayBuffer = await fetchPdfAsArrayBuffer(source)
  } else {
    arrayBuffer = await readFileAsArrayBuffer(source)
  }

  const loadingTask = getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  let text = ''

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const pageText = (content.items as TextItem[])
      .map((item) => item.str ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    text += `${pageText}\n`
  }

  return text.trim()
}

export const truncateText = (input: string, limit = 20000) => {
  if (input.length <= limit) return input
  return `${input.slice(0, limit)}…`
}

const chunkText = (input: string, chunkSize = 1400, overlap = 200) => {
  const text = input.replace(/\s+/g, ' ').trim()
  if (!text) return [] as string[]
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize)
    const chunk = text.slice(start, end).trim()
    if (chunk) chunks.push(chunk)
    if (end >= text.length) break
    start = Math.max(0, end - overlap)
  }
  return chunks
}

export const buildRagContext = (input: string, limit = 20000) => {
  const chunks = chunkText(input)
  if (chunks.length <= 1) return truncateText(input, limit)

  const keywords = [
    'abstract',
    'resumen',
    'method',
    'methods',
    'metod',
    'participants',
    'sample',
    'muestra',
    'intervention',
    'intervenci',
    'results',
    'resultados',
    'discussion',
    'discusi',
    'conclusion',
    'conclusi',
    'limitations',
    'limitaciones',
    'p <',
    'p<',
  ]

  const scored = chunks
    .map((chunk, index) => {
      const lower = chunk.toLowerCase()
      let score = 0
      for (const keyword of keywords) {
        if (lower.includes(keyword)) score += 3
      }
      if (/\b\d+\b/.test(lower)) score += 1
      return { chunk, index, score }
    })
    .sort((a, b) => b.score - a.score)

  const selectedIndexes = new Set<number>()
  selectedIndexes.add(0)
  selectedIndexes.add(chunks.length - 1)
  for (const item of scored.slice(0, 10)) selectedIndexes.add(item.index)

  const selected = Array.from(selectedIndexes)
    .sort((a, b) => a - b)
    .map((index) => chunks[index])
    .join('\n\n')

  return truncateText(selected, limit)
}

