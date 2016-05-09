export interface ISpi {
  write(buffer: Buffer, callback: (error: any, data: any) => void): void;
}

export interface IDotstarOptions {
  length?: number;
}

export class Dotstar {
  static defaultOptions: IDotstarOptions = {
    length: 10
  };
  
  static startBytesLength = 4;
  static endBytesLength = 4;
  static bytesPerLed = 4;
  
  device: ISpi;
  length: number;
  ledBuffer: Buffer;
  colorBuffer: Buffer;
  offBuffer: Buffer;
  
  constructor(spi: ISpi, options: IDotstarOptions = {}) {
    this.length = options.length || Dotstar.defaultOptions.length;
    
    const fullBufferLength = Dotstar.startBytesLength + this.length * Dotstar.bytesPerLed + Dotstar.endBytesLength;
    this.ledBuffer = new Buffer(fullBufferLength);
    this.ledBuffer.fill(0);
    this.ledBuffer.fill(255, this.ledBuffer.length - Dotstar.endBytesLength);
    
    // Create buffer which is subset of the full buffer represetenting only the LEDs
    this.colorBuffer = this.ledBuffer.slice(Dotstar.startBytesLength, -Dotstar.endBytesLength);
    this.clear();
    
    this.offBuffer = new Buffer(fullBufferLength);
    this.ledBuffer.copy(this.offBuffer);
    
    this.device = spi;
    this.write(this.offBuffer);
  }
  
  /**
   * Set every LED in the colorBuffer to the RGBA value.
   */
  all(r: number, g: number, b: number, a: number = 1) {
    const singleLedBuffer = this.convertRgbaToLedBuffer(r,g,b,a);
    
    for(let led = 0; led < this.length; led++) {
      singleLedBuffer.copy(this.colorBuffer, Dotstar.bytesPerLed * led);
    }
  }
  
  /**
   * Set every LED in the colorBuffer to black/off.
   */
  clear() {
    this.all(0,0,0,0);
  }
  
  /**
   * Turn off every LED without having to update the color buffer.
   * This is slightly faster and useful when you want to resume with the previous color.
   */
  off() {
    this.write(this.offBuffer);
  }
  
  /**
   * Set a specific LED in the colorBuffer to RGBA value.
   */
  set(led: number, r: number, g: number, b: number, a: number = 1) {
    if(led < 0) {
      throw new Error(`led value must be a positive integer. You passed ${led}`);
    }
    if(led > this.length) {
      throw new Error(`led value must not be greater than the maximum length of the led strip. The max length is: ${this.length}. You passed: ${led}`);
    }
    
    const ledBuffer = this.convertRgbaToLedBuffer(r,g,b,a);
    const ledOffset = Dotstar.bytesPerLed * led;
    ledBuffer.copy(this.colorBuffer, ledOffset);
  }
  
  /**
   * Update DotStar LED strip with current data in led buffer.
   */
  sync() {
    this.write(this.ledBuffer);
  }
  
  /**
   * Convert RGBA value to Buffer
   */
  private convertRgbaToLedBuffer(r: number, g: number, b: number, a: number = 1): Buffer {
    const brightnessValue = Math.floor(0b11111 * a) + 0b11100000;
    
    const ledBuffer = new Buffer(Dotstar.bytesPerLed);
    ledBuffer.writeUInt8(brightnessValue, 0);
    ledBuffer.writeUInt8(b, 1);
    ledBuffer.writeUInt8(g, 2);
    ledBuffer.writeUInt8(r, 3);
    
    return ledBuffer;
  }
  
  /**
   * Wrapper around device.write which rethrows errors
   */
  private write(buffer: Buffer) {
    this.device.write(buffer, (error) => {
      if(error) {
        throw error;
      }
    });
  }
}