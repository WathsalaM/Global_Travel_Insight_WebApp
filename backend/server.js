// backend/server.js
import express from "express";
import cors from "cors";



const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- API KEYS ---------------- //
const OPENWEATHER_KEY = "1095d2960c513f3bafa9c5cccdb7373a";
const TRAVEL_API_KEY = "01519c0546msh1d450b5125a2c37p10559cjsn49982d3c9c8a";
const TRAVEL_API_HOST = "travel-advisor.p.rapidapi.com";

// ---------------- ROUTES ---------------- //
app.get("/api/travel/:country", async (req, res) => {
    const countryName = req.params.country;

    try {
        // 1️⃣ Country Info
        const countryResp = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const countryDataRaw = await countryResp.json();
        const countryData = countryDataRaw[0];

        const country = {
            population: countryData.population,
            region: countryData.region,
            currency: Object.keys(countryData.currencies)[0],
            flag: countryData.flags.svg,
            capital: countryData.capital[0]
        };

        // 2️⃣ Weather Info
        const weatherResp = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${country.capital}&appid=${OPENWEATHER_KEY}&units=metric`
        );
        const weatherDataRaw = await weatherResp.json();
        const weather = {
            temp: weatherDataRaw.main.temp,
            humidity: weatherDataRaw.main.humidity,
            condition: weatherDataRaw.weather[0].description
        };

        // 3️⃣ Travel Advisory Info
        const searchResp = await fetch(
            `https://travel-advisor.p.rapidapi.com/locations/search?query=${countryName}&limit=1`,
            {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": TRAVEL_API_KEY,
                    "X-RapidAPI-Host": TRAVEL_API_HOST
                }
            }
        );
        const searchData = await searchResp.json();
        const location = searchData.data?.[0]?.result_object;
        const contentId = location?.location_id;

        let travel = { safetyScore: "-", advisory: "No advisory info available" };

        if (contentId) {
            const bodyData = {
                contentType: "hotel",
                contentId,
                questionId: "8393250",
                pagee: 0,
                updateToken: ""
            };

            const advisoryResp = await fetch(
                "https://travel-advisor.p.rapidapi.com/answers/v2/list?currency=USD&units=km&lang=en_US",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-RapidAPI-Key": TRAVEL_API_KEY,
                        "X-RapidAPI-Host": TRAVEL_API_HOST
                    },
                    body: JSON.stringify(bodyData)
                }
            );

            const advisoryData = await advisoryResp.json();
            const firstAnswer = advisoryData.data?.[0] || {};
            travel = {
                safetyScore: firstAnswer.advisory_score || firstAnswer.safety_score || "-",
                advisory: firstAnswer.advisory_message || firstAnswer.message || "No advisory info available"
            };
        }

        res.json({ country, weather, travel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch travel data" });
    }
});

// ---------------- START SERVER ---------------- //
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});


