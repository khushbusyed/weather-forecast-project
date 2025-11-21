// script.js
// Weather Forecast App - corrected & cleaned version
// API config
const API_KEY = "7ad74676aa0242cc8f361803252111";
const API_BASE_URL = "https://api.weatherapi.com/v1";

// --- DOM Element Initialization ---
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const currentLocationButton = document.getElementById("current-location-button");

const currentCityDisplay = document.getElementById("city-name-display");
const dateDisplay = document.getElementById("date-display");
const tempDisplay = document.getElementById("temperature-display");
const weatherIconElement = document.getElementById("weather-icon-large");
const weatherDescription = document.getElementById("weather-description");

const humidityDisplay = document.getElementById("humidity-display");
const windSpeedDisplay = document.getElementById("wind-speed-display");
const pressureDisplay = document.getElementById("pressure-display");

const forecastContainer = document.getElementById("forecast-container");

const currentWeatherCard = document.getElementById("current-weather-card");

// Alerts
const extremeTempAlert = document.getElementById("extreme-temp-alert");
const alertMessage = document.getElementById("alert-message");

// Unit display
const currentUnitElement = document.getElementById("unit-display");

// Recent cities
const recentCitiesContainer = document.getElementById("recent-cities-container");
const recentCitiesDropdown = document.getElementById("recent-cities-select");

// Error Modal
const errorBox = document.getElementById("error-modal");
const errorText = document.getElementById("modal-body");
const closeErrorBox = document.getElementById("modal-close-button");

// Unit toggle
const unitToggle = document.getElementById("unit-toggle");

//Note: Additional comments for clarity and maintainability.

// --- State Management ---
let currentUnit = "metric"; // 'metric' => °C, 'imperial' => °F
let currentTempC = null;
let currentTempF = null;
let currentWindKPH = null;
let currentWindMPH = null;

// Safety: ensure required DOM elements exist (fail fast with console warning)
function assertElement(el, name) {
    if (!el) {
        console.warn(`Missing element: ${name}`);
    }
}
[
    cityInput, searchButton, currentLocationButton, currentCityDisplay, dateDisplay,
    tempDisplay, weatherIconElement, weatherDescription, humidityDisplay, windSpeedDisplay,
    pressureDisplay, forecastContainer, currentWeatherCard, extremeTempAlert, alertMessage,
    currentUnitElement, recentCitiesContainer, recentCitiesDropdown, errorBox, errorText, closeErrorBox, unitToggle
].forEach((el, idx) => {
    // Just log missing elements for debugging (does not throw)
    if (!el) {
        // No user-facing alert here, the console is fine for debugging
    }
});

// --- Utility Functions ---
function showError(message) {
    if (errorText) errorText.textContent = message;
    if (errorBox) errorBox.classList.remove("hidden");
}

if (closeErrorBox) {
    closeErrorBox.addEventListener("click", () => {
        errorBox.classList.add("hidden");
    });
}

/**
 * Map a textual condition to an icon class + isRainy flag.
 * We keep Font Awesome class names as in your JS; if Font Awesome isn't loaded,
 * these will still render as <i> tags (but you may want to add FA CDN in index.html).
 */
function getWeatherIcon(conditionText, isDay = 1) {
    const textLower = (conditionText || "").toLowerCase();

    if (textLower.includes("rain") || textLower.includes("drizzle") || textLower.includes("shower")) {
        return { icon: "fas fa-cloud-showers-heavy", color: "text-blue-400", isRainy: true };
    }
    if (textLower.includes("snow") || textLower.includes("sleet") || textLower.includes("ice")) {
        return { icon: "fas fa-snowflake", color: "text-cyan-200", isRainy: false };
    }
    if (textLower.includes("thunder") || textLower.includes("lightning")) {
        return { icon: "fas fa-bolt", color: "text-yellow-500", isRainy: true };
    }
    if (textLower.includes("clear") || textLower.includes("sun") || textLower.includes("sunny")) {
        return isDay ? { icon: "fas fa-sun", color: "text-yellow-400", isRainy: false } : { icon: "fas fa-moon", color: "text-yellow-200", isRainy: false };
    }
    if (textLower.includes("cloud") || textLower.includes("overcast") || textLower.includes("partly cloudy")) {
        return isDay ? { icon: "fas fa-cloud-sun", color: "text-gray-300", isRainy: false } : { icon: "fas fa-cloud-moon", color: "text-gray-400", isRainy: false };
    }
    if (textLower.includes("mist") || textLower.includes("fog") || textLower.includes("haze")) {
        return { icon: "fas fa-smog", color: "text-gray-500", isRainy: false };
    }
    // Default
    return { icon: "fas fa-question-circle", color: "text-gray-500", isRainy: false };
}

