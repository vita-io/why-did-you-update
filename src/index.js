import {deepDiff} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function diffProps (prev, next) {
  return deepDiff(prev, next, 'props', [])
}

function diffState (prev, next) {
  if (prev && next) {
    return deepDiff(prev, next, 'state', [])
  }

  return []
}

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this)

    if (!shouldInclude(displayName, opts)) {
      return
    }

    const diffs = diffProps(prevProps, this.props)
                    .concat(diffState(prevState, this.state));

    opts.notifier(displayName, diffs);
  }
}

export const whyDidYouUpdate = (React, opts = {}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  const _createClass = React.createClass
  opts = normalizeOptions(opts)

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  if (_createClass) {
    React.createClass = function createClass (obj) {
      if (!obj.mixins) {
        obj.mixins = []
      }

      const Mixin = {
        componentDidUpdate: createComponentDidUpdate(opts)
      }

      obj.mixins = [Mixin].concat(obj.mixins)

      return _createClass.call(React, obj)
    }
  }

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    React.createClass = _createClass
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
