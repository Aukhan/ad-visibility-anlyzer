import App from './app'

App.init(['#ad'], window)

setInterval(function () {
  App.log()
}, 500)
