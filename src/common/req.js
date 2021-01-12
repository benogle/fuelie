// Use this to require node standard libs from the renderer or electron libs
//
// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300
export default function req (moduleName) {
  return typeof window === 'object'
    ? window.require(moduleName)
    : require(moduleName)
}
