import { create } from 'zustand'
import type { AppScreen, Recording } from './types'

interface AppStore {
  // Navigation
  screen: AppScreen
  setScreen: (screen: AppScreen) => void
  selectedRecordingId: string | null
  viewRecording: (id: string) => void

  // Recording state
  isRecording: boolean
  setIsRecording: (v: boolean) => void
  recordingDuration: number
  setRecordingDuration: (v: number) => void
  audioLevel: number
  setAudioLevel: (v: number) => void

  // Current capture flow
  currentAudioBlob: Blob | null
  setCurrentAudioBlob: (blob: Blob | null) => void
  processingStatus: 'idle' | 'uploading' | 'transcribing' | 'ready' | 'error'
  setProcessingStatus: (s: AppStore['processingStatus']) => void
  currentRecording: Recording | null
  setCurrentRecording: (r: Recording | null) => void

  // Recordings list
  recordings: Recording[]
  setRecordings: (r: Recording[]) => void
  prependRecording: (r: Recording) => void
  updateRecording: (id: string, patch: Partial<Recording>) => void

  // Connectivity
  isOnline: boolean
  setIsOnline: (v: boolean) => void

  // Reset after save
  resetCapture: () => void
}

export const useAppStore = create<AppStore>()((set) => ({
  screen: 'record',
  setScreen: (screen) => set({ screen }),
  selectedRecordingId: null,
  viewRecording: (id) => set({ screen: 'detail', selectedRecordingId: id }),

  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
  recordingDuration: 0,
  setRecordingDuration: (recordingDuration) => set({ recordingDuration }),
  audioLevel: 0,
  setAudioLevel: (audioLevel) => set({ audioLevel }),

  currentAudioBlob: null,
  setCurrentAudioBlob: (currentAudioBlob) => set({ currentAudioBlob }),
  processingStatus: 'idle',
  setProcessingStatus: (processingStatus) => set({ processingStatus }),
  currentRecording: null,
  setCurrentRecording: (currentRecording) => set({ currentRecording }),

  recordings: [],
  setRecordings: (recordings) => set({ recordings }),
  prependRecording: (r) => set((s) => ({ recordings: [r, ...s.recordings] })),
  updateRecording: (id, patch) =>
    set((s) => ({
      recordings: s.recordings.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      currentRecording:
        s.currentRecording?.id === id ? { ...s.currentRecording, ...patch } : s.currentRecording,
    })),

  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),

  resetCapture: () =>
    set({
      currentAudioBlob: null,
      processingStatus: 'idle',
      currentRecording: null,
      recordingDuration: 0,
      audioLevel: 0,
    }),
}))
