# 100억 리빌드

국가 재건 지원금 100억 원으로 무너진 집을 다시 짓는 재건 시뮬레이션 웹 게임입니다.

**플레이:** https://leejigog-crypto.github.io/rebuild-100/

## 화면

| 경로 | 화면 |
|---|---|
| `/` | 메인 |
| `/intro` | 인트로 |
| `/site` | 2단계 · 부지 선택 |
| `/estimate` | 3단계 · 견적 확인 |
| `/build` | 4단계 · 시공 진행 (공정마다 돌발 상황 2~3번) |
| `/result` | 5단계 · 완공 결과 (예산 초과 시 준공 실패) |

## 개발

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
```

Vite + React + TypeScript. `npm run deploy` 로 빌드해서 `gh-pages` 브랜치에 올리면 GitHub Pages에 반영됩니다.

- 디자인 토큰: `src/styles/tokens.css`
- 공통 컴포넌트: `src/components/`
- 화면: `src/pages/`
- 게임 데이터: `src/data/` (돌발 상황은 `buildEvents.ts`)