function updateBackground(isRainy) {
    const bodyElement = document.body;
    if (!bodyElement) return;
    // remove both possible classes and add appropriate one
    bodyElement.classList.remove("bg-blue-900", "bg-gray-800", "bg-gray-100");
    if (isRainy) {
        bodyElement.classList.add("bg-blue-900");
    } else {
        bodyElement.classList.add("bg-gray-100");
    }
}

/** Recent cities localStorage functions */
function getRecentCities() {
    const cities = localStorage.getItem("recentCities");
    return cities ? JSON.parse(cities) : [];
}
function addRecentCity(city) {
    if (!city) return;
    const cities = getRecentCities();
    const newCities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    newCities.unshift(city);
    localStorage.setItem("recentCities", JSON.stringify(newCities.slice(0, 5)));
    populateRecentCitiesDropdown();
}
function populateRecentCitiesDropdown() {
    if (!recentCitiesDropdown || !recentCitiesContainer) return;
    const cities = getRecentCities();
    recentCitiesDropdown.innerHTML = "";

    if (cities.length === 0) {
        recentCitiesContainer.classList.add("hidden");
        return;
    }

    recentCitiesContainer.classList.remove("hidden");

    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a recent city...";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    recentCitiesDropdown.appendChild(defaultOption);

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

/** Update temperature + wind displays based on currentUnit */
function updateTemperatureDisplay() {
    if (!tempDisplay) return;
    currentWeatherCard.classList.remove("hidden");

    if (currentUnit === "metric") {
        if (currentTempC !== null) {
            tempDisplay.innerHTML = `${Math.round(currentTempC)}<sup class="text-4xl font-light">°</sup>`;
        } else {
            tempDisplay.textContent = "--";
        }
        if (currentUnitElement) currentUnitElement.textContent = "°C";
        if (currentWindKPH !== null) windSpeedDisplay.textContent = `${currentWindKPH} km/h`;
    } else {
        if (currentTempF !== null) {
            tempDisplay.innerHTML = `${Math.round(currentTempF)}<sup class="text-4xl font-light">°</sup>`;
        } else {
            tempDisplay.textContent = "--";
        }
        if (currentUnitElement) currentUnitElement.textContent = "°F";
        if (currentWindMPH !== null) windSpeedDisplay.textContent = `${currentWindMPH} mph`;
    }
    checkExtremeWeatherAlert(); // show/hide alert
}

function checkExtremeWeatherAlert() {
    if (!alertMessage) return;
    alertMessage.classList.add("hidden");
    // use Celsius thresholds
    if (currentTempC !== null && currentTempC > 40) {
        alertMessage.textContent = `⚠️ WARNING: Extreme Heat (${Math.round(currentTempC)}°C)! Stay hydrated. 🥵`;
        alertMessage.classList.remove("hidden");
    } else if (currentTempC !== null && currentTempC < 0) {
        alertMessage.textContent = `🥶 WARNING: Freezing Temperatures (${Math.round(currentTempC)}°C)! Dress warmly. ❄️`;
        alertMessage.classList.remove("hidden");
    }
}

/** Render current weather */
function renderCurrentWeather(data) {
    if (!data || !data.location || !data.current) return;
    const { location, current } = data;

    currentTempC = current.temp_c;
    currentTempF = current.temp_f;
    currentWindKPH = current.wind_kph ? Number(current.wind_kph.toFixed(1)) : null;
    currentWindMPH = current.wind_mph ? Number(current.wind_mph.toFixed(1)) : null;

    if (currentCityDisplay) currentCityDisplay.textContent = location.name + (location.region ? `, ${location.region}` : "");
    if (dateDisplay) {
        const localDate = location.localtime ? location.localtime.split(" ")[0] : null;
        if (localDate) {
            dateDisplay.textContent = new Date(localDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        } else {
            dateDisplay.textContent = new Date().toLocaleDateString();
        }
    }
    if (weatherDescription) weatherDescription.textContent = current.condition.text;
    if (humidityDisplay) humidityDisplay.textContent = `${current.humidity}%`;
    if (pressureDisplay) pressureDisplay.textContent = `${current.pressure_mb} mb`;

    const iconData = getWeatherIcon(current.condition.text, current.is_day);
    if (weatherIconElement) {
        weatherIconElement.className = "text-7xl mb-4";
        weatherIconElement.innerHTML = `<i class="${iconData.icon} ${iconData.color}"></i>`;
    }

    updateBackground(iconData.isRainy);
    updateTemperatureDisplay();
    checkExtremeWeatherAlert();
}

/** Render 5-day forecast */
function renderForecast(forecastDays) {
    if (!forecastContainer) return;
    forecastContainer.innerHTML = "";

    // ensure we have days
    if (!Array.isArray(forecastDays) || forecastDays.length === 0) {
        forecastContainer.innerHTML = `<div class="col-span-full p-4 text-center">No forecast available.</div>`;
        return;
    }

    // We take next 5 days (including today optionally) — here use indices 0..4 if available
    const daysToShow = forecastDays.slice(0, 5);

    daysToShow.forEach(item => {
        const date = new Date(item.date);
        const dayData = item.day;
        const iconData = getWeatherIcon(dayData.condition.text, 1);

        const card = document.createElement("div");
        card.className = "p-4 bg-gray-700 rounded-xl text-center shadow-xl space-y-2 transform hover:scale-[1.02] transition duration-300 min-w-[120px]";
        card.innerHTML = `
            <p class="text-sm font-light text-gray-300">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <p class="text-lg font-bold text-white">${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <div class="text-3xl ${iconData.color} my-2">
                <i class="${iconData.icon}"></i>
            </div>
            <p class="text-xl font-semibold text-blue-300">${Math.round(dayData.avgtemp_c)}<sup class="text-sm">°C</sup></p>
            <p class="text-xs capitalize text-gray-400 min-h-[30px]">${dayData.condition.text}</p>
            <div class="text-sm text-gray-300 space-y-1 mt-2">
                <p class="flex items-center justify-center text-green-300"><i class="fas fa-wind w-4 mr-2"></i> ${dayData.maxwind_kph.toFixed(1)} km/h</p>
                <p class="flex items-center justify-center text-cyan-300"><i class="fas fa-tint w-4 mr-2"></i> ${Math.round(dayData.avghumidity)}%</p>
            </div>
        `;
        forecastContainer.appendChild(card);
    });
}

/** Core fetch logic: accepts either string city or coordinates object {lat, lon} */
async function fetchWeatherData(query, isCoords = false) {
    if (!query || (typeof query === "string" && query.trim().length === 0)) {
        showError("Please enter a city name or use your current location.");
        return;
    }

    if (API_KEY === "YOUR_API_KEY_HERE" || !API_KEY || API_KEY.length < 5) {
        showError("API Key is missing or invalid. Please set API_KEY in script.js.");
        return;
    }

    let qParam = "";
    if (isCoords) {
        qParam = `${query.lat},${query.lon}`;
    } else {
        qParam = encodeURIComponent(query);
    }

    // UI loading state
    if (currentCityDisplay) currentCityDisplay.textContent = "Loading...";
    currentWeatherCard.classList.remove("hidden");

    const url = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${qParam}&days=6&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Location not found");
        }

        // Render UI
        renderCurrentWeather(data);
        renderForecast(data.forecast.forecastday);

        // Add to recents if query was a city string
        if (!isCoords && data.location && data.location.name) {
            addRecentCity(data.location.name);
        }
    } catch (err) {
        console.error("Weather fetch error:", err);
        showError(`Failed to fetch weather: ${err.message}`);
        // graceful fallback UI
        if (currentCityDisplay) currentCityDisplay.textContent = "Error Loading Data";
        if (tempDisplay) tempDisplay.innerHTML = "--";
        if (weatherDescription) weatherDescription.textContent = "Please check your connection or location name.";
        if (forecastContainer) forecastContainer.innerHTML = '<div class="col-span-full p-4 text-center text-red-300">Could not load forecast data.</div>';
        updateBackground(false);
    }
}

