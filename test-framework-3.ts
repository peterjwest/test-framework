import { promises as fs } from 'fs'
import childProcess from 'child_process'
import { isEqual, calledWith, not, throws, mock } from 'pugstrel'
import { expect } from 'jest'

import { main, throwException, batchReadEndpoints } from './downloadUpdate'

const jest: any = {}
const dependencies: any = {}

// npm install seed-random

interface Test<Mocks extends object, Data extends object> {
  (mocks: Mocks, data: Data): void
}

interface Config {
  processIsolation?: boolean
  setupIsolation?: boolean
  randomOrder?: boolean | string
}

type Setup<
  Mocks extends object,
  DataOnce extends object,
  DataEach extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object
> = (
  SetupAll<Mocks, DataOnce, DataEach, ParentDataOnce, ParentDataEach> |
  SetupNoMocks<DataOnce, DataEach, ParentDataOnce, ParentDataEach> |
  SetupNoDataEach<Mocks, DataOnce, ParentDataOnce, ParentDataEach> |
  SetupNoDataOnce<Mocks, DataEach, ParentDataOnce, ParentDataEach> |
  SetupOnlyMocks<Mocks, ParentDataOnce, ParentDataEach> |
  SetupOnlyEach<DataEach, ParentDataOnce, ParentDataEach> |
  SetupOnlyOnce<DataOnce, ParentDataOnce, ParentDataEach> |
  SetupNone<ParentDataOnce, ParentDataEach>
)

interface SetupAll<
  Mocks extends object,
  DataOnce extends object,
  DataEach extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once: {
    before: (data: ParentDataOnce) => DataOnce | Promise<DataOnce>
    after?: (data: DataOnce) => void
  }
  each: {
    before: (data: DataOnce & ParentDataEach) => DataEach | Promise<DataEach>
    between?: (data: DataEach) => void
    after?: (data: DataEach) => void
  }
  mocks: (data: DataEach) => Mocks | Promise<Mocks>
}

interface SetupNoMocks<
  DataOnce extends object,
  DataEach extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once: {
    before: (data: ParentDataOnce) => DataOnce | Promise<DataOnce>
    after?: (data: DataOnce) => void
  }
  each: {
    before: (data: DataOnce & ParentDataEach) => DataEach | Promise<DataEach>
    between?: (data: DataEach) => void
    after?: (data: DataEach) => void
  }
}

interface SetupNoDataEach<
  Mocks extends object,
  DataOnce extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once: {
    before: (data: ParentDataOnce) => DataOnce | Promise<DataOnce>
    after?: (data: DataOnce) => void
  }
  each?: {
    between?: (data: DataOnce & ParentDataEach) => void
    after?: (data: DataOnce) => void
  }
  mocks: (data: DataOnce) => Mocks | Promise<Mocks>
}

interface SetupNoDataOnce<
  Mocks extends object,
  DataEach extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once?: {
    after?: (data: ParentDataOnce) => void
  }
  each: {
    before: (data: ParentDataOnce & ParentDataEach) => DataEach | Promise<DataEach>
    between?: (data: DataEach) => void
    after?: (data: DataEach) => void
  }
  mocks: (data: DataEach) => Mocks | Promise<Mocks>
}

interface SetupOnlyMocks<
  Mocks extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once?: {
    after?: (data: ParentDataOnce) => void
  }
  each?: {
    between?: (data: ParentDataOnce & ParentDataEach) => void
    after?: (data: ParentDataOnce & ParentDataEach) => void
  }
  mocks: (data: ParentDataOnce & ParentDataEach) => Mocks | Promise<Mocks>
}

interface SetupOnlyEach<
  DataEach extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once?: {
    after?: (data: ParentDataOnce) => void
  }
  each: {
    before: (data: ParentDataOnce & ParentDataEach) => DataEach | Promise<DataEach>
    between?: (data: DataEach) => void
    after?: (data: DataEach) => void
  }
}

