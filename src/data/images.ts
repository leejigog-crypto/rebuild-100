import type { CSSProperties } from 'react'
import build from '../assets/images/build.png'
import city from '../assets/images/city.png'
import forest from '../assets/images/forest.png'
import lake from '../assets/images/lake.png'
import quake from '../assets/images/quake.jpg'
import sea from '../assets/images/sea.png'
import suburb from '../assets/images/suburb.png'

export const images = { build, city, forest, lake, quake, sea, suburb }

/** Background photo presets. `citycore` is a tight crop of the city photo. */
export type PhotoKey = 'sea' | 'suburb' | 'lake' | 'forest' | 'city' | 'citycore' | 'build'

export function photoStyle(key: PhotoKey): CSSProperties {
  if (key === 'citycore') {
    return { backgroundImage: `url(${city})`, backgroundSize: '260%', backgroundPosition: '92% 6%' }
  }
  return { backgroundImage: `url(${images[key]})` }
}
