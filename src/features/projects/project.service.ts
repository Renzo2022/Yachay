import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { firestore } from '../../services/firebase/firebase.ts'
import type { Project } from './types.ts'
import { createProjectDefaults } from './types.ts'
import type { Phase1Data } from '../phase1_planning/types.ts'
import type { ExternalPaper } from '../phase2_search/types.ts'

const projectsCollection = collection(firestore, 'projects')

const mapProjectDoc = (snapshot: QueryDocumentSnapshot<DocumentData>) => snapshot.data() as Project

export const createProject = async (userId: string, data: Partial<Project>) => {
  const projectDoc = doc(projectsCollection)
  const timestamp = Date.now()
  const project: Project = createProjectDefaults({
    ...data,
    id: projectDoc.id,
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await setDoc(projectDoc, project)
  return project
}

export const getUserProjects = async (userId: string) => {
  const q = query(projectsCollection, where('userId', '==', userId), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapProjectDoc)
}

export const listenToProjects = (userId: string, callback: (projects: Project[]) => void): Unsubscribe => {
  const q = query(projectsCollection, where('userId', '==', userId), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(mapProjectDoc)
    callback(items)
  })
}

const getProjectDocRef = (projectId: string) => doc(projectsCollection, projectId)

export const listenToProject = (projectId: string, callback: (project: Project | null) => void): Unsubscribe => {
  const projectRef = getProjectDocRef(projectId)
  return onSnapshot(projectRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }
    callback(snapshot.data() as Project)
  })
}

export const updateProjectPhase1 = async (projectId: string, phase1: Phase1Data) => {
  const projectRef = getProjectDocRef(projectId)
  await updateDoc(projectRef, {
    phase1,
    updatedAt: Date.now(),
  })
}

export const saveProjectCandidates = async (projectId: string, papers: ExternalPaper[]) => {
  const candidatesCollection = collection(getProjectDocRef(projectId), 'candidates')
  const timestamp = Date.now()
  await Promise.all(
    papers.map((paper) =>
      setDoc(
        doc(candidatesCollection, paper.id),
        {
          ...paper,
          savedAt: timestamp,
        },
        { merge: true },
      ),
    ),
  )
  await updateDoc(getProjectDocRef(projectId), {
    updatedAt: Date.now(),
  })
}