interface SetupOnlyOnce<
  DataOnce extends object,
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once: {
    before: (data: ParentDataOnce) => DataOnce | Promise<DataOnce>
    after?: (data: DataOnce) => void
  }
  each?: {
    between?: (data: DataOnce & ParentDataEach) => void
    after?: (data: DataOnce & ParentDataEach) => void
  }
}

interface SetupNone<
  ParentDataOnce extends object,
  ParentDataEach extends object,
> extends SetupCommon {
  once?: {
    after?: (data: ParentDataOnce) => void
  }
  each?: {
    between?: (data: ParentDataOnce & ParentDataEach) => void
    after?: (data: ParentDataOnce & ParentDataEach) => void
  }
}

interface SetupCommon {
  beforeEach?: boolean
  serialOnly?: boolean
}


interface Suite<Mocks extends object, DataOnce extends object, DataEach extends object> {
  setup: Setup<Mocks, DataOnce, DataEach, {}, {}>
  content: { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> }
}

interface Group<Mocks extends object, DataOnce extends object, DataEach extends object, ParentMocks extends object, ParentDataOnce extends object, ParentDataEach extends object> {
  setup: Setup<Mocks, DataOnce, DataEach, ParentDataOnce, ParentDataEach>
  content: { [name: string]: Group<any, any, any, ParentMocks & Mocks, DataOnce, DataEach> | Test<ParentMocks & Mocks, DataOnce & DataEach> }
}

class SuiteHelper<ParentMocks extends object, ParentDataOnce extends object, ParentDataEach extends object> {
  createGroup<Mocks extends object, DataOnce extends object, DataEach extends object>(
    setup: SetupAll<Mocks, DataOnce, DataEach, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, DataOnce, DataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks & Mocks, DataOnce, DataEach> | Test<ParentMocks & Mocks, DataOnce & DataEach>
    },
  ): Group<Mocks, DataOnce, DataEach, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<DataOnce extends object, DataEach extends object>(
    setup: SetupNoMocks<DataOnce, DataEach, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks, DataOnce, DataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks, DataOnce, DataEach> | Test<ParentMocks, DataOnce & DataEach>
    },
  ): Group<{}, DataOnce, DataEach, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<Mocks extends object, DataOnce extends object>(
    setup: SetupNoDataEach<Mocks, DataOnce, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, DataOnce, ParentDataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks & Mocks, DataOnce, ParentDataEach> | Test<ParentMocks & Mocks, DataOnce & ParentDataEach>
    },
  ): Group<Mocks, DataOnce, {}, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<Mocks extends object, DataEach extends object>(
    setup: SetupNoDataOnce<Mocks, DataEach, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, ParentDataOnce, DataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks & Mocks, ParentDataOnce, DataEach> | Test<ParentMocks & Mocks, ParentDataOnce & DataEach>
    },
  ): Group<Mocks, {}, DataEach, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<Mocks extends object>(
    setup: SetupOnlyMocks<Mocks, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, ParentDataOnce, ParentDataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks & Mocks, ParentDataOnce, ParentDataEach> | Test<ParentMocks & Mocks, ParentDataOnce & ParentDataEach>
    },
  ): Group<Mocks, {}, {}, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<DataEach extends object>(
    setup: SetupOnlyEach<DataEach, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks, ParentDataOnce, DataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks, ParentDataOnce, DataEach> | Test<ParentMocks, ParentDataOnce & DataEach>
    },
  ): Group<{}, {}, DataEach, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup<DataOnce extends object>(
    setup: SetupOnlyOnce<DataOnce, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks, DataOnce, ParentDataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks, DataOnce, ParentDataEach> | Test<ParentMocks, DataOnce & ParentDataEach>
    },
  ): Group<{}, DataOnce, {}, ParentMocks, ParentDataOnce, ParentDataEach>
  createGroup(
    setup: SetupNone<ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks, ParentDataOnce, ParentDataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks, ParentDataOnce, ParentDataEach> | Test<ParentMocks, ParentDataOnce & ParentDataEach>
    },
  ): Group<{}, {}, {}, ParentMocks, ParentDataOnce, ParentDataEach>

  createGroup<Mocks extends object, DataOnce extends object, DataEach extends object>(
    setup: Setup<Mocks, DataOnce, DataEach, ParentDataOnce, ParentDataEach>,
    spec: (suite: SuiteHelper<ParentMocks & Mocks, DataOnce, DataEach>) => {
      [name: string]: Group<any, any, any, ParentMocks & Mocks, DataOnce, DataEach> | Test<ParentMocks & Mocks, DataOnce & DataEach>
    },
  ): Group<Mocks, DataOnce, DataEach, ParentMocks, ParentDataOnce, ParentDataEach> {
    return { setup, content: spec(new SuiteHelper()) }
  }
}

