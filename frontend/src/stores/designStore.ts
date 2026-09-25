import { create } from 'zustand';
import { designApi } from '../api/design';
import { DesignPhase, DesignVersion } from '../types';

interface DesignState {
  designs: DesignPhase[];
  versionsByPhase: Record<string, DesignVersion[]>;
  fetchDesigns: () => Promise<void>;
  fetchVersions: (phaseId: string) => Promise<void>;
  submitDesign: (id: string, description: string, fileUrls: string[]) => Promise<void>;
  reviewDesign: (id: string, approved: boolean, comment: string) => Promise<void>;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  versionsByPhase: {},
  async fetchDesigns() {
    set({ designs: await designApi.list() });
  },
  async fetchVersions(phaseId) {
    const versions = await designApi.versions(phaseId);
    set({ versionsByPhase: { ...get().versionsByPhase, [phaseId]: versions } });
  },
  async submitDesign(id, description, fileUrls) {
    await designApi.submit(id, { description, fileUrls });
    await Promise.all([get().fetchDesigns(), get().fetchVersions(id)]);
  },
  async reviewDesign(id, approved, comment) {
    await designApi.review(id, approved, comment);
    await Promise.all([get().fetchDesigns(), get().fetchVersions(id)]);
  }
}));
