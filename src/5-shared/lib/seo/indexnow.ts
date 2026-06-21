/**
 * IndexNow — non-blocking URL submission to Bing and Yandex.
 * Call this from any API route that creates or updates public-facing content.
 * Reads INDEXNOW_KEY from env. If the key is not set, returns silently.
 * Never throws — all errors are caught and logged only.
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!key || urls.length === 0) return

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'saasofsaass.com'
  const host = rootDomain

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: urls,
      }),
    })
  } catch (err) {
    // Non-blocking: log only, never propagate
    console.error('[IndexNow] ping failed:', err)
  }
}
