const left = document.querySelector("#leftbars");
const right = document.querySelector("#rightbars");

let FFTList = [];
let options;

class FFT {
  constructor(value, i, parent) {
    this._pastValues = [0];
    this._value = value || 0;
    this._index = i;
    this._peak = 0;
    this._parent = parent;
    this._otherChannel = false;
    this.el = document.createElement("li");
    this.quarterFFTSize = options["FFT Size"] / 4;
    this.el.style.setProperty("--position", this._index % this.quarterFFTSize);
    this.setProperties();
    parent.appendChild(this.el);
    return this;
  }

  get value() {
    return this._value;
  }

  set value(x) {
    this._value = x;
    this._pastValues.push(x);
    while (this._pastValues.length > options["Average Length"])
      this._pastValues.shift();
    this.peak = x;
    if (!this._otherChannel) {
      if (this._parent == right) {
        this._otherChannel = FFTList[this._index - this.quarterFFTSize];
      } else {
        this._otherChannel = FFTList[this._index + this.quarterFFTSize];
      }
    }
    this.setProperties();
    return this._value;
  }

  get peak() {
    return this._peak;
  }

  set peak(x) {
    this._peak -= options["Peak Decay"];
    this._peak = Math.max(0, Math.max(this._peak, x));
    return this._peak;
  }

  get averageValue() {
    return Math.max(
      this._pastValues.reduce((t, v) => t + v) / this._pastValues.length,
      0.0001
    );
  }

  setProperties() {
    this.el.style.setProperty("--value", this._value);
    this.el.style.setProperty("--average-value", this.averageValue);
    this.el.style.setProperty("--peak-value", this.peak);
    if (this._otherChannel) {
      this.el.style.setProperty("--other-value", this._otherChannel._value);
      this.el.style.setProperty(
        "--other-average-value",
        this._otherChannel.averageValue
      );
      this.el.style.setProperty("--other-peak-value", this._otherChannel._peak);
    }
  }

  clear() {
    FFTList = [];
  }
}

FFT.setList = newFFTs => {
  if (Array.isArray(newFFTs)) {
    if (FFTList.length == newFFTs.length) {
      newFFTs.forEach((v, i) => {
        FFTList[i].value = (v + 100) * 0.1; //Math.log10(v) * 100;
      });
    } else {
      FFTList = [];
      while (left.firstChild) {
        left.removeChild(left.firstChild);
      }
      while (right.firstChild) {
        right.removeChild(right.firstChild);
      }
      FFTList = newFFTs.map((v, i) => {
        return new FFT(v, i, i < options["FFT Size"] / 4 ? left : right);
      });
    }
  } else {
    throw new TypeError("FFT list must be an array.");
  }
};

FFT.setOptions = newOptions => {
  options = newOptions;
};

module.exports = FFT;
