import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BuildPage } from './pages/BuildPage'
import { EstimatePage } from './pages/EstimatePage'
import { IntroPage } from './pages/IntroPage'
import { MainPage } from './pages/MainPage'
import { ResultPage } from './pages/ResultPage'
import { SitePage } from './pages/SitePage'
import { GalleryPage } from './pages/GalleryPage'
import { HousePage } from './pages/HousePage'
import { MyHousesPage } from './pages/MyHousesPage'
import { Toaster } from './components/Toaster'
import { restoreProgressFromServer } from './data/progress'

const titles: Record<string, string> = {
  '/': '메인',
  '/intro': '인트로',
  '/site': '부지 선택',
  '/estimate': '견적 확인',
  '/build': '시공 진행',
  '/result': '완공 결과',
  '/gallery': '갤러리',
  '/my': '내 집',
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
  // 이 브라우저 저장소가 비었는데 서버 저장본이 있으면 되살립니다.
  useEffect(() => {
    void restoreProgressFromServer()
  }, [])

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
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/my" element={<MyHousesPage />} />
        <Route path="/h/:id" element={<HousePage />} />
        <Route path="*" element={<MainPage />} />
      </Routes>
      <Toaster />
    </>
  )
}
