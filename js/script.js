// ---------------------------
// 都市データ
// ---------------------------
let cities = {};

//cities.json 読み込み

async function loadCities() {
    try {
        const response = await fetch("data/cities.json");
        cities = await response.json();
    } catch (error) {
        console.error("都市データの読み込み失敗", error);
    }
}

loadCities();

// ---------------------------
// 検索ボタン
// ---------------------------
document.querySelector("button[type='submit']").addEventListener("click", function (event) {
    event.preventDefault();
    searchWeather();
});

// Enterキー検索
document.querySelector("input[name='city_name']").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        searchWeather();
    }
});

// ---------------------------
// 都市検索
// ---------------------------
function searchWeather(){

    const cityName =
        document.querySelector("input[name='city_name']").value.trim();

    const cityCode = cities[cityName];

    if(!cityCode){

        alert("都市が見つかりません");

        return;

    }

    getWeather(cityCode);

}

// ---------------------------
// 天気取得
// ---------------------------
async function getWeather(code) {
    try {
        const url = `https://weather.tsukumijima.net/api/forecast?city=${code}`;
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("天気取得エラー", error);
    }
}

// ---------------------------
// 天気表示
// ---------------------------
function displayWeather(weather) {
    if (!weather) return;
    const weatherArea = document.getElementById("weather-area");
    const forecastArea = document.querySelector(".forecast-area");
    const title = document.getElementById("weather-title");
    weatherArea.style.display = "block";
    title.textContent =
        `${weather.location.city}（${weather.location.district} / ${weather.location.area}）の天気（3日間）`;

    forecastArea.innerHTML = "";


    weather.forecasts.forEach(forecast => {

        const maxTemp = forecast.temperature.max ?
            forecast.temperature.max.celsius : "データなし";

        const minTemp = forecast.temperature.min ?
            forecast.temperature.min.celsius : "データなし";

        const wind = forecast.detail ? forecast.detail.wind : "";
        const wave = forecast.detail ? forecast.detail.wave : "";

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <p>📅 日付: ${forecast.date}</p>
            <p>⛅ 天気: ${forecast.telop}</p>

            <p>🌡️ 最高気温: ${maxTemp} ℃</p>
            <p>🌡️ 最低気温: ${minTemp} ℃</p>

            <p>💧 降水確率:</p>
            <ul>
                <li>00〜06時: ${forecast.chanceOfRain.T00_06}</li>
                <li>06〜12時: ${forecast.chanceOfRain.T06_12}</li>
                <li>12〜18時: ${forecast.chanceOfRain.T12_18}</li>
                <li>18〜24時: ${forecast.chanceOfRain.T18_24}</li>
            </ul>

            ${wind ? `<p>🌬️ 風: ${wind}</p>` : ""}
            ${wave ? `<p>🌊 波: ${wave}</p>` : ""}
        `;
        forecastArea.appendChild(card);
    });
    document.getElementById("overview").innerHTML =
        `<h3>天気概要</h3>
        <p>${weather.description.text}</p>`;
  
    showMap(
        weather.location.lat,
        weather.location.lon
    );
}




// ---------------------------
// オートコンプリート（候補表示）
// ---------------------------
const input = document.getElementById("city-input");
const suggestionBox = document.getElementById("suggestions-box");

input.addEventListener("input", function(){
    const keyword = input.value.trim();
    suggestionBox.innerHTML = "";
    if(!keyword) return;
    const cityNames = Object.keys(cities);
    const matches = cityNames
        .filter(name => name.includes(keyword))
        .slice(0,10);
    matches.forEach(name => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = name;
        div.addEventListener("click", function(){
            input.value = name;
            suggestionBox.innerHTML = "";
        });
        suggestionBox.appendChild(div);
    });
});

document.addEventListener("click", function(e){
    if(!e.target.closest(".input-group")){
        suggestionBox.innerHTML = "";
    }
});



//地図を表示
let map;

function showMap(lat, lon) {
    if (!map) {
        map = L.map("map").setView([lat, lon], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
        }).addTo(map);

    } else {
        map.setView([lat, lon], 10);
    }

    L.marker([lat, lon]).addTo(map);
}
