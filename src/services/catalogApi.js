async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo completar la solicitud.');
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