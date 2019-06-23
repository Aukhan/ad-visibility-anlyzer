import Ad from '../../src/ad'
import State from '../../src/ad-state'
import { VisibilityEvent } from '../../src/events'

jest.useFakeTimers()

describe('detect ad state updates', () => {
  let ad

  beforeAll(() => {
    ad = new Ad('#test', window)
  })

  test('changeLog is empty on start', () => {
    const state = new State()
    expect(state.changeLog).toHaveLength(0)
  })

  test('changeLog should receive first event', () => {
    const state = new State()
    state.pushEvent(new VisibilityEvent(ad, true, 100))
    expect(state.changeLog).toHaveLength(1)
    expect(state.getLastEvent(state.changeLog).visible()).toBeTruthy()
  })

  test('changeLog does not accept similar event', () => {
    const state = new State()
    state.pushEvent(new VisibilityEvent(ad, true, 100))
    state.pushEvent(new VisibilityEvent(ad, true, 100))
    expect(state.changeLog).toHaveLength(1)
    expect(state.getLastEvent(state.changeLog).visible()).toBeTruthy()
  })

  test('stats should have visibility after being processed', () => {
    const state = new State()
    state.pushEvent(new VisibilityEvent(ad, true, 100))
    jest.advanceTimersByTime(1000)
    const stats = state.getStats()
    expect(stats.isVisible).toBeTruthy()
  })

  test('stats should not have visibility after false VisibilityEvent pushed', () => {
    const state = new State()
    state.pushEvent(new VisibilityEvent(ad, true, 100))
    jest.advanceTimersByTime(1000)
    const stats = state.getStats()
    expect(stats.isVisible).toBeTruthy()

    state.pushEvent(new VisibilityEvent(ad, false, 0))
    jest.advanceTimersByTime(1000)
    expect(stats.isVisible).not.toBeTruthy()
    expect(state.changeLog).toHaveLength(2)
    expect(state.changeLog).toHaveLength(state.lastIndex)
  })

  afterAll(() => jest.clearAllTimers())
})
