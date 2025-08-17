// Renderer-side file service that communicates with main process via IPC
// This replaces direct Node.js fs access in the renderer

class FileService {
  constructor () {
    // Get ipcRenderer from the preload script
    this.ipcRenderer = window.ipcRenderer
    if (!this.ipcRenderer) {
      throw new Error('ipcRenderer not available. Make sure preload script is loaded.')
    }
  }

  /**
   * Read and parse a CSV file via main process
   * @param {string} filename - Path to the CSV file
   * @returns {Promise<{data: Array, headers: Array, length: number}>}
   */
  async readCSVFile (filename) {
    try {
      return await this.ipcRenderer.invoke('read-csv-file', filename)
    } catch (error) {
      console.error('Error reading CSV file via IPC:', error)
      throw error
    }
  }

  /**
   * Read a binary file via main process
   * @param {string} filename - Path to the file
   * @returns {Promise<Buffer>}
   */
  async readBinaryFile (filename) {
    try {
      const result = await this.ipcRenderer.invoke('read-binary-file', filename)
      // Convert ArrayBuffer back to Buffer for compatibility
      return Buffer.from(result)
    } catch (error) {
      console.error('Error reading binary file via IPC:', error)
      throw error
    }
  }

  /**
   * Check if a file exists via main process
   * @param {string} filename - Path to check
   * @returns {Promise<boolean>}
   */
  async fileExists (filename) {
    try {
      return await this.ipcRenderer.invoke('file-exists', filename)
    } catch (error) {
      console.error('Error checking file existence via IPC:', error)
      return false
    }
  }

  /**
   * Get file stats via main process
   * @param {string} filename - Path to the file
   * @returns {Promise<object>}
   */
  async getFileStats (filename) {
    try {
      return await this.ipcRenderer.invoke('get-file-stats', filename)
    } catch (error) {
      console.error('Error getting file stats via IPC:', error)
      throw error
    }
  }
}

// Export singleton instance
export default new FileService()