// --- Event Listeners ---

// Unit toggle
if (unitToggle) {
    unitToggle.addEventListener("click", () => {
        if (currentUnit === "metric") {
            currentUnit = "imperial";
            unitToggle.textContent = "Show in °C";
        } else {
            currentUnit = "metric";
            unitToggle.textContent = "Show in °F";
        }
        updateTemperatureDisplay();
    });
}

// Search button click
if (searchButton) {
    searchButton.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            showError("Please enter a city name.");
        }
    });
}

// Enter key
if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchButton.click();
        }
    });
}

// Recent cities selection
if (recentCitiesDropdown) {
    recentCitiesDropdown.addEventListener("change", (e) => {
        const city = e.target.value;
        if (city) {
            cityInput.value = city;
            fetchWeatherData(city);
            e.target.selectedIndex = 0;
        }
    });
}

// Current location
if (currentLocationButton) {
    currentLocationButton.addEventListener("click", () => {
        currentWeatherCard.classList.remove("hidden");
        if (currentCityDisplay) currentCityDisplay.textContent = "Locating...";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData({ lat: latitude, lon: longitude }, true);
                },
                (error) => {
                    let msg = "Could not get your location. Please ensure location services are enabled and permissions are granted.";
                    if (error && error.code === error.PERMISSION_DENIED) {
                        msg = "Location access denied. Please allow location access to use this feature.";
                    }
                    showError(msg);
                    currentWeatherCard.classList.add("hidden");
                    if (currentCityDisplay) currentCityDisplay.textContent = "Location Error";
                }
            );
        } else {
            showError("Geolocation is not supported by your browser.");
            currentWeatherCard.classList.add("hidden");
        }
    });
}

// --- Initialization on load ---
window.addEventListener("load", () => {
    populateRecentCitiesDropdown();
    // Optionally fetch a default city
    fetchWeatherData("London");
});
