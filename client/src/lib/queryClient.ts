import { QueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// Lightweight fetch interceptor: automatically injects Bearer token for all /api requests
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (typeof url === "string" && url.startsWith("/api")) {
    const token = localStorage.getItem("access_token");
    if (token) {
      init = init || {};
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      init.headers = headers;
      console.log(`[Auth] Injecting Bearer token for ${url}`);
    } else {
      console.warn(`[Auth] No access_token found in localStorage for ${url}`);
    }
  }
  return originalFetch.call(this, input, init);
};

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Attach Bearer token if available in localStorage
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [endpoint] = queryKey as [string];
        return apiRequest(endpoint);
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});
