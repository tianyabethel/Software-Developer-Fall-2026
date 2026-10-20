async function request(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Cannot reach the server. Make sure the backend is running on port 5000."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function fetchProperties(params = {}) {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return request(`/api/properties${suffix}`);
}

export async function fetchPropertyDetail(id) {
  if (!id) {
    throw new Error("A property listing ID is required.");
  }

  return request(`/api/properties/${encodeURIComponent(id)}`);
}
