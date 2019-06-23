import { JSDOM } from 'jsdom'
import fs from 'fs'
import App from '../../src/app'

const mockGetBoundingClientReact = (extend) => () => ({
  top: 100,
  left: 100,
  right: 400,
  bottom: 350,
  height: 250,
  width: 300,
  ...extend
})

describe('detect visibility', () => {
  const html = fs.readFileSync('public/index.html')
  const dom = new JSDOM(html.toString())
  let ad

  beforeAll(() => {
    App.init(['#ad'], dom.window)
    ad = App.ads[0]

    dom.window.innerWidth = 2500
    dom.window.innerHeight = 2500
  })

  test('App has initialized with ad', () => {
    expect(ad).toBeDefined()
  })

  test('Ad is visible by default', () => {
    expect(ad.isVisibleByStyle()).toBeTruthy()
  })

  test('Ad is not visible when display turned to none', () => {
    ad.el.style.display = 'none'
    expect(ad.isVisibleByStyle()).not.toBeTruthy()
    ad.el.style.display = 'block'
  })

  test('Ad is not visible when visibility turned to none', () => {
    ad.el.style.visibility = 'hidden'
    expect(ad.isVisibleByStyle()).not.toBeTruthy()
    ad.el.style.visibility = 'visible'
  })

  test('Ad is visible by default coordinates', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact()
    expect(ad.getVisibilityPercentage()).toBe(100)
  })

  test('Ad is visible when scrolled left 100px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: 0,
      right: 300
    })
    expect(ad.getVisibilityPercentage()).toBe(100)
  })

  test('Ad is visible 50% when scrolled left -150px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -150,
      right: 150
    })
    expect(ad.getVisibilityPercentage()).toBe(50)
  })

  test('Ad is visible 75% when scrolled left -225', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -225,
      right: 75
    })
    expect(ad.getVisibilityPercentage()).toBe(25)
  })

  test('Ad is not visible when scrolled left -300px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -300,
      right: 0
    })
    expect(ad.getVisibilityPercentage()).toBe(0)
  })

  test('Ad is visible 50% when scrolled top -125px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      top: -125,
      bottom: 125
    })
    expect(ad.getVisibilityPercentage()).toBe(50)
  })

  test('Ad is not visible when scrolled top -250px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      top: -250,
      right: 0
    })
    expect(ad.getVisibilityPercentage()).toBe(0)
  })

  test('Ad is visible 25% when scrolled left -150px and scrolled top -125px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -150,
      right: 150,
      top: -125,
      bottom: 125
    })
    expect(ad.getVisibilityPercentage()).toBe(25)
  })

  test('Ad is visible 56.25% when scrolled left -75px and scrolled top -62.5px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -75,
      right: 225,
      top: -62.5,
      bottom: 187.5
    })
    expect(ad.getVisibilityPercentage()).toBe(56.25)
  })

  test('Ad is not visible  when scrolled left -300px and scrolled top -250px', () => {
    ad.el.getBoundingClientRect = mockGetBoundingClientReact({
      left: -300,
      right: 0,
      top: -250,
      bottom: 0
    })
    expect(ad.getVisibilityPercentage()).toBe(0)
  })
})
