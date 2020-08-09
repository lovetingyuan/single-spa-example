import config from './single-app.json'

export type AppNames = keyof typeof config

export interface Manifest {
  port: number
  mountPath: string
  publicPath?: string // default same with mountPath
  serve?: string // default "npm run serve"
  build?: string // default "npm run build"
  output?: string // default "dist"
  default?: boolean // default false
}

export interface NormalizedManifest extends Required<Manifest> {
  entry: string // full url to access index.html
}

export type NormalizedManifestMap = Record<AppNames, NormalizedManifest>
