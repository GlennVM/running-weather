const axios = require('axios')

const BASE_URL = 'http://api.openweathermap.org'

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

const api = {
    getCoordinates: async (city, country) => {
        try {
            const { data } = await apiClient.get(`/geo/1.0/direct?q=${city},${country}&appid=${process.env.API_KEY}`)
            return data[0]
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    },

    getWeatherData: async (lat, lon) => {
        try {
            const { data } = await apiClient.get(`/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY}`)
            return data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }
}

module.exports = api
