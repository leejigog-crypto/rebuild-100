import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BigChevrons, DoubleChevron, PixelCloud } from '../components/Icons'
import { Logo } from '../components/Logo'
import { SiteMenu } from '../components/SiteMenu'
import { heroSlides, levelSteps, popularHouses, regionRows } from '../data/game'
import { loadHouseName } from '../data/progress'
import { photoStyle } from '../data/images'
import './MainPage.css'

const tickerWords = Array.from({ length: 8 }, () => "LET'S BUILD")

export function MainPage() {
  // TODO(기능): 슬라이드 전환. 지금은 첫 장면(호숫가)만 보여 줍니다.
  const slideIndex = 0
  const slide = heroSlides[slideIndex]
  const [houseName] = useState(loadHouseName)

  return (
    <div className="main-page">
      <section aria-label="소개" className="hero">
        <div role="img" aria-label={slide.alt} className="hero__photo photo" style={photoStyle(slide.photo)} />
        <div aria-hidden="true" className="hero__night" />
        <div aria-hidden="true" className="hero__moon" />
        <div aria-hidden="true" className="hero__floor" />

        <Logo />
        <SiteMenu variant="home" />

        <div className="hero__inner container">
          <div className="hero__card glass">
            <h1 className="hero__title">
              국가 재건 지원금 <span>100억 원</span>으로
              <br />
              꿈꾸던 집을 완성해 보세요.
            </h1>
            <div className="hero__cta">
              <Link to="/intro" className="btn btn--primary hero__start">
                새 집 짓기 <DoubleChevron />
              </Link>
              <Link to="/site" className="hero__continue">
                이어하기 · {houseName}
              </Link>
            </div>
          </div>

          <div className="hero__pager">
            <span className="hero__count">
              0{slideIndex + 1}
              <span>/0{heroSlides.length}</span>
            </span>
            <div className="hero__track">
              <div className="hero__bar" />
            </div>
            <div className="hero__arrows">
              <button type="button" aria-label="이전 집 사진">
                <BigChevrons direction="left" />
              </button>
              <button type="button" aria-label="다음 집 사진">
                <BigChevrons direction="right" />
              </button>
            </div>
          </div>
          <div className="hero__captions">
            <span className="caption">어두운 밤이 지나면, 다시 지을 집이 기다립니다.</span>
            <span className="hero__place">
              {slide.region} · {slide.caption}
            </span>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="ticker">
        <div className="marquee">
          {[...tickerWords, ...tickerWords].map((word, i) => (
            <span key={i} className="ticker__item">
              <span className="ticker__amount">100억</span>
              <span className="ticker__word">{word}</span>
            </span>
          ))}
        </div>
      </div>

      <section id="steps" className="steps container">
        <h2 className="stroke-title steps__title">5단계로 LEVEL UP!</h2>
        <p className="steps__lead">한 판에 약 20~30분. 단계가 지날수록 공사 현장은 점점 뜨거워져요.</p>
        <div className="steps__grid">
          {levelSteps.map((s) => (
            <div key={s.no} className="step-card" style={{ background: s.bg, color: s.fg, transform: `rotate(${s.tilt}deg)` }}>
              <span className="step-card__lv">LV.{s.no}</span>
              <strong className="step-card__title">{s.title}</strong>
              <span className="step-card__desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="지역 둘러보기" className="regions">
        {regionRows.map((row, r) => {
          const items = Array.from({ length: 6 }, (_, j) => j)
          return (
            <div key={row.word} className="regions__row">
              <div className={`marquee marquee--slow${r % 2 ? ' marquee--reverse' : ''}`}>
                {[...items, ...items].map((j, k) => (
                  <span key={k} className="regions__item" aria-hidden={k >= items.length || undefined}>
                    <span className="regions__word">{row.word}</span>
                    <span
                      role="img"
                      aria-label={row.alt}
                      className="regions__thumb photo"
                      style={{ ...photoStyle(row.photo), transform: `rotate(${j % 2 === 0 ? -3 : 3}deg)` }}
                    />
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <div aria-hidden="true" className="wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" width="100%" height="120">
          <path d="M0 70 C 240 10, 420 10, 660 60 S 1080 120, 1440 30 L1440 120 L0 120 Z" fill="#00A7E2" stroke="#2B2A27" strokeWidth="4" />
        </svg>
      </div>

      <section id="gallery" className="gallery">
        <PixelCloud className="gallery__cloud gallery__cloud--a" width={120} height={48} />
        <PixelCloud className="gallery__cloud gallery__cloud--b" width={90} height={36} />
        <div className="gallery__inner container">
          <div className="gallery__head">
            <div>
              <h2 className="stroke-title gallery__title">지금 인기 있는 집</h2>
              <p className="gallery__lead">다른 사람들은 100억으로 어떤 집을 지었을까요?</p>
            </div>
            <a href="#gallery" className="btn btn--accent btn--sm">
              갤러리 더보기 <DoubleChevron color="#2B2A27" width={22} height={16} />
            </a>
          </div>
          <div className="gallery__grid">
            {popularHouses.map((h) => (
              <a key={h.name} href="#gallery" className="house-card">
                <div role="img" aria-label={h.alt} className="house-card__photo photo" style={photoStyle(h.photo)} />
                <div className="house-card__body">
                  <div className="house-card__top">
                    <strong className="house-card__name">{h.name}</strong>
                    <span className="house-card__grade" aria-label={`${h.grade}등급`}>
                      {h.grade}
                    </span>
                  </div>
                  <span className="house-card__meta">
                    {h.region} · {h.maker} · 좋아요 {h.likes}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div aria-hidden="true" className="site-footer__ticker">
          <div className="marquee marquee--slow">
            {[...tickerWords, ...tickerWords].map((word, i) => (
              <span key={i} className="ticker__item">
                <span className="site-footer__word">{word}</span>
                <span className="site-footer__amount">100억</span>
              </span>
            ))}
          </div>
        </div>
        <div className="site-footer__bottom container">
          <nav aria-label="하단 메뉴" className="site-footer__nav">
            <a href="#steps">게임 소개</a>
            <a href="#gallery">갤러리</a>
            <a href="#gallery">랭킹</a>
            <a href="#gallery">내 집</a>
          </nav>
          <span className="site-footer__legal">100억 리빌드 · 재건 시뮬레이션 웹 게임 · 이용약관 · 개인정보처리방침</span>
        </div>
      </footer>
    </div>
  )
}
