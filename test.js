const merge = require('./index')

let order = []

let baseComp = {
  name: 'baseComp',
  asyncData: async (ctx) => {
    order.push(baseComp)
    return {
      baseComp: true,
      val: 'baseComp'
    }
  }
}

let comp = {
  name: 'comp',
  mixins: [baseComp],
  asyncData: async (ctx) => {
    await new Promise((res, rej) => setTimeout(() => {res()}, 1))
    order.push(comp)
    return {
      comp: true,
      val: 'comp'
    }
  }
}

let comp2 = {
  name: 'comp2',
  mixins: [baseComp],
  asyncData: async (ctx) => {
    order.push(comp2)
    return {
      comp2: true,
      val: 'comp2'
    }
  }
}

let extendedComp = {
  name: 'extendedComp',
  mixins: [comp],
  asyncData: async (ctx) => {
    order.push(extendedComp)
    return {
      extendedComp: true,
      val: 'extendedComp'
    }
  }
}

// ---------------------

let mergedAsync = merge({
  name: 'mergedAsync',
  mixins: [extendedComp, comp2],
  asyncData: async (ctx) => {
    order.push(mergedAsync)
    return {
      ctx: Object.assign({}, ctx),
      mergedAsync: true,
      val: 'mergedAsync'
    }
  }
})

let mergedSync = merge.sync({
  name: 'mergedSync',
  mixins: [extendedComp, comp2],
  asyncData: async (ctx) => {
    order.push(mergedSync)
    return {
      asyncDataValue: Object.assign({}, ctx.asyncDataValue),
      ctx: Object.assign({}, ctx),
      mergedSync: true,
      val: 'mergedSync'
    }
  }
})

let mergedManual = merge.manual({
  name: 'mergedManual',
  mixins: [extendedComp, comp2],
  asyncData: async (ctx) => {
    order.push(mergedManual)
    return {
      ctx: Object.assign({}, ctx),
      mergedManual: true,
      val: 'mergedManual'
    }
  }
})

// -----------------

function assert(expr, descr) {
  if (!expr) {
    throw new Error("ASSERTION FAILED: " + descr)
  }
}
function assertBulk(list) {
  list.forEach(a => assert(a[0], a[1]))
}

// ---------------------

async function runTest() {
  let asyncValue = await mergedAsync.asyncData({origin: mergedAsync})
  assertBulk([
    [ asyncValue.baseComp && asyncValue.comp && asyncValue.extendedComp && asyncValue.comp2 && asyncValue.mergedAsync,
      "mergedAsync should invoke all inherited methods" ],
    [ asyncValue.ctx.origin === mergedAsync,
      "mergedAsync should get passed context" ],
    [ asyncValue.val === 'mergedAsync',
      "mergedAsync should have merged value overriden by higher methods" ],
  ])

  order = []
  let syncValue = await mergedSync.asyncData({origin: mergedSync})
  assertBulk([
    [    order[0] === baseComp
      && order[1] === comp
      && order[2] === extendedComp
      && order[3] === comp2
      && order[4] === mergedSync,
      "mergedSync should invoke all inherited methods in order" ],
    [ syncValue.ctx.origin === mergedSync,
      "mergedSync should get passed context" ],
    [ syncValue.asyncDataValue.val === 'comp2',
      "mergedManual should get result of previous call in context 'asyncDataValue'" ],
    [ syncValue.val === 'mergedSync',
      "mergedSync should have merged value overriden by higher methods" ],
  ])

  let manualValue = await mergedManual.asyncData({origin: mergedManual})
  assertBulk([
    [ manualValue.ctx.origin === mergedManual,
      "mergedManual should get passed context" ],
    [    manualValue.ctx.mixins.includes(baseComp)
      && manualValue.ctx.mixins.includes(comp)
      && manualValue.ctx.mixins.includes(extendedComp)
      && manualValue.ctx.mixins.includes(comp2),
      "mergedManual should get mixins array passed to context" ],
    [ manualValue.val === 'mergedManual',
      "mergedManual should have merged value overriden by higher methods" ],
  ])
}

runTest()
