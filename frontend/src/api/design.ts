import { apiPaths } from '../constants/apiPaths';
import { DesignPhase, DesignSubmission, SubmitDesignPayload } from '../types';
import { request } from '../utils/request';

export const designApi = {
  list: () => request.get<unknown, DesignPhase[]>(apiPaths.designs),
  submissions: (id: string) =>
    request.get<unknown, DesignSubmission[]>(`${apiPaths.designs}/${id}/submissions`),
  submit: (id: string, payload: SubmitDesignPayload) =>
    request.post<unknown, DesignSubmission>(`${apiPaths.designs}/${id}/submit`, payload),
  review: (id: string, approved: boolean, comment: string) =>
    request.post<unknown, DesignSubmission>(`${apiPaths.designs}/${id}/review`, { approved, comment })
};
