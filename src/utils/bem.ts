type Modifiers = Array<
  | {
      [name: string]: boolean
    }
  | string
>

const getActiveModifiers = (modifiers: Modifiers) => {
  const activeModifiers: string[] = []
  modifiers.forEach(
    modifier =>
      typeof modifier === 'string'
        ? activeModifiers.push(modifier)
        : Object.keys(modifier).forEach(key => {
            if (modifier[key]) {
              activeModifiers.push(key)
            }
          }),
  )
  return activeModifiers
}

class Bem {
  constructor(private namespace: string) {}

  block(...modifiers: Modifiers) {
    return getActiveModifiers(modifiers).reduce(
      (result, modifier) => `${result} ${this.namespace}--${modifier}`,
      this.namespace,
    )
  }

  element(name: string, ...modifiers: Modifiers) {
    return getActiveModifiers(modifiers).reduce(
      (result, modifier) => `${result} ${this.namespace}__${name}--${modifier}`,
      `${this.namespace}__${name}`,
    )
  }
}

export const buildBem = (namespace: string) => new Bem(namespace)
