import React from 'react';
import WeatherReport from './components/WeatherReport';
import HourlyWeather from './components/HourlyWeather';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'hourly'
        };
    }

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab });
    }

    render() {
        const { activeTab } = this.state;
        
        return (
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-title">Weather App</h1>
                    <nav className="tab-navigation">
                        <button 
                            className={`tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('hourly')}
                        >
                            5-Hour Forecast
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('daily')}
                        >
                            5-Day Forecast
                        </button>
                    </nav>
                </header>
                
                <main className="main-content">
                    {activeTab === 'hourly' && <HourlyWeather />}
                    {activeTab === 'daily' && <WeatherReport />}
                </main>
            </div>
        );
    }
}

export default App;
