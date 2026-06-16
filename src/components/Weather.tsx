import { useState, useEffect } from 'react';
import { Cloud, MapPin, RefreshCw, Calendar, X, TrendingUp } from 'lucide-react';
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

interface HourlyWeather {
  fxTime: string;
  temp: string;
  icon: string;
  text: string;
  windDir: string;
  windScale: string;
  humidity: string;
  pop: string; // 降水概率
  precip: string; // 降水量
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
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inputCity, setInputCity] = useState(city);
  const [locationId, setLocationId] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [showHourlyDetail, setShowHourlyDetail] = useState(false);

  // 搜索城市并获取 LocationID
  const searchCity = async (cityName: string): Promise<string | null> => {
    try {
      const url = `${QWEATHER_API_HOST}/geo/v2/city/lookup?location=${encodeURIComponent(cityName)}&key=${QWEATHER_KEY}`;

      console.log('Searching city:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('City search response:', data);

      if (data.code === '200' && data.location && data.location.length > 0) {
        // 返回第一个匹配的城市 ID
        const cityId = data.location[0].id;
        console.log(`Found city: ${data.location[0].name}, ID: ${cityId}`);
        return cityId;
      } else if (data.code === '204') {
        throw new Error('未找到该城市');
      } else if (data.code === '401') {
        throw new Error('API Key 认证失败');
      } else if (data.code === '402') {
        throw new Error('API 配额不足');
      } else if (data.code === '404') {
        throw new Error('城市不存在');
      } else {
        throw new Error(`城市搜索失败: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to search city:', error);
      throw error;
    }
  };

  // 获取城市天气（初始化）
  const getCityWeather = async (cityName: string) => {
    try {
      // 先搜索城市获取 LocationID
      let cityId: string | null;

      // 优先尝试从本地映射表获取（节省 API 调用）
      cityId = getCityId(cityName);

      // 如果本地没有，调用城市搜索 API
      if (!cityId) {
        console.log(`本地映射表未找到 ${cityName}，调用城市搜索 API`);
        cityId = await searchCity(cityName);
      }

      if (!cityId) {
        throw new Error(`无法找到城市: ${cityName}`);
      }

      console.log(`City: ${cityName}, ID: ${cityId}`);

      // 获取天气
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
      } else if (data.code === '204') {
        throw new Error('该地区暂无天气数据');
      } else if (data.code === '401') {
        throw new Error('API Key 认证失败');
      } else if (data.code === '402') {
        throw new Error('API 配额不足，请稍后再试');
      } else if (data.code === '404') {
        throw new Error('未找到该地区的天气数据');
      } else {
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to get weather:', error);
      alert(`获取天气失败: ${error instanceof Error ? error.message : error}\n\n提示：支持全球城市名称或中国城市名称`);
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
      } else if (data.code === '204') {
        console.warn('该地区暂无天气数据');
      } else if (data.code === '401') {
        console.error('API Key 认证失败');
      } else if (data.code === '402') {
        console.error('API 配额不足');
      } else if (data.code === '429') {
        console.error('请求过于频繁');
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
      } else if (data.code === '204') {
        console.warn('该地区暂无预报数据');
      } else if (data.code === '401') {
        console.error('API Key 认证失败');
      } else if (data.code === '402') {
        console.error('API 配额不足');
      } else if (data.code === '429') {
        console.error('请求过于频繁');
      } else {
        console.error('Forecast API error code:', data.code);
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    }
  };

  // 获取24小时逐小时预报
  const fetchHourlyForecast = async (locId: string) => {
    try {
      const url = `${QWEATHER_API_HOST}/v7/weather/24h?location=${encodeURIComponent(locId)}&key=${QWEATHER_KEY}`;

      console.log('Fetching hourly forecast:', url);

      const response = await fetch(url);

      console.log('Hourly forecast status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Hourly forecast response:', data);

      if (data.code === '200') {
        const hourlyData = data.hourly.map((hour: any) => ({
          fxTime: hour.fxTime,
          temp: hour.temp,
          icon: hour.icon,
          text: hour.text,
          windDir: hour.windDir,
          windScale: hour.windScale,
          humidity: hour.humidity,
          pop: hour.pop,
          precip: hour.precip,
        }));
        setHourlyForecast(hourlyData);
      } else if (data.code === '204') {
        console.warn('该地区暂无逐小时预报数据');
      } else if (data.code === '401') {
        console.error('API Key 认证失败');
      } else if (data.code === '402') {
        console.error('API 配额不足');
      } else if (data.code === '429') {
        console.error('请求过于频繁');
      } else {
        console.error('Hourly API error code:', data.code);
        throw new Error(`API 错误码: ${data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch hourly forecast:', error);
    }
  };

  // 刷新天气数据
  const refreshWeather = async () => {
    if (!locationId) return;
    setLoading(true);
    await fetchWeatherNow(locationId);
    await fetchHourlyForecast(locationId);
    if (showForecast) {
      await fetchWeatherForecast(locationId);
    }
    setLoading(false);
  };

  // 初始化和城市变更
  useEffect(() => {
    const initWeather = async () => {
      const cityId = await getCityWeather(city);
      if (cityId) {
        await fetchHourlyForecast(cityId);
      }
    };
    initWeather();
  }, [city]);

  // 5分钟自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      if (locationId) {
        fetchWeatherNow(locationId);
        fetchHourlyForecast(locationId);
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

  // 渲染和风天气图标（使用图标字体）
  const WeatherIcon = ({ code, className = "" }: { code: string; className?: string }) => {
    return <i className={`qi-${code} ${className}`}></i>;
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

  // 格式化简短日期（用于图表）
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 格式化小时（用于逐小时预报）
  const formatHour = (timeStr: string) => {
    const date = new Date(timeStr);
    const hour = date.getHours();
    return `${hour}:00`;
  };

  // 获取关键时段天气（下班和上班）
  const getKeyPeriodsWeather = () => {
    if (hourlyForecast.length === 0) return null;

    const now = new Date();
    const currentHour = now.getHours();

    // 下班时段：18:00后到22:00
    const offWorkHours = hourlyForecast.filter(h => {
      const hourTime = new Date(h.fxTime);
      const hour = hourTime.getHours();
      const isSameDay = hourTime.getDate() === now.getDate();
      return isSameDay && hour >= 18 && hour <= 22;
    });

    // 明日上班时段：7:00-9:00
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const workHours = hourlyForecast.filter(h => {
      const hourTime = new Date(h.fxTime);
      const hour = hourTime.getHours();
      const isTomorrow = hourTime.getDate() === tomorrow.getDate();
      return isTomorrow && hour >= 7 && hour <= 9;
    });

    // 分析降水情况
    const analyzeRain = (hours: HourlyWeather[]) => {
      const rainHours = hours.filter(h => parseFloat(h.pop) > 30 || parseFloat(h.precip) > 0);

      if (rainHours.length === 0) {
        // 没有降水，返回主要天气
        return {
          hasRain: false,
          mainWeather: hours[0]?.text || '未知',
          description: hours[0]?.text || '未知',
        };
      }

      // 有降水
      const firstRain = rainHours[0];
      const lastRain = rainHours[rainHours.length - 1];
      const avgPop = Math.round(rainHours.reduce((sum, h) => sum + parseFloat(h.pop), 0) / rainHours.length);

      return {
        hasRain: true,
        start: formatHour(firstRain.fxTime),
        end: formatHour(lastRain.fxTime),
        duration: rainHours.length,
        avgPop,
        maxPop: Math.max(...rainHours.map(h => parseFloat(h.pop))),
        text: firstRain.text,
        description: rainHours.length === 1
          ? `${formatHour(firstRain.fxTime)}有${firstRain.text}`
          : `${formatHour(firstRain.fxTime)}-${formatHour(lastRain.fxTime)}有${firstRain.text}`,
      };
    };

    const offWorkRain = offWorkHours.length > 0 ? analyzeRain(offWorkHours) : null;
    const workRain = workHours.length > 0 ? analyzeRain(workHours) : null;

    // 只在有意义的时段显示
    const shouldShowOffWork = currentHour >= 14 && currentHour < 23 && offWorkHours.length > 0;
    const shouldShowWork = (currentHour >= 20 || currentHour < 9) && workHours.length > 0;

    if (!shouldShowOffWork && !shouldShowWork) return null;

    return {
      offWork: shouldShowOffWork ? { hours: offWorkHours, rain: offWorkRain } : null,
      work: shouldShowWork ? { hours: workHours, rain: workRain } : null,
    };
  };

  const keyPeriods = getKeyPeriodsWeather();

  // 温度折线图组件
  const TemperatureChart = () => {
    if (forecast.length === 0) return null;

    const chartWidth = 900;
    const chartHeight = 300;
    const padding = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // 提取温度数据
    const maxTemps = forecast.map(d => parseFloat(d.tempMax));
    const minTemps = forecast.map(d => parseFloat(d.tempMin));
    const allTemps = [...maxTemps, ...minTemps];

    // 计算温度范围
    const tempMin = Math.floor(Math.min(...allTemps)) - 2;
    const tempMax = Math.ceil(Math.max(...allTemps)) + 2;
    const tempRange = tempMax - tempMin;

    // 计算坐标点
    const points = forecast.map((_, index) => {
      const x = padding.left + (index / (forecast.length - 1)) * innerWidth;
      const yMax = padding.top + (1 - (maxTemps[index] - tempMin) / tempRange) * innerHeight;
      const yMin = padding.top + (1 - (minTemps[index] - tempMin) / tempRange) * innerHeight;
      return { x, yMax, yMin };
    });

    // 生成路径字符串
    const maxLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yMax}`).join(' ');
    const minLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yMin}`).join(' ');

    // 生成填充区域路径
    const areaPath = `M ${points[0].x} ${points[0].yMax} ${maxLine.slice(2)} L ${points[points.length - 1].x} ${points[points.length - 1].yMin} ${points.map(p => `L ${p.x} ${p.yMin}`).reverse().join(' ')} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* 背景网格 */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* 温度刻度线 */}
          {[...Array(6)].map((_, i) => {
            const temp = tempMin + (tempRange / 5) * i;
            const y = padding.top + (1 - i / 5) * innerHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {Math.round(temp)}°
                </text>
              </g>
            );
          })}

          {/* 温度区域填充 */}
          <path d={areaPath} fill="url(#tempGradient)" />

          {/* 最高温度线 */}
          <path
            d={maxLine}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 最低温度线 */}
          <path
            d={minLine}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 数据点和标签 */}
          {points.map((point, index) => (
            <g key={index}>
              {/* 最高温度点 */}
              <circle cx={point.x} cy={point.yMax} r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
              <text
                x={point.x}
                y={point.yMax - 10}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#ef4444"
              >
                {maxTemps[index]}°
              </text>

              {/* 最低温度点 */}
              <circle cx={point.x} cy={point.yMin} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
              <text
                x={point.x}
                y={point.yMin + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#3b82f6"
              >
                {minTemps[index]}°
              </text>

              {/* 日期标签 */}
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#374151"
              >
                {index === 0 ? '今天' : formatShortDate(forecast[index].date)}
              </text>

              {/* 天气图标 */}
              <foreignObject
                x={point.x - 15}
                y={chartHeight - padding.bottom + 30}
                width="30"
                height="30"
              >
                <div className="flex items-center justify-center">
                  <i className={`qi-${forecast[index].iconDay} text-xl`}></i>
                </div>
              </foreignObject>
            </g>
          ))}

          {/* 图例 */}
          <g transform={`translate(${chartWidth - 150}, 20)`}>
            <line x1="0" y1="0" x2="30" y2="0" stroke="#ef4444" strokeWidth="3" />
            <text x="35" y="4" fontSize="12" fill="#374151">最高温度</text>

            <line x1="0" y1="20" x2="30" y2="20" stroke="#3b82f6" strokeWidth="3" />
            <text x="35" y="24" fontSize="12" fill="#374151">最低温度</text>
          </g>
        </svg>
      </div>
    );
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
      <div className="flex flex-col gap-2">
        {/* 实时天气卡片 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl transition-all shadow-lg">
          {/* 实时天气显示 */}
          <WeatherIcon code={weatherNow.icon} className="text-5xl text-white" />
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

        {/* 关键时段天气提示 */}
        {keyPeriods && (
          <div className="flex flex-col gap-2">
            {keyPeriods.offWork && (
              <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg cursor-pointer hover:bg-white/15 transition-all"
                onClick={() => setShowHourlyDetail(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">📅 今日下班 (18:00后)</span>
                  </div>
                  <WeatherIcon code={keyPeriods.offWork.hours[0].icon} className="text-2xl text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      {keyPeriods.offWork.hours[0].temp}° - {keyPeriods.offWork.hours[keyPeriods.offWork.hours.length - 1].temp}°
                    </span>
                    {keyPeriods.offWork.rain?.hasRain ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-orange-300">
                          ⚠️ {keyPeriods.offWork.rain.description}
                        </span>
                        <span className="text-xs text-orange-200">
                          降水概率 {keyPeriods.offWork.rain.maxPop}% · 建议带伞
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/80">{keyPeriods.offWork.rain?.description}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {keyPeriods.work && (
              <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg cursor-pointer hover:bg-white/15 transition-all"
                onClick={() => setShowHourlyDetail(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">📅 明日上班 (7:00-9:00)</span>
                  </div>
                  <WeatherIcon code={keyPeriods.work.hours[0].icon} className="text-2xl text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      {keyPeriods.work.hours[0].temp}° - {keyPeriods.work.hours[keyPeriods.work.hours.length - 1].temp}°
                    </span>
                    {keyPeriods.work.rain?.hasRain ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-orange-300">
                          ⚠️ {keyPeriods.work.rain.description}
                        </span>
                        <span className="text-xs text-orange-200">
                          降水概率 {keyPeriods.work.rain.maxPop}% · 建议带伞
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/80">{keyPeriods.work.rain?.description}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 15天预报弹窗 */}
      {showForecast && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{city} - 15天天气预报</h3>
              <div className="flex items-center gap-2">
                {/* 视图切换按钮 */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded transition-all text-sm ${
                      viewMode === 'grid'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    卡片
                  </button>
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`px-3 py-1 rounded transition-all text-sm flex items-center gap-1 ${
                      viewMode === 'chart'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp size={14} />
                    折线图
                  </button>
                </div>
                <button
                  onClick={() => setShowForecast(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {viewMode === 'grid' ? (
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
                        <WeatherIcon code={day.iconDay} className="text-3xl" />
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
              ) : (
                <div className="flex flex-col items-center">
                  <TemperatureChart />
                  <div className="mt-6 w-full">
                    <div className="text-sm font-medium text-gray-700 mb-3">详细天气</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {forecast.map((day, index) => (
                        <div
                          key={day.date}
                          className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            {index === 0 ? '今天' : formatShortDate(day.date)}
                          </div>
                          <div className="flex items-center justify-between">
                            <WeatherIcon code={day.iconDay} className="text-2xl" />
                            <div className="text-right">
                              <div className="text-xs text-red-500 font-medium">{day.tempMax}°</div>
                              <div className="text-xs text-blue-500">{day.tempMin}°</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 truncate">{day.textDay}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                  placeholder="例如：深圳、北京、Tokyo、New York"
                />
                <div className="text-xs text-gray-500 mt-1">
                  支持全球城市名称（中文、英文），支持模糊搜索
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

      {/* 24小时逐小时预报弹窗 */}
      {showHourlyDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-5xl mx-4 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{city} - 24小时天气预报</h3>
              <button
                onClick={() => setShowHourlyDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
                {hourlyForecast.map((hour, index) => {
                  const hourTime = new Date(hour.fxTime);
                  const displayHour = hourTime.getHours();
                  const isNow = index === 0;
                  const hasRain = parseFloat(hour.pop) > 30 || parseFloat(hour.precip) > 0;

                  return (
                    <div
                      key={hour.fxTime}
                      className={`flex-shrink-0 w-24 p-3 rounded-lg border-2 ${
                        isNow
                          ? 'border-blue-500 bg-blue-50'
                          : hasRain
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-xs text-gray-600 text-center mb-2">
                        {isNow ? '现在' : `${displayHour}:00`}
                      </div>
                      <div className="flex justify-center mb-2">
                        <WeatherIcon code={hour.icon} className="text-4xl" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                          {hour.temp}°
                        </div>
                        <div className="text-xs text-gray-600 mb-1">{hour.text}</div>
                        {hasRain && (
                          <div className="text-xs font-medium text-orange-600 mt-1">
                            💧 {hour.pop}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {hour.windDir} {hour.windScale}级
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-4 text-center">
              数据来源：和风天气 QWeather • 更新时间：{lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
