import { housePhotoUrl } from '../data/houses'
import { copyShareLink, houseShareUrl, shareToX, shareWithApp } from '../lib/share'
import { Dialog } from './Dialog'
import { SmallCloseIcon } from './Icons'
import './ShareDialog.css'

type Props = {
  houseId: string
  houseName: string
  grade: string
  total: number
  title: string
  photo: string
  onClose: () => void
}

/** "자랑하기" 창: 공유 카드 미리보기, 링크 복사, 카카오톡·인스타그램·X */
export function ShareDialog({ houseId, houseName, grade, total, title, photo, onClose }: Props) {
  const url = houseShareUrl(houseId)
  const text = `100억으로 지은 내 집 "${houseName}" ${grade}등급! 너도 지어 볼래?`

  return (
    <Dialog titleId="shareTitle" maxWidth={480} offsetTop={220} onClose={onClose}>
      <div className="share-dialog__head">
        <h2 id="shareTitle" className="share-dialog__title">
          자랑하기
        </h2>
        <button type="button" className="dialog__close" aria-label="닫기" onClick={onClose}>
          <SmallCloseIcon />
        </button>
      </div>
      <div className="share-dialog__body">
        <div className="share-card">
          <div className="share-card__photo photo" aria-hidden="true" style={{ backgroundImage: `url(${housePhotoUrl(photo)})` }} />
          <div className="share-card__text">
            <strong>
              {houseName} · {grade}등급
            </strong>
            <span className="share-card__score">
              종합 {total}점 · {title}
            </span>
            <span className="share-card__pitch">100억으로 지은 내 집, 너도 지어 볼래?</span>
          </div>
        </div>
        <div className="share-dialog__link">
          <label htmlFor="shareLink" className="sr-only">
            공유 링크
          </label>
          <input id="shareLink" type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={() => copyShareLink(url)}>
            링크 복사
          </button>
        </div>
        <div className="share-dialog__channels">
          <button type="button" onClick={() => shareWithApp(url, text, '카카오톡')}>
            카카오톡
          </button>
          <button type="button" onClick={() => shareWithApp(url, text, '인스타그램')}>
            인스타그램
          </button>
          <button type="button" onClick={() => shareToX(url, text)}>
            X
          </button>
        </div>
      </div>
    </Dialog>
  )
}
