// Unset in production: same-origin `/api` calls are routed to the backend by the ingress.
// Dev server falls back to the backend running directly on :8080.
const apiBase =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '')

async function asJson(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `request failed: ${res.status}`)
  }
  return res.json()
}

export function getSets() {
  return fetch(`${apiBase}/api/sets`).then(asJson)
}

export function getRandomCard(setId) {
  const query = setId ? `?setId=${encodeURIComponent(setId)}` : ''
  return fetch(`${apiBase}/api/cards/random${query}`).then(asJson)
}

export function submitAnswer({ id, setId, correct, filterSetId }) {
  return fetch(`${apiBase}/api/cards/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, setId, correct, filterSetId }),
  }).then(asJson)
}

export function uploadSet({ file, mode, name, setId }) {
  const form = new FormData()
  form.append('file', file)
  form.append('mode', mode)
  if (mode === 'new') form.append('name', name)
  if (mode === 'merge') form.append('setId', setId)
  return fetch(`${apiBase}/api/sets/upload`, { method: 'POST', body: form }).then(asJson)
}

export function deleteSet(id) {
  return fetch(`${apiBase}/api/sets/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) throw new Error(`request failed: ${res.status}`)
  })
}

export function getSetDownloadUrl(id) {
  return `${apiBase}/api/sets/${encodeURIComponent(id)}/download`
}
