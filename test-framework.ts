import { promises as fs } from 'fs'
import childProcess from 'child_process'
import { isEqual, calledWith, not, throws, mock } from 'pugstrel'

import { main, throwException } from './downloadUpdate'

// interface Test<Data extends Object> {
//   (data: Data): void
// }

// -----------------------------------------------------------
// Class version:

// class SuiteClass<Mocks extends Object, ParentMocks extends Object> {
//   public tests: { [name: string]: Test<Mocks & ParentMocks> }
//   public mocks: () => Mocks
//   public groups: { [name: string]: {
//     tests: { [name: string]: Test<any> }
//     mocks: () => any
//   } }

//   constructor(parentMocks: ParentMocks, spec: {
//     tests: { [name: string]: Test<Mocks & ParentMocks> }
//     mocks: () => Mocks
//   }) {
//     this.tests = spec.tests
//     this.mocks = spec.mocks
//   }

//   public addGroup<GroupMocks extends Object>(name: string, spec: {
//     tests: { [name: string]: Test<Mocks & GroupMocks> }
//     mocks: () => GroupMocks
//   }) {
//     this.groups[name] = spec
//   }
// }

// const suiteInstance = new SuiteClass({}, {
//   mocks: () => ({
//     exec: mock(childProcess, 'exec').resolves(null),
//     unlink: mock(fs, 'unlink').resolves(),
//   }),
//   tests: {
//     'Executes the download command, then return with a 0 exit code, if checksum is correct': async (mocks) => {
//       const contentSha = '0'.repeat(128)

//       mocks.exec.case(1).resolves({
//         stderrData: [],
//         stdoutData: [`${contentSha} test-file`],
//       })

//       const params = { timeoutHours: '2', contentSha, contentLength: '100' }
//       isEqual(await main([JSON.stringify(params)]), 0)

//       calledWith(mocks.exec, ([
//         [`wget 'https://assets/test.zip'`],
//         ['sha512sum /home/vocovo/controller-apps/test.zip'],
//       ]))

//       not(calledWith)(mocks.unlink, ['/home/vocovo/controller-apps/test.zip'])
//     },
//     'Throws an exception': async () => {
//       throws(() => throwException())
//     },
//   },
// })

// suiteInstance.addGroup('foo bar', {
//   mocks: () => ({ foo: 'bar' }),
//   tests: { x: (mocks) => {}}
// })

// -----------------------------------------------------------
// Functional version:

// interface Suite<Mocks extends Object, ParentMocks extends Object> {
//   tests: { [name: string]: Test<Mocks & ParentMocks> }
//   mocks: (() => Mocks)
// }

// export function createSuite<Mocks extends Object, ParentMocks extends () => Object> (data: Suite<Mocks, ReturnType<ParentMocks>>, parentMocks?: ParentMocks) {
//   return data
// }

// const parent = createSuite({ tests: {}, mocks: () => ({ foo: 'bar' }) })

// export const suite = createSuite({
//   mocks: () => ({
//     exec: mock(childProcess, 'exec').resolves(null),
//     unlink: mock(fs, 'unlink').resolves(),
//   }),
//   tests: {
//     'Executes the download command, then return with a 0 exit code, if checksum is correct': async (mocks) => {
//       const contentSha = '0'.repeat(128)

//       mocks.exec.case(1).resolves({
//         stderrData: [],
//         stdoutData: [`${contentSha} test-file`],
//       })

//       const params = { timeoutHours: '2', contentSha, contentLength: '100' }
//       isEqual(await main([JSON.stringify(params)]), 0)

//       calledWith(mocks.exec, ([
//         [`wget 'https://assets/test.zip'`],
//         ['sha512sum /home/vocovo/controller-apps/test.zip'],
//       ]))

//       not(calledWith)(mocks.unlink, ['/home/vocovo/controller-apps/test.zip'])
//     },
//     'Throws an exception': async () => {
//       throws(() => throwException())
//     },
//   },
// }, parent.mocks)

// -----------------------------------------------------------
// Prototyping:

// interface Suite<Mocks extends Object> {
//   tests: { [name: string]: Test<Mocks> }
//   mocks: () => Mocks
// }

// interface Fixture<Data extends Object> {
//   before: () => Data
//   after?: (data: Data) => void
// }

