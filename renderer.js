const app = require('electron').remote.app;
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const defaultOptionsPath = path.join(__dirname, '/json/defaultOptions.json')
const optionsPath = path.join(__dirname, '/json/options.json');
const themesPath = path.join(__dirname, '/themes/');

if(!fs.existsSync(optionsPath)){
  fs.createReadStream(defaultOptionsPath).pipe(fs.createWriteStream(optionsPath));
}

let options = require(optionsPath);
let quarterFftSize = options['FFT Size']/4;

let bars = {
  left: document.querySelector('#leftbars'),
  right: document.querySelector('#rightbars')
}

let ffts = {
  _list: [],
  get list(){
    return this._list;
  },
  set list(newFfts){
    if(Array.isArray(newFfts)){
      if(this._list.length == newFfts.length){
        newFfts.forEach((v, i) => {
          this._list[i].value = Math.log10(v) * 100;
        });
      } else {
        this._list = [];
        while(bars.left.firstChild){
          bars.left.removeChild(bars.left.firstChild);
        }
        while(bars.right.firstChild){
          bars.right.removeChild(bars.right.firstChild);
        }
        this._list = newFfts.map((v, i) => {return new Fft(v, i, i < quarterFftSize?bars.left:bars.right);});
      }
    } else {
      throw new TypeError('Fft list must be an array.');
    }
  }
}

initialize(options);

class Fft {
  constructor(value, i, parent){
    this._pastValues = [0,0,0,0,0];
    this._value = value;
    this._index = i;
    this._peak = 0;
    this._parent = parent;
    this._otherChannel = false;
    this.el = document.createElement('li');
    this.el.style.setProperty('--position', this._index%quarterFftSize);
    parent.appendChild(this.el);
    return this;
  }

  get value(){
    return this._value;
  }

  set value(x){
    this._value = x;
    this._pastValues.push(x);
    while(this._pastValues.length > options['Average Length'])
      this._pastValues.shift();
    this.peak = x;
    if(!this._otherChannel){
      if(this._parent == bars.right){
        this._otherChannel = ffts.list[this._index - quarterFftSize];
      } else {
        this._otherChannel = ffts.list[this._index + quarterFftSize];
      };
    }
    this.el.style.setProperty('--value', this._value);
    this.el.style.setProperty('--average-value', this.averageValue);
    this.el.style.setProperty('--peak-value', this.peak)
    if(this._otherChannel){
      this.el.style.setProperty('--other-value', this._otherChannel._value)
      this.el.style.setProperty('--other-average-value', this._otherChannel.averageValue)
      this.el.style.setProperty('--other-peak-value', this._otherChannel._peak)
    }
    return this._value;
  }

  get peak(){
    return this._peak;
  }

  set peak(x){
    this._peak -= options['Peak Decay'];
    this._peak = Math.max(0, Math.max(this._peak, x));
    return this._peak;
  }

  get averageValue(){
    return Math.max(this._pastValues.reduce( (t, v) => t + v ) / this._pastValues.length, .0001);
  }
};

function initialize(options){
  let awdedFFT = cp.spawn(path.join(app.getAppPath(), 'AwdedFFT.exe').replace('app.asar', 'app.asar.unpacked'), [Math.round(1000 / options['Update Fps']), (options['FFT Size']).toString()]);
  let body = document.querySelector('body');

  document.querySelector('.bars').style.setProperty('--fftSize', options['FFT Size']);
  body.style.setProperty('--theme', options['Theme']);
  body.style.setProperty('--update-fps', options['Update Fps']);
  body.style.setProperty('--primary-color', options['Primary Color']);
  body.style.setProperty('--secondary-color', options['Secondary Color']);
  body.style.setProperty('--tertiary-color', options['Tertiary Color']);
  body.style.setProperty('--bar-direction', options['Bar Direction']);
  body.style.setProperty('--bar-width', options['Bar Width']);
  body.style.setProperty('--bar-height', options['Bar Height']);
  body.style.setProperty('--average-length', options['Average Length']);
  body.style.setProperty('--bar-y-spread', options['Bar Y Spread']);
  body.style.setProperty('--bar-x-spread', options['Bar X Spread']);
  body.style.setProperty('--bar-offset-x', options['Bar Offset X']);
  body.style.setProperty('--bar-offset-y', options['Bar Offset Y']);
  body.style.setProperty('--bar-inverse', options['Bar Inverse']);

  audedFFT.stdout.on('data', (data) => {
    try{
      ffts.list = JSON.parse(data);
    }  catch(e) {
      console.log(e);
    }
  });
}
