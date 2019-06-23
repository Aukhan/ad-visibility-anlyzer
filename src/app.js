/**
 * Stolen from MDN docs
 * Set the name of the hidden property and the change event for visibility
 */

import Ad from './Ad'

let hidden, visibilityChange
// Opera 12.10 and Firefox 18 and later support
if (typeof document.hidden !== 'undefined') {
  hidden = 'hidden'
  visibilityChange = 'visibilitychange'
} else if (typeof document.msHidden !== 'undefined') {
  hidden = 'msHidden'
  visibilityChange = 'msvisibilitychange'
} else if (typeof document.webkitHidden !== 'undefined') {
  hidden = 'webkitHidden'
  visibilityChange = 'webkitvisibilitychange'
}

const UPDATE_VISIBILITY_DELAY = 100

export default class App {
  /**
   * initialize required variables and timers
   * @method init
   * @param  {Array} selectors [description]
   * @param  {Window} window    [description]
   */
  static init (selectors, window) {
    if (!selectors.length) {
      return console.error('App expects an array of selectors')
    }

    if (!window) {
      return console.error('App requires window object to initialize')
    }

    this.window = window
    this.ads = []

    selectors.forEach(s => this.ads.push(new Ad(s, window)))

    this.setupEvents()

    this.startUpdateTimer()
  }

  /**
   * setupEvents to make sure visibility is captured appropriately
   * there is an update time enabled which will capture the scroll
   * and resize events, since it will update the visibility after
   * every 100 ms. On visibility hidden we will disable that timer
   * and enable again when tab is focussed
   * @method setupEvents
   */
  static setupEvents () {
    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === 'undefined' || hidden === undefined) {
      console.warn('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.')
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, this.onPageVisibilityChanged.bind(this), false)
    }
    window.onbeforeunload = this.onWindowClosed.bind(this)
  }

  /**
   * push an event when the Page Visibility changes
   * probably want to push this data to the server
   * @method onPageVisibilityChanged
   */
  static onPageVisibilityChanged () {
    if (document[hidden]) {
      this.stopUpdateTimer()
      this.pushVisibilityChange(false, 0)
    } else {
      this.startUpdateTimer()
    }
  }

  /**
   * push an event when the window is closed
   * probably want to push data to the server at this point
   * @method onWindowClosed
   */
  static onWindowClosed () {
    this.pushVisibilityChange(false, 0)
  }

  static pushVisibilityChange (isVisible, percentage) {
    this.ads.forEach(ad => ad.pushVisibilityChange(isVisible, percentage))
  }

  /**
   * starts the update timer
   * @method startUpdateTimer
   */
  static startUpdateTimer () {
    this.updateTimer = setInterval(this.pushVisibilityChange.bind(this), UPDATE_VISIBILITY_DELAY)
  }

  /**
   * stops the update timer
   * @method stopUpdateTimer
   */
  static stopUpdateTimer () {
    clearInterval(this.updateTimer)
  }

  /**
   * log function to display status of all ads
   * @method log
   */
  static log () {
    this.ads.forEach(ad => {
      const {
        isVisible,
        percentage,
        viewabilityTime,
        clicks
      } = ad.state.getStats()
      const verbiage = `AD        : ${ad.id} \nVISIBLE   : ${isVisible} \nPERCENTAGE: ${this.round(percentage)}% \nTIME      : ${this.round(viewabilityTime)}s \nCLICKS    : ${clicks}`

      if (percentage < 50) {
        console.warn(verbiage)
      } else {
        console.info(verbiage)
      }
    })
  }

  /**
   * wrapper around rounding to two digits
   */
  static round (val) {
    return Math.round(val * 100 + Number.EPSILON) / 100
  }
}
