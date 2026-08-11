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
    const data: GeoCurrencyResponse = response.data;
    return {
      ip: data.ip,
      countryCode: data.country_code,
      countryName: data.country_name,
      regionCode: data.region_code,
      regionName: data.region_name,
      city: data.city,
      zip: data.zip,
      latitude: data.latitude,
      longitude: data.longitude,
      timeZone: data.time_zone,
      currency: data.currency,
    };
  }

  async getExchangeRate(currency: string): Promise<ExchangeRate[]> {
    const response = await axios.get(`${this.apiEndpoint}/exchange_rate/${currency}?key=${this.apiKey}`);
    const data: GeoCurrencyResponse = response.data;
    return data.exchange_rate;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const exchangeRateResponse = await this.getExchangeRate(fromCurrency);
    const exchangeRate = exchangeRateResponse.find((rate) => rate.currency === toCurrency);
    if (!exchangeRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
    return amount * exchangeRate.rate;
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

// Example usage
import GeoCurrency from '../lib/geo-currency';

const geoCurrency = new GeoCurrency('https://api.example.com', 'YOUR_API_KEY');

geoCurrency.getGeoLocation('8.8.8.8').then((geoLocation) => {
  console.log(geoLocation);
});

geoCurrency.getExchangeRate('USD').then((exchangeRate) => {
  console.log(exchangeRate);
});

geoCurrency.convertCurrency(100, 'USD', 'EUR').then((convertedAmount) => {
  console.log(convertedAmount);
});