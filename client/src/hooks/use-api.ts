import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property, Audit, AuditItem } from "@shared/schema";

export function useProperties() {
  return useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("/properties"),
  });
}

export function useAudits(params?: { auditorId?: number; reviewerId?: number; propertyId?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.auditorId) queryParams.append('auditorId', params.auditorId.toString());
  if (params?.reviewerId) queryParams.append('reviewerId', params.reviewerId.toString());
  if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
  
  const endpoint = `/audits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useQuery({
    queryKey: ["/api/audits", params],
    queryFn: () => apiRequest(endpoint),
  });
}

export function useAuditItems(auditId: number) {
  return useQuery({
    queryKey: ["/api/audits", auditId, "items"],
    queryFn: () => apiRequest(`/audits/${auditId}/items`),
    enabled: !!auditId,
  });
}

export function useCreateAudit() {
  return useMutation({
    mutationFn: (audit: any) => apiRequest("/audits", {
      method: "POST",
      body: JSON.stringify(audit),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
    },
  });
}

export function useUpdateAudit() {
  return useMutation({
    mutationFn: ({ id, ...audit }: any) => apiRequest(`/audits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(audit),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
    },
  });
}

export function useCreateAuditItem() {
  return useMutation({
    mutationFn: ({ auditId, ...item }: any) => apiRequest(`/audits/${auditId}/items`, {
      method: "POST",
      body: JSON.stringify(item),
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits", variables.auditId, "items"] });
    },
  });
}

export function useUpdateAuditItem() {
  return useMutation({
    mutationFn: ({ id, ...item }: any) => apiRequest(`/audit-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(item),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
    },
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ["/api/properties", id],
    queryFn: () => apiRequest(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["/api/health"],
    queryFn: () => apiRequest("/health").catch(() => ({ status: "disconnected" })),
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });
}

// Add the missing exports that AIDemoPage needs
export function useReportGeneration() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("/ai/generate-report", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
    },
  });
}

export function useScoreSuggestion() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("/ai/score-suggestion", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });
}