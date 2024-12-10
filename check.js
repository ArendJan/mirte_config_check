

/*
device:
  mirte:
    type: breadboard
    board: pico
#    max_frequency: 50
distance:
  left:
    name: left
    device: mirte
    pins:
      trigger: GP9
      echo: GP8
  right:
    name: right
    device: mirte
    pins:
      trigger: GP7
      echo: GP6
#encoder:
#  left:
#    name: left
#    device: mirte
#    pins:
#      pin: GP14
#  right:
#    name: right
#    device: mirte
#    pins:
#      pin: GP15
intensity:
  left:
    name: left
    device: mirte
    pins:
      analog: GP27
      digital: GP17
  right:
    name: right
    device: mirte
    pins:
      analog: GP26
      digital: GP16
oled:
  left:
    name: left
    device: mirte
    pins:
      sda: GP10
      scl: GP11
  right:
    name: right
    device: mirte
    pins:
      sda: GP4
      scl: GP5
servo:
  left:
    name: left
    device: mirte
    pins:
      pin: GP14
  right:
    name: right
    device: mirte
    pins:
      pin: GP15
  # These servo`s have the same pins as the ObjectDetectors. So as
  # soon as they are implemented, these should be commented out
  gripper:
    name: gripper
    device: mirte
    pins:
      pin: GP12
  arm:
    name: arm
    device: mirte
    pins:
      pin: GP13
keypad:
  yellow:
    name: yellow
    device: mirte
    pins:
      pin: GP28
motor:
  left:
    name: left
    device: mirte
    type: pp
    pins:
      p1: GP18
      p2: GP19
  right:
    name: right
    device: mirte
    type: pp
    pins:
      p1: GP20
      p2: GP21
# These motors have the same pins as the line intensity sensors. So
# when uncommenting these, please comment the intensity sensors.
#  left2:
#    name: left2
#    device: mirte
#    type: pp
#    pins:
#      p1: GP26
#      p2: GP16
#  right2:
#    name: right2
#    device: mirte
#    type: pp
#    pins:
#      p1: GP27
#      p2: GP17
*/

// if running in node: require jsyaml
if (typeof require !== 'undefined') {
  var jsyaml = require('js-yaml');

}

