function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return '/api/v1';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api/v1`;
}

const API_BASE = getApiBaseUrl();

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('System status error:', err);
    return {
      service_name: 'TraceXen API',
      version: '1.0.0',
      graph_name: 'TraceXenGraph',
      graph_host: 'Offline',
      tigergraph_connected: false,
      mock_fallback_active: false,
      backend_tests: 'OFFLINE',
      total_benchmark_cases: 20,
      sar_cases_count: 2,
      environment: 'OFFLINE'
    };
  }
}

export async function fetchCases() {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.cases || []);
}

export async function fetchCaseDetail(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchCaseGraph(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/graph`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function searchGraph(query) {
  const res = await fetch(`${API_BASE}/graph/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchBenchmarkSummary() {
  const res = await fetch(`${API_BASE}/benchmark/summary`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
