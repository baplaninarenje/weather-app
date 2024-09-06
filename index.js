// query selectors
const html = document.querySelector('html');
const form = document.querySelector('[data-form-user]');
const locationInput = document.querySelector('[data-location]');
const dateInput = document.querySelector('[data-date]');
const systemOfUnitsSelect = document.querySelector('[name="units"]');
const submitBtn = document.querySelector('[data-get-weather-data]');
const contentSection = document.querySelector('[data-content]');
const weatherInfoTemplate = document.querySelector(
  '[data-template-weather-info]'
);
const errorPara = document.querySelector('[data-error]');
const loader = document.querySelector('[data-loader]');
// query selectors

function setErrorMsg(element) {
  let msg;

  if (element.validity.valueMissing) {
    msg = 'Field is empty';
  } else msg = '';

  element.setCustomValidity(msg);
}

function setUIDateToToday() {
  const today = new Date().toISOString().split('T')[0];
  dateInput.defaultValue = today;
}

async function getGiphyData(searchTerm) {
  const apiKey = 'bb2006d9d3454578be1a99cfad65913d';
  const url = `https://api.giphy.com/v1/gifs/translate?api_key=${apiKey}&s=${searchTerm}`;

  try {
    const response = await fetch(url, { mode: 'cors' });

    if (response.ok) {
      errorPara.textContent = '';
      errorPara.classList.remove('successful-info', 'error-info');
      const json = await response.json();
      return json;
    } else {
      errorPara.textContent = await response.text();
      errorPara.className = 'error-info';
      return;
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function getWeatherData(location, date, unitGroup) {
  const apiKey = 'D8G6THCZLW93DX37FRCSZWTBE';
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?unitGroup=${unitGroup}&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      errorPara.textContent = '';
      errorPara.classList.remove('successful-info', 'error-info');
      const json = await response.json();
      return json;
    } else {
      errorPara.textContent = await response.text();
      errorPara.className = 'error-info';
      return;
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function getWeatherObjectToDisplay(location, date, unitGroup) {
  try {
    const response = await getWeatherData(location, date, unitGroup);

    if (response) {
      const { conditions, humidity, icon, pressure, temp, uvindex } =
        response.days[0];

      return { conditions, humidity, icon, pressure, temp, uvindex };
    } else return;
  } catch (error) {
    throw new Error(error);
  }
}

function createWeatherDataUI(data) {
  const weatherInfoTemplateClone = weatherInfoTemplate.content.cloneNode(true);

  const locationNameSpan = weatherInfoTemplateClone.querySelector(
    '[data-location-name]'
  );
  const conditionsSpan =
    weatherInfoTemplateClone.querySelector('[data-conditions]');
  const humiditySpan =
    weatherInfoTemplateClone.querySelector('[data-humidity]');
  const pressureSpan =
    weatherInfoTemplateClone.querySelector('[data-pressure]');
  const tempSpan = weatherInfoTemplateClone.querySelector('[data-temp]');
  const uvindexSpan = weatherInfoTemplateClone.querySelector('[data-uvindex]');

  const { conditions, humidity, icon, pressure, temp, uvindex } = data;
  locationNameSpan.textContent =
    locationInput.value.charAt(0).toUpperCase() + locationInput.value.slice(1);
  conditionsSpan.textContent = conditions ? conditions : '/';
  humiditySpan.textContent = humidity ? humidity : '/';
  pressureSpan.textContent = pressure ? pressure : '/';
  tempSpan.textContent = temp ? temp : '/';
  uvindexSpan.textContent = uvindex ? uvindex : '/';

  contentSection.replaceChildren(weatherInfoTemplateClone);
}

function handleFormValidation(input) {
  setErrorMsg(input);

  if (input.validationMessage !== '') {
    errorPara.textContent = input.validationMessage;
    errorPara.className = 'error-info';
    input.className = 'error-info';
  } else {
    if (form.checkValidity()) {
      errorPara.innerHTML = '&#10003;';
      errorPara.className = 'successful-info';
    }
    input.className = 'successful-info';
  }
}

locationInput.onblur = () => {
  if (!form.checkValidity()) handleFormValidation(locationInput);
};

submitBtn.onclick = () => {
  if (form.checkValidity()) {
    errorPara.textContent = '';
    errorPara.classList.remove('successful-info', 'error-info');
    loader.className = 'loader';
    getWeatherObjectToDisplay(
      locationInput.value,
      dateInput.value,
      systemOfUnitsSelect.value
    ).then((data) => {
      if (data) {
        createWeatherDataUI(data);

        const weatherContainer = document.querySelector(
          '[data-weather-container]'
        );

        getGiphyData(data.icon).then((data) => {
          if (data.data.images) {
            html.style.backgroundImage = `url("${data.data.images.original.url}")`;
          } else {
            html.style.backgroundImage = null;
          }
        });
      } else {
        contentSection.replaceChildren();
        html.style.backgroundImage = null;
      }
      loader.classList.remove('loader');
    });
  } else handleFormValidation(locationInput);
};

window.onload = () => {
  setUIDateToToday();
};

window.onoffline = () => {
  html.style.backgroundImage = null;
  errorPara.textContent = 'Appears that You`re offline';
};

window.ononline = () => {
  errorPara.textContent = '';
};
