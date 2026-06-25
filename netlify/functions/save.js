exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const body = JSON.parse(event.body)
  const password = (body.password || '').trim()

  if (password !== (process.env.ADMIN_PASSWORD || '').trim()) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Wrong password' }) }
  }

  const token = process.env.GH_TOKEN
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GitHub token not configured' }) }
  }

  const { files = [], deletes = [] } = body
  const results = []
  const GH_HEADERS = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
  const repoPath = (p) => `https://api.github.com/repos/khamid9/portfolio/contents/${p}`

  for (const item of files) {
    try {
      const url = repoPath(item.path)
      const getRes = await fetch(url, { headers: GH_HEADERS })
      const existing = getRes.ok ? await getRes.json() : null
      const content = item.encoding === 'base64'
        ? item.content
        : Buffer.from(item.content).toString('base64')

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: { ...GH_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Update ${item.path} via admin`,
          content,
          sha: existing ? existing.sha : undefined,
          branch: 'main'
        })
      })

      results.push({
        path: item.path,
        status: putRes.ok ? 'ok' : 'error',
        error: putRes.ok ? null : await putRes.text()
      })
    } catch (e) {
      results.push({ path: item.path, status: 'error', error: e.message })
    }
  }

  for (const item of deletes) {
    try {
      const url = repoPath(item.path)
      const getRes = await fetch(url, { headers: GH_HEADERS })
      if (!getRes.ok) {
        results.push({ path: item.path, status: 'error', error: 'Not found' })
        continue
      }
      const existing = await getRes.json()
      const delRes = await fetch(url, {
        method: 'DELETE',
        headers: { ...GH_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Delete ${item.path} via admin`,
          sha: existing.sha,
          branch: 'main'
        })
      })

      results.push({
        path: item.path,
        status: delRes.ok ? 'deleted' : 'error',
        error: delRes.ok ? null : await delRes.text()
      })
    } catch (e) {
      results.push({ path: item.path, status: 'error', error: e.message })
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  }
}
