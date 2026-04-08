async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { message: await response.text().catch(() => '') };

  if (!response.ok) {
    throw new Error(payload.message || `Solicitud fallida con código ${response.status}.`);
  }

  return payload;
}

export async function getAdminDashboardRequest(token) {
  const response = await fetch('/api/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}
