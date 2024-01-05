// This is the API key
const apiKey = 'd40e3b8f398b80a2a9e638ead63583f2';

const activitiesApiKey = 'b1af1b23fc43461ba23a2ed81c8d37b6'

// the following is an event listener so that when the search form button is clicked we get the user input for the name of the city, starting date, then we can call the Function to fetch the weather data from OpenWeatherMap and the createCityButton to create a city button

$("#search-form").on("submit", function (event) {
    event.preventDefault();
  
    var cityName = $("#search-input").val().trim();
    var cityName2 = $("#search-input").val().trim();
    
    console.log("City Name:", cityName);
  
    // Call the getWeatherData function with the cityName
    getWeatherData(cityName);
    // Append a button for the searched city
    createCityButton(cityName);

    // we call the function to get the activities data from the Geoapify website

    getActivitiesData(cityName);
  
    // Then clear the search input
    $("#search-input").val("");
  });
  
  function getWeatherData(cityName) {
    // This is the modified query url that does not include the start date and end date

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + apiKey;
    console.log("Query URL:", queryURL);
  
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      console.log("City weather data for " + cityName, response)
      displayWeatherInfo(response);
    });
  }
  
  // Displays weather function 

  //// Displays weather information
  function displayWeatherInfo(weatherData) {
    // Clear existing content
    $("#weather-info").empty();
  
    // Create row for the weather content
    var $weatherRow = $("<div class='row'>");
  
    // Create container for city name
    var $cityContainer = $("<div class='col-md-12 mx-auto text-center mb-4 city-container'>");
    $cityContainer.append("<h2>" + '5 Day Weather Forecast For ' + weatherData.city.name + "</h2>");
  
    // Append city container to weather row
    $weatherRow.append($cityContainer);
  
    // Loop through 5-day forecast
    for (var i = 0; i < 5; i++) {
      var forecast = weatherData.list[i * 8];
      var forecastDate = forecast.dt_txt;
      var forecastIconUrl = "https://openweathermap.org/img/w/" + forecast.weather[0].icon + ".png";
  
      // Create column for each forecast day
      var $forecastColumn = $("<div class='col-md-2'>");
  
      // Create container for each forecast day
      var $forecastContainer = $("<div class='forecast-day text-center'>");
      $forecastContainer.append("<p>Date: " + forecastDate.split(' ')[0] + "</p>");
      $forecastContainer.append("<img src='" + forecastIconUrl + "' alt='Weather Icon'>");
      $forecastContainer.append("<p>Temperature: " + (forecast.main.temp - 273.15).toFixed(2) + " °C</p>");
      $forecastContainer.append("<p>Humidity: " + forecast.main.humidity + "%</p>");
      $forecastContainer.append("<p>Wind Speed: " + forecast.wind.speed + " m/s</p>");
  
      // Append forecast day container to forecast column
      $forecastColumn.append($forecastContainer);
  
      // Append forecast column to row
      $weatherRow.append($forecastColumn);
    }
  
    // Append content row to weather-info div
    $("#weather-info").append($weatherRow);
  }

  // With the following function I create a button for the searched city, the buttons will remain in the internal storage untill deleted, and will allow users to perform a quick, updated search based on the city name.

  function createCityButton(cityName) {
  // Here I create a button element if it doesn't exist already, I used the find function in the if statement to check if the button already existed.

  if ($("#history").find(".city-button:contains('" + cityName + "')").length === 0) {
    
    var $cityButton = $("<button>");

    // then I set the button text and class
    $cityButton.text(cityName);
    $cityButton.addClass("city-button");

    // and apend the button to the history container
    $("#history").append($cityButton);

    // then I store the city name in local storage
    saveSearchHistory(cityName);

    // and finally attach click event to the button to display weather information so that when the button is clicked it will call the getWeatherData function to display the updated city forecast.

    $cityButton.on("click", function () {
      getWeatherData(cityName);
      getActivitiesData(cityName);
    });
  }
}

// This function saves the city name in the local storage
function saveSearchHistory(cityName) {
  // First I get the existing search history from local storage
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Then, to add them in order, I use the push to add the new city name to the search history
  searchHistory.push(cityName);

  // Finally I save the updated search history in local storage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function loadSearchHistory() {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  var uniqueCities = [...new Set(searchHistory)]; 

  // Loop through the search history and create buttons
  uniqueCities.forEach(function (cityName) {
    createCityButton(cityName);
  });
}

// Then I call the function to load search history on the page 

 loadSearchHistory();

 //  we added a button to clear search history, this would help the user to start a brand new seach and button list.

$("#clear-history").on("click", function () {
  // First thing after the click event is to clear the search history from local storage
  localStorage.removeItem("searchHistory");

  // After that I have to clear the buttons in the history container and clear all the displayed weather information.
  $("#history").empty();
  $("#weather-info").empty();
  $("#activities-info").empty();
 
});



// supported categories in the Geoapify website we can use to populate the queryURL: accommodation, activity, entertainment, leisure, natural, tourism
function getActivitiesData(cityName) {
  var queryURL = "https://api.geoapify.com/v1/geocode/search?text=" + cityName + "&format=json&apiKey=" + activitiesApiKey;

  console.log("Query URL:", queryURL);
  let placeId = "";
  let queryURL2;
  
  fetch(queryURL)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results[0]) {
        placeId = data.results[0].place_id;
        console.log(placeId);

        queryURL2 = "https://api.geoapify.com/v2/places?categories=tourism,catering.restaurant&filter=place:" + placeId + "&limit=5&apiKey=" + activitiesApiKey;

        return fetch(queryURL2);
      } 
    })
    .then(response => response.json())
    .then(data => {
      // Call the displayActivitiesInfo function with the activities data
      displayActivitiesInfo(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function displayActivitiesInfo(activitiesData) {
  // Clear existing content
  $("#activities-info").empty();

  console.log('Activities Data:', activitiesData);

  
  if (activitiesData.features && activitiesData.features.length > 0) {
    
    var $activitiesContainer = $("<div class='activities-container'>");

   
    activitiesData.features.forEach(function (activity) {
      
      var name = activity.properties.name;
      var address = activity.properties.address_line1 + ', ' + activity.properties.address_line2;
      

      var $activityCard = $("<div class='activity-card'>");
      $activityCard.append("<h4>" + name + "</h4>");
      $activityCard.append("<p><strong>Address:</strong> " + address + "</p>");
      

      // Append the card to the activities container
      $activitiesContainer.append($activityCard);
    });

    // Append the activities container to the #activities-info 
    $("#activities-info").append($activitiesContainer);
  } else {
    // If there are no activities, display a message
    $("#activities-info").html("<p>No activities found for this city.</p>");
  }
}
