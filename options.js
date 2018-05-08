const fs = require('fs');
const _ = require('underscore');
const path = require('path');
const saveChangesDebounced = _.debounce(saveChanges);

const defaultOptions = require('./json/defaultOptions.json');
const defaultOptionsPath = path.join(__dirname, '/json/defaultOptions.json')
const optionsPath = path.join(__dirname, '/json/options.json');
const themesPath = path.join(__dirname, '/themes/');

const optionsSetup = [
  {
    summary: "Main",
    inputs: [
      {name: "Theme", type: "select", values: {options: loadThemes()}},
      {name: "FFT Size", type: "select", values: {options: [64, 128, 256, 512, 1024, 2048, 4096]}},
      {name: "Update Fps", type: "number", values: {min: 1, max: 144}}
    ]
  },
  {
    summary: "Colors",
    inputs: [
      {name: "Primary Color", type: "color"},
      {name: "Secondary Color", type: "color"},
      {name: "Tertiary Color", type: "color"}
    ]
  },
  {
    summary: "Bars",
    inputs: [
      {name: "Bar Rotation", type: "range", values: {min: 0, max: 360, step: 15}},
      {name: "Bar Width", type: "range", values: {min: 0, max: 100}},
      {name: "Bar Height", type: "range", values: {min: 0, max: 100}},
      {name: "Average Length", type: "range", values: {min: 1, max: 60}},
      {name: "Peak Decay", type: "range", values: {min: 1, max: 100}},
      {name: "Bar Y Spread", type: "range", values: {min: -100, max: 100}},
      {name: "Bar X Spread", type: "range", values: {min: 0, max: 100}},
      {name: "Bar Offset X", type: "range", values: {min: 0, max: 100}},
      {name: "Bar Offset Y", type: "range", values: {min: 0, max: 100}},
      {name: "Bar Inverse", type: "checkbox"}
    ]
  }
];

const inputTypes = {
  'number': {
    'tag': 'input',
    'type': 'number'
  },
  'range': {
    'tag': 'input',
    'type': 'range'
    },
  'checkbox': {
    'tag': 'input',
    'type': 'checkbox'
  },
  'color': {
    'tag': 'input',
    'type': 'color'
  },
  'select': {
    'tag': 'select',
    'type': null
  }
};

reinitialize();


function reinitialize(){
  let options = require(optionsPath);
  let optionsEl = document.querySelector("#options");
  while(optionsEl.firstChild){
    optionsEl.removeChild(optionsEl.firstChild);
  }
  optionsSetup.forEach((option) => {
    let optionGroup = document.createElement("details");
    let summary = document.createElement("summary");
    summary.appendChild(document.createTextNode(option.summary));
    optionGroup.appendChild(summary);
    option.inputs.forEach((input) => {
      let inputGroup = document.createElement("label");
      let inputType = inputTypes[input.type];
      let inputEl = document.createElement(inputType.tag);
      let labelText = document.createTextNode(input.name);
      inputEl.addEventListener('change', saveChangesDebounced);
      if(!inputType)
        return false;
      if(input.values && inputType.tag == 'select' && Array.isArray(input.values.options)){
        input.values.options.forEach((x)=>{
          let selectOption = document.createElement('option');
          let selectOptionText = document.createTextNode(x);
          selectOption.value = x;
          selectOption.appendChild(selectOptionText);
          inputEl.appendChild(selectOption);
        });
      }

      if(inputType.type)
        inputEl.type = inputType.type;
      if(input.values && input.values.min)
        inputEl.min = input.values.min;
      if(input.values && input.values.max)
        inputEl.max = input.values.max;
      if(input.values && input.values.step)
        inputEl.step = input.values.step;
      if(options && options[input.name])
        inputEl.value = options[input.name];

      inputEl.id = input.name.toLowerCase().replace(/\s+/gi,'-');
      inputGroup.appendChild(labelText);
      inputGroup.appendChild(inputEl);
      optionGroup.appendChild(inputGroup);
    });
    optionsEl.appendChild(optionGroup);
  });
}

function saveChanges(){
  let outboundOptions = defaultOptions;
  for(let option in outboundOptions){
    var optionEl = document.getElementById(option.toLowerCase().replace(/\s+/gi,'-'));
    outboundOptions[option] = optionEl.value;
  }

  let jsonOptions = JSON.stringify(outboundOptions);
  if(jsonOptions){
    fs.writeFile(optionsPath, jsonOptions, (e)=>{
      if(e)
        logError(e);
    });
  } else {
    logError('Failed to save options.');
  }
}

fs.readFile(optionsPath, (err, data) => {
  try{
    JSON.parse(data);
  } catch (e){
    logError(e);
    fs.unlink();
    fs.writeFile(optionsPath, JSON.stringify(defaultOptions));
  }
});

function logError(e){
  alert(e);
}

function loadThemes(){
  let themes = fs.readdirSync(themesPath).filter((x)=>{return x.indexOf('.') == -1})
  themes.push('Default');
  return themes;
}