// function createFixture<Data extends Object>(data: Fixture<Data>) {
//   return data
// }

// const mocks = createFixture({
//   before: () => ({
//     exec: mock(childProcess, 'exec').resolves(null),
//     unlink: mock(fs, 'unlink').resolves(),
//   }),
//   after: (mocks) => {
//   },
// })

// const mocks2 = createFixture({
//   before: () => ({
//     foo: 'bar',
//   }),
//   after: (mocks) => {
//   },
// })

// const mocks3 = createFixture({
//   before: () => ({
//     zim: 'gir',
//   }),
//   after: (mocks) => {
//   },
// })

// export function createSuite(name: string, fixtures: [], tests: { [name: string]: Test<{}> }): void;
// export function createSuite<Data1 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>],
//   tests: { [name: string]: Test<Data1> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>, Fixture<Data2>],
//   tests: { [name: string]: Test<Data1 & Data2> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object, Data3 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>],
//   tests: { [name: string]: Test<Data1 & Data2 & Data3> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>],
//   tests: { [name: string]: Test<Data1 & Data2 & Data3 & Data4> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>],
//   tests: { [name: string]: Test<Data1 & Data2 & Data3 & Data4 & Data5> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object, Data6 extends Object>(
//   name: string,
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>, Fixture<Data6>],
//   tests: { [name: string]: Test<Data1 & Data2 & Data3 & Data4 & Data5 & Data6> }): void;
// export function createSuite<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object, Data6 extends Object>(
//   name: string,
//   fixtures:
//     [] |
//     [Fixture<Data1>] |
//     [Fixture<Data1>, Fixture<Data2>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>, Fixture<Data6>],
//   tests: { [name: string]: Test<Data1 & Data2 & Data3 & Data4 & Data5> }) {
// }

// createSuite('foo bar', [mocks, mocks2], {
//   'Executes the download command, then return with a 0 exit code, if checksum is correct': async (mocks) => {
//     const contentSha = '0'.repeat(128)

//     mocks.exec.case(1).resolves({
//       stderrData: [],
//       stdoutData: [`${contentSha} test-file`],
//     })

//     const params = { timeoutHours: '2', contentSha, contentLength: '100' }
//     isEqual(await main([JSON.stringify(params)]), 0)

//     calledWith(mocks.exec, ([
//       [`wget 'https://assets/test.zip'`],
//       ['sha512sum /home/vocovo/controller-apps/test.zip'],
//     ]))

//     not(calledWith)(mocks.unlink, ['/home/vocovo/controller-apps/test.zip'])
//   },
//   'Throws an exception': async () => {
//     throws(() => throwException())
//   },
// })

// export function useFixtures(fixtures: [], test: (data: {}) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object>(
//   fixtures: [Fixture<Data1>],
//   test: (data: Data1) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object>(
//   fixtures: [Fixture<Data1>, Fixture<Data2>],
//   test: (data: Data1 & Data2) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object, Data3 extends Object>(
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>],
//   test: (data: Data1 & Data2 & Data3) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object>(
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>],
//   test: (data: Data1 & Data2 & Data3 & Data4) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object>(
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>],
//   test: (data: Data1 & Data2 & Data3 & Data4 & Data5) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object, Data6 extends Object>(
//   fixtures: [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>, Fixture<Data6>],
//   test: (data: Data1 & Data2 & Data3 & Data4 & Data5 & Data6) => void): { fixtures: typeof fixtures, test: typeof test };
// export function useFixtures<Data1 extends Object, Data2 extends Object, Data3 extends Object, Data4 extends Object, Data5 extends Object, Data6 extends Object>(
//   fixtures:
//     [] |
//     [Fixture<Data1>] |
//     [Fixture<Data1>, Fixture<Data2>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>] |
//     [Fixture<Data1>, Fixture<Data2>, Fixture<Data3>, Fixture<Data4>, Fixture<Data5>, Fixture<Data6>],
//     test: (data: Data1 & Data2 & Data3 & Data4 & Data5 & Data6) => void) {
//     return { fixtures, test }
// }

// const suite = {
//   'Executes the download command, then return with a 0 exit code, if checksum is correct': useFixtures([mocks, mocks2], async (mocks) => {
//     const contentSha = '0'.repeat(128)

