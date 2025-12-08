import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { firestore } from './firebase/firebase.ts'
import type { ExtractionData } from '../features/phase5_extraction/types.ts'

const projectsCollection = collection(firestore, 'projects')

const getProjectDoc = (projectId: string) => doc(projectsCollection, projectId)
const getExtractionCollection = (projectId: string) => collection(getProjectDoc(projectId), 'extraction_matrix')
const getIncludedCollection = (projectId: string) => collection(getProjectDoc(projectId), 'included_studies')

export const listenToExtractionMatrix = (
  projectId: string,
  callback: (entries: ExtractionData[]) => void,
): Unsubscribe => {
  return onSnapshot(getExtractionCollection(projectId), (snapshot) => {
    const entries = snapshot.docs.map((docSnapshot) => docSnapshot.data() as ExtractionData)
    callback(entries)
  })
}

export const saveExtractionEntry = async (projectId: string, data: ExtractionData) => {
  const extractionRef = doc(getExtractionCollection(projectId), data.id)
  const includedRef = doc(getIncludedCollection(projectId), data.studyId)

  await Promise.all([
    setDoc(extractionRef, data, { merge: true }),
    setDoc(
      includedRef,
      {
        extractionStatus: data.status === 'verified' ? 'verified' : 'extracted',
        extractionId: data.id,
      },
      { merge: true },
    ),
  ])
}
