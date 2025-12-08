import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { firestore } from './firebase/firebase.ts'
import type { SynthesisData, SynthesisTheme } from '../features/phase6_synthesis/types.ts'
import { createDefaultSynthesis } from '../features/phase6_synthesis/types.ts'

const projectsCollection = collection(firestore, 'projects')

const getProjectDoc = (projectId: string) => doc(projectsCollection, projectId)
const getSynthesisDoc = (projectId: string) => doc(collection(getProjectDoc(projectId), 'synthesis'), 'state')

export const listenToSynthesisData = (projectId: string, callback: (data: SynthesisData) => void): Unsubscribe => {
  return onSnapshot(getSynthesisDoc(projectId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(createDefaultSynthesis())
      return
    }
    callback({ ...createDefaultSynthesis(), ...(snapshot.data() as SynthesisData) })
  })
}

export const saveSynthesisData = async (projectId: string, data: Partial<SynthesisData>) => {
  await setDoc(getSynthesisDoc(projectId), data, { merge: true })
}

export const upsertTheme = async (projectId: string, theme: SynthesisTheme) => {
  await setDoc(
    getSynthesisDoc(projectId),
    {
      themes: [{ ...theme }],
    },
    { merge: true },
  )
}
