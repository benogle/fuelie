let mainProcess = null
export default function getMainProcess () {
  if (!mainProcess) {
    mainProcess = {
      openFile: () => window.electron.send('open-file'),
      openUserConfig: () => window.electron.send('open-user-config'),
    }
  }
  return mainProcess
}
