import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import { WEATHER_API_KEY } from '../config';

interface WeatherWidgetProps {
    lat: number;
    lng: number;
}

interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
    rainChance: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng }) => {
    const [weather, setWeather] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // OpenWeatherMap 5-day forecast API
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${WEATHER_API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Weather API failed');
                }

                const data = await response.json();

                // Get next 3 days (one forecast per day at noon)
                const forecasts = data.list
                    .filter((_: any, index: number) => index % 8 === 0) // Every 8th item = 24 hours
                    .slice(0, 3)
                    .map((item: any) => ({
                        temp: Math.round(item.main.temp),
                        condition: item.weather[0].main,
                        icon: item.weather[0].icon,
                        rainChance: item.pop * 100 // Probability of precipitation
                    }));

                setWeather(forecasts);
                setLoading(false);
            } catch (err) {
                console.error('Weather fetch error:', err);
                setError(true);
                setLoading(false);
            }
        };

        if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY') {
            fetchWeather();
        } else {
            // Demo data if no API key
            setWeather([
                { temp: 28, condition: 'Clear', icon: '01d', rainChance: 10 },
                { temp: 30, condition: 'Clouds', icon: '02d', rainChance: 30 },
                { temp: 26, condition: 'Rain', icon: '10d', rainChance: 80 }
            ]);
            setLoading(false);
        }
    }, [lat, lng]);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'rain':
            case 'drizzle':
                return <CloudRain className="h-8 w-8 text-blue-500" />;
            case 'clear':
                return <Sun className="h-8 w-8 text-yellow-500" />;
            case 'clouds':
                return <Cloud className="h-8 w-8 text-gray-500" />;
            default:
                return <Wind className="h-8 w-8 text-gray-400" />;
        }
    };

    const getDayLabel = (index: number) => {
        const days = ['Today', 'Tomorrow', 'Day 3'];
        return days[index];
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-4 border-2 border-blue-100">
                <p className="text-sm text-gray-500 text-center">Loading weather...</p>
            </div>
        );
    }

    if (error) {
        return null; // Hide widget if error
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-5 border-2 border-blue-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    3-Day Forecast
                </h3>
                <span className="text-xs text-gray-500 font-medium">Plan your work</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {weather.map((day, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-3 text-center shadow-sm border border-blue-100"
                    >
                        <p className="text-xs font-bold text-gray-600 mb-2">{getDayLabel(index)}</p>
                        <div className="flex justify-center mb-2">
                            {getWeatherIcon(day.condition)}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{day.temp}°</p>
                        <p className="text-xs text-gray-500 mb-2">{day.condition}</p>
                        {day.rainChance > 30 && (
                            <div className="flex items-center justify-center gap-1 bg-blue-50 rounded-lg py-1 px-2">
                                <CloudRain className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-bold text-blue-600">{Math.round(day.rainChance)}%</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-xs text-center text-gray-500 mt-3">
                {weather[0].rainChance > 50 ? '⚠️ High chance of rain - plan accordingly' : '✅ Good weather for farming'}
            </p>
        </div>
    );
};

export default WeatherWidget;
