import { vi, expect } from 'vitest'
import sinon from 'sinon'
import * as chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(sinonChai)
chai.use(chaiAsPromised)

// Make vitest globals available
globalThis.vi = vi
globalThis.expect = expect
globalThis.describe = globalThis.describe
globalThis.it = globalThis.it
globalThis.test = globalThis.test

// Keep chai and sinon for existing tests
globalThis.chai = chai
globalThis.sinon = sinon
globalThis.should = chai.should()

// Mock window for Electron-dependent tests
globalThis.window = {
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  }
}
