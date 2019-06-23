import { VisibilityEvent, ClickEvent } from './events'
import AdState from './ad-state'

/**
 * Class Ad providing an instance around the ad block. It will link to the
 * document element and maintain it's state.
 * @type {Class}
 */
export default class Ad {
  constructor (id, window) {
    this.id = id
    this.window = window
    this.el = window.document.querySelector(id)
    this.state = new AdState()

    if (!this.el) {
      return console.warn('Unable to attach a document element')
    }

    this.el.onclick = this.onClick.bind(this)
  }

  /**
   * wrapper around window.getComputedStyle
   * @method getComputedStyle
   */
  getComputedStyle () {
    return this.window.getComputedStyle(this.el)
  }

  /**
   * method checks visibility by style, if visibility is turned of by changing
   * style of the div
   * @method isVisibleByStyle
   * @return {Boolean}
   */
  isVisibleByStyle () {
    const style = this.getComputedStyle()
    return style.width !== '0' &&
      style.height !== '0' &&
      style.opacity !== '0' &&
      style.display !== 'none' &&
      style.visibility !== 'hidden'
  }

  /**
   * calculates the visible percentage of the element and returns number (%age)
   * @method getVisibilityPercentage
   * @return {Number}
   */
  getVisibilityPercentage () {
    const adRect = this.el.getBoundingClientRect()
    const viewRect = {
      left: 0,
      top: 0,
      bottom: this.window.innerHeight,
      right: this.window.innerWidth,
      width: this.window.innerWidth,
      height: this.window.innerHeight
    }

    // detect any change to style
    if (!this.isVisibleByStyle()) return 0

    // if completely scrolled left
    if (adRect.right <= 0) return 0

    // if completely scrolled top
    if (adRect.bottom <= 0) return 0

    // if completely scrolled right
    if (adRect.left > viewRect.right) return 0
    //
    // if completely scrolled bottom
    if (adRect.top >= viewRect.bottom) return 0

    const effectiveLeft = adRect.left > 0 ? adRect.left : 0
    const effectiveTop = adRect.top > 0 ? adRect.top : 0
    const effectiveRight = adRect.right < viewRect.right ? adRect.right : viewRect.right
    const effectiveBottom = adRect.bottom < viewRect.bottom ? adRect.bottom : viewRect.bottom

    const effectiveWidth = effectiveRight - effectiveLeft
    const effectiveHeight = effectiveBottom - effectiveTop

    const adArea = this.getRectArea(adRect.height, adRect.width)
    const effectiveArea = this.getRectArea(effectiveHeight, effectiveWidth)

    return (effectiveArea / adArea) * 100
  }

  /**
   * wrapper around area calculation
   * @method getRectArea
   * @param  {Number}    height [description]
   * @param  {Number}    width  [description]
   * @return {Number}
   */
  getRectArea (height, width) {
    return height * width
  }

  /**
   * push an event to state when Page Visibility Api changes
   * @method pushVisibilityChange
   * @param  {Boolean}            isVisible  override visibility
   * @param  {Number}             percentage override percentage
   */
  pushVisibilityChange (isVisible, percentage) {
    if (typeof isVisible !== 'undefined' && typeof percentage !== 'undefined') {
      this.state.pushEvent(new VisibilityEvent(this, isVisible, percentage))
    } else {
      const perc = this.getVisibilityPercentage()
      this.state.pushEvent(new VisibilityEvent(this, !!perc, perc))
    }
  }

  /**
   * onClick handler to save mouse click
   * @method onClick
   * @param  {MouseEvent} event
   */
  onClick (event) {
    this.state.pushEvent(new ClickEvent(this, event))
  }
}
