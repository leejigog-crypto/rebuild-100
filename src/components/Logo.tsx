import { Link } from 'react-router-dom'
import './Logo.css'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="100억 리빌드 홈">
      <span className="logo__tag">LET'S BUILD</span>
      <span className="logo__amount">100억</span>
      <span className="logo__name">리빌드</span>
    </Link>
  )
}
