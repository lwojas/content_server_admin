const configuredBaseUrl = import.meta.env.VITE_CONTENT_SERVER_URL || "";

export const defaultBaseUrl = configuredBaseUrl.replace(/\/$/, "");

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload?.error ? payload.error : payload;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function createContentApi(baseUrl = defaultBaseUrl) {
  return {
    getProjects: () => request(baseUrl, "/api/projects"),
    getDocuments: (project, type) =>
      request(
        baseUrl,
        `/api/projects/${encodeURIComponent(project)}/${encodeURIComponent(type)}`,
      ),
    getDocument: (project, type, name) =>
      request(
        baseUrl,
        `/api/projects/${encodeURIComponent(project)}/${encodeURIComponent(type)}/${encodeURIComponent(name)}`,
      ),
    saveDocument: (project, type, name, document) =>
      request(
        baseUrl,
        `/api/projects/${encodeURIComponent(project)}/${encodeURIComponent(type)}/${encodeURIComponent(name)}`,
        {
          method: "PUT",
          body: JSON.stringify(document),
        },
      ),
  };
}
