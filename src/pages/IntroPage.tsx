import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile, type Profile } from '../data/progress'
import { DoubleChevron } from '../components/Icons'
import { Logo } from '../components/Logo'
import { SiteMenu } from '../components/SiteMenu'
import { ArrowLink } from '../components/StageBar'
import { images } from '../data/images'
import './IntroPage.css'

export function IntroPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const ready = profile.player.trim().length > 0 && profile.house.trim().length > 0
  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch }
    setProfile(next)
    saveProfile(next)
  }

  return (
    <div className="intro">
      <img className="intro__photo" src={images.quake} alt="산비탈이 무너져 흙더미에 휩쓸린 마을과 부서진 집들" />
      <div aria-hidden="true" className="intro__shade" />

      <Logo />
      <SiteMenu variant="home" />

      <main className="intro__body container">
        <div className="intro__head">
          <span className="tag intro__tag">PROLOGUE</span>
          <h1 className="stroke-title intro__title">
            어느 날, 큰 지진으로
            <br />
            우리 집이 무너졌어요.
          </h1>
          <p className="caption">그리고 며칠 뒤, 한 통의 우편이 도착했습니다.</p>
        </div>

        <div className="intro__panels">
          <article className="intro__notice glass">
            <div className="intro__notice-top">
              <span className="intro__badge">재난 피해 주택 재건 지원</span>
              <span className="intro__receiver">수령인: {profile.player.trim() || '[플레이어 이름]'}</span>
            </div>
            <h2 className="intro__panel-title">재건 지원금 지급 통지서</h2>
            <p className="intro__notice-text">피해 가구의 빠른 일상 회복을 위해 아래 금액을 지급합니다. 원하시는 집을 자유롭게 지으세요.</p>
            <div className="intro__amount">
              <span>지급 금액</span>
              <strong>100억 원</strong>
            </div>
          </article>

          <form
            className="intro__form glass"
            onSubmit={(e) => {
              e.preventDefault()
              if (ready) navigate('/site')
            }}
          >
            <h2 className="intro__panel-title">새 집의 주인이 되어 주세요</h2>
            <div className="intro__fields">
              <label htmlFor="playerName" className="field">
                플레이어 이름
                <input
                  id="playerName"
                  type="text"
                  placeholder="예: 지윤"
                  autoComplete="nickname"
                  maxLength={12}
                  value={profile.player}
                  onChange={(e) => update({ player: e.target.value })}
                />
              </label>
              <label htmlFor="houseName" className="field">
                집 이름
                <input
                  id="houseName"
                  type="text"
                  placeholder="예: 호숫가의 봄"
                  maxLength={16}
                  value={profile.house}
                  onChange={(e) => update({ house: e.target.value })}
                />
              </label>
            </div>
            {ready ? (
              <button type="submit" className="btn btn--primary">
                재건 시작하기 <DoubleChevron />
              </button>
            ) : (
              <>
                <button type="button" className="btn" disabled>
                  재건 시작하기
                </button>
                <span className="intro__hint">두 칸을 모두 입력하면 시작할 수 있어요.</span>
              </>
            )}
          </form>
        </div>

        <div className="intro__story">
          <span className="intro__story-label">STORY</span>
          <div className="intro__story-track">
            <div className="intro__story-bar" />
          </div>
          <ArrowLink to="/site">건너뛰기</ArrowLink>
        </div>
      </main>
    </div>
  )
}
