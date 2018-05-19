const { ipcRenderer } = require("electron");

const fs = require("fs");
const path = require("path");

const defaultOptions = require("./json/defaultOptions.json");
const defaultOptionsPath = path.join(__dirname, "/json/defaultOptions.json");
const optionsSetupPath = path.join(__dirname, "/json/optionsSetup.json");
const optionsPath = path.join(__dirname, "/json/options.json");
const themesPath = path.join(__dirname, "/themes/");

const optionsSetup = require(optionsSetupPath);

const inputTypes = {
  number: {
    tag: "input",
    type: "number"
  },
  range: {
    tag: "input",
    type: "range"
  },
  checkbox: {
    tag: "input",
    type: "checkbox"
  },
  color: {
    tag: "input",
    type: "color"
  },
  select: {
    tag: "select",
    type: null
  }
};

const optionsFunctions = {
  loadThemes() {
    let themes = fs.readdirSync(themesPath).filter(x => {
      return x.indexOf(".") == -1;
    });
    themes.push("Default");
    return themes;
  }
};

reinitialize();

function reinitialize() {
  let options = require(optionsPath);
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
        ipcRenderer.send("options", getOptions());
      });
      inputEl.addEventListener("change", x => {
        ipcRenderer.send("options", getOptions());
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
    revert.addEventListener("click", reinitialize);
    optionsEl.parentNode.insertBefore(buttonGroup, optionsEl.nextSibling);
  }
  ipcRenderer.send("options", getOptions());
}

app;

function saveChanges() {
  let outboundOptions = getOptions();

  let jsonOptions = JSON.stringify(outboundOptions);
  if (jsonOptions) {
    fs.writeFile(optionsPath, jsonOptions, e => {
      if (e) logError(e);
    });
  } else {
    logError("Failed to save options.");
  }
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

  return outboundOptions;
}

fs.readFile(optionsPath, (err, data) => {
  try {
    JSON.parse(data);
  } catch (e) {
    logError(e);
    fs.unlink();
    fs.writeFile(optionsPath, JSON.stringify(defaultOptions));
  }
});

function logError(e) {
  alert(e);
}
