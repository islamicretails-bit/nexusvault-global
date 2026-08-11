// src/lib/geo-currency.ts
import axios from 'axios';
import { GeoLocation } from '../types/index';

interface ExchangeRate {
  currency: string;
  rate: number;
}

interface GeoCurrencyResponse {
  ip: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  time_zone: string;
  currency: string;
  exchange_rate: ExchangeRate[];
}

class GeoCurrency {
  private apiEndpoint: string;
  private apiKey: string;

  constructor(apiEndpoint: string, apiKey: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
  }

  async getGeoLocation(ipAddress: string): Promise<GeoLocation> {
    const response = await axios.get(`${this.apiEndpoint}/ip/${ipAddress}?key=${this.apiKey}`);
    const geoLocation: GeoLocation = {
      ip: response.data.ip,
      countryCode: response.data.country_code,
      countryName: response.data.country_name,
      regionCode: response.data.region_code,
      regionName: response.data.region_name,
      city: response.data.city,
      zip: response.data.zip,
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      timeZone: response.data.time_zone,
      currency: response.data.currency,
    };
    return geoLocation;
  }

  async getExchangeRate(geoLocation: GeoLocation, baseCurrency: string): Promise<ExchangeRate[]> {
    const response = await axios.get(`${this.apiEndpoint}/exchange_rate/${baseCurrency}?key=${this.apiKey}`);
    const exchangeRates: ExchangeRate[] = response.data.exchange_rate;
    return exchangeRates;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const exchangeRates = await this.getExchangeRate({ currency: fromCurrency }, fromCurrency);
    const toCurrencyRate = exchangeRates.find((rate) => rate.currency === toCurrency);
    if (!toCurrencyRate) {
      throw new Error(`No exchange rate found for ${toCurrency}`);
    }
    const convertedAmount = amount * toCurrencyRate.rate;
    return convertedAmount;
  }
}

export default GeoCurrency;

// src/types/index.ts (partial)
interface GeoLocation {
  ip: string;
  countryCode: string;
  countryName: string;
  regionCode: string;
  regionName: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  currency: string;
}

// src/app/globals.css (partial)
/* Add CSS styles for geo-currency component */
.geo-currency {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.geo-currency .currency-symbol {
  font-size: 18px;
  font-weight: bold;
  color: #666;
}

// src/app/page.tsx (partial)
import GeoCurrency from '../lib/geo-currency';

const App = () => {
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate[] | null>(null);

  useEffect(() => {
    const geoCurrency = new GeoCurrency('https://api.example.com', 'YOUR_API_KEY');
    geoCurrency.getGeoLocation('8.8.8.8').then((location) => {
      setGeoLocation(location);
    });
    geoCurrency.getExchangeRate({ currency: 'USD' }, 'USD').then((rates) => {
      setExchangeRate(rates);
    });
  }, []);

  return (
    <div>
      {geoLocation && (
        <div>
          <h2>Geo Location</h2>
          <p>IP: {geoLocation.ip}</p>
          <p>Country Code: {geoLocation.countryCode}</p>
          <p>Country Name: {geoLocation.countryName}</p>
          <p>Region Code: {geoLocation.regionCode}</p>
          <p>Region Name: {geoLocation.regionName}</p>
          <p>City: {geoLocation.city}</p>
          <p>Zip: {geoLocation.zip}</p>
          <p>Latitude: {geoLocation.latitude}</p>
          <p>Longitude: {geoLocation.longitude}</p>
          <p>Time Zone: {geoLocation.timeZone}</p>
          <p>Currency: {geoLocation.currency}</p>
        </div>
      )}
      {exchangeRate && (
        <div>
          <h2>Exchange Rate</h2>
          {exchangeRate.map((rate) => (
            <p key={rate.currency}>
              {rate.currency}: {rate.rate}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;