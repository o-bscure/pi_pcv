var gpio = require('rpi-gpio').promise;
var sleep = require('sleep');

var led = gpio.setup(32, gpio.DIR_OUT).then(() => {
  led.on('change', (channel, value) => {
    console.log(channel, value)
  })

  gpio.write(32, 1)
})
.catch((e) => {
  console.error(e.toString())
})
