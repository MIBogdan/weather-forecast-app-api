const e = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const IP = require('ip');


const app = e();
const port = 3000;

app.use(e.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?lat=44.426765&lon=26.102537";
const API_KEY = "&appid=82bc0730c9febabfd1a583cf016c2b4d"

const COUNTRY_URL = "http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5"
const ipAddress = IP.address();
const yearData = new Date().getFullYear();
let chosenCity;
let errorMessage;
let message;
let button = `<form action="/return-home" method="post">
<button type="submit" value="Return Home" formaction="/return-home" class="Btn14">
<div class="sign14"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
<div class="text14">Return</div>
</button>
</div>
</form>`;

let fullName;


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



app.get("/", async (req, res) => {
    try {
        const result = await axios.get("http://ip-api.com/json/" + ipAddress);
        let cityByIP = result.data.city;


        if (cityByIP === undefined) {
            errorMessage = `Could not get your IP address. Default city has been set to Bucharest-Romania.`;
            chosenCity = "Bucharest";
        } else {
            chosenCity = cityByIP;
        }
        

        try {
            const result = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${chosenCity}&limit=1` + API_KEY);
            const lat = result.data[0].lat;
            const lon = result.data[0].lon;
            let cityName = result.data[0].name;
            let countryName = result.data[0].country;
            fullName = `${cityName}, ${countryName}`;
            
            
            try {
                const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` + API_KEY);
                
                const tempInK = result.data.main.temp;
                const minTempInK = result.data.main.temp_min;
                const maxTempInK = result.data.main.temp_max;
                const temperature = Math.floor(tempInK - 273.15);
                const minTemperature = Math.floor(minTempInK - 273.15);
                const maxTemperature = Math.floor(maxTempInK - 273.15);
                const humidity = result.data.main.humidity;
                const windSpeed = result.data.wind.speed;
                const status = result.data.weather[0].description;
                let statusDescription = status.split(" ");

                for (let i = 0; i < statusDescription.length; i++) {
                    statusDescription[i] = statusDescription[i][0].toUpperCase() + statusDescription[i].substr(1);
                }
                 statusDescription = statusDescription[0] + " " + statusDescription[1];
                

                
    
                const allData = {
                    temperature,
                    minTemperature,
                    maxTemperature,
                    humidity,
                    windSpeed,
                    status,
                    statusDescription,
                    chosenCity,
                    fullName
                }
    
                res.render("index.ejs", {year: yearData, allData, errorMessage, message });
            } catch (error) {
                console.log(error);
                errorMessage = `Error type: "${error.response}" this could be the result of the API failing to send data about the city or country required. `;
            }
        } catch(error) {
            console.log(error);
            errorMessage = `Error: "${error.response}" this could be the result of the server failing to get latitude and longitude data from API`;
        }


    } catch(error) {
        console.log(error);
        
        errorMessage = `Error: ${error.response}`;
        
       
    }
});


app.post("/get-weather", async (req, res) => {
    let inputCity = req.body.country;
    errorMessage = "";
    

    chosenCity = capitalizeFirstLetter(inputCity);


    try {
        const result = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${chosenCity}&limit=1` + API_KEY);
        const lat = result.data[0].lat;
        const lon = result.data[0].lon;
        let cityName = result.data[0].name;
        let countryName = result.data[0].country;
        fullName = `${cityName}, ${countryName}`;

        try {
            const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` + API_KEY);
            const tempInK = result.data.main.temp;
            const minTempInK = result.data.main.temp_min;
            const maxTempInK = result.data.main.temp_max;
            const temperature = Math.floor(tempInK - 273.15);
            const minTemperature = Math.floor(minTempInK - 273.15);
            const maxTemperature = Math.floor(maxTempInK - 273.15);
            const humidity = result.data.main.humidity;
            const windSpeed = result.data.wind.speed;
            const status = result.data.weather[0].description;
            let statusDescription = status.split(" ");

            for (let i = 0; i < statusDescription.length; i++) {
                statusDescription[i] = statusDescription[i][0].toUpperCase() + statusDescription[i].substr(1);
            }

            

            statusDescription = statusDescription[0] + " " + statusDescription[1];
            

            
            

            const allData = {
                temperature,
                minTemperature,
                maxTemperature,
                humidity,
                windSpeed,
                statusDescription,
                chosenCity,
                fullName
            }

            

            res.render("index.ejs", {year: yearData, allData, errorMessage, message });
            
            
        } catch (error) {
            console.log(error);
            errorMessage = `Error type: "${error}". There has been some problems trying to get data from API `;
        }
    } catch(error) {
        if (!inputCity) {
            message = "Nothing to geocode. Type something";
            
        } else {
            message = "The country/city does not exist.";
            
        }
        
        let messageButton = {
            message,
            button
        }
        res.render("index.ejs", {messageButton});
    }


});

app.post("/return-home", (req, res) => {
    res.redirect("/");
})





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});