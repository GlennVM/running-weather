const axios = require('axios')
const { addHours, format } = require('date-fns')

const API_KEY = ""

const start = async () => {
    try {
        const {generalAdvice, recommendations} = await createRunningRecommendation('Gent', 'Belgium')
        console.log(generalAdvice)
        if (recommendations) recommendations.forEach(rec => console.log(rec))
    } catch (e) {
        console.error(e)
    }
}

const createRunningRecommendation = async (city = 'Gent', country = 'Belgium') => {
    const { lat, lon } = await getCoordinates(city, country)
    const { data } = await getWeatherDataNext15Hours(lat, lon)

    const timezoneOffset = data.city.timezone
    const weather = data.list.slice(0, 5)

    return getRecommendation(weather, timezoneOffset)
}

const getCoordinates = async (city, country) => {
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&appid=${API_KEY}`)
    const { lat, lon } = response.data[0]
    return { lat, lon }
}

const getWeatherDataNext15Hours = (lat, lon) => {
    return axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
}

const getRecommendation = (predictions, timezoneOffset) => {
    const { max: maxTemp, min: minTemp } = getExtremaTemperatures(predictions)

    const goodWeatherConditions = predictions.filter(prediction => {
        const { weather } = prediction
        const weatherType = weather[0].id

        if (weatherType >= 300 && weatherType <= 399) return true
        if (weatherType >= 500 && weatherType <= 502) return true
        if (weatherType >= 800 && weatherType <= 899) return true

        return false
    })

    if (maxTemp < 5) return { generalAdvice: `It's too cold, hit the threadmill!` }
    if (minTemp > 25) return { generalAdvice: `It's too hot, hit the threadmill!` }

    if (goodWeatherConditions.length === 0) return { generalAdvice: 'The weather is terrible, hit the threadmill!' }

    const recommendations = goodWeatherConditions.map(condition => {
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

    return { generalAdvice: '🏃‍♂️‍➡️ Run, Forest! Run! 🏃‍♂️‍➡️', recommendations }
}

const getExtremaTemperatures = (predictions) => {
    return predictions.reduce((acc, { main }) => ({
        ...acc,
        max: main.temp > acc.max ? main.temp : acc.max,
        min: main.temp < acc.min ? main.temp : acc.min
    }), { max: predictions[0].main.temp, min: predictions[0].main.temp })
}

module.exports = start()