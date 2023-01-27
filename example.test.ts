import { suite, expect, mock, before, test, scope, setup, teardown } from 'test-framework'

// Using a style of mocking here where each module publishes dependencies so they can be mocked easily
import Calculator, { dependencies } from './Calculator'

export default suite('Calculator', async ({ scope }) => {
  // A `scope` is similar to a `describe` in jest.
  await scope('add', async ({ test, mock }) => {
    // Mocks registered in a scope would be created and removed for each `test()` case in that scope (or nested scopes)
    const addNumbersMock = mock(dependencies, 'addNumbers', (a, b) => a + b)

    // A test is similar to an `it` in jest.
    await test('Returns the sum of numbers', async () => {
      expect(Calculator.add(1, -2, 3, 0)).equals(2)

      expect(addNumbersMock).toBeCalledWith([
        [1, -2],
        [-1, 3],
        [2, 0],
      ])
    })

    test('Returns zero when no numbers are passed', async () => {
      expect(Calculator.add()).equals(0)

      expect(addNumbersMock).notToBeCalled()
    })

    scope(async ({ test, after, before }) => {
      await before(async () => {
        // Work to be done once before all tests in this scope
      })

      await after(async() => {
        // Work to be done once after all tests in this scope
      })

      // Changes to mocks in nested scopes are applied in each `test()` case in the scope (or nested scopes)
      addNumbersMock.throws(new Error('NOT_A_NUMBER'))

      await test('Throws if addNumbers throws', async () => {

        expect(() => Calculator.add(['x', 'y'])).throws(new Error('"x" or "y" is not a number'))

        expect(addNumbersMock).toBeCalledOnceWith(['x', 'y'])
      })

      await test('Throws if addNumbers throws something weird', async () => {
        // Changes to mocks in a test case are applied immediately
        addNumbersMock.throws(new Error('Blegh!'))

        expect(() => Calculator.add(['x', 'y'])).throws(new Error('Unknown error: Blegh!'))

        expect(addNumbersMock).toBeCalledOnceWith(['x', 'y'])
      })
    })
  })
})

// Thinking about the idea where each test re-runs its entire stack of scopes
// which would mean each test runs in isolation and side effects from one test would not affect another
