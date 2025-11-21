🌦️ Weather Forecast Dashboard
Project Overview
This is a responsive, single-page Weather Forecast Application developed using HTML, Tailwind CSS, and vanilla JavaScript. It fetches real-time weather data and 5-day forecasts using the WeatherAPI.com service.

This project was built to demonstrate proficiency in:
‌Consuming external REST APIs (fetch).
‌Building a responsive and aesthetically pleasing user interface using Tailwind CSS.
‌Implementing client-side data persistence (localStorage) for recent searches.
‌Handling user location (Geolocation API).
‌Implementing custom error handling and unit toggling.

##Key Features
The application meets all the specified requirements:
1. Location Search: Search for weather data by city name.
2. Current Location: Get the forecast for your current location using the browser's Geolocation API.
3. Recent Searches: Maintains a dropdown list of the last 5 searched cities using localStorage.
4. Temperature Toggle: Switch between Celsius (°C) and Fahrenheit (°F) for the current temperature display.
5. Extended 5-Day Forecast: Displays daily high/low temperatures, wind speed, and humidity.
6. Dynamic UI: The background dynamically changes to a "rainy" theme based on weather conditions.
7. Custom Alerts: Displays a warning message for extreme temperatures (below 0°C or above 40°C).
8. Graceful Error Handling: Uses a custom modal for input validation errors and API failures (instead of alert()).

🛠️ Setup and Usage
Prerequisites
You need a key from WeatherAPI.com. A free-tier key is sufficient for this project.
Installation Steps
1. Clone the Repository:
*git clone [YOUR_REPOSITORY_URL_HERE]
cd weather-forecast-project*

2. Configure API Key:
Open the script.js file.
Find the line const API_KEY = "YOUR_API_KEY_HERE";
Replace "YOUR_API_KEY_HERE" with your actual API key:
const API_KEY = "7ad74676aa0242cc8f361803252111"; // Your key

3. Run the Application:
‌The application consists of a single index.html file and requires no server-side setup.
Simply open the index.html file in your preferred web browser (e.g., Chrome, Firefox).

Using the Dashboard
1. Search: Type a city name (e.g., Tokyo, Paris) into the input field and click Search.

2. Geolocation: Click the Use Current Location button to use your browser's location services.

3. Recent Cities: Use the dropdown menu to quickly re-load weather data for previously searched locations.

4. Unit Change: Click the °C or °F buttons next to the temperature to switch units.

## Updates
- Improved DOM selector mapping.
- Added custom modal handling for errors.
- Enhanced UI for rainfall and weather condition background changes.
