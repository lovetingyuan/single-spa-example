import SingleSpa, { LifeCycles } from 'single-spa'
import { NormalizedManifest, NormalizedManifestMap } from './types'

declare global {
  interface Window {
    singleApp: {
      startApp: (appName: string, lifecycles: LifeCycles) => void,
      singleSpa: typeof SingleSpa,
      appManifests: NormalizedManifestMap
    }
  }
}

// declare var singleApp: {
//   startApp: (appName: string, lifecycles: LifeCycles) => void,
//   singleSpa: typeof SingleSpa,
//   appManifests: NormalizedManifestMap
// }
