import { VisibilityEvent, ClickEvent } from './events'

const DEFAULT_STATS_SCHEMA = {
  isVisible: false,
  percentage: 0,
  viewabilityTime: 0,
  lastChangeTimeStamp: 0,
  click: 0
}

const LOG_PROCESS_DELAY = 100

/**
 * The AdState class provides an instance that can be attached to the
 * ad object and serves as it's dedicated state container. It maintains a log
 * of change events that can be sent back to the server for further mining data
 * by time
 * @type {Class} AdState
 */
export default class AdState {
  constructor () {
    this.changeLog = []
    this.clickLog = []
    this.stats = { ...DEFAULT_STATS_SCHEMA }

    this.startUpdateTimer()
  }
  /**
   * get last event from the log
   * @method getLastEvent
   * @return {VisibilityEvent|ClickEvent}
   */
  getLastEvent (log) {
    return log[log.length - 1]
  }

  /**
   * push an event into the changeLog if it's visibility status or percentage
   * is different from the previous one
   * @method pushEvent
   * @param  {VisibilityEvent}  event
   */
  pushEvent (event) {
    if (event instanceof VisibilityEvent) {
      this.preserveVisibilityEvent(event)
    } else if (event instanceof ClickEvent) {
      this.preserveClickEvent(event)
    }
  }

  preserveVisibilityEvent (event) {
    const lastEvent = this.getLastEvent(this.changeLog)

    // only push a change event is visibility has changed
    if (!lastEvent ||
      event.isVisible !== lastEvent.isVisible ||
      event.percentage !== lastEvent.percentage) {
      this.changeLog.push(event)
    }
  }

  preserveClickEvent (event) {
    this.clickLog.push(event)
  }

  getStats () {
    return this.stats
  }

  /**
   * this method is keeping a track of the last index processed so it doesn't
   * have to process the complete array over and over again
   * @method updateVisibilityStats
   */
  updateVisibilityStats () {
    this.lastIndex = this.lastIndex || 0

    /**
     * only update the viewabilityTime if changeLog has already been processed
     * and current event is visible and stop further processing
     */
    if (this.lastIndex === this.changeLog.length) {
      const current = this.changeLog[this.lastIndex - 1]
      if (current && current.visible()) {
        const secondsElapsed = ((new Date()).getTime() - current.timestamp) / 1000
        this.stats.viewabilityTime += secondsElapsed
      }
      return
    }

    /**
     * copy to a temp array to not mutate the original one
     * splice the part that has not been processed yet
     */
    const tempLog = [...this.changeLog].splice(this.lastIndex)

    for (let i = 0; i < tempLog.length; i++) {
      const prev = tempLog[i - 1]
      const current = tempLog[i]

      this.stats.isVisible = current.visible()
      this.stats.percentage = current.percentage
      this.stats.lastChangeTimeStamp = current.timestamp

      if (prev && prev.visible()) {
        const secondsElapsed = (prev.timestamp - current.timestamp) / 1000
        this.stats.viewabilityTime += secondsElapsed
      }
    }

    // update lastIndex to changeLog.length after processing
    this.lastIndex = this.changeLog.length
  }

  /**
   * counts click events and updates stats
   * @method updateClickStats
   */
  updateClickStats () {
    this.stats.clicks = this.clickLog.reduce((sum, e) => sum + 1, 0)
  }

  /**
   * creates an interval to keep processing new events coming into the change log
   * @method startUpdateTimer
   */
  startUpdateTimer () {
    this.updateTimer = setInterval(() => {
      this.updateVisibilityStats()
      this.updateClickStats()
    }, LOG_PROCESS_DELAY)
  }

  /**
   * stops the update timer
   * @method stopUpdateTimer
   */
  stopUpdateTimer () {
    clearInterval(this.updateTimer)
  }
}
