export class VisibilityEvent {
  constructor (ad, isVisible, percentage) {
    if (typeof ad === 'undefined' || isVisible === 'undefined' || typeof percentage === 'undefined') {
      return console.warn('Tried to create an invalid event')
    }

    this.adId = ad.id
    this.isVisible = isVisible
    this.percentage = percentage
    this.timestamp = (new Date()).getTime()
  }

  visible () {
    return this.isVisible || !!this.percentage
  }
}

export class ClickEvent {
  constructor (ad, event) {
    if (typeof ad === 'undefined' || typeof event === 'undefined') {
      return console.warn('Tried to create an invalid event')
    }

    /**
     * saving ad id and x,y coordinates of the click
     */
    this.adId = ad.id
    this.x = event.clientX
    this.y = event.clientY
    this.timestamp = (new Date()).getTime()
  }
}
