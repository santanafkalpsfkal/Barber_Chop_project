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

export async function createReservationRequest(reservation, token) {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(reservation),
  });

  return parseResponse(response);
}

export async function getMyReservationsRequest(token) {
  const response = await fetch('/api/reservations/mine', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}
