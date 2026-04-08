async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo completar la solicitud.');
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
