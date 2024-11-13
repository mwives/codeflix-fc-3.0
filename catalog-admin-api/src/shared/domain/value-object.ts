import isEqual from 'lodash/isEqual'

export abstract class ValueObject {
  public equals(vo: this): boolean {
    if (vo === null || vo === undefined) {
      return false
    }

    if (this.constructor.name !== vo.constructor.name) {
      return false
    }

    return isEqual(this, vo)
  }
}
