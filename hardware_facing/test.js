var fs = require('fs')
var sleep = require('sleep')
var path = require('path')
var { buffer_upload }= require('../prepeare_post_request.js')
var Gpio = require('onoff').Gpio; 
//var LED = new Gpio(12, 'out'); 
var Button = new Gpio(14, 'in', 'falling', {debounceTimeout: 20}); //use GPIO pin 14 as input, and 'both' button presses, and releases should be handled


Button.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  console.log(value)
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }
  //take picture to a path by spawning python module
  const new_path = path.join(__dirname, 'image.png')

  f = async () => {
    const buf = fs.readFileSync(new_path)
    fs.unlinkSync(new_path)
    await buffer_upload(buf, '.png')
    .then(() => {
      console.log("picture submited sucessfully")
      return
    })
    .catch((e) => {
      console.log("error submitting picture remotely")
      console.error(e)
      return
    })
  }

});

while (true) {
  console.log("yo")
  //sleep.sleep(2)
  for (let i=0; i<1000000000; i++) {
    continue
  }
}




function unexportOnClose() { //function to run when exiting program
  //LED.writeSync(0); // Turn LED off
  //LED.unexport(); // Unexport LED GPIO to free resources
  Button.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
process.on('exit', unexportOnClose);