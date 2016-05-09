# dotstar
A javascript library to use the Adafruit DotStar LED strip with raspberry pi.

DotStar LEDs: https://learn.adafruit.com/adafruit-dotstar-leds/overview

Based on: https://github.com/RussTheAerialist/node-adafruit-pixel

## No dependencies

This library is not tied to specific implementaiton of Spi bus communication and allows taking any object which implements the `dotstar.ISpy` interface:
```
export interface ISpi {
  write(buffer: Buffer, callback: (error: any, data: any) => void): void;
}
```

This means you can use node [pi-spy](https://github.com/natevw/pi-spi) or [node-spi](https://github.com/RussTheAerialist/node-spi)

## Usage

```
import * as dotstar from './dotstar';
const SPI = require('pi-spi');

spi = SPI.initialize('/dev/spidev0.0');
const ledStripLength = 144;

const ledStrip = new dotstar.Dotstar(spi, {
  length: ledStripLength
});
```

> When an instace of Dotstar class is created it will automatically set all LEDs to off/black.

## Methods

Set all leds to same color
```
ledStrip.all(255, 200, 175, 0.8);
ledStrip.sync();
```

Set single led to a color
```
ledStrip.set(1, 0, 255, 148, 0.5);
ledStrip.sync();
```

> For both the `all` and `set` methods if you don't specify the `a` (alpha) value it defaults to 1.


Set all leds to off/black
```
ledStrip.clear();
ledStrip.sync();
```

Set all leds to off/black without overwriting internal LED color data.
```
ledStrip.off();
```

# Notes
The DotStar library is simple. It simply manages node 3 different node Buffers.

There is the `colorBuffer` which holds color data for each LED.  From the design sheet you can see that each LED is 4 bytes and must start with first three bits as ones (0b11100000)

There is the `ledBuffer` which is full buffere which overlaps with the `colorBuffer` but has the prefix of 4 bytes of 0x00 and suffix of 4 bytes of 0xFF.

There is also another buffer called `offBuffer` which is like the full `ledBuffer` but preconfigured to set all LEDs off and can be written over the spi bus without having to update the color buffer.

This means you could alternate between off and red without updating anything in memory. Notice the calls to sync send whatever the current state of the `ledBuffer`.

```
ledStrip.all(255,0,0);
ledStrip.sync(); // Set red
ledStrip.off();  // Set off
ledStrip.sync(); // Set red
ledStrip.off();  // Set off
...
```
