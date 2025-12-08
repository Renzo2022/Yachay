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