//     mocks.exec.case(1).resolves({
//       stderrData: [],
//       stdoutData: [`${contentSha} test-file`],
//     })

//     const params = { timeoutHours: '2', contentSha, contentLength: '100' }
//     isEqual(await main([JSON.stringify(params)]), 0)

//     calledWith(mocks.exec, ([
//       [`wget 'https://assets/test.zip'`],
//       ['sha512sum /home/vocovo/controller-apps/test.zip'],
//     ]))

//     not(calledWith)(mocks.unlink, ['/home/vocovo/controller-apps/test.zip'])
//   }),
//   'Throws an exception': useFixtures([mocks], async () => {
//     throws(() => throwException())
//   }),
// }

// ------------------------------------------------------------

// const mockLogger = createFixture({
//   before: () => ({
//     logger: {
//       error: jest.spyOn(dependencies.logger, 'error').mockReturnValue(undefined),
//       info: jest.spyOn(dependencies.logger, 'info').mockReturnValue(undefined),
//       debug: jest.spyOn(dependencies.logger, 'debug').mockReturnValue(undefined),
//     }
//   }),
//   after: (data) => {
//     data.logger.error.resetMock()
//     data.logger.info.resetMock()
//     data.logger.debug.resetMock()
//   },
// })

// const mockModels = createFixture({
//   before: () => ({
//     patchEndpointState: jest.spyOn(dependencies, 'patchEndpointState').mockResolvedValue(undefined),
//     endpointStateUpdate: jest.spyOn(dependencies.EndpointState, 'update').mockResolvedValue(undefined),
//     endpointFindAll: jest.spyOn(dependencies.Endpoint, 'findAll').mockResolvedValue([]),
//   }),
//   after: (data) => {
//     data.patchEndpointState.resetMock()
//     data.endpointStateUpdate.resetMock()
//     data.endpointFindAll.resetMock()
//   },
// })

// const createData = createFixture({
//   before: () => ({
//     now: 1777000111,
//     source: 'controller/11:22:33:44:55:66',
//     data: {
//       VOCO_V002: {
//         groupId: 'mock-group',
//         id: 'a349cd44-453a-49a1-8d96-481172f08de1',
//         deviceId: 'VOCO_V002',
//         ipui: '025EE145CB',
//       },
//     },
//     VOCO_V001: {
//       id: 'VOCO_V001',
//       category: 'headset',
//       displayName: 'VocoVoice 1',
//       ipui: '025EE10963',
//       defaultConference: '01',
//     },
//     VOCO_V002: {
//       id: 'VOCO_V002',
//       category: 'headset',
//       displayName: 'VocoVoice 2',
//       ipui: '025EE145CB',
//       defaultConference: '01',
//     },
//     service: {
//       find: jest.fn(),
//       create: jest.fn(),
//       remove: jest.fn(),
//       patch: jest.fn(),
//     },
//     app: {
//       service: () => service,
//       ddStatsD: {
//         increment: jest.fn(),
//       },
//     },
//     context: { app },
//   }),
// })

// const createData = createFixture({
//   before: () => ({
//     now: 1777000111,
//     source: 'controller/11:22:33:44:55:66',
//     data: {
//       VOCO_V002: {
//         groupId: 'mock-group',
//         id: 'a349cd44-453a-49a1-8d96-481172f08de1',
//         deviceId: 'VOCO_V002',
//         ipui: '025EE145CB',
//       },
//     },
//     VOCO_V001: {
//       id: 'VOCO_V001',
//       category: 'headset',
//       displayName: 'VocoVoice 1',
//       ipui: '025EE10963',
//       defaultConference: '01',
//     },
//     VOCO_V002: {
//       id: 'VOCO_V002',
//       category: 'headset',
//       displayName: 'VocoVoice 2',
//       ipui: '025EE145CB',
//       defaultConference: '01',
//     },
//   })
// })

// const createService = createFixture({
//   before: () => {
//     const service = {
//       find: jest.fn(),
//       create: jest.fn(),
//       remove: jest.fn(),
//       patch: jest.fn(),
//     }
//     return {
//       context: {
//         app: {
//           service: () => service,
//           ddStatsD: { increment: jest.fn() },
//         } ,
//       },
//     }
//   }
// })

