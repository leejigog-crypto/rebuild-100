export type ToastMessage = { id: number; text: string; tone: 'ok' | 'error' }

export const TOAST_EVENT = 'rebuild:toast'
let nextId = 0

/** 화면 아래 가운데에 잠깐 뜨는 알림 (<Toaster />가 표시). 어디서든 호출할 수 있습니다. */
export function toast(text: string, tone: ToastMessage['tone'] = 'ok') {
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: { id: nextId++, text, tone } }))
}
