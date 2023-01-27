import { z } from 'zod'

const Dog = z.object({
  name: z.string(),
  age: z.number(),
})

type Dog = z.infer<typeof Dog>


const data: any = { name: 'Sparky', age: 5 }
const spot = Dog.parse(data)

const sparky: Dog = { name: 'Sparky', age: 3 }

let optional: string | undefined = undefined

optional = 's'

function func(optional: string | undefined) {
  optional
}
