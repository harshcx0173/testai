import React, { useEffect, useState } from 'react';

const API_KEY = 'd765cc3ba35b4108b5b61427252506';

function Weather() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasRun = React.useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log('Got location:', latitude, longitude);
        setLocation({ latitude, longitude });
        fetchWeather(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`Could not get your location: ${err.message}`);
        setLoading(false);
      }
    );
  }, []);
 
  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes`
      );
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#f5f5f5', borderRadius: 12 }}>
      <h2>Current Weather</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {weather && (
        <div>
          <h3>{weather.location.name}, {weather.location.region}, {weather.location.country}</h3>
          <p><b>Local Time:</b> {weather.location.localtime}</p>
          <div className='main-div' >
            <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
            <div>
              {/* <div style={{ fontSize: 32, fontWeight: 600 }}>{weather.current.temp_c}°C / {weather.current.temp_f}°F</div> */}
              <div style={{ fontSize: 32, fontWeight: 600 }}>{weather.current.temp_c}°C</div>
              <div>{weather.current.condition.text}</div>
              <div>Feels like: {weather.current.feelslike_c}°C</div>
            </div>
          </div>
          <hr style={{ margin: '16px 0' }} />
          <div className='basic-div' >
            <div><b>Humidity:</b> {weather.current.humidity}%</div>
            <div><b>Wind:</b> {weather.current.wind_kph} kph {weather.current.wind_dir}</div>
            <div><b>Pressure:</b> {weather.current.pressure_mb} mb</div>
            <div><b>Cloud:</b> {weather.current.cloud}%</div>
            <div><b>Visibility:</b> {weather.current.vis_km} km</div>
            <div><b>UV Index:</b> {weather.current.uv}</div>
          </div>
          <h4 style={{ marginTop: 24 }}>Air Quality</h4>
          <div className='air-quality-div' >
            <div><b>CO:</b> {weather.current.air_quality.co.toFixed(1)}</div>
            <div><b>NO₂:</b> {weather.current.air_quality.no2.toFixed(1)}</div>
            <div><b>O₃:</b> {weather.current.air_quality.o3.toFixed(1)}</div>
            <div><b>SO₂:</b> {weather.current.air_quality.so2.toFixed(1)}</div>
            <div><b>PM2.5:</b> {weather.current.air_quality.pm2_5.toFixed(1)}</div>
            <div><b>PM10:</b> {weather.current.air_quality.pm10.toFixed(1)}</div>
            <div><b>US EPA Index:</b> {weather.current.air_quality['us-epa-index']}</div>
            <div><b>GB DEFRA Index:</b> {weather.current.air_quality['gb-defra-index']}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather; 