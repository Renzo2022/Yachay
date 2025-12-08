import { createContext, useContext } from 'react'
import type { Project } from './types.ts'

type ProjectContextValue = {
  project: Project
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export const ProjectProvider = ProjectContext.Provider

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context.project
}
