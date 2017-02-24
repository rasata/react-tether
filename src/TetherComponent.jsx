import React, { Component, Children, PropTypes, cloneElement } from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import Tether from 'tether'

if (!Tether) {
  console.error('It looks like Tether has not been included. Please load this dependency first https://github.com/HubSpot/tether')
}

const renderElementToPropTypes = [
  PropTypes.string,
  PropTypes.shape({
    appendChild: PropTypes.func.isRequired
  })
]

const childrenPropType = ({ children }, propName, componentName) => {
  const childCount = Children.count(children)
  if (childCount <= 0) {
    return new Error(`${componentName} expects at least one child to use as the target element.`)
  } else if (childCount > 2) {
    return new Error(`Only a max of two children allowed in ${componentName}.`)
  }
}

const attachmentPositions = [
  'auto auto',
  'top left',
  'top center',
  'top right',
  'middle left',
  'middle center',
  'middle right',
  'bottom left',
  'bottom center',
  'bottom right'
]

class TetherComponent extends Component {
  static propTypes = {
    renderElementTag: PropTypes.string,
    renderElementTo: PropTypes.oneOfType(renderElementToPropTypes),
    attachment: PropTypes.oneOf(attachmentPositions).isRequired,
    targetAttachment: PropTypes.oneOf(attachmentPositions),
    offset: PropTypes.string,
    targetOffset: PropTypes.string,
    targetModifier: PropTypes.string,
    enabled: PropTypes.bool,
    classes: PropTypes.object,
    classPrefix: PropTypes.string,
    optimizations: PropTypes.object,
    constraints: PropTypes.array,
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onUpdate: PropTypes.func,
    onRepositioned: PropTypes.func,
    children: childrenPropType
  }

  static defaultProps = {
    tag: 'div',
    onUpdate: () => null,
    onRepositioned: () => null
  }

  componentDidMount() {
    this._update()
  }

  componentDidUpdate() {
    this._update()
  }

  componentWillUnmount() {
    this._destroy()
  }

  getTetherInstance() {
    return this._tether
  }

  disable() {
    this._tether.disable()
  }

  enable() {
    this._tether.enable()
  }

  on(event, handler, ctx) {
    this._tether.on(event, handler, ctx);
  }

  once(event, handler, ctx) {
    this._tether.once(event, handler, ctx);
  }

  off(event, handler) {
    this._tether.off(event, handler)
  }

  position() {
    this._tether.position()
  }

  _bindEventListeners() {
    this.on('update', this.props.onUpdate)
    this.on('repositioned', this.props.onRepositioned)
  }

  _unbindEventListeners() {
    this.off('update', this.props.onUpdate)
    this.off('repositioned', this.props.onRepositioned)
  }

  _destroy() {
    if (this._tether) {
      this._tether.destroy()
      this._unbindEventListeners()
    }
  }

  _update() {
    const { children, renderElementTag, renderElementTo, ...options } = this.props
    const tetherOptions = {
      target: this._targetNode,
      element: this._elementNode,
      ...options
    }

    if (!this._tether) {
      this._tether = new Tether(tetherOptions)
      this._bindEventListeners()
    } else {
      this._tether.setOptions(tetherOptions)
    }

    this._tether.position()
  }

  _handleTargetRef = (c) => (
    this._targetNode = findDOMNode(c)
  )

  _handleElementRef = (c) => (
    this._elementNode = findDOMNode(c)
  )

  render() {
    const { tag: Tag, tagProps, children, ...restProps } = this.props
    const [firstChild, secondChild] = Children.toArray(children)
    return (
      <Tag {...tagProps}>
        {cloneElement(firstChild, { ref: this._handleTargetRef })}
        {cloneElement(secondChild, { ref: this._handleElementRef })}
      </Tag>
    )
  }
}

export default TetherComponent
