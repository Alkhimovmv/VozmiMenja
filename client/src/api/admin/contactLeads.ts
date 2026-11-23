import apiClient from './client';
import type { ContactLead, LeadWorkflowUpdate } from '../../types';

interface ContactLeadsResponse {
  success: boolean;
  data: ContactLead[];
}

interface ContactLeadResponse {
  success: boolean;
  data: ContactLead;
}

const unwrapContactLeads = (response: ContactLead[] | ContactLeadsResponse): ContactLead[] =>
  Array.isArray(response) ? response : response.data;

const unwrapContactLead = (response: ContactLead | ContactLeadResponse): ContactLead =>
  'data' in response ? response.data : response;

export const contactLeadsApi = {
  getAll: async (): Promise<ContactLead[]> => {
    const response = await apiClient.get<ContactLead[] | ContactLeadsResponse>('/contact-leads');
    return unwrapContactLeads(response.data);
  },

  updateStatus: async (id: number, status: ContactLead['status']): Promise<ContactLead> => {
    const response = await apiClient.patch<ContactLead | ContactLeadResponse>(`/contact-leads/${id}/status`, { status });
    return unwrapContactLead(response.data);
  },

  updateWorkflow: async (id: number, workflow: LeadWorkflowUpdate): Promise<ContactLead> => {
    const response = await apiClient.patch<ContactLead | ContactLeadResponse>(`/contact-leads/${id}/workflow`, workflow);
    return unwrapContactLead(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/contact-leads/${id}`);
  },
};
