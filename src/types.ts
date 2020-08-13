import config from './single-app.json'
import SingleSpa, { LifeCycles } from 'single-spa'

export type AppNames = keyof typeof config

export interface Manifest {
  port: number
  mountPath: string
  publicPath?: string // default same with mountPath
  output?: string // default "dist"
  default?: boolean // default false
}

export interface NormalizedManifest extends Required<Manifest> {
  entry: string // full url to access index.html
  serve: string
  build: string
}

export type NormalizedManifestMap = Record<AppNames, NormalizedManifest>


export interface SingleApp {
  startApp: (appName: AppNames, lifecycles: LifeCycles) => void,
  singleSpa: typeof SingleSpa,
  appManifests: NormalizedManifestMap
}