function check(config) {
  let ok = false;
  let errors = [];
  let warnings = [];
  let pins = []; // {pin: ``, device: ``, type: ``}
  let j = ``;
  try {
    j = jsyaml.load(config);
  } catch (e) {
    errors.push(e);
    console.log("yaml errors: ", e);
    return { ok, errors }
  }

  let micros = [`pico`, `nano`];
  let micro = ``;
  if (!(`device` in j)) {
    errors.push(`device not defined`);
    // return {ok, errors}
  } else {
    if (!(`mirte` in j.device)) {
      errors.push(`device mirte not defined, not an issue`);
    }
    if (!(`type` in j.device.mirte)) {
      errors.push(`device type not defined`);
    } else {
      switch (j.device.mirte.type) {
        case `breadboard`:
          if (!(`board` in j.device.mirte)) {
            errors.push(`device board not defined`);
          } else {
            switch (j.device.mirte.board) {
              case `pico`:
                micro = `pico`;
                break;
              case `nano`:
              case 'nanoatmega328':
                micro = `nano`;
                break;
              default:
                errors.push(`device board unknown ` + j.device.mirte.board);
            }
          }
          break;
        case `pcb`:
          // console.log(`pcb`);
          if (!(`version` in j.device.mirte)) {
            errors.push(`device pcb version not defined`);
          }
          break;
        default:

          errors.push(`device type unknown ` + j.device.mirte.type);
      }
    }
  }

  //  check motors
  /*
  motor:
left:
  name: left
  device: mirte
  type: pp
  pins:
    p1: GP18
    p2: GP19



  */
  if (`motor` in j) {
    for (let m in j.motor) {
      if (!(`name` in j.motor[m])) {
        errors.push(`motor name not defined`);
      }
      if (!(`device` in j.motor[m])) {
        errors.push(`motor device not defined`);
      }
      if (!(`type` in j.motor[m])) {
        errors.push(`motor type not defined`);
      }
      if (![`pp`, `dp`].includes(j.motor[m].type)) {
        errors.push(`motor ${m} type unknown ` + j.motor[m].type);
      }
      if (m != j.motor[m].name) {
        errors.push(`motor ${m} name not same`);
      }
      if (!(`pins` in j.motor[m]) && !(`connector` in j.motor[m])) {
        errors.push(`motor ${m} pins or connector not defined`);
      } else {
        if (`connector` in j.motor[m]) {
          if (![`MC1-B`, `MC1-A`, `MC2-B`, `MC2-A`].includes(j.motor[m].connector)) {
            errors.push(`motor ${m} connector unknown ` + j.motor[m].connector);
          } else {
            switch (j.motor[m].connector) {
              case `MC1-A`:
                pins.push({ pin: `GP18`, device: m, type: `motor`, pin_type: 'pwm' });
                pins.push({ pin: `GP19`, device: m, type: `motor`, pin_type: 'pwm' });
                break;
              case `MC1-B`:
                pins.push({ pin: `GP20`, device: m, type: `motor`, pin_type: 'pwm' });
                pins.push({ pin: `GP21`, device: m, type: `motor`, pin_type: 'pwm' });
                break;
              case `MC2-B`:
                pins.push({ pin: `GP26`, device: m, type: `motor`, pin_type: 'pwm' });
                pins.push({ pin: `GP16`, device: m, type: `motor`, pin_type: 'pwm' });
                break;
              case `MC2-A`:
                pins.push({ pin: `GP27`, device: m, type: `motor`, pin_type: 'pwm' });
                pins.push({ pin: `GP17`, device: m, type: `motor`, pin_type: 'pwm' });
                break;
              default:
                errors.push(`motor ${m} connector unknown ` + j.motor[m].connector);
            }
          }
        } else {
          switch (j.motor[m].type) {
            case `pp`:
              if (!(`p1` in j.motor[m].pins) || !(`p2` in j.motor[m].pins)) {
                errors.push(`motor ${m} pins not defined`);
              }
              pins.push({ pin: j.motor[m].pins.p1, device: m, type: `motor`, pin_type: 'pwm' });
              pins.push({ pin: j.motor[m].pins.p2, device: m, type: `motor`, pin_type: 'pwm' });
              break;
            case `dp`:
              if (!(`p1` in j.motor[m].pins) || !(`d1` in j.motor[m].pins)) {
                errors.push(`motor ${m} pins not defined`);
              } else {
                pins.push({ pin: j.motor[m].pins.p1, device: m, type: `motor`, pin_type: 'pwm' });
                pins.push({ pin: j.motor[m].pins.d1, device: m, type: `motor`, pin_type: 'digital' });
              }
              break;
            default:
              errors.push(`motor ${m} type unknown ` + j.motor[m].type);
          }
        }
      }
    }
  } else {
    warnings.push(`no motors defined`);
  }

  // check sonars
  /*
  distance:
    left:
      name: left
      device: mirte
      pins:
        trigger: GP9
        echo: GP8
    right:
      name: right
      device: mirte
      pins:
        trigger: GP7
        echo: GP6
  */
  if (`distance` in j) {
    for (let d in j.distance) {
      if (!(`name` in j.distance[d])) {
        errors.push(`distance ${d} name not defined`);
      }
      if (j.distance[d].name != d) {
        errors.push(`distance ${d} name not same`);
      }
      if (!(`pins` in j.distance[d]) && !(`connector` in j.distance[d])) {
        errors.push(`distance ${d} pins not defined`);
      } else {
        if (`connector` in j.distance[d]) {
          if (![`SRF1`, 'SRF2'].includes(j.distance[d].connector)) {
            errors.push(`distance ${d} connector unknown ` + j.distance[d].connector);
          } else {
            switch (j.distance[d].connector) {
              case `SRF2`:
                pins.push({ pin: `GP9`, device: d, type: `distance`, pin_type: 'digital' });
                pins.push({ pin: `GP8`, device: d, type: `distance`, pin_type: 'interrupt' });
                break;
              case `SRF1`:
                pins.push({ pin: `GP7`, device: d, type: `distance`, pin_type: 'digital' });
                pins.push({ pin: `GP6`, device: d, type: `distance`, pin_type: 'interrupt' });
                break;
              default:
                errors.push(`distance ${d} connector unknown ` + j.distance[d].connector);
            }
          }
        } else {
          if (!(`trigger` in j.distance[d].pins) || !(`echo` in j.distance[d].pins)) {
            errors.push(`distance ${d} pins not defined`);
          } else {
            pins.push({ pin: j.distance[d].pins.trigger, device: d, type: `distance`, pin_type: 'digital' });
            pins.push({ pin: j.distance[d].pins.echo, device: d, type: `distance`, pin_type: 'interrupt' });
          }
        }
      }
    }
  } else {
    warnings.push(`no distance sensors defined`);
  }

  // check servos
  /*
  servo:
left:
  name: left
  device: mirte
  pins:
    pin: GP14
right:
  name: right
  device: mirte
  pins:
    pin: GP15
  */
  if (`servo` in j) {
    for (let s in j.servo) {
      // console.log(j.servo, s);
      if (!(`name` in j.servo[s])) {
        errors.push(`servo ${s} name not defined`);
      }
      if (j.servo[s].name != s) {
        errors.push(`servo ${s} name not same`);
      }
      if (!(`pins` in j.servo[s]) && !(`connector` in j.servo[s])) {
        errors.push(`servo ${s} pins not defined`);
      } else {
        if (`connector` in j.servo[s]) {
          if (![`Servo1`, `Servo2`, `Servo3`, `Servo4`].includes(j.servo[s].connector)) {
            errors.push(`servo ${s} connector unknown ` + j.servo[s].connector);
          } else {
            switch (j.servo[s].connector) {
              case `Servo1`:
                pins.push({ pin: `GP14`, device: s, type: `servo`, pin_type: 'pwm' });
                break;
              case `Servo2`:
                pins.push({ pin: `GP15`, device: s, type: `servo`, pin_type: 'pwm' });
                break;
              case `Servo3`:
                pins.push({ pin: `GP12`, device: s, type: `servo`, pin_type: 'pwm' });
                break;
              case `Servo4`:
                pins.push({ pin: `GP13`, device: s, type: `servo`, pin_type: 'pwm' });
                break;

              default:
                errors.push(`servo ${s} connector unknown ` + j.servo[s].connector);
            }
          }
        } else {
          if (!(`pin` in j.servo[s].pins)) {
            errors.push(`servo ${s} pin not defined`);
          } else {
            pins.push({ pin: j.servo[s].pins.pin, device: s, type: `servo`, pin_type: 'pwm' });
          }
        }
      }
    }
  } else {
    warnings.push(`no servos defined`);
  }

  // check intensity sensors
  /*
  intensity:
left:
  name: left
  device: mirte
  pins:
    analog: GP27
    digital: GP17
right:
  name: right
  device: mirte
  pins:
    analog: GP26
    digital: GP16
*/
  if (`intensity` in j) {
    for (let i in j.intensity) {
      if (!(`name` in j.intensity[i])) {
        errors.push(`intensity ${i} name not defined`);
      }
      if (j.intensity[i].name != i) {
        errors.push(`intensity ${i} name not same`);
      }
      if (!(`pins` in j.intensity[i]) && !(`connector` in j.intensity[i])) {
        errors.push(`intensity ${i} pins not defined`);
      } else {
        if (`connector` in j.intensity[i]) {
          if (![`IR1`, `IR2`].includes(j.intensity[i].connector)) {
            errors.push(`intensity ${i} connector unknown ` + j.intensity[i].connector);
          } else {
            switch (j.intensity[i].connector) {
              case `IR2`:
                pins.push({ pin: `GP27`, device: i, type: `intensity`, pin_type: 'analog' });
                pins.push({ pin: `GP17`, device: i, type: `intensity`, pin_type: 'digital' });
                break;
              case `IR1`:
                pins.push({ pin: `GP26`, device: i, type: `intensity`, pin_type: 'analog' });
                pins.push({ pin: `GP16`, device: i, type: `intensity`, pin_type: 'digital' });
                break;
              default:
                errors.push(`intensity ${i} connector unknown ` + j.intensity[i].connector);
            }
          }
        } else {
          if (!(`analog` in j.intensity[i].pins) || !(`digital` in j.intensity[i].pins)) {
            errors.push(`intensity ${i} pins not defined`);
          } else {
            pins.push({ pin: j.intensity[i].pins.analog, device: i, type: `intensity`, pin_type: 'analog' });
            pins.push({ pin: j.intensity[i].pins.digital, device: i, type: `intensity`, pin_type: 'digital' });
          }
        }
      }
    }
  } else {
    warnings.push(`no intensity sensors defined`);
  }
  // check encoders
  /*
  encoder:
left:
 name: left
 device: mirte
 pins:
   pin: GP14
right:
 name: right
 device: mirte
 pins:
   pin: GP15
*/
  if (`encoder` in j) {
    for (let e in j.encoder) {
      if (!(`name` in j.encoder[e])) {
        errors.push(`encoder ${e} name not defined`);
      }
      if (j.encoder[e].name != e) {
        errors.push(`encoder ${e} name not same`);
      }
      if (!(`pins` in j.encoder[e]) && !(`connector` in j.encoder[e])) {
        errors.push(`encoder ${e} pins not defined`);
      } else {
        if (`connector` in j.encoder[e]) {
          if (![`ENC1`, `ENC2`].includes(j.encoder[e].connector)) {
            errors.push(`encoder ${e} connector unknown ` + j.encoder[e].connector);
          } else {
            switch (j.encoder[e].connector) {
              case `ENC1`:
                pins.push({ pin: `GP15`, device: e, type: `encoder`, pin_type: 'interrupt' });
                break;
              case `ENC2`:
                pins.push({ pin: `GP14`, device: e, type: `encoder`, pin_type: 'interrupt' });
                break;
              default:
                errors.push(`encoder ${e} connector unknown ` + j.encoder[e].connector);
            }
          }
        } else {
          if (!(`pin` in j.encoder[e].pins) && (!('A' in j.encoder[e].pins) || !('B' in j.encoder[e].pins))) {
            errors.push(`encoder ${e} pin(s) not defined`);
          } else if ('A' in j.encoder[e].pins && 'B' in j.encoder[e].pins) {
            pins.push({ pin: j.encoder[e].pins.A, device: e, type: `encoder`, pin_type: 'interrupt' });
            pins.push({ pin: j.encoder[e].pins.B, device: e, type: `encoder`, pin_type: 'interrupt' });
          } else {
            pins.push({ pin: j.encoder[e].pins.pin, device: e, type: `encoder` });
          }
        }
      }
    }
  } else {
    warnings.push(`no encoders defined`);
  }

  // check pins:
  let pin_errors = [];
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    // console.log(pin);
    pin.pin_n = parseInt(pin.pin.toString().replace(/\D/g, ''));

    for (let j = i + 1; j < pins.length; j++) {
      pins[j].pin_n = parseInt(pins[j].pin.toString().replace(/\D/g, ''));

      if (pin.pin_n == pins[j].pin_n) {
        pin_errors.push(`pin ${pin.pin} used by ${pin.device} ${pin.type} and ${pins[j].device} ${pins[j].type}`);
      }

      if (pin.pin_type == 'pwm' && pins[j].pin_type == 'pwm' && micro == `pico`) {
        if (Math.abs(pin.pin_n - pins[j].pin_n) == 16) {
          pin_errors.push(`pwm pins ${pin.pin} and ${pins[j].pin} are on the same pwm channel and will get the same pwm signal`);
        }
      }
    }

    if (micro == `pico`) {
      if (pin.pin_n == 0 || pin.pin_n == 1) {
        pin_errors.push(`pin ${pin.pin} is reserved`);
      }

      // either just number or GP followed by number
      if (!pin.pin.match(/^GP\d+$/) && !pin.pin.match(/^\d+$/)) {
        pin_errors.push(`pin ${pin.pin} is not a correct pin`);
      }
      if(pin.pin_n > 30) {
        pin_errors.push(`pin ${pin.pin} is not a correct pin`);
      }
      // check ananlog
      if (pin.pin_type == 'analog') {
        if (pin.pin_n < 26 && pin.pin_n > 29) {
          pin_errors.push(`pin ${pin.pin} is not an analog pin`);
        }
      }

    } else if (micro == `nano`) {
      // either just number or A followed by number or D followed by number
      if (!pin.pin.match(/^A\d+$/) && !pin.pin.match(/^D\d+$/) && !pin.pin.match(/^\d+$/)) {
        pin_errors.push(`pin ${pin.pin} is not a correct pin`);
      }
      // check rx tx pins
      if (pin.pin == 'D0' || pin.pin == 'D1' || pin.pin == '0' || pin.pin == '1') {
        pin_errors.push(`pin ${pin.pin} is reserved`);
      }
      // check ananlog
      if (pin.pin_type == 'analog') {
        if (!pin.pin.startsWith('A') || !pin.pin_n < 8) {
          pin_errors.push(`pin ${pin.pin} is not an analog pin`);
        }
      }
      if (pin.pin_type == 'pwm') {
        if ([3, 5, 6, 9, 10, 11].includes(pin.pin_n)) {
          pin_errors.push(`pin ${pin.pin} is not a pwm pin`);
        }
      }
      if (pin.pin_type == 'interrupt') {
        if (![2, 3].includes(pin.pin_n)) {
          pin_errors.push(`pin ${pin.pin} is not an interrupt pin`);
        }
      }
      if (pin.pin_type == 'digital' && (pin.pin == "A6" || pin.pin == "A7")) {
        pin_errors.push(`pin ${pin.pin} is not a digital pin`);
      }
      if (pin.pin_n > 13) {
        pin_errors.push(`pin ${pin.pin} is not a correct pin`);
      }
    }

  }
  errors = errors.concat(pin_errors);
  if (errors.length == 0) {
    ok = true;
  }
  return { ok, errors, warnings }
}

module.exports = check;