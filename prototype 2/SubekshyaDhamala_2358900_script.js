const defaultCity = "Swansea";
let currentCity = defaultCity;

// Display default weather data on page load
function displayDefaultWeather() {
    if (navigator.onLine) {
        fetchWeatherData(defaultCity);
    } else {
        const cachedData = JSON.parse(localStorage.getItem(defaultCity));
        if (cachedData) {
            displayWeatherData(defaultCity, cachedData);
        } else {
            displayErrorMessage("You are offline and no cached data is available.");
        }
    }
}
displayDefaultWeather();

// Search for weather data based on user input
function searchWeather() {
    let cityInput = document.getElementById("city-input").value;
    if (cityInput.trim() === "") {
        displayErrorMessage("Please enter a city name.");
        clearWeatherData();
    } else {
        clearErrorMessage();
        if (navigator.onLine) {
            fetchWeatherData(cityInput);
        } else {
            const cachedData = JSON.parse(localStorage.getItem(cityInput));
            if (cachedData) {
                displayWeatherData(cityInput, cachedData);
            } else {
                displayErrorMessage("You are offline and no cached data is available for this city.");
            }
        }
    }
}

// Display error message
function displayErrorMessage(message) {
    clearWeatherData();
    document.getElementById("error-message").textContent = message;
}

// Clear error message
function clearErrorMessage() {
    document.getElementById("error-message").textContent = "";
}

// Clear weather data display
function clearWeatherData() {
    document.getElementById("weather-info").innerHTML = "";
    document.getElementById("past-data-container").innerHTML = "";
}

// Fetch weather data from API
function fetchWeatherData(city) {
    var apiKey = 'a3c2f3bbb87091a51b820cddbb33b075';
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Unable to fetch weather data. Please enter a valid city name.");
            }
        })
        .then(function (data) {
            displayWeatherData(city, data);
            saveWeatherDataToDatabase(city, data); // Save weather data to the database
        })
        .catch(function (error) {
            displayErrorMessage(error.message);
        });
}

// Display weather data
function displayWeatherData(city, data) {
    let weatherInfoContainer = document.getElementById("weather-info");
    weatherInfoContainer.innerHTML = "";

    let dayAndDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    let weatherCondition = data.weather[0].description;
    let weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    let temperature = data.main.temp;
    let pressure = data.main.pressure;
    let windSpeed = data.wind.speed;
    let humidity = data.main.humidity;

    let weatherData = `
      <h2>${city}</h2 id=city>
      <p>${dayAndDate}</p id=day>
      <p>${weatherCondition}</p id= condition>
      <img src="${weatherIcon}" alt="Weather Icon" id=icon>
      <p>Temperature: ${temperature} &#8451;</p id= temperature>
      <p>Pressure: ${pressure} hPa</p id=pressure>
      <p>Wind Speed: ${windSpeed} m/s</p id wind>
      <p>Humidity: ${humidity}%</p id=humidity>
    `;

    weatherInfoContainer.innerHTML = weatherData;
    localStorage.setItem(city, JSON.stringify(data)); // Cache the fetched data
}

// Function to save weather data to the local database
function saveWeatherDataToDatabase(city, data) {
    if (navigator.onLine) {
        return fetch("SubekshyaDhamala_2358900.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ city, data })
        })
            .then(response => response.text())
            .catch(error => {
                throw new Error("Error saving data to the database.");
            });
    } else {
        return Promise.reject("Offline mode. Cannot save data to the database.");
    }
}

// Fetch and display past data
function fetchAndDisplayPastData(city) {
    let pastDataContainer = document.getElementById("past-data-container");
    pastDataContainer.innerHTML = ""; // Clear previous data

    if (city === "") {
        city = defaultCity;
    }

    fetch(`past.php?city=${city}`)
        .then(response => response.json())
        .then(data => {
            const currentDate = new Date();
            const sixDaysAgo = new Date(currentDate);
            sixDaysAgo.setDate(currentDate.getDate() - 6);

            let filteredData = [];
            for (let i = 0; i < 6; i++) {
                const targetDate = new Date(sixDaysAgo);
                targetDate.setDate(sixDaysAgo.getDate() + i);
                const matchingEntry = data.find(entry => isSameDate(new Date(entry.date), targetDate));

                if (matchingEntry) {
                    filteredData.push(matchingEntry);
                } else {
                    filteredData.push({
                        city: city,
                        temperature: "N/A",
                        humidity: "N/A",
                        pressure: "N/A",
                        wind: "N/A",
                        description: "No data available",
                        date: targetDate.toISOString()
                    });
                }
            }

            if (filteredData.length === 0) {
                if (city === defaultCity) {
                    pastDataContainer.innerHTML = `No past weather data available for ${defaultCity} in the last 7 days.`;
                } else {
                    pastDataContainer.innerHTML = `No past weather data available for ${city} in the last 7 days.`;
                }
            } else {
                filteredData.forEach(entry => {
                    const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });

                    pastDataContainer.innerHTML += `
              <div class='past-weather-box'>
                <h3>Past Weather Data for ${entry.city} on ${formattedDate}</h3>
                <p>Temperature: ${entry.temperature} &#8451;</p>
                <p>Humidity: ${entry.humidity}%</p>
                <p>Pressure: ${entry.pressure} hPa</p>
                <p>Wind Speed: ${entry.wind} m/s</p>
                <p>Description: ${entry.description}</p>
              </div>
            `;
                });
            }
        })
        .catch(error => {
            if (city === defaultCity) {
                pastDataContainer.innerHTML = `Error loading past data for ${defaultCity}.`;
            } else {
                pastDataContainer.innerHTML = `Error loading past data for ${city}.`;
            }
        });
}

function isSameDate(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Event listener for "Show Past Data" button
    pastDataButton.addEventListener("click", () => {
    pastDataContainer.innerHTML = "Loading past data...";

    fetchAndDisplayPastData(currentCity);
});

// Load default city weather data and past data on page load
window.addEventListener("load", () => {
    loadDefaultCityWeather();
    // You might want to add more initialization or event listeners here
});