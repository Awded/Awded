const { ipcRenderer, remote } = require("electron");

const fs = require("fs");
const paths = require("../paths.js");

const optionsSetup = require(paths.optionsSetup);
const defaultOptions = require(paths.defaultOptions);
const inputTypes = require(paths.inputTypes);

const currentWindow = remote.getCurrentWindow();

let options = require(paths.options);

const optionsFunctions = {
  loadThemes() {
    let themes = fs.readdirSync(paths.themes).filter(x => {
      return x.indexOf(".") == -1;
    });
    themes.push("Default");
    return themes;
  }
};

reinitialize();

currentWindow.on("close", () => {
  revertChanges();
});

function reinitialize() {
  let optionsEl = document.querySelector("#options");
  while (optionsEl.firstChild) {
    optionsEl.removeChild(optionsEl.firstChild);
  }
  optionsSetup.forEach(option => {
    let optionGroup = document.createElement("details");
    let summary = document.createElement("summary");
    summary.appendChild(document.createTextNode(option.summary));
    optionGroup.appendChild(summary);
    option.inputs.forEach(input => {
      let inputGroup = document.createElement("label");
      let inputType = inputTypes[input.type];
      let inputEl = document.createElement(inputType.tag);
      let label = document.createElement("span");
      let labelText = document.createTextNode(input.name);
      inputEl.id = input.name.toLowerCase().replace(/\s+/gi, "-");
      inputEl.addEventListener("input", x => {
        ipcRenderer.send("setOptions", getOptions());
      });
      inputEl.addEventListener("change", x => {
        ipcRenderer.send("setOptions", getOptions());
      });
      if (!inputType) {
        return false;
      }
      if (input.values && inputType.tag == "select") {
        if (input.values.optionsFunction) {
          const optionsFunction =
            optionsFunctions[input.values.optionsFunction];
          if (optionsFunction) {
            input.values.options = optionsFunction();
          }
        }
        if (Array.isArray(input.values.options)) {
          input.values.options.forEach(x => {
            let selectOption = document.createElement("option");
            let selectOptionText = document.createTextNode(x);
            selectOption.value = x;
            selectOption.appendChild(selectOptionText);
            inputEl.appendChild(selectOption);
          });
        }
      }
      if (inputType.type) {
        inputEl.type = inputType.type;
      }
      if (input.values && input.values.min) {
        inputEl.min = input.values.min;
      }
      if (input.values && input.values.max) {
        inputEl.max = input.values.max;
      }
      if (input.values && input.values.step) {
        inputEl.step = input.values.step;
      }
      if (options && options[input.name]) {
        inputEl.value = options[input.name];
        if (input.type == "checkbox") inputEl.checked = options[input.name];
      }
      label.appendChild(labelText);
      inputGroup.appendChild(label);
      inputGroup.appendChild(inputEl);
      optionGroup.appendChild(inputGroup);
      if (input.values && input.type == "range") {
        let rangeNumberEl = document.createElement("input");
        rangeNumberEl.value = inputEl.value;
        rangeNumberEl.id = inputEl.id + "-input";
        rangeNumberEl.classList.add("range-input");
        inputEl.addEventListener("input", x => {
          rangeNumberEl.value = inputEl.value;
        });
        rangeNumberEl.addEventListener("input", x => {
          inputEl.value = rangeNumberEl.value;
          inputEl.dispatchEvent(
            new Event("input", {
              bubbles: true,
              cancelable: true
            })
          );
        });
        inputGroup.appendChild(rangeNumberEl);
      }
    });
    optionsEl.appendChild(optionGroup);
  });

  let save = document.createElement("button");
  let revert = document.createElement("button");
  let saveText = document.createTextNode("Save");
  let revertText = document.createTextNode("Revert");
  let buttonGroup = document.createElement("div");
  save.id = "save";
  revert.id = "revert";
  if (!document.querySelector("#optionsButtonGroup")) {
    save.appendChild(saveText);
    revert.appendChild(revertText);
    buttonGroup.id = "optionsButtonGroup";
    buttonGroup.appendChild(save);
    buttonGroup.appendChild(revert);
    save.addEventListener("click", saveChanges);
    revert.addEventListener("click", revertChanges);
    optionsEl.parentNode.insertBefore(buttonGroup, optionsEl.nextSibling);
  }
}

function setInputValues() {
  optionsSetup.forEach(option => {
    option.inputs.forEach(input => {
      let inputEl = document.querySelector(
        "#" + input.name.toLowerCase().replace(/\s+/gi, "-")
      );
      let rangeNumberEl = document.querySelector("#" + inputEl.id + "-input");
      if (options && options[input.name]) {
        inputEl.value = options[input.name];
        if (input.type == "checkbox") inputEl.checked = options[input.name];
      }
      if (rangeNumberEl) rangeNumberEl.value = inputEl.value;
    });
  });
}

function saveChanges() {
  options = getOptions();

  let jsonOptions = JSON.stringify(options);
  if (jsonOptions) {
    fs.writeFile(paths.options, jsonOptions, e => {
      if (e) logError(e);
    });
  } else {
    logError("Failed to save options.");
  }
}

function revertChanges() {
  setInputValues();
  ipcRenderer.send("setOptions", options);
}

function getOptions() {
  let outboundOptions = defaultOptions;
  for (let option in outboundOptions) {
    var optionEl = document.getElementById(
      option.toLowerCase().replace(/\s+/gi, "-")
    );
    outboundOptions[option] =
      option == "Bar Inverse" ? !!optionEl.checked : optionEl.value;
  }
  console.log(outboundOptions);
  return outboundOptions;
}

fs.readFile(paths.options, (err, data) => {
  try {
    JSON.parse(data);
  } catch (e) {
    logError(e);
    fs.unlink();
    fs.writeFile(paths.options, JSON.stringify(defaultOptions));
  }
});

function logError(e) {
  alert(e);
}
