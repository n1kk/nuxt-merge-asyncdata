function flattenMixins(mixins, list) {
  let flatWithAssyncData = list || []
  mixins.forEach(mixin => {
    if (mixin.mixins)
      flattenMixins(mixin.mixins, flatWithAssyncData)
    if (mixin.asyncData && !flatWithAssyncData.includes(mixin))
      flatWithAssyncData.push(mixin)
  })
  return flatWithAssyncData
}

function merge_async (comp) {
  if (comp && comp.mixins) {
    let mixins = flattenMixins(comp.mixins)
    if (mixins.length) {
      let methods = mixins.map(mixin => mixin.asyncData)
      if (comp.asyncData)
        methods.push(comp.asyncData)
      comp.asyncData = async (context) => {
        const values = await Promise.all(methods.map(method => method(context)))
        return Object.assign.apply(Object, values)
      }
    }
  }
  return comp
}

function merge_sync (comp) {
  if (comp && comp.mixins) {
    let mixins = flattenMixins(comp.mixins)
    if (mixins.length) {
      let methods = mixins.map(mixin => mixin.asyncData)
      if (comp.asyncData)
        methods.push(comp.asyncData)
      comp.asyncData = async (context) => {
        let lastValue
        for (let i = 0; i < methods.length; i++) {
          context.asyncDataValue = lastValue
          lastValue = Object.assign(lastValue || {}, await methods[i](context))
        }
        return lastValue
      }
    }
  }
  return comp
}

function merge_manual (comp) {
  if (comp && comp.mixins) {
    let mixins = flattenMixins(comp.mixins)
    if (mixins.length) {
      if (comp.asyncData) {
        let original = comp.asyncData
        comp.asyncData = async (context) => {
          context.mixins = mixins
          return await original(context)
        }
      } else {
        return merge_async(comp)
      }
    }
  }
  return comp
}

const merge_default = merge_async
merge_default.sync = merge_sync
merge_default.manual = merge_manual

//export default merge_default
var exports = module.exports = merge_default
