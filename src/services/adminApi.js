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

export async function getAdminUsersRequest(token) {
  const response = await fetch('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function getAdminReservationsRequest(token) {
  const response = await fetch('/api/admin/reservations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function createAdminReservationRequest(token, payload) {
  const response = await fetch('/api/admin/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateAdminReservationRequest(token, reservationId, payload) {
  const response = await fetch(`/api/admin/reservations/${reservationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function deleteAdminReservationRequest(token, reservationId) {
  const response = await fetch(`/api/admin/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}
