const apiKey = "a510f7a144a445cfb92154721262303";

const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const themeButton = document.getElementById("theme-button");
const unitButton = document.getElementById("unit-button");
const favoriteButton = document.getElementById("favorite-button");

const message = document.getElementById("message");
const loading = document.getElementById("loading");

const cityName = document.getElementById("city-name");
const cityDate = document.getElementById("city-date");
const cityTime = document.getElementById("city-time");
const cityTemp = document.getElementById("city-temp");
const weatherCondition = document.getElementById("weather-condition");
const weatherIcon = document.getElementById("weather-icon");

const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const airQuality = document.getElementById("air-quality");
const pressure = document.getElementById("pressure");
const uvIndex = document.getElementById("uv-index");
const visibility = document.getElementById("visibility");
const sunTime = document.getElementById("sun-time");

const recentSearchesContainer = document.getElementById("recent-searches");
const favoriteCitiesContainer = document.getElementById("favorite-cities");
const hourlyForecastContainer = document.getElementById("hourly-forecast");
const forecastListContainer = document.getElementById("forecast-list");
const defaultCity = "Hajipur";

let isCelsius = true;
let currentWeatherData = null;
let currentCity = "";
let hasUserSearched = false;
const cachedWeatherKey = "cachedWeatherData";

function getRecentSearches() {
  const data = localStorage.getItem("recentSearches");
  if (data) {
    return JSON.parse(data);
  }

  return [];
}

function getFavoriteCities() {
  const data = localStorage.getItem("favoriteCities");
  if (data) {
    return JSON.parse(data);
  }

  return [];
}

function saveRecentSearch(city) {
  let searches = getRecentSearches();
  searches = searches.filter(function (item) {
    return item.toLowerCase() !== city.toLowerCase();
  });

  searches.unshift(city);
  searches = searches.slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(searches));
  showRecentSearches();
}

function saveFavoriteCity(city) {
  let favorites = getFavoriteCities();

  const alreadyAdded = favorites.some(function (item) {
    return item.toLowerCase() === city.toLowerCase();
  });

  if (alreadyAdded) {
    showMessage("City is already in favorites.", "#d97706");
    return;
  }

  favorites.push(city);
  localStorage.setItem("favoriteCities", JSON.stringify(favorites));
  showFavoriteCities();
  showMessage("City added to favorites.", "green");
}

function removeFavoriteCity(city) {
  let favorites = getFavoriteCities();
  favorites = favorites.filter(function (item) {
    return item.toLowerCase() !== city.toLowerCase();
  });

  localStorage.setItem("favoriteCities", JSON.stringify(favorites));
  showFavoriteCities();
}

function createCityButton(city, container, canRemove) {
  const button = document.createElement("button");
  button.className = "tag-button";
  button.type = "button";

  if (canRemove) {
    button.innerText = city + " x";
    button.addEventListener("click", function () {
      removeFavoriteCity(city);
    });
  } else {
    button.innerText = city;
    button.addEventListener("click", function () {
      cityInput.value = city;
      searchWeatherByCity(city);
    });
  }

  container.appendChild(button);
}

function showRecentSearches() {
  const searches = getRecentSearches();
  recentSearchesContainer.innerHTML = "";

  if (searches.length === 0) {
    recentSearchesContainer.innerHTML = "<p>No recent searches yet.</p>";
    return;
  }

  searches.forEach(function (city) {
    createCityButton(city, recentSearchesContainer, false);
  });
}

function showFavoriteCities() {
  const favorites = getFavoriteCities();
  favoriteCitiesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoriteCitiesContainer.innerHTML = "<p>No favorite cities yet.</p>";
    return;
  }

  favorites.forEach(function (city) {
    createCityButton(city, favoriteCitiesContainer, true);
  });
}

