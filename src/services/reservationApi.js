async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo completar la solicitud.');
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
