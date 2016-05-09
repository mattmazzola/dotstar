"use strict";
var dotstar = require('../dist/dotstar');
var dotstar1;
var spi;
var spiWriteSpy;
describe('dotstar', function () {
    beforeEach(function () {
        spi = jasmine.createSpyObj("spiMock", ["write"]);
        spiWriteSpy = spi.write;
        dotstar1 = new dotstar.Dotstar(spi, { length: 2 });
    });
    it('turns off all LEDs when initialized', function () {
        // Arrange
        var expectedBuffer = new Buffer([0x00, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF]);
        // Act
        // Assert
        var actualBuffer = spiWriteSpy.calls.mostRecent().args[0];
        expect(actualBuffer.equals(expectedBuffer)).toBe(true);
    });
    describe('all', function () {
        it('all() does not update the LED strip only sets the memory for the next sync', function () {
            // Arrange
            // Act
            dotstar1.all(255, 255, 255, 1);
            // Assert
            expect(spiWriteSpy.calls.count()).toEqual(1);
        });
        it('all() sets each LED to the specified RGBA color', function () {
            // Arrange
            var expectedBuffer = new Buffer([0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
            // Act
            dotstar1.all(255, 255, 255, 1);
            dotstar1.sync();
            // Assert
            var actualBuffer = spiWriteSpy.calls.mostRecent().args[0];
            expect(actualBuffer.equals(expectedBuffer)).toBe(true);
        });
    });
    describe('set', function () {
        it('all() does not update the LED strip only sets the memory for the next sync', function () {
            // Arrange
            // Act
            dotstar1.set(1, 255, 255, 255, 1);
            // Assert
            expect(spiWriteSpy.calls.count()).toEqual(1);
        });
        it('set() sets the LED at index to the specified RGBA color', function () {
            // Arrange
            var expectedBuffer = new Buffer([0x00, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
            // Act
            dotstar1.set(1, 255, 255, 255, 1);
            dotstar1.sync();
            // Assert
            var actualBuffer = spiWriteSpy.calls.mostRecent().args[0];
            expect(actualBuffer.equals(expectedBuffer)).toBe(true);
        });
    });
    describe('clear', function () {
        it('clear() does not update the LED strip only sets the memory for the next sync', function () {
            // Arrange
            // Act
            dotstar1.clear();
            // Assert
            expect(spiWriteSpy.calls.count()).toEqual(1);
        });
        it('clear() sets all the LED colors to ', function () {
            // Arrange
            var expectedBuffer = new Buffer([0x00, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x00, 0xE0, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF]);
            // Act
            dotstar1.all(255, 255, 255, 1);
            dotstar1.clear();
            dotstar1.sync();
            // Assert
            var actualBuffer = spiWriteSpy.calls.mostRecent().args[0];
            expect(actualBuffer.equals(expectedBuffer)).toBe(true);
        });
    });
    describe('sync', function () {
        it('sync() call the internal device.write', function () {
            // Arrange
            // Act
            dotstar1.sync();
            dotstar1.sync();
            // Assert
            expect(spiWriteSpy.calls.count()).toEqual(3);
        });
    });
});
//# sourceMappingURL=dotstar.spec.js.map