function createSuite<Mocks extends object, DataOnce extends object, DataEach extends object>(
  setup: SetupAll<Mocks, DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> },
): Suite<Mocks, DataOnce, DataEach>
function createSuite<DataOnce extends object, DataEach extends object>(
  setup: SetupNoMocks<DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<{}, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, {}, DataOnce, DataEach> | Test<{}, DataOnce & DataEach> },
): Suite<{}, DataOnce, DataEach>
function createSuite<Mocks extends object, DataOnce extends object>(
  setup: SetupNoDataEach<Mocks, DataOnce, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, {}>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, {}> | Test<Mocks, DataOnce> },
): Suite<Mocks, DataOnce, {}>
function createSuite<Mocks extends object, DataEach extends object>(
  setup: SetupNoDataOnce<Mocks, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, {}, DataEach>) => { [name: string]: Group<any, any, any, Mocks, {}, DataEach> | Test<Mocks, DataEach> },
): Suite<Mocks, {}, DataEach>
function createSuite<Mocks extends object>(
  setup: SetupOnlyMocks<Mocks, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, {}, {}>) => { [name: string]: Group<any, any, any, Mocks, {}, {}> | Test<Mocks, {}> },
): Suite<Mocks, {}, {}>
function createSuite<DataEach extends object>(
  setup: SetupOnlyEach<DataEach, {}, {}>,
  spec: (suite: SuiteHelper<{}, {}, DataEach>) => { [name: string]: Group<any, any, any, {}, {}, DataEach> | Test<{}, DataEach> },
): Suite<{}, {}, DataEach>
function createSuite<DataOnce extends object>(
  setup: SetupOnlyOnce<DataOnce, {}, {}>,
  spec: (suite: SuiteHelper<{}, DataOnce, {}>) => { [name: string]: Group<any, any, any, {}, DataOnce, {}> | Test<{}, DataOnce> },
): Suite<{}, DataOnce, {}>
function createSuite(
  setup: SetupNone<{}, {}>,
  spec: (suite: SuiteHelper<{}, {}, {}>) => { [name: string]: Group<any, any, any, {}, {}, {}> | Test<{}, {}> },
): Suite<{}, {}, {}>

function createSuite<Mocks extends object, DataOnce extends object, DataEach extends object>(
  setup: Setup<Mocks, DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> },
): Suite<Mocks, DataOnce, DataEach> {
  return { setup, content: spec(new SuiteHelper<Mocks, DataOnce, DataEach>()) }
}

// TODO:
// - Make data extend from previous

export default createSuite({
  mocks: () => ({
    exec: 1,
    unlink: 2,
  }),
  each: {
    before: () => {
      dependencies.createData()
      return { now: '123456789', source: 'src', data: 'foobar' }
    },
    after: (data) => dependencies.deleteData(data),
  },
}, (suite) => ({
  'install_test': suite.createGroup({
  each: {
    after: () => {},
  }

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
    once: {
      before: () => ({ blah: 123 }),
    },
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
      each: {
        before: ({ now }) => ({
          x: 1,
          now,
        }),
      },
    }, (suite) => ({
      'Throws an exception': (mocks, data) => {
        expect(data.x).toEqual(1)
        throws(() => throwException())
      },
    })),
  })),
}))
