import { create } from 'zustand';
import { designApi } from '../api/design';
import { DesignPhase, DesignSubmission, SubmitDesignPayload } from '../types';

interface DesignState {
  designs: DesignPhase[];
  fetchDesigns: () => Promise<void>;
  fetchSubmissions: (phaseId: string) => Promise<DesignSubmission[]>;
  submitDesign: (id: string, payload: SubmitDesignPayload) => Promise<void>;
  reviewDesign: (id: string, approved: boolean, comment?: string) => Promise<void>;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  async fetchDesigns() {
    set({ designs: await designApi.list() });
  },
  async fetchSubmissions(phaseId) {
    return designApi.submissions(phaseId);
  },
  async submitDesign(id, payload) {
    await designApi.submit(id, payload);
    await get().fetchDesigns();
  },
  async reviewDesign(id, approved, comment) {
    await designApi.review(id, approved, comment ?? (approved ? '方案确认通过' : '请按审核意见调整后重新提交'));
    await get().fetchDesigns();
  }
}));