function showMessage(text, color) {
  message.innerText = text;
  message.style.color = color;
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function formatDate(dateText) {
  const date = new Date(dateText);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTime(dateText) {
  const date = new Date(dateText);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getTemperatureText(celsiusValue) {
  if (isCelsius) {
    return celsiusValue + " C";
  }

  const fahrenheitValue = (celsiusValue * 9) / 5 + 32;
  return fahrenheitValue.toFixed(1) + " F";
}

function getSpeedText(kphValue) {
  if (isCelsius) {
    return kphValue + " kph";
  }

  const mphValue = kphValue * 0.621371;
  return mphValue.toFixed(1) + " mph";
}

function getDistanceText(kmValue) {
  if (isCelsius) {
    return kmValue + " km";
  }

  const milesValue = kmValue * 0.621371;
  return milesValue.toFixed(1) + " miles";
}

function getPressureText(mbValue) {
  if (isCelsius) {
    return mbValue + " mb";
  }

  const inchValue = mbValue * 0.02953;
  return inchValue.toFixed(2) + " in";
}

function getAirQualityText(aqiValue) {
  if (aqiValue === 1) {
    return { text: "Good", className: "air-good" };
  }

  if (aqiValue === 2) {
    return { text: "Moderate", className: "air-moderate" };
  }

  if (aqiValue === 3 || aqiValue === 4 || aqiValue === 5 || aqiValue === 6) {
    return { text: "Unhealthy", className: "air-bad" };
  }

  return { text: "Not available", className: "" };
}

function applyTheme() {
  document.body.className = "";

  if (document.body.dataset.theme === "dark") {
    document.body.classList.add("dark-mode", "weather-night");
  } else {
    document.body.classList.add("weather-default");
  }
}

function clearWeatherInfo() {
  cityName.innerText = "City name";
  cityDate.innerText = "Date";
  cityTime.innerText = "Local time";
  cityTemp.innerText = "--";
  weatherCondition.innerText = "Weather condition";
  feelsLike.innerText = "--";
  humidity.innerText = "--";
  windSpeed.innerText = "--";
  airQuality.innerText = "--";
  pressure.innerText = "--";
  uvIndex.innerText = "--";
  visibility.innerText = "--";
  sunTime.innerText = "--";
  hourlyForecastContainer.innerHTML = "";
  forecastListContainer.innerHTML = "";
  weatherIcon.classList.add("hidden-image");
  weatherIcon.src = "";
}

async function getWeatherData(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=yes&alerts=yes`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function getWeatherByCoordinates(latitude, longitude) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=5&aqi=yes&alerts=yes`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function showHourlyForecast(forecastDays, localTime) {
  hourlyForecastContainer.innerHTML = "";

  const currentHour = new Date(localTime).getHours();
  let nextHours = forecastDays[0].hour.slice(currentHour, currentHour + 6);

  if (nextHours.length < 6 && forecastDays.length > 1) {
    const remainingHours = 6 - nextHours.length;
    const tomorrowHours = forecastDays[1].hour.slice(0, remainingHours);
    nextHours = nextHours.concat(tomorrowHours);
  }

  if (nextHours.length === 0) {
    nextHours = forecastDays[0].hour.slice(0, 6);
  }

  nextHours.forEach(function (hourItem) {
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <p>${formatTime(hourItem.time)}</p>
      <img src="https:${hourItem.condition.icon}" alt="icon">
      <p>${getTemperatureText(hourItem.temp_c)}</p>
      <p>${hourItem.condition.text}</p>
    `;
    hourlyForecastContainer.appendChild(card);
  });
}

function showForecast(forecastDays) {
  forecastListContainer.innerHTML = "";

  forecastDays.forEach(function (dayItem) {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <h4>${formatDate(dayItem.date)}</h4>
      <img src="https:${dayItem.day.condition.icon}" alt="forecast icon">
      <p>${dayItem.day.condition.text}</p>
      <p>Max: ${getTemperatureText(dayItem.day.maxtemp_c)}</p>
      <p>Min: ${getTemperatureText(dayItem.day.mintemp_c)}</p>
    `;
    forecastListContainer.appendChild(card);
  });
}

function showWeatherData(data) {
  currentWeatherData = data;
  currentCity = data.location.name;

  cityName.innerText = `${data.location.name}, ${data.location.region}, ${data.location.country}`;
  cityDate.innerText = formatDate(data.location.localtime);
  cityTime.innerText = "Local time: " + formatTime(data.location.localtime);
  cityTemp.innerText = getTemperatureText(data.current.temp_c);
  weatherCondition.innerText = data.current.condition.text;
  feelsLike.innerText = getTemperatureText(data.current.feelslike_c);
  humidity.innerText = data.current.humidity + "%";
  windSpeed.innerText = getSpeedText(data.current.wind_kph);
  pressure.innerText = getPressureText(data.current.pressure_mb);
  uvIndex.innerText = data.current.uv;
  visibility.innerText = getDistanceText(data.current.vis_km);
  sunTime.innerText = data.forecast.forecastday[0].astro.sunrise + " / " + data.forecast.forecastday[0].astro.sunset;

  const airData = getAirQualityText(data.current.air_quality["us-epa-index"]);
  airQuality.innerText = airData.text;
  airQuality.className = airData.className;

  weatherIcon.src = `https:${data.current.condition.icon}`;
  weatherIcon.classList.remove("hidden-image");

  applyTheme();
  showHourlyForecast(data.forecast.forecastday, data.location.localtime);
  showForecast(data.forecast.forecastday);
}

function saveCachedWeather(data) {
  if (!data || !data.location || !data.location.name) {
    return;
  }

  if (data.location.name.toLowerCase() !== defaultCity.toLowerCase()) {
    return;
  }

  localStorage.setItem(cachedWeatherKey, JSON.stringify(data));
}

function loadCachedWeather() {
  const raw = localStorage.getItem(cachedWeatherKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.location &&
      parsed.location.name &&
      parsed.location.name.toLowerCase() === defaultCity.toLowerCase()
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function searchWeatherByCity(city, silent = false) {
  if (city.trim() === "") {
    if (!silent) {
      showMessage("Please enter a city name.", "#dc2626");
    }
    clearWeatherInfo();
    return false;
  }

  try {
    showLoading();
    if (!silent) {
      showMessage("Loading weather data...", "#1d3557");
    }

    const data = await getWeatherData(city);

    hideLoading();

    if (data.error) {
      if (!silent) {
        showMessage(data.error.message, "#dc2626");
      }
      clearWeatherInfo();
      return false;
    }

    showWeatherData(data);
    saveCachedWeather(data);
    saveRecentSearch(data.location.name);
    if (!silent) {
      showMessage("Weather data loaded successfully.", "green");
    }
    return true;
  } catch (error) {
    hideLoading();
    if (!silent) {
      showMessage("Internet problem or API issue. Please try again.", "#dc2626");
    }
    const cachedData = loadCachedWeather();
    if (cachedData) {
      showWeatherData(cachedData);
    } else {
      clearWeatherInfo();
    }
    return false;
  }
}

function searchWeather() {
  hasUserSearched = true;
  const city = cityInput.value.trim();
  searchWeatherByCity(city);
}

function searchByLocation() {
  if (!navigator.geolocation) {
    showMessage("Geolocation is not supported in this browser.", "#dc2626");
    return;
  }

  showMessage("Getting your location...", "#1d3557");
  showLoading();

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const data = await getWeatherByCoordinates(latitude, longitude);

        hideLoading();

        if (data.error) {
          showMessage(data.error.message, "#dc2626");
          clearWeatherInfo();
          return;
        }

        cityInput.value = data.location.name;
        showWeatherData(data);
        saveRecentSearch(data.location.name);
        showMessage("Weather loaded from your location.", "green");
      } catch (error) {
        hideLoading();
        showMessage("Could not load location weather.", "#dc2626");
      }
    },
    function () {
      hideLoading();
      showMessage("Location permission denied.", "#dc2626");
    }
  );
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    document.body.dataset.theme = "dark";
    themeButton.innerText = "Light Mode";
  } else {
    document.body.dataset.theme = "light";
    themeButton.innerText = "Dark Mode";
  }

  applyTheme();
}

function toggleUnit() {
  isCelsius = !isCelsius;

  if (isCelsius) {
    unitButton.innerText = "Show F";
  } else {
    unitButton.innerText = "Show C";
  }

  if (currentWeatherData) {
    showWeatherData(currentWeatherData);
  }
}

searchButton.addEventListener("click", searchWeather);
locationButton.addEventListener("click", searchByLocation);
themeButton.addEventListener("click", toggleTheme);
unitButton.addEventListener("click", toggleUnit);

favoriteButton.addEventListener("click", function () {
  if (currentCity !== "") {
    saveFavoriteCity(currentCity);
  }
});

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

async function initApp() {
  document.body.dataset.theme = "light";
  applyTheme();
  showRecentSearches();
  showFavoriteCities();
  cityInput.value = "";
  clearWeatherInfo();
  showMessage("Search a city to see the weather.", "#1d3557");
}

initApp();
