import { Config, NormalizedConfigs } from './types'

export default function normalizeConfig(manifestMap: Record<string, Config>) {
  const normalizedManifestMap: NormalizedConfigs = {} as NormalizedConfigs
  const publicPathes = new Set()
  Object.entries(manifestMap).forEach(([name, manifest]) => {
    if (name[0] === '_') return
    const _manifest = normalizedManifestMap[name] = {
      publicPath: '', serve: '', build: '', output: '', entry: '', default: false,
      ...manifest
    }
    let publicPath = manifest.publicPath || manifest.mountPath
    if (publicPath === '/') { // publicPath can not be '/'
      publicPath = '/' + name + '/'
    } else if (!publicPath.endsWith('/')) {
      publicPath += '/'
    }
    if (!publicPathes.has(publicPath)) {
      publicPathes.add(publicPath)
    } else {
      throw new Error(`publicPath: ${publicPath} of ${name} has existed.`)
    }
    _manifest.publicPath = publicPath
    _manifest.entry = 'http://localhost:' + manifest.port + publicPath
    _manifest.default = !!manifest.default
    _manifest.output = manifest.output || 'dist'
  })
  return normalizedManifestMap
}