// const suites = {
//   'should fail early if no location provided': useFixtures([mockLogger, mockModels, createData, createService], async (data) => {
//     const message = {
//       id: '123',
//       type: 'batchReadEndpoints',
//       epoch: data.now,
//       source: data.source + '-invalid',
//       payload: {
//         endpoints: [data.VOCO_V001],
//       },
//     }
//     await expect(batchReadEndpoints(<any>data.context, message)).resolves.toBe(data.context)
//     expect(service.find).toBeCalledTimes(0)
//     expect(app.ddStatsD.increment).not.toHaveBeenCalled()
//   }),

//   'should create new endpoints': useFixtures([mockLogger, mockModels, createData, createService], async (data) => {
//     const message = {
//       id: '123',
//       type: 'batchReadEndpoints',
//       epoch: data.now,
//       source: data.source,
//       payload: {
//         endpoints: [data.VOCO_V001, data.VOCO_V002],
//       },
//     }
//     service.find.mockResolvedValue({ data: [] })
//     await expect(batchReadEndpoints(<any>data.context, message)).resolves.toBe(data.context)

//     expect(dependencies.patchEndpointState).toBeCalledTimes(1)
//     expect(data.context.app.ddStatsD.increment).toHaveBeenCalledWith('batchReadEndpoints_ok')
//   }),

//   'should remove endpoints': useFixtures([mockLogger, mockModels, createData, createService], async (data) => {
//     const message = {
//       id: '123',
//       type: 'batchReadEndpoints',
//       epoch: data.now,
//       source: data.source,
//       payload: {
//         endpoints: [data.VOCO_V001],
//       },
//     }
//     service.find.mockResolvedValue({ data: [data.VOCO_V001, data.VOCO_V002] })
//     await expect(batchReadEndpoints(<any>data.context, message)).resolves.toBe(data.context)

//     expect(dependencies.EndpointState.update).toBeCalledTimes(1)
//     expect(dependencies.patchEndpointState).toBeCalledTimes(1)
//     expect(app.ddStatsD.increment).toHaveBeenCalledWith('batchReadEndpoints_ok')
//   }),
// }

// ----------------------------------------------------------------------------------------

interface Test<Data> {
  (data: Data): void
}

interface Suite<Mocks, ParentMocks> {
  mocks: (() => Mocks & ParentMocks)
  content: { [name: string]: Suite<any, Mocks & ParentMocks> | Test<Mocks & ParentMocks> }
}

function createSuite<Mocks extends Object>(
  mocks: [() => Mocks],
  inner: (suite: { mocks: () => Mocks }) => { [name: string]: Suite<any, Mocks> | Test<Mocks> },
): Suite<Mocks, {}> {
  const suite = { mocks: mocks[0] }
  return { ...suite, content: inner(suite)}
}

function createGroup<Mocks extends Object, ParentMocks extends Object>(
  parentGroup: { mocks: () => ParentMocks },
  mocks: [() => Mocks],
  inner: (group: { mocks: () => Mocks & ParentMocks }) => { [name: string]: Suite<any, Mocks & ParentMocks> | Test<Mocks & ParentMocks> },
): Suite<Mocks, ParentMocks> {
  const group = { mocks: () => ({ ...parentGroup.mocks(), ...mocks[0]() } }
  return { ...group, content: inner(group)}
}

const jest: any = {}
const dependencies: any = {}

const mockFileSystem = () => ({
  exec: mock(childProcess, 'exec').resolves(null),
  unlink: mock(fs, 'unlink').resolves(),
})

const mockEndpointState = () => ({
  patchEndpointState: jest.spyOn(dependencies, 'patchEndpointState').mockResolvedValue(undefined),
})

const mockEndpoint = () => ({
  endpointFindAll: jest.spyOn(dependencies.Endpoint, 'findAll').mockResolvedValue([]),
})

createSuite([mockFileSystem], (suite) => ({
  'download_test': createGroup(suite, [mockEndpointState], (group) => ({
    'Equals expected mocks': (mocks) => {
      isEqual(mocks.exec, 'foo')
    },
    'batchReadEndpoints': createGroup(group, [mockEndpoint], () => ({
      'Throws an exception': (mocks) => {
        throws(() => throwException())
      },
    })),
  })),
}))
