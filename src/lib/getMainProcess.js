// Modern IPC-based approach to replace deprecated remote module
// This provides the same API as the original getMainProcess but uses IPC

let mainProcessAPI = null

export default function getMainProcess () {
  if (!mainProcessAPI) {
    const { ipcRenderer } = window.require('electron')

    mainProcessAPI = {
      openFile: async () => {
        try {
          return await ipcRenderer.invoke('open-file')
        } catch (error) {
          console.error('Failed to open file:', error)
        }
      },

      openUserConfig: async () => {
        try {
          return await ipcRenderer.invoke('open-user-config')
        } catch (error) {
          console.error('Failed to open user config:', error)
        }
      },
    }
  }

  return mainProcessAPI
}
