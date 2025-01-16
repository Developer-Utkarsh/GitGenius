import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Repository } from '@/types/github'

interface GitHubStore {
  userData: any
  repositories: Repository[]
  stats: any
  rawApiData: {
    profile?: any
    repos?: any[]
    events?: any[]
    contributions?: any
    languages?: any
    activity?: any
  }
  setUserData: (data: any) => void
  setRepositories: (repos: Repository[]) => void
  setStats: (stats: any) => void
  setRawApiData: (key: keyof GitHubStore['rawApiData'], data: any) => void
  clearStore: () => void
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set) => ({
      userData: null,
      repositories: [],
      stats: null,
      rawApiData: {},
      setUserData: (data) => set({ userData: data }),
      setRepositories: (repos) => set({ repositories: repos }),
      setStats: (stats) => set({ stats: stats }),
      setRawApiData: (key, data) => 
        set((state) => ({
          rawApiData: {
            ...state.rawApiData,
            [key]: data
          }
        })),
      clearStore: () => set({
        userData: null,
        repositories: [],
        stats: null,
        rawApiData: {}
      })
    }),
    {
      name: 'github-store',
    }
  )
)
