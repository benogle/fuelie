const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

const path = require('path')
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, '..', '..', 'src'))
appModulePath.addPath(path.join(__dirname, '..', '..'))

chai.use(sinonChai)
chai.use(chaiAsPromised)

global.chai = chai
global.sinon = sinon
global.expect = chai.expect
global.should = chai.should()
