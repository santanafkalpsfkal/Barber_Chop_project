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

export async function getCatalogRequest() {
  const response = await fetch('/api/catalog');
  return parseResponse(response);
}

export async function getAvailabilityRequest({ barberId, date, serviceId }) {
  const params = new URLSearchParams({
    barberId: String(barberId),
    date,
    serviceId: String(serviceId),
  });

  const response = await fetch(`/api/catalog/availability?${params.toString()}`);
  return parseResponse(response);
}