// **START OF FILE
// ==============================================================================
// CONFIGURATION FOR WEATHERAPI.COM
// API Key and Base URL
// ==============================================================================
const API_KEY = "7ad74676aa0242cc8f361803252111"; 
const API_BASE_URL = "https://api.weatherapi.com/v1"; // Uses HTTPS for security

// --- DOM Element Initialization ---
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');
const currentCityDisplay = document.getElementById('current-city-display');
const dateDisplay = document.getElementById('date-display');
const tempDisplay = document.getElementById('temperature-display');
const weatherIconElement = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidityDisplay = document.getElementById('humidity-display');
const windSpeedDisplay = document.getElementById('wind-speed-display');
const forecastContainer = document.getElementById('forecast-container');
const alertMessage = document.getElementById('alert-message');
const currentWeatherCard = document.getElementById('current-weather-card');
const currentUnitElement = document.getElementById('current-unit');

// Toggle elements
const celsiusToggle = document.getElementById('celsius-toggle');
const fahrenheitToggle = document.getElementById('fahrenheit-toggle');

// Error Modal elements
const errorBox = document.getElementById('error-box');
const errorText = document.getElementById('error-text');
const closeErrorBox = document.getElementById('close-error-box');

// Recent Cities elements
const recentCitiesContainer = document.getElementById('recent-cities-container');
const recentCitiesDropdown = document.getElementById('recent-cities-dropdown');

// --- State Management ---
// Default to metric (°C) as per standard practice, but user can toggle
let currentUnit = 'metric'; 
let currentTempC = null;
let currentTempF = null;
let currentWindKPH = null;
let currentWindMPH = null;

// --- Utility Functions ---

/**
 * Displays a custom error modal instead of using alert(). (Task 6)
 * @param {string} message - The error message to display.
 */
function showError(message) {
    errorText.textContent = message;
    errorBox.classList.remove('hidden');
}

// Handles closing the error modal
closeErrorBox.addEventListener('click', () => {
    errorBox.classList.add('hidden');
});

/**
 * Maps WeatherAPI condition text to Font Awesome icons and determines if it's rainy. (Task 4 - Icons)
 * @param {string} conditionText - The description of the weather.
 * @param {number} isDay - 1 for day, 0 for night (used to distinguish sun/moon).
 * @returns {object} - Contains icon class, color, and isRainy flag.
 */
function getWeatherIcon(conditionText, isDay = 1) {
    const textLower = conditionText.toLowerCase();
    
    // Check for precipitation (isRainy flag for background change - Task 4)
    if (textLower.includes('rain') || textLower.includes('drizzle') || textLower.includes('patchy light rain')) {
        return { icon: 'fas fa-cloud-showers-heavy', color: 'text-blue-400', isRainy: true };
    }
    if (textLower.includes('snow') || textLower.includes('sleet') || textLower.includes('ice')) {
        return { icon: 'fas fa-snowflake', color: 'text-cyan-200', isRainy: false };
    }
    if (textLower.includes('thunder') || textLower.includes('lightning')) {
        return { icon: 'fas fa-bolt', color: 'text-yellow-500', isRainy: false };
    }
    
    // Check for clear/sunny conditions
    if (textLower.includes('clear') || textLower.includes('sun') || textLower.includes('sunny')) {
        return isDay ? { icon: 'fas fa-sun', color: 'text-yellow-400', isRainy: false } : { icon: 'fas fa-moon', color: 'text-yellow-200', isRainy: false };
    }
    
    // Check for clouds
    if (textLower.includes('cloud') || textLower.includes('overcast') || textLower.includes('partly cloudy')) {
        return isDay ? { icon: 'fas fa-cloud-sun', color: 'text-gray-300', isRainy: false } : { icon: 'fas fa-cloud-moon', color: 'text-gray-400', isRainy: false };
    }
    
    // Check for atmospheric conditions
    if (textLower.includes('mist') || textLower.includes('fog')) {
        return { icon: 'fas fa-smog', color: 'text-gray-500', isRainy: false };
    }
    
    // Default fallback
    return { icon: 'fas fa-question-circle', color: 'text-gray-500', isRainy: false };
}

/**
 * Changes the body background based on weather type (Rainy vs. Clear). (Task 4 - Dynamic Background)
 * @param {boolean} isRainy - True if the current weather is considered rainy.
 */
function updateBackground(isRainy) {
    const bodyElement = document.body;
    if (isRainy) {
        // Rainy theme (dark blue/grey for rain)
        bodyElement.classList.remove('bg-gray-800');
        // bg-blue-900 gives a deeper, rainier feel
        bodyElement.classList.add('bg-blue-900'); 
    } else {
        // Default theme (dark grey/blue for clear)
        bodyElement.classList.remove('bg-blue-900');
        // bg-gray-800 is the standard dark theme color
        bodyElement.classList.add('bg-gray-800'); 
    }
}

// --- Local Storage Management for Recent Cities (Task 4) ---

/** Retrieves recent cities from local storage. */
function getRecentCities() {
    const cities = localStorage.getItem('recentCities');
    return cities ? JSON.parse(cities) : [];
}

/**
 * Adds a city name to the recent search list and updates the dropdown.
 * @param {string} city - The name of the city.
 */
function addRecentCity(city) {
    const cities = getRecentCities();
    // Remove if already exists to move it to the front
    const newCities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    newCities.unshift(city);
    // Keep only the last 5 cities (Task 4)
    localStorage.setItem('recentCities', JSON.stringify(newCities.slice(0, 5)));
    populateRecentCitiesDropdown();
}

/** Populates the recent cities dropdown menu. */
function populateRecentCitiesDropdown() {
    const cities = getRecentCities();
    recentCitiesDropdown.innerHTML = '';
    
    if (cities.length === 0) {
        recentCitiesContainer.classList.add('hidden');
        return;
    }

    recentCitiesContainer.classList.remove('hidden');
    
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a recent city...';
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    recentCitiesDropdown.appendChild(defaultOption);

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

// --- UI Rendering Functions ---

/** Updates the main temperature and wind speed based on the selected unit. (Task 4 - Unit Toggle) */
function updateTemperatureDisplay() {
    // Ensure the card is visible when data is loaded
    currentWeatherCard.classList.remove('hidden');

    if (currentUnit === 'metric') {
        // Display Celsius
        tempDisplay.innerHTML = `${Math.round(currentTempC)}<sup class="text-4xl font-light">°</sup>`;
        currentUnitElement.textContent = 'C';
        celsiusToggle.classList.add('bg-blue-600', 'text-white');
        fahrenheitToggle.classList.remove('bg-blue-600', 'text-white');
        if (currentWindKPH) windSpeedDisplay.textContent = `${currentWindKPH} km/h`;
    } else {
        // Display Fahrenheit
        tempDisplay.innerHTML = `${Math.round(currentTempF)}<sup class="text-4xl font-light">°</sup>`;
        currentUnitElement.textContent = 'F';
        fahrenheitToggle.classList.add('bg-blue-600', 'text-white');
        celsiusToggle.classList.remove('bg-blue-600', 'text-white');
        if (currentWindMPH) windSpeedDisplay.textContent = `${currentWindMPH} mph`;
    }
    
    // Note: Re-check alert on unit change, although the condition uses C for consistency
    checkExtremeWeatherAlert();
}

/** Checks and displays an alert message for extreme temperatures. (Task 4 - Custom Alerts) */
function checkExtremeWeatherAlert() {
    // Hide previous alerts
    alertMessage.classList.add('hidden');

    // Extreme temperature thresholds (using Celsius for consistency)
    if (currentTempC > 40) {
        alertMessage.textContent = `⚠️ WARNING: Extreme Heat (${Math.round(currentTempC)}°C)! Stay hydrated. 🥵`;
        alertMessage.classList.remove('hidden');
    } else if (currentTempC < 0) {
        alertMessage.textContent = `🥶 WARNING: Freezing Temperatures (${Math.round(currentTempC)}°C)! Dress warmly. ❄️`;
        alertMessage.classList.remove('hidden');
    }
}

/**
 * Renders the current weather data onto the main dashboard card. (Task 4)
 * @param {object} data - The current weather data from WeatherAPI.
 */
function renderCurrentWeather(data) {
    const { location, current } = data;
    
    // Store data from WeatherAPI response for unit toggling
    currentTempC = current.temp_c;
    currentTempF = current.temp_f;
    currentWindKPH = current.wind_kph.toFixed(1);
    currentWindMPH = current.wind_mph.toFixed(1);
    
    // Set text content
    currentCityDisplay.textContent = location.name;
    // WeatherAPI localtime is YYYY-MM-DD HH:MM, we use the date part
    dateDisplay.textContent = new Date(location.localtime.split(' ')[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    weatherDescription.textContent = current.condition.text;
    humidityDisplay.textContent = `${current.humidity}%`;
    
    // Update Icon and background
    const iconData = getWeatherIcon(current.condition.text, current.is_day);
    // Remove old icon classes and add new ones
    weatherIconElement.className = 'text-7xl mb-4';
    weatherIconElement.innerHTML = `<i class="${iconData.icon} ${iconData.color}"></i>`;
    updateBackground(iconData.isRainy);

    // Update Temperature Display with current unit
    updateTemperatureDisplay();
    
    // Check and display alert
    checkExtremeWeatherAlert();
}

/**
 * Renders the 5-Day Forecast cards. (Task 5)
 * @param {array} forecastDays - Array of forecast day objects from WeatherAPI.
 */
function renderForecast(forecastDays) {
    forecastContainer.innerHTML = ''; // Clear previous forecasts
    
    // Slice to get the next 5 days (skipping today, which is forecastDays[0])
    const nextFiveDays = forecastDays.slice(1, 6);

    nextFiveDays.forEach(item => {
        const date = new Date(item.date);
        const dayData = item.day;
        
        // Use default day value (1) for forecast icon mapping
        const iconData = getWeatherIcon(dayData.condition.text, 1); 
        
        const card = document.createElement('div');
        // Use a background slightly darker than the main card background for visual separation
        card.className = 'p-4 bg-gray-700 rounded-xl text-center shadow-xl space-y-2 transform hover:scale-[1.02] transition duration-300 min-w-[120px]';
        
        // Note: Forecast section displays key metrics in Celsius/KPH and percentage humidity (Task 5)
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


// --- Core Fetching Logic (Task 2 & 4) ---

/**
 * Fetches weather data from WeatherAPI based on city name or coordinates.
 * @param {string|object} query - City name string or {lat, lon} object.
 * @param {boolean} isCoords - True if query is coordinates.
 */
async function fetchWeatherData(query, isCoords = false) {
    // Task 6: API Key Validation
    // The key is now properly set, but we keep the validation for robustness
    if (API_KEY === "YOUR_API_KEY_HERE" || API_KEY.length < 5) {
        showError("API Key is missing or invalid. Please replace 'YOUR_API_KEY_HERE' in script.js and try again.");
        return;
    }

    if (!query) {
        showError("Please enter a city name or use current location.");
        return;
    }

    // WeatherAPI.com forecast endpoint (requesting 6 days to get 5 full days + current day data)
    let qParam;
    if (isCoords) {
        qParam = `${query.lat},${query.lon}`;
    } else {
        qParam = query;
    }
    
    // Simple UI feedback during fetch
    currentCityDisplay.textContent = 'Loading...';
    currentWeatherCard.classList.remove('hidden');

    // Ensure the use of the HTTPS API URL
    const url = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${qParam}&days=6`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            // Task 6: API Error Handling (e.g., key invalid, no location found)
            throw new Error(data.error.message || 'Location not found or API error.');
        }
        
        // Render Current Weather
        renderCurrentWeather(data);
        
        // Add city to recent list (using the name returned by API)
        if (!isCoords) {
            addRecentCity(data.location.name);
        }

        // Render 5-Day Forecast (uses the forecast.forecastday array)
        renderForecast(data.forecast.forecastday);

    } catch (error) {
        console.error("Weather fetching error:", error.message);
        showError(`Failed to fetch weather: ${error.message}`);
        
        // Hide card on hard error
        currentWeatherCard.classList.add('hidden'); 

        // Reset UI on error
        currentCityDisplay.textContent = 'Error Loading Data';
        tempDisplay.innerHTML = '--';
        weatherDescription.textContent = 'Please check your connection or location name.';
        forecastContainer.innerHTML = '<div class="col-span-full p-4 text-center text-red-300">Could not load forecast data.</div>';
        updateBackground(false);
    }
}

// --- Event Listeners Initialization (Task 4) ---

// Unit toggle listeners
celsiusToggle.addEventListener('click', () => { currentUnit = 'metric'; updateTemperatureDisplay(); });
fahrenheitToggle.addEventListener('click', () => { currentUnit = 'imperial'; updateTemperatureDisplay(); });


// Search by City button handler
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        // Task 4: Input validation
        showError('Please enter a city name.');
    }
});

// Search by City on Enter key press
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// Select recent city handler
recentCitiesDropdown.addEventListener('change', (e) => {
    const city = e.target.value;
    if (city) {
        cityInput.value = city; // Fill the input field
        fetchWeatherData(city);
        // Reset dropdown to default after selection to allow re-selection
        e.target.selectedIndex = 0;
    }
});


// Use Current Location button handler (Task 4 - Geolocation)
currentLocationButton.addEventListener('click', () => {
    // Show the card before fetching, as it gets hidden on initial load or error
    currentWeatherCard.classList.remove('hidden');
    currentCityDisplay.textContent = 'Locating...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // WeatherAPI uses lat,lon format for query parameter
                fetchWeatherData({ lat: latitude, lon: longitude }, true);
            },
            (error) => {
                // Task 6: Geolocation Error Handling
                let msg = "Could not get your location. Please ensure location services are enabled and permissions are granted.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location access denied. Please allow location access to use this feature.";
                }
                showError(msg);
                // Hide card on permission error
                currentWeatherCard.classList.add('hidden');
                currentCityDisplay.textContent = 'Location Error';
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
        currentWeatherCard.classList.add('hidden');
    }
});

// --- Application Startup ---

window.onload = function() {
    populateRecentCitiesDropdown();
    // Load a default city on startup
    fetchWeatherData('London'); 
};
// **END OF FILE