import { toast } from './toast'

/** 공개된 집을 볼 수 있는 주소 (예: https://…/rebuild-100/h/<id>) */
export function houseShareUrl(id: string): string {
  return new URL(`${import.meta.env.BASE_URL}h/${id}`, window.location.origin).toString()
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export async function copyShareLink(url: string) {
  const ok = await copyText(url)
  toast(ok ? '링크를 복사했어요!' : '복사하지 못했어요. 주소를 길게 눌러 복사해 주세요.', ok ? 'ok' : 'error')
}

/** X(트위터) 글쓰기 창을 새 탭으로 엽니다. */
export function shareToX(url: string, text: string) {
  const intent = new URL('https://twitter.com/intent/tweet')
  intent.searchParams.set('text', text)
  intent.searchParams.set('url', url)
  window.open(intent.toString(), '_blank', 'noopener,noreferrer')
}

/**
 * 카카오톡·인스타그램: 휴대폰의 공유 창(Web Share)을 띄웁니다.
 * 공유 창이 없는 PC에서는 링크를 복사하고 붙여 넣으라고 안내합니다.
 */
export async function shareWithApp(url: string, text: string, appName: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title: '100억 리빌드', text, url })
      return
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return
    }
  }
  const ok = await copyText(`${text} ${url}`)
  toast(ok ? `링크를 복사했어요. ${appName}에 붙여 넣어 주세요!` : '복사하지 못했어요.', ok ? 'ok' : 'error')
}
