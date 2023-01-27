import { createSuite, throws } from './index'

const expect: (input: any) => any = () => {}
const jest: any = {}
const dependencies: any = {}
const throwException: any = null
const batchReadEndpoints: any = null

export default createSuite(
  {
    each: {
      before: () => {
        dependencies.createData()
        return { now: '123456789', source: 'src', data: 'foobar' }
      },
      after: (data) => dependencies.deleteData(data),
    },
    mocks: () => ({
      exec: 1,
      unlink: 2,
    }),
  },
  (suite) => ({
    'install_test': suite.createGroup(
      {
        each: { after: () => {} },
      },
      (suite) => ({
        'Throws an exception': (mocks, data) => {
          expect(data.now).toEqual(1)
          throws(() => throwException())
        },
      }),
    ),
    'download_test': suite.createGroup(
      {
        once: {
          before: () => ({ blah: 123 }),
        },
        mocks: () => ({
          patchEndpointState: jest.spyOn(dependencies, 'patchEndpointState').mockResolvedValue(undefined),
        }),
      },
      (suite) => ({
        'batchReadEndpoints': suite.createGroup({},
          (suite) => ({
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
          }),
        ),
        'batchReadEndpoints2': suite.createGroup(
          {
            each: {
              before: ({ now }) => ({
                x: 1,
                now,
              }),
            },
          },
          (suite) => ({
            'Throws an exception': (mocks, data) => {
              expect(data.x).toEqual(1)
              throws(() => throwException())
            },
          }),
        ),
      }),
    ),
  }),
);
