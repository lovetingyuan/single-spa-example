import SingleSpa, { LifeCycles } from 'single-spa'

export interface Config {
  port: number
  mountPath: string
  publicPath?: string // default same with mountPath
  output?: string // default "dist"
  default?: boolean // default false
}

export interface NormalizedConfig extends Required<Config> {
  entry: string // full url to access index.html
  serve: string
  build: string
}

export type NormalizedConfigs = Record<string, NormalizedConfig>

export interface SingleApp {
  startApp: (appName: string, lifecycles: LifeCycles) => void,
  singleSpa: typeof SingleSpa,
  singleAppConfig: NormalizedConfigs
}
