import { useState, useEffect } from 'react';
import { Cloud, MapPin, RefreshCw, Calendar, X } from 'lucide-react';
import { getCityId } from '../cityData';

interface WeatherNow {
  temp: string;
  text: string;
  icon: string;
  feelsLike: string;
  humidity: string;
  windDir: string;
  windScale: string;
}

interface WeatherForecast {
  date: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  iconDay: string;
}

interface WeatherProps {
  city: string;
  onCityChange: (city: string) => void;
}

// 和风天气免费 API Key（用户需要自己申请）
const QWEATHER_KEY = '70a2f19ac5cc4fa2866e60dedc5e75b1';
// 和风天气 API 端点（每个用户有独立的子域名）
const QWEATHER_API_HOST = 'https://k27p44bt62.re.qweatherapi.com';

export default function Weather({ city, onCityChange }: WeatherProps) {
  const [weatherNow, setWeatherNow] = useState<WeatherNow | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inputCity, setInputCity] = useState(city);
  const [locationId, setLocationId] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 获取城市天气（初始化）
  const getCityWeather = async (cityName: string) => {
    try {
      // 获取城市 ID
      const cityId = getCityId(cityName);
      if (!cityId) {
        throw new Error(`不支持的城市: ${cityName}`);
      }

      console.log(`City: ${cityName}, ID: ${cityId}`);

      // 直接获取天气
      const url = `${QWEATHER_API_HOST}/v7/weather/now?location=${cityId}&key=${QWEATHER_KEY}`;

      console.log('Fetching weather:', url);

      const response = await fetch(url);

      console.log('Weather status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Weather response:', data);

      if (data.code === '200' && data.now) {
        setLocationId(cityId);
        setWeatherNow({
          temp: data.now.temp,
          text: data.now.text,
          icon: data.now.icon,
          feelsLike: data.now.feelsLike,
          humidity: data.now.humidity,
          windDir: data.now.windDir,
          windScale: data.now.windScale,
        });
        setLastUpdate(new Date());
        return cityId;
      } else {
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to get weather:', error);
      alert(`获取天气失败: ${error}\n\n请检查城市名称是否正确\n支持的城市：北京、上海、深圳、广州等主要城市`);
      return null;
    }
  };

  // 获取实时天气（单独调用，非初始化）
  const fetchWeatherNow = async (locId: string) => {
    try {
      const url = `${QWEATHER_API_HOST}/v7/weather/now?location=${encodeURIComponent(locId)}&key=${QWEATHER_KEY}`;

      console.log('Fetching weather now:', url);

      const response = await fetch(url);

      console.log('Weather now status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Weather now response:', data);

      if (data.code === '200') {
        setWeatherNow({
          temp: data.now.temp,
          text: data.now.text,
          icon: data.now.icon,
          feelsLike: data.now.feelsLike,
          humidity: data.now.humidity,
          windDir: data.now.windDir,
          windScale: data.now.windScale,
        });
        setLastUpdate(new Date());
      } else {
        console.error('Weather API error code:', data.code);
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  // 获取15天预报
  const fetchWeatherForecast = async (locId: string) => {
    try {
      const url = `${QWEATHER_API_HOST}/v7/weather/15d?location=${encodeURIComponent(locId)}&key=${QWEATHER_KEY}`;

      console.log('Fetching weather forecast:', url);

      const response = await fetch(url);

      console.log('Weather forecast status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Weather forecast response:', data);

      if (data.code === '200') {
        const forecastData = data.daily.map((day: any) => ({
          date: day.fxDate,
          tempMax: day.tempMax,
          tempMin: day.tempMin,
          textDay: day.textDay,
          iconDay: day.iconDay,
        }));
        setForecast(forecastData);
      } else {
        console.error('Forecast API error code:', data.code);
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    }
  };

  // 刷新天气数据
  const refreshWeather = async () => {
    if (!locationId) return;
    setLoading(true);
    await fetchWeatherNow(locationId);
    if (showForecast) {
      await fetchWeatherForecast(locationId);
    }
    setLoading(false);
  };

  // 初始化和城市变更
  useEffect(() => {
    const initWeather = async () => {
      await getCityWeather(city);
    };
    initWeather();
  }, [city]);

  // 5分钟自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      if (locationId) {
        fetchWeatherNow(locationId);
      }
    }, 5 * 60 * 1000); // 5分钟

    return () => clearInterval(interval);
  }, [locationId]);

  // 打开预报时加载数据
  useEffect(() => {
    if (showForecast && locationId && forecast.length === 0) {
      fetchWeatherForecast(locationId);
    }
  }, [showForecast, locationId, forecast.length]);

  const handleCitySubmit = async () => {
    if (inputCity.trim()) {
      setLoading(true);
      const cityId = await getCityWeather(inputCity.trim());
      if (cityId) {
        onCityChange(inputCity.trim());
        setShowSettings(false);
      }
      setLoading(false);
    }
  };

  // 获取和风天气图标 URL
  const getWeatherIcon = (code: string) => {
    return `https://cdn.qweather.com/img/plugin/weather-icon/${code}.png`;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} ${weekday}`;
  };

  if (!weatherNow) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl cursor-pointer hover:bg-white/15 transition-all"
        onClick={() => setShowSettings(true)}
        title="点击设置城市"
      >
        <Cloud size={20} className="text-white animate-pulse" />
        <span className="text-white text-sm">加载天气中...</span>
        <button
          className="ml-2 text-white/70 text-xs hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}
        >
          配置
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl transition-all shadow-lg">
        {/* 实时天气显示 */}
        <img
          src={getWeatherIcon(weatherNow.icon)}
          alt={weatherNow.text}
          className="w-12 h-12"
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{weatherNow.temp}°</span>
            <span className="text-sm text-white/80">{weatherNow.text}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
            <MapPin size={12} />
            <span>{city}</span>
            <span>•</span>
            <span>体感 {weatherNow.feelsLike}°</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="刷新天气"
          >
            <RefreshCw
              size={16}
              className={`text-white ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setShowForecast(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="查看15天预报"
          >
            <Calendar size={16} className="text-white" />
          </button>
          <button
            onClick={() => {
              setShowSettings(true);
              setInputCity(city);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="更改城市"
          >
            <MapPin size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* 15天预报弹窗 */}
      {showForecast && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{city} - 15天天气预报</h3>
              <button
                onClick={() => setShowForecast(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {forecast.map((day, index) => (
                  <div
                    key={day.date}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">
                        {index === 0 ? '今天' : formatDate(day.date)}
                      </div>
                      <img
                        src={getWeatherIcon(day.iconDay)}
                        alt={day.textDay}
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-red-500">
                        {day.tempMax}°
                      </span>
                      <span className="text-lg text-blue-500">{day.tempMin}°</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{day.textDay}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-4 text-center">
              数据来源：和风天气 QWeather • 更新时间：{lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* 城市设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">更改城市</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">城市名称</label>
                <input
                  type="text"
                  value={inputCity}
                  onChange={(e) => setInputCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCitySubmit()}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：深圳、北京、上海"
                />
                <div className="text-xs text-gray-500 mt-1">
                  支持中国城市名称，例如：深圳、北京、上海等
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCitySubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors"
                >
                  {loading ? '加载中...' : '确定'}
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setInputCity(city);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
