Util to merge asyncData methods on route pages in nuxt framework.

## Install
```bash
npm i nuxt-merge-asyncdata -save
```

### Usage

```javascript
import nmerge from "nuxt-merge-asyncdata"

export default nmerge({...}) // asynchronous
export default nmerge.sync({...})
export default nmerge.manual({...})
export default nmerge.controlled({...})

```

## API

### nmerge({...})

Default method will collect all asyncData methods and run them in parallel (asynchronous). Results will be merged together with respect to hierarchy.

```javascript
import nmerge from "nuxt-merge-asyncdata"

let base = {
  asyncData: async (ctx) => {
    console.log('asyncData in base: start')
    await new Promise(res => setTimeout(() => res(), 1000)) // some delay
    console.log('asyncData in base: end')
    return { value: 1 }
  }
}

export default nmerge({
  mixins: [base],
  asyncData: async (ctx) => {
    console.log('asyncData in component')
    return { value: 2 }
  },
  created: function () {
    console.log('value is', this.value)
  }
})
```

Result

```
> asyncData in base: start
> asyncData in component
> asyncData in base: end
> value is 2
```

### nmerge.sync({...})

`sync` method differs in a way that it will run asyncData methods synchronously, it will also continuously merge results and pass them to next method in context field `asyncDataResult`

```javascript
import nmerge from "nuxt-merge-asyncdata"

let base = {
  asyncData: async (ctx) => {
    console.log('asyncData in base: start')
    await new Promise(res => setTimeout(() => res(), 1000)) // some delay
    console.log('asyncData in base: end')
    return { value: 1 }
  }
}

export default nmerge.sync({
  mixins: [base],
  asyncData: async ({ asyncDataResult }) => {
    console.log('asyncData in component, base result is:', asyncDataResult)
    return { value: 2 }
  },
  created: function () {
    console.log('value is', this.value)
  }
})
```

Result

```
> asyncData in base: start
> asyncData in base: end
> asyncData in component, base result is: { value: 1 }
> value is 2
```

### nmerge.manual({...}) nmerge.controlled({...})

These methods will just flatten out mixins hierarchy removing duplicates and filter out mixins without asyncData methods, resulted array will be passed to component asyncData method in `mixins` field. 

Difference between `manual` and `controlled` is that if asyncData is not present on passed component then `controlled` will assume that invocation of base asyncData methods is desired and will fallback on default (asynchronous) method whether `manual` will do nothing.

```javascript
import nmerge from "nuxt-merge-asyncdata"

let core = {
  name: 'core',
  asyncData: async (ctx) => { ... }
}

let base = {
  name: 'base',
  mixins: [core],
  asyncData: async (ctx) => { ... }
}

let comp2 = {
  name: 'comp2',
  mixins: [core],
  asyncData: async (ctx) => { ... }
}

export default nmerge.controlled({
  mixins: [base, comp2],
  asyncData: async ({mixins}) => {
    // mixins[0] === core
    // mixins[1] === base
    // mixins[2] === comp2
    return { value: 2 }
  }
})
```
