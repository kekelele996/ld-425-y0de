import { apiPaths } from '../constants/apiPaths';
import { DesignPhase, DesignVersion } from '../types';
import { request } from '../utils/request';

export const designApi = {
  list: () => request.get<unknown, DesignPhase[]>(apiPaths.designs),
  versions: (id: string) => request.get<unknown, DesignVersion[]>(`${apiPaths.designs}/${id}/versions`),
  submit: (id: string, payload: { description: string; fileUrls: string[] }) => request.post<unknown, DesignPhase>(`${apiPaths.designs}/${id}/submit`, payload),
  review: (id: string, approved: boolean, comment: string) => request.post<unknown, DesignPhase>(`${apiPaths.designs}/${id}/review`, { approved, comment })
};
