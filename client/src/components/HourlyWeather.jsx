import React from 'react';
import 'whatwg-fetch';
import '../styles/HourlyWeather.css';

class HourlyWeather extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            locationInput: '',
            hourlyForecast: [],
            currentWeather: null,
            loading: false,
            error: null,
            unitFahrenheit: true
        };
    }

    handleInputChange = (event) => {
        this.setState({ locationInput: event.target.value });
    }

    handleUnitToggle = () => {
        const { unitFahrenheit, locationInput } = this.state;
        this.setState({ unitFahrenheit: !unitFahrenheit }, () => {
            if (locationInput) {
                this.fetchWeatherData();
            }
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.state.locationInput.trim()) {
            this.fetchWeatherData();
        }
    }

    fetchWeatherData = () => {
        const { locationInput, unitFahrenheit } = this.state;
        const unit = unitFahrenheit ? 'imperial' : 'metric';
        const apiKey = process.env.REACT_APP_API_KEY;
        
        this.setState({ loading: true, error: null });

        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationInput)}&units=${unit}&appid=${apiKey}`;
        
        window.fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                return response.json();
            })
            .then(data => {
                const hourlyData = this.extractHourlyForecast(data);
                this.setState({
                    hourlyForecast: hourlyData,
                    currentWeather: {
                        city: data.city.name,
                        country: data.city.country
                    },
                    loading: false,
                    error: null
                });
            })
            .catch(error => {
                this.setState({
                    loading: false,
                    error: error.message || 'Failed to fetch weather data',
                    hourlyForecast: [],
                    currentWeather: null
                });
            });
    }

    extractHourlyForecast = (data) => {
        // OpenWeatherMap API returns 3-hour intervals
        // Get the first 5 entries (next ~15 hours, showing every 3 hours)
        // For 5-hour display, we'll take what's available in the closest timeframe
        const now = new Date();
        const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
        
        return data.list.slice(0, 5).map(item => ({
            time: new Date(item.dt * 1000),
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            feelsLike: Math.round(item.main.feels_like)
        }));
    }

    formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    renderHourlyCards = () => {
        const { hourlyForecast, unitFahrenheit } = this.state;
        
        return hourlyForecast.map((hour, index) => (
            <div key={index} className="hourly-card">
                <div className="hourly-time">{this.formatTime(hour.time)}</div>
                <img 
                    src={`https://openweathermap.org/img/w/${hour.icon}.png`} 
                    alt={hour.description}
                    className="hourly-icon"
                />
                <div className="hourly-temp">
                    {hour.temp}
                    <span className="temp-unit">{unitFahrenheit ? '\u2109' : '\u2103'}</span>
                </div>
                <div className="hourly-desc">{hour.description}</div>
                <div className="hourly-details">
                    <span>Feels: {hour.feelsLike}{unitFahrenheit ? '\u2109' : '\u2103'}</span>
                    <span>Humidity: {hour.humidity}%</span>
                </div>
            </div>
        ));
    }

    render() {
        const { locationInput, loading, error, currentWeather, hourlyForecast, unitFahrenheit } = this.state;

        return (
            <div className="hourly-weather-container">
                <h2 className="hourly-title">5-Hour Weather Forecast</h2>
                
                <form onSubmit={this.handleSubmit} className="location-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={locationInput}
                            onChange={this.handleInputChange}
                            placeholder="Enter city name (e.g., New York, London)"
                            className="location-input"
                        />
                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? 'Searching...' : 'Get Weather'}
                        </button>
                    </div>
                </form>

                <div className="unit-toggle" onClick={this.handleUnitToggle}>
                    <span className={unitFahrenheit ? 'active' : ''}>F</span>
                    {' | '}
                    <span className={!unitFahrenheit ? 'active' : ''}>C</span>
                </div>

                {error && (
                    <div className="error-message">
                        {error}. Please try another location.
                    </div>
                )}

                {currentWeather && hourlyForecast.length > 0 && (
                    <div className="weather-results">
                        <h3 className="location-name">
                            {currentWeather.city}, {currentWeather.country}
                        </h3>
                        <p className="forecast-subtitle">Weather forecast for the next few hours</p>
                        <div className="hourly-cards-container">
                            {this.renderHourlyCards()}
                        </div>
                    </div>
                )}

                {!currentWeather && !error && !loading && (
                    <div className="placeholder-message">
                        Enter a location above to see the weather forecast
                    </div>
                )}
            </div>
        );
    }
}

export default HourlyWeather;
