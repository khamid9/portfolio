exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const { password, files } = JSON.parse(event.body)

  if (password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Wrong password' }) }
  }

  const token = process.env.GH_TOKEN
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GitHub token not configured' }) }
  }

  const results = []
  for (const item of files) {
    const url = `https://api.github.com/repos/khamid9/portfolio/contents/${item.path}`
    const getRes = await fetch(url, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    })
    const existing = getRes.ok ? await getRes.json() : null
    const body = {
      message: `Update ${item.path} via admin`,
      content: Buffer.from(item.content).toString('base64'),
      sha: existing ? existing.sha : undefined,
      branch: 'main'
    }
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    results.push({
      path: item.path,
      status: putRes.ok ? 'ok' : 'error',
      error: putRes.ok ? null : await putRes.text()
    })
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  }
}
