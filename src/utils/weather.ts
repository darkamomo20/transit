import { CloudSun, CloudRain, Sun, Wind, LucideIcon } from 'lucide-react';

export interface CityWeatherData {
  temp: string;
  condition: string;
  icon: LucideIcon;
  humidity: string;
  wind: string;
  uvIndex: string;
  mobilityImpact: string;
  recommendation: string;
  accentColor: string;
}

export const getCityWeatherData = (cityId: string, cityName: string): CityWeatherData => {
  const baseId = cityId.toLowerCase();
  if (baseId.includes('paris')) {
    return {
      temp: '19°C',
      condition: 'Parcialmente Nublado',
      icon: CloudSun,
      humidity: '58%',
      wind: '12 km/h',
      uvIndex: 'Bajo (2)',
      mobilityImpact: 'Óptimo',
      recommendation: 'Excelente momento para caminar o usar metro.',
      accentColor: 'from-amber-500/20 to-orange-500/10'
    };
  }
  if (baseId.includes('london')) {
    return {
      temp: '16°C',
      condition: 'Lluvia Ligera',
      icon: CloudRain,
      humidity: '78%',
      wind: '19 km/h',
      uvIndex: 'Bajo (1)',
      mobilityImpact: 'Precaución Ligera',
      recommendation: 'Se sugiere usar Metro subterráneo o RER Cubierto.',
      accentColor: 'from-blue-500/20 to-cyan-500/10'
    };
  }
  if (baseId.includes('madrid') || baseId.includes('barcelona')) {
    return {
      temp: '25°C',
      condition: 'Despejado / Soleado',
      icon: Sun,
      humidity: '42%',
      wind: '9 km/h',
      uvIndex: 'Moderado (5)',
      mobilityImpact: 'Excelente',
      recommendation: 'Clima perfecto para combinar autobús y bicicleta eléctrica.',
      accentColor: 'from-amber-400/20 to-yellow-500/10'
    };
  }
  if (baseId.includes('berlin') || baseId.includes('amsterdam')) {
    return {
      temp: '17°C',
      condition: 'Viento Templado',
      icon: Wind,
      humidity: '64%',
      wind: '22 km/h',
      uvIndex: 'Bajo (2)',
      mobilityImpact: 'Normal',
      recommendation: 'Líneas de Tranvía y Metro operando con fluidez.',
      accentColor: 'from-teal-500/20 to-emerald-500/10'
    };
  }
  // Default fallback for other European cities
  return {
    temp: '20°C',
    condition: 'Agradable',
    icon: CloudSun,
    humidity: '52%',
    wind: '14 km/h',
    uvIndex: 'Moderado (3)',
    mobilityImpact: 'Fluido',
    recommendation: 'Red de transporte pública en horarios programados.',
    accentColor: 'from-indigo-500/20 to-blue-500/10'
  };
};
