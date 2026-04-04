import axios from 'axios';

const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

async function fetchPrices() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        symbol: 'ETH,FLR',
        convert: 'USD'
      },
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY
      }
    });

    const ethPrice = response.data.data.ETH[0].quote.USD.price;
    const flrPrice = response.data.data.FLR[0].quote.USD.price;

    console.log(`ETH/USD: $${ethPrice}`);
    console.log(`FLR/USD: $${flrPrice}`);

    return { ethPrice, flrPrice };
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
}

// Usage in React component
function PriceDisplay() {
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    fetchPrices().then(setPrices);
  }, []);

  if (!prices) return <div>Loading...</div>;

  return (
    <div>
      <p>ETH/USD: ${prices.ethPrice}</p>
      <p>FLR/USD: ${prices.flrPrice}</p>
    </div>
  );
}