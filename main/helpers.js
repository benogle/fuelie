import { dialog } from 'electron'

export async function getFilesFromUser () {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    filters: [
      { name: 'CSV Files', extensions: ['csv', 'tsv', 'txt'] },
    ],
  })
  if (!result || result.canceled || !result.filePaths) {
    return null
  }
  return result.filePaths
}
