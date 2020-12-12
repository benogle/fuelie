
let mainProcess = null
export default function getMainProcess () {
  if (!mainProcess) {
    const { remote } = window.require('electron')
    mainProcess = remote.require('./index.js')
  }
  return mainProcess
}
