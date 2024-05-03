const { addHours, format } = require('date-fns')
const api = require('./client')

const start = async () => {
    try {
        const {generalAdvice, recommendations} = await createRunningRecommendation('Gent', 'Belgium')
        console.log(`Our recommendation:\n\n${generalAdvice}\n`)
        if (recommendations) recommendations.forEach(rec => console.log(rec))
    } catch (e) {
        console.error(e)
    }
}

const createRunningRecommendation = async (city = 'Gent', country = 'Belgium') => {
    // Get coordinates and weather data
    const { lat, lon } = await api.getCoordinates(city, country)
    const { city: cityData, list: weatherList } = await api.getWeatherData(lat, lon)

    const weather = weatherList.slice(0,5)
    const timezoneOffset = cityData.timezone

    // Generate running recommendation based on weather data
    return getRecommendation(weather, timezoneOffset)
}

const getRecommendation = (predictions, timezoneOffset) => {
    const { max: maxTemp, min: minTemp } = getExtremaTemperatures(predictions)
    if (maxTemp < 5) return { generalAdvice: `It's too cold, hit the threadmill!` }
    if (minTemp > 25) return { generalAdvice: `It's too hot, hit the threadmill!` }

    const goodWeatherConditions = getGoodWeatherConditions(predictions)
    if (goodWeatherConditions.length === 0) return { generalAdvice: 'The weather is terrible, hit the threadmill!' }

    const recommendations = getGoodWeatherRecommendations(goodWeatherConditions, timezoneOffset)
    return { generalAdvice: '🏃‍♂️‍➡️ Run, Forest! Run! 🏃‍♂️‍➡️', recommendations }
}

const getGoodWeatherConditions = (predictions) => {
    return predictions.filter(prediction => {
        const weatherType = prediction.weather[0].id
        return (weatherType >= 300 && weatherType <= 399) || // Drizzle
               (weatherType >= 500 && weatherType <= 502) || // Rain
               (weatherType >= 800 && weatherType <= 899)   // Clear sky or Clouds
    })
}

const getGoodWeatherRecommendations = (conditions, timezoneOffset) => {
    return conditions.map(condition => {
        const timestamp = (condition.dt - timezoneOffset) * 1000
        const startTime = format(timestamp, 'HH:mm')
        const endTime = format(addHours(timestamp, 3), 'HH:mm')
        
        const weatherType = condition.weather[0].id

        let recommendation = ''

        if (weatherType >= 300 && weatherType <= 399) {
            recommendation = `- ${startTime} - ${endTime}: 🌧️there might be some drizzle , maybe bring a jacket`
        }
        if (weatherType >= 500 && weatherType <= 502) {
            recommendation = `- ${startTime} - ${endTime}: 🌧️ there might be some light rain , probably a good idea to bring a jacket`
        }
        if (weatherType === 800) {
            recommendation = `- ${startTime} - ${endTime}: ☀️ it's clear, enjoy!`
        }
        if (weatherType >= 800 && weatherType <= 899) {
            recommendation = `- ${startTime} - ${endTime}: ⛅️ it might be a bit cloudy`
        }

        return `${recommendation}\n 🌡️  ${condition.main.temp}\n`
    })
}

const getExtremaTemperatures = (predictions) => {
    return predictions.reduce((acc, { main }) => ({
        ...acc,
        max: main.temp > acc.max ? main.temp : acc.max,
        min: main.temp < acc.min ? main.temp : acc.min
    }), { max: predictions[0].main.temp, min: predictions[0].main.temp })
}

module.exports = start()
