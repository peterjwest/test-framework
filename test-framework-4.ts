export interface Test<Mocks extends object, Data extends object> {
  (mocks: Mocks, data: Data): void
}

export interface Config {
  processIsolation?: boolean
  setupIsolation?: boolean
  randomOrder?: boolean | string
}

export type Setup<
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
    after?: (data: DataOnce & ParentDataEach) => void
  }
  mocks: (data: DataOnce & ParentDataEach) => Mocks | Promise<Mocks>
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

export interface Suite<Mocks extends object, DataOnce extends object, DataEach extends object> {
  setup: Setup<Mocks, DataOnce, DataEach, {}, {}>
  content: { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> }
}

export interface Group<Mocks extends object, DataOnce extends object, DataEach extends object, ParentMocks extends object, ParentDataOnce extends object, ParentDataEach extends object> {
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

export function createSuite<Mocks extends object, DataOnce extends object, DataEach extends object>(
  setup: SetupAll<Mocks, DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> },
): Suite<Mocks, DataOnce, DataEach>
export function createSuite<DataOnce extends object, DataEach extends object>(
  setup: SetupNoMocks<DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<{}, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, {}, DataOnce, DataEach> | Test<{}, DataOnce & DataEach> },
): Suite<{}, DataOnce, DataEach>
export function createSuite<Mocks extends object, DataOnce extends object>(
  setup: SetupNoDataEach<Mocks, DataOnce, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, {}>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, {}> | Test<Mocks, DataOnce> },
): Suite<Mocks, DataOnce, {}>
export function createSuite<Mocks extends object, DataEach extends object>(
  setup: SetupNoDataOnce<Mocks, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, {}, DataEach>) => { [name: string]: Group<any, any, any, Mocks, {}, DataEach> | Test<Mocks, DataEach> },
): Suite<Mocks, {}, DataEach>
export function createSuite<Mocks extends object>(
  setup: SetupOnlyMocks<Mocks, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, {}, {}>) => { [name: string]: Group<any, any, any, Mocks, {}, {}> | Test<Mocks, {}> },
): Suite<Mocks, {}, {}>
export function createSuite<DataEach extends object>(
  setup: SetupOnlyEach<DataEach, {}, {}>,
  spec: (suite: SuiteHelper<{}, {}, DataEach>) => { [name: string]: Group<any, any, any, {}, {}, DataEach> | Test<{}, DataEach> },
): Suite<{}, {}, DataEach>
export function createSuite<DataOnce extends object>(
  setup: SetupOnlyOnce<DataOnce, {}, {}>,
  spec: (suite: SuiteHelper<{}, DataOnce, {}>) => { [name: string]: Group<any, any, any, {}, DataOnce, {}> | Test<{}, DataOnce> },
): Suite<{}, DataOnce, {}>
export function createSuite(
  setup: SetupNone<{}, {}>,
  spec: (suite: SuiteHelper<{}, {}, {}>) => { [name: string]: Group<any, any, any, {}, {}, {}> | Test<{}, {}> },
): Suite<{}, {}, {}>

export function createSuite<Mocks extends object, DataOnce extends object, DataEach extends object>(
  setup: Setup<Mocks, DataOnce, DataEach, {}, {}>,
  spec: (suite: SuiteHelper<Mocks, DataOnce, DataEach>) => { [name: string]: Group<any, any, any, Mocks, DataOnce, DataEach> | Test<Mocks, DataOnce & DataEach> },
): Suite<Mocks, DataOnce, DataEach> {
  return { setup, content: spec(new SuiteHelper<Mocks, DataOnce, DataEach>()) }
}

export function isEqual() {

}

export function calledWith() {

}

export function not() {

}

export function throws(func: any) {

}
