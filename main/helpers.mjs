import { dialog } from 'electron'

export async function getFilesFromUser () {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    filters: [
      { name: 'Log files', extensions: ['csv', 'tsv', 'txt', 'llgx'] },
    ],
  })
  if (!result || result.canceled || !result.filePaths) {
    return null
  }
  return result.filePaths
}
