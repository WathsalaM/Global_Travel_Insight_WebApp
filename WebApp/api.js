// frontend/api.js

const countrySelect = document.getElementById("country");
const button = document.querySelector("button");

button.addEventListener("click", getTravelInfo);

async function getTravelInfo() {
    const countryName = countrySelect.value;

    try {
        // Call your backend
        const res = await fetch(`http://localhost:5000/api/travel/${countryName}`);
        const data = await res.json();

        displayData(data.country, data.weather, data.travel);
    } catch (error) {
        console.error(error);
        alert("Error fetching data from backend.");
    }
}

function displayData(country, weather, travel) {
    const cards = document.querySelectorAll(".card");

    cards[0].innerHTML = `
        <h3>Country Information</h3>
        <p><strong>Population:</strong> ${country.population}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Currency:</strong> ${country.currency}</p>
        <p><strong>Capital:</strong> ${country.capital}</p>
        <img src="${country.flag}" class="flag-img" alt="Country Flag">
    `;

    cards[1].innerHTML = `
        <h3>Weather Information</h3>
        <p><strong>Temperature:</strong> ${weather.temp} °C</p>
        <p><strong>Humidity:</strong> ${weather.humidity} %</p>
        <p><strong>Condition:</strong> ${weather.condition}</p>
    `;

    cards[2].innerHTML = `
        <h3>Travel Advisory</h3>
        <p><strong>Safety Score:</strong> ${travel.safetyScore}</p>
        <p><strong>Advisory:</strong> ${travel.advisory}</p>
    `;
}




