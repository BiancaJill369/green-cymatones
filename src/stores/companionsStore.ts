import { create } from 'zustand'

/**
 * Shared live state for the two ambient characters (Shadowmoss the cat +
 * the gardener) so each can react to the other's position, and so an
 * occasional coordinated rendezvous can be choreographed between them.
 */
export type RendezvousType = 'pet' | 'figure8' | 'sit_together' | 'iam'

export interface Rendezvous {
  initiator: 'cat' | 'gardener'
  type: RendezvousType
  x: number // meet-up point (left %)
}

interface CompanionsState {
  catX: number
  gardenerX: number
  rendezvous: Rendezvous | null
  setCatX: (x: number) => void
  setGardenerX: (x: number) => void
  startRendezvous: (r: Rendezvous) => void
  endRendezvous: () => void
}

export const useCompanionsStore = create<CompanionsState>((set) => ({
  catX: 12,
  gardenerX: 55,
  rendezvous: null,
  setCatX: (x) => set({ catX: x }),
  setGardenerX: (x) => set({ gardenerX: x }),
  startRendezvous: (r) => set({ rendezvous: r }),
  endRendezvous: () => set({ rendezvous: null }),
}))
