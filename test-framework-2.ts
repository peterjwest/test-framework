import { promises as fs } from 'fs'
import childProcess from 'child_process'
import { isEqual, calledWith, not, throws, mock } from 'pugstrel'
import { expect } from 'jest'

import { main, throwException, batchReadEndpoints } from './downloadUpdate'

// npm install seed-random

interface Test<Mocks extends object, Data extends object> {
  (mocks: Mocks, data: Data): void
}

interface Config {
  processIsolation?: boolean
  setupIsolation?: boolean
  randomOrder?: boolean | string
}

type Setup<Mocks extends object, Data extends object> = SetupAll<Mocks, Data> | SetupOnlyData<Data> | SetupOnlyMocks<Mocks> | SetupNone

interface SetupAll<Mocks extends object, Data extends object> extends SetupCommon {
  mocks: () => Mocks | Promise<Mocks>
  before: () => Data | Promise<Data>
  between?: (data: Data) => void
  after?: (data: Data) => void
}

interface SetupOnlyData<Data extends object> extends SetupCommon {
  before: () => Data | Promise<Data>
  between?: (data: Data) => void
  after?: (data: Data) => void
}

interface SetupOnlyMocks<Mocks extends object> extends SetupCommon {
  mocks: () => Mocks | Promise<Mocks>
  between?: (data: {}) => void
  after?: (data: {}) => void
}

interface SetupNone extends SetupCommon {
  between?: (data: {}) => void
  after?: (data: {}) => void
}

interface SetupCommon {
  beforeEach?: boolean
  serialOnly?: boolean
}

interface Suite<Mocks extends object, Data extends object> {
  setup: Setup<Mocks, Data>
  content: { [name: string]: Group<any, Mocks, any, Data> | Test<Mocks, Data> }
}

interface Group<Mocks extends object, ParentMocks extends object, Data extends object, ParentData extends object> {
  setup: Setup<Mocks, Data>
  content: { [name: string]: Group<any, ParentMocks & Mocks, any, ParentData & Data> | Test<ParentMocks & Mocks, ParentData & Data> }
}

class SuiteHelper<ParentMocks extends object, ParentData extends object> {
  createGroup<Mocks extends object, Data extends object>(
    setup: SetupAll<Mocks, Data>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, ParentData & Data>) => {
      [name: string]: Group<any, ParentMocks & Mocks, any, ParentData & Data> | Test<ParentMocks & Mocks, ParentData & Data>
    },
  ): Group<Mocks, ParentMocks, Data, ParentData>
  createGroup(
    setup: SetupNone,
    spec: (suite: SuiteHelper<ParentMocks, ParentData>) => {
      [name: string]: Group<any, ParentMocks, any, ParentData> | Test<ParentMocks, ParentData>
    },
  ): Group<{}, ParentMocks, {}, ParentData>
  createGroup<Data extends object>(
    setup: SetupOnlyData<Data>,
    spec: (suite: SuiteHelper<ParentMocks, ParentData & Data>) => {
      [name: string]: Group<any, ParentMocks, any, ParentData & Data> | Test<ParentMocks, ParentData & Data>
    },
  ): Group<{}, ParentMocks, Data, ParentData>
  createGroup<Mocks extends object>(
    setup: SetupOnlyMocks<Mocks>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, ParentData>) => {
      [name: string]: Group<any, ParentMocks & Mocks, any, ParentData> | Test<ParentMocks & Mocks, ParentData>
    },
  ): Group<Mocks, ParentMocks, {}, ParentData>
  createGroup<Mocks extends object, Data extends object>(
    setup: Setup<Mocks, Data>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, ParentData & Data>) => {
      [name: string]: Group<any, ParentMocks & Mocks, any, ParentData & Data> | Test<ParentMocks & Mocks, ParentData & Data>
    },
  ): Group<Mocks, ParentMocks, Data, ParentData> {
    return { setup, content: spec(new SuiteHelper()) }
  }
}

function createSuite<Mocks extends object, Data extends object>(
  setup: SetupAll<Mocks, Data>,
  spec: (suite: SuiteHelper<Mocks, Data>) => { [name: string]: Group<any, Mocks, any, Data> | Test<Mocks, Data> },
): Suite<Mocks, Data>
function createSuite<Data extends object>(
  setup: SetupOnlyData<Data>,
  spec: (suite: SuiteHelper<{}, Data>) => { [name: string]: Group<any, {}, any, Data> | Test<{}, Data> },
): Suite<{}, Data>
function createSuite<Mocks extends object>(
  setup: SetupOnlyMocks<Mocks>,
  spec: (suite: SuiteHelper<Mocks, {}>) => { [name: string]: Group<any, Mocks, any, {}> | Test<Mocks, {}> },
): Suite<Mocks, {}>
function createSuite(
  setup: SetupNone,
  spec: (suite: SuiteHelper<{}, {}>) => { [name: string]: Group<any, {}, any, {}> | Test<{}, {}> },
): Suite<{}, {}>
function createSuite<Mocks extends object, Data extends object>(
  setup: Setup<Mocks, Data>,
  spec: (suite: SuiteHelper<Mocks, Data>) => { [name: string]: Group<any, Mocks, any, Data> | Test<Mocks, Data> },
): Suite<Mocks, Data> {
  return { setup, content: spec(new SuiteHelper<Mocks, Data>()) }
}

const jest: any = {}
const dependencies: any = {}

export default createSuite({
  mocks: () => ({
    exec: 1,
    unlink: 2,
  }),
  before: () => {
    dependencies.createData()
    return { now: '123456789', source: 'src', data: 'foobar' }
  },
  after: (data) => dependencies.deleteData(data),
  beforeEach: true,
}, (suite) => ({
  'install_test': suite.createGroup({
    after: () => {},
  }, (suite) => ({
    'Throws an exception': (mocks, data) => {
      expect(data.now).toEqual(1)
      throws(() => throwException())
    },
  })),
  'download_test': suite.createGroup({
    mocks: () => ({
      patchEndpointState: jest.spyOn(dependencies, 'patchEndpointState').mockResolvedValue(undefined),
    }),
    before: () => ({ blah: 123 }),
  }, (suite) => ({
    'batchReadEndpoints': suite.createGroup({
    }, (suite) => ({
      'Does the thing it is meant to': async (mocks, data) => {
        const message = {
          id: '123',
          type: 'batchReadEndpoints',
          epoch: data.now,
          source: data.source + '-invalid',
          payload: {
            endpoints: [data.data],
          },
        }
        await expect(batchReadEndpoints(data.data, message)).resolves.toBe(data.data)
        expect(mocks.patchEndpointState).toBeCalledTimes(0)
        expect(mocks.exec).not.toHaveBeenCalled()
      },
    })),
    'batchReadEndpoints2': suite.createGroup({
      before: () => ({
        x: 1,
      }),
    }, (suite) => ({
      'Throws an exception': (mocks, data) => {
        expect(data.x).toEqual(1)
        throws(() => throwException())
      },
    })),
  })),
}))
