import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BuildPage } from './pages/BuildPage'
import { EstimatePage } from './pages/EstimatePage'
import { IntroPage } from './pages/IntroPage'
import { MainPage } from './pages/MainPage'
import { ResultPage } from './pages/ResultPage'
import { SitePage } from './pages/SitePage'

const titles: Record<string, string> = {
  '/': '메인',
  '/intro': '인트로',
  '/site': '부지 선택',
  '/estimate': '견적 확인',
  '/build': '시공 진행',
  '/result': '완공 결과',
}

/** Scrolls to `#hash` targets (or the top) after each navigation and keeps the tab title in sync. */
function RouteEffects() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = `100억 리빌드 · ${titles[pathname] ?? '메인'}`
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/site" element={<SitePage />} />
        <Route path="/estimate" element={<EstimatePage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<MainPage />} />
      </Routes>
    </>
  )
}
