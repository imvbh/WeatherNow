let currCity = "Vadodara";
let units = "metric";

document.addEventListener("DOMContentLoaded", function () {
  let city = document.querySelector(".weather-city");
  let datetime = document.querySelector(".weather-datetime p");
  let forecast = document.querySelector(".weather-forecast");
  let temperature = document.querySelector(".weather-temp");
  let mainIcon = document.querySelector(".weather-icon");
  let minmax = document.querySelector(".weather-minmax");
  let feelslike = document.querySelector(".weather-feelslike");
  let humidity = document.querySelector(".weather-humidity");
  let wind = document.querySelector(".weather-wind");
  let visibility = document.querySelector(".weather-visibility");
  const search = document.querySelector(".weather-searchform");
  const error = document.querySelector(".error");
  search.value = "";

  document
    .querySelector(".weather-search")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const city = search.value.trim();
      console.log(city);

      try {
        currCity = city;
        await getWeather3Days();
        await getWeather2();
        await getWeather();
        search.value = "";
        error.innerHTML = ""; // Clear any previous error messages
      } catch (error) {
        if (error.message === "City not found") {
          error.innerHTML = `"${city}" was not found. Please check the spelling.`;
        } else {
          error.innerHTML = "An error occurred.";
        }
      }
    });

  function convertTime(timestamp, timezone) {
    const convertTime = timezone / 3600;

    const date = new Date(timestamp * 1000);

    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      timezone: `Etc/GMT${convertTime >= 0 ? "-" : "+"}${Math.abs(
        convertTime
      )}`,
      hour12: true,
    };
    const formattedDate = date.toLocaleString("en-US", options);

    // Replace the first ',' and 'at' with '|'
    formattedOutput = formattedDate.replace(",", " |").replace(" at", " |");

    return formattedOutput;
  }
  function convertCountryCode(country) {
    let regionsNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionsNames.of(country);
  }

  function getWeather() {
    const API_KEY = "cc1be744c458cd468f7a64b77e69685c";
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`
    )
      .then((res) => {
        if (res.status === 404) {
          throw new Error("City not found");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        city.textContent = `${data.name}, ${convertCountryCode(
          data.sys.country
        )}`;
        datetime.textContent = convertTime(data.dt, data.timezone);
        forecast.innerHTML = `<p>${data.weather[0].main}</p>`;
        temperature.innerHTML = `${data.main.temp.toFixed()}&#176C`;
        mainIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="" srcset="">`;
        minmax.innerHTML = `<p>Min: <b>${
          data.main.temp_min.toFixed() - 4
        }&#176C</b></p>
        <p>Max: <b>${
          parseFloat(data.main.temp_max.toFixed()) + 2
        }&#176C</b></p>`;
        feelslike.innerHTML = `${data.main.feels_like.toFixed()}&#176C`;
        humidity.innerHTML = `${data.main.humidity.toFixed()}%`;
        wind.innerHTML = `${data.wind.speed.toFixed()} kmph`;
        visibility.innerHTML = `${data.visibility / 1000} km`;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  function getWeather2() {
    const API_KEY = "cc1be744c458cd468f7a64b77e69685c";

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${currCity}&appid=${API_KEY}&units=${units}&cnt=6`
    )
      .then((res) => {
        if (res.status === 404) {
          throw new Error("City not found");
        }
        return res.json();
      })
      .then((data) => {
        // Loop through the data.list array
        for (let i = 0; i < data.list.length; i++) {
          const weatherData = data.list[i];
          const hourWeatherDiv =
            document.getElementsByClassName("hour-weather")[i];

          // Check if hourWeatherDiv exists before updating its content
          if (hourWeatherDiv) {
            // Update the hour-time and hour-date elements
            const hourTimeElement = hourWeatherDiv.querySelector(".hour-time");
            const hourDateElement = hourWeatherDiv.querySelector(".hour-date");

            const date = new Date(weatherData.dt * 1000);
            const hour = date.getHours();
            const minute = date.getMinutes();
            const month = date.toLocaleString("en-US", { month: "short" });
            const day = date.getDate();

            // Update the hour-time and hour-date elements separately
            hourTimeElement.textContent = `${hour}:${
              minute < 10 ? "0" : ""
            }${minute}${hour < 12 ? "AM" : "PM"}`;
            hourDateElement.textContent = `${day} ${month}`;

            // Update the hour-forecast element
            const temperature = Math.round(weatherData.main.temp);
            const hourForecastElement =
              hourWeatherDiv.querySelector(".hour-forecast");
            hourForecastElement.textContent = `${temperature}°C`;

            // Update the hour-icon image source
            const hourIconElement =
              hourWeatherDiv.querySelector(".hour-icon img");
            const weatherIcon = weatherData.weather[0].icon;
            hourIconElement.src = `https://openweathermap.org/img/wn/${weatherIcon}@4x.png`;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  function getWeather3Days() {
    const API_KEY = "cc1be744c458cd468f7a64b77e69685c";

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${currCity}&appid=${API_KEY}&units=${units}&cnt=32`
    )
      .then((res) => {
        if (res.status === 404) {
          throw new Error("City not found");
        }
        return res.json();
      })
      .then((data) => {
        const forecastCards = document.querySelectorAll(".future-card");

        // Get the current date
        const currentDate = new Date();

        // Initialize dayCount to 0
        let dayCount = 0;

        // Loop through the forecast data
        for (let i = 0; i < data.list.length; i++) {
          const weatherData = data.list[i];
          const date = new Date(weatherData.dt * 1000);

          // Calculate the time difference in hours between the current date and the forecast date
          const hoursDiff = Math.floor(
            (date.getTime() - currentDate.getTime()) / (1000 * 60 * 60)
          );

          // Check if the time difference is approximately 24 hours
          if (hoursDiff >= 24 * dayCount) {
            // Update the day name and date
            const cardDayNameElement =
              forecastCards[dayCount].querySelector(".card-day-name");
            const cardDayDateElement =
              forecastCards[dayCount].querySelector(".card-day-date");

            const day = date.toLocaleString("en-US", { weekday: "short" });
            const dayNum = date.getDate();
            const month = date.toLocaleString("en-US", { month: "short" });

            cardDayNameElement.textContent = day;
            cardDayDateElement.textContent = dayNum + " " + month;

            // Update the weather icon
            const cardIconElement =
              forecastCards[dayCount].querySelector(".card-icon img");
            const weatherIcon = weatherData.weather[0].icon;
            cardIconElement.src = `https://openweathermap.org/img/wn/${weatherIcon}@4x.png`;

            // Update the temperature
            const minTempElement =
              forecastCards[dayCount].querySelector(".min-temp");
            const maxTempElement =
              forecastCards[dayCount].querySelector(".max-temp");
            minTempElement.textContent = `${Math.round(
              weatherData.main.temp_min
            )}°C`;
            maxTempElement.textContent = `${Math.round(
              weatherData.main.temp_max
            )}°C`;

            dayCount++; // Move to the next day

            if (dayCount >= 3) {
              break; // Exit the loop if we have filled the next three days
            }
          }
        }
      })

      .catch((error) => {
        console.error("Error fetching 3-day forecast data:", error);
      });
  }

  getWeather3Days();
  getWeather2();
  getWeather();
  search.value = ""; // Call the function after the DOM is loaded
});
