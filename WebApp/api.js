// ---------------- Select elements ---------------- //
const countrySelect = document.getElementById("country");
const button = document.querySelector("button");

// ---------------- Event listener ---------------- //
button.addEventListener("click", getTravelInfo);

async function getTravelInfo() {
    const countryName = countrySelect.value;

    try {
        // 1️⃣ Country info
        const countryData = await getCountryData(countryName);

        // 2️⃣ Weather info
        const weatherData = await getWeatherData(countryData.capital);

        // 3️⃣ Travel advisory info
        const travelData = await getTravelData(countryName);

        // Display all data
        displayData(countryData, weatherData, travelData);

    } catch (error) {
        console.error(error);
        alert("Error fetching data. Check console.");
    }
}

// ---------------- API FUNCTIONS ---------------- //

// REST Countries API
async function getCountryData(name) {
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    const data = await res.json();

    return {
        population: data[0].population,
        region: data[0].region,
        currency: Object.keys(data[0].currencies)[0],
        flag: data[0].flags.svg,
        capital: data[0].capital[0]
    };
}

// OpenWeather API
async function getWeatherData(city) {
    const apiKey = "1095d2960c513f3bafa9c5cccdb7373a"; // Your OpenWeather API key
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    return {
        temp: data.main.temp,
        humidity: data.main.humidity,
        condition: data.weather[0].description
    };
}

// Travel Advisor API
async function getTravelData(countryName) {
    const apiKey = '01519c0546msh1d450b5125a2c37p10559cjsn49982d3c9c8a'; // RapidAPI Key
    const host = 'travel-advisor.p.rapidapi.com';

    try {
        // 1️⃣ Search location
        const searchRes = await fetch(`https://travel-advisor.p.rapidapi.com/locations/search?query=${countryName}&limit=1`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': host
            }
        });

        const searchData = await searchRes.json();
        console.log("Location search data:", searchData);

        const location = searchData.data?.[0]?.result_object;
        const contentId = location?.location_id;

        if (!contentId) return { safetyScore: "-", advisory: "No advisory info available" };

        // 2️⃣ Fetch advisory
        const bodyData = {
            contentType: "hotel",
            contentId,
            questionId: "8393250",
            pagee: 0,
            updateToken: ""
        };

        const advisoryRes = await fetch(
            'https://travel-advisor.p.rapidapi.com/answers/v2/list?currency=USD&units=km&lang=en_US',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": apiKey,
                    "X-RapidAPI-Host": host
                },
                body: JSON.stringify(bodyData)
            }
        );

        const advisoryData = await advisoryRes.json();
        console.log("Advisory data:", advisoryData);

        const firstAnswer = advisoryData.data?.[0] || {};
        return {
            safetyScore: firstAnswer.advisory_score || firstAnswer.safety_score || "-",
            advisory: firstAnswer.advisory_message || firstAnswer.message || "No advisory info available"
        };

    } catch (error) {
        console.error("Travel Advisor API error:", error);
        return { safetyScore: "-", advisory: "Error fetching advisory" };
    }
}

// ---------------- DISPLAY FUNCTION ---------------- //
function displayData(country, weather, travel) {
    const cards = document.querySelectorAll(".card");

    // Country Info
    cards[0].innerHTML = `
        <h3>Country Information</h3>
        <p><strong>Population:</strong> ${country.population}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Currency:</strong> ${country.currency}</p>
        <p><strong>Capital:</strong> ${country.capital}</p>
        <img src="${country.flag}" class="flag-img" alt="Country Flag">
    `;

    // Weather Info
    cards[1].innerHTML = `
        <h3>Weather Information</h3>
        <p><strong>Temperature:</strong> ${weather.temp} °C</p>
        <p><strong>Humidity:</strong> ${weather.humidity} %</p>
        <p><strong>Condition:</strong> ${weather.condition}</p>
    `;

    // Travel Advisory
    cards[2].innerHTML = `
        <h3>Travel Advisory</h3>
        <p><strong>Safety Score:</strong> ${travel.safetyScore}</p>
        <p><strong>Advisory:</strong> ${travel.advisory}</p>
    `;
}




