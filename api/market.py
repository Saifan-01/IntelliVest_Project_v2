from flask import Blueprint, request, jsonify
import yfinance as yf

market_bp = Blueprint('market', __name__)

@market_bp.route('/indices', methods=['GET'])
def get_market_indices():
    # SENSEX (^BSESN), NIFTY 50 (^NSEI), BANK NIFTY (^NSEBANK), NASDAQ (^IXIC)
    tickers = {
        "SENSEX": "^BSESN",
        "NIFTY 50": "^NSEI",
        "BANK NIFTY": "^NSEBANK",
        "NASDAQ": "^IXIC"
    }
    
    data = []
    for name, symbol in tickers.items():
        try:
            ticker = yf.Ticker(symbol)
            # Use fast_info for better performance
            price = ticker.fast_info.last_price
            prev = ticker.fast_info.previous_close
            change = price - prev
            change_p = (change / prev) * 100
            
            data.append({
                "name": name,
                "price": round(price, 2),
                "change": round(change_p, 2),
                "symbol": symbol
            })
        except:
            # Fallback if API fails
            data.append({
                "name": name,
                "price": 0,
                "change": 0,
                "symbol": symbol
            })
            
    return jsonify(data)

@market_bp.route('/stocks', methods=['POST'])
def get_stock_prices():
    # Expects a list of symbols e.g. ["RELIANCE.NS", "TCS.NS"]
    req = request.get_json(silent=True) or {}
    symbols = req.get('symbols', [])
    
    if not symbols:
        return jsonify([])
        
    import concurrent.futures
    def fetch_stock(sym):
        try:
            lookup_sym = sym if ('.' in sym or '^' in sym) else f"{sym}.NS"
            ticker = yf.Ticker(lookup_sym)
            price = ticker.fast_info.last_price
            prev = ticker.fast_info.previous_close
            change = (price - prev) / prev * 100
            
            return {
                "symbol": sym,
                "price": round(price, 2),
                "change": round(change, 2)
            }
        except:
            return None

    data = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(fetch_stock, symbols)
        data = [r for r in results if r is not None]
            
    return jsonify(data)

@market_bp.route('/trending', methods=['GET'])
def get_trending_stocks():
    country = request.args.get('country', 'india').lower()

    market_data = {
        'india': {
            'currency': '₹',
            'currency_code': 'INR',
            'symbols': [
                {"name": "Reliance Ind.", "symbol": "RELIANCE.NS"},
                {"name": "TCS", "symbol": "TCS.NS"},
                {"name": "HDFC Bank", "symbol": "HDFCBANK.NS"},
                {"name": "ICICI Bank", "symbol": "ICICIBANK.NS"},
                {"name": "Infosys", "symbol": "INFY.NS"},
                {"name": "State Bank of India", "symbol": "SBIN.NS"},
                {"name": "Bharti Airtel", "symbol": "BHARTIARTL.NS"},
                {"name": "ITC Ltd.", "symbol": "ITC.NS"},
                {"name": "Larsen & Toubro", "symbol": "LT.NS"},
                {"name": "Bajaj Finance", "symbol": "BAJFINANCE.NS"},
                {"name": "Hindustan Unilever", "symbol": "HINDUNILVR.NS"},
                {"name": "Axis Bank", "symbol": "AXISBANK.NS"},
                {"name": "Kotak Mahindra", "symbol": "KOTAKBANK.NS"},
                {"name": "Maruti Suzuki", "symbol": "MARUTI.NS"},
                {"name": "Tata Motors", "symbol": "TATAMOTORS.NS"},
                {"name": "Sun Pharma", "symbol": "SUNPHARMA.NS"},
                {"name": "Asian Paints", "symbol": "ASIANPAINT.NS"},
                {"name": "NTPC", "symbol": "NTPC.NS"},
                {"name": "HCL Tech", "symbol": "HCLTECH.NS"},
                {"name": "Titan Company", "symbol": "TITAN.NS"}
            ]
        },
        'usa': {
            'currency': '$',
            'currency_code': 'USD',
            'symbols': [
                {"name": "Apple Inc.", "symbol": "AAPL"},
                {"name": "Microsoft Corp.", "symbol": "MSFT"},
                {"name": "Alphabet Inc.", "symbol": "GOOGL"},
                {"name": "Tesla Inc.", "symbol": "TSLA"},
                {"name": "NVIDIA Corp.", "symbol": "NVDA"},
                {"name": "Amazon.com Inc.", "symbol": "AMZN"},
                {"name": "Meta Platforms", "symbol": "META"},
                {"name": "Berkshire Hathaway", "symbol": "BRK-B"},
                {"name": "Eli Lilly", "symbol": "LLY"},
                {"name": "Broadcom", "symbol": "AVGO"},
                {"name": "JPMorgan Chase", "symbol": "JPM"},
                {"name": "UnitedHealth", "symbol": "UNH"},
                {"name": "Visa Inc.", "symbol": "V"},
                {"name": "Exxon Mobil", "symbol": "XOM"},
                {"name": "Mastercard", "symbol": "MA"},
                {"name": "Johnson & Johnson", "symbol": "JNJ"},
                {"name": "Procter & Gamble", "symbol": "PG"},
                {"name": "Home Depot", "symbol": "HD"},
                {"name": "Costco", "symbol": "COST"},
                {"name": "AbbVie", "symbol": "ABBV"}
            ]
        },
        'uk': {
            'currency': '£',
            'currency_code': 'GBP',
            'symbols': [
                {"name": "Shell PLC", "symbol": "SHEL.L"},
                {"name": "AstraZeneca", "symbol": "AZN.L"},
                {"name": "HSBC Holdings", "symbol": "HSBA.L"},
                {"name": "BP PLC", "symbol": "BP.L"},
                {"name": "Unilever PLC", "symbol": "ULVR.L"},
                {"name": "Diageo PLC", "symbol": "DGE.L"},
                {"name": "GSK plc", "symbol": "GSK.L"},
                {"name": "Rio Tinto", "symbol": "RIO.L"},
                {"name": "British American Tobacco", "symbol": "BATS.L"},
                {"name": "Relx", "symbol": "REL.L"},
                {"name": "Glencore", "symbol": "GLEN.L"},
                {"name": "Reckitt Benckiser", "symbol": "RKT.L"},
                {"name": "National Grid", "symbol": "NG.L"},
                {"name": "Compass Group", "symbol": "CPG.L"},
                {"name": "Anglo American", "symbol": "AAL.L"}
            ]
        },
        'japan': {
            'currency': '¥',
            'currency_code': 'JPY',
            'symbols': [
                {"name": "Toyota Motor", "symbol": "7203.T"},
                {"name": "Sony Group", "symbol": "6758.T"},
                {"name": "Mitsubishi UFJ", "symbol": "8306.T"},
                {"name": "SoftBank Group", "symbol": "9984.T"},
                {"name": "Honda Motor", "symbol": "7267.T"},
                {"name": "Keyence Corp", "symbol": "6861.T"},
                {"name": "Tokyo Electron", "symbol": "8035.T"},
                {"name": "Shin-Etsu Chemical", "symbol": "4063.T"},
                {"name": "Sumitomo Mitsui", "symbol": "8316.T"},
                {"name": "Hitachi", "symbol": "6501.T"},
                {"name": "Mitsubishi Corp", "symbol": "8058.T"},
                {"name": "Itochu", "symbol": "8001.T"},
                {"name": "Mitsui & Co", "symbol": "8031.T"},
                {"name": "Fast Retailing", "symbol": "9983.T"},
                {"name": "Nintendo", "symbol": "7974.T"}
            ]
        }
    }

    # Fallback to India if unknown country
    selected_market = market_data.get(country, market_data['india'])
    trending_symbols = selected_market['symbols']
    currency = selected_market['currency']
    currency_code = selected_market.get('currency_code', 'INR')
    
    import concurrent.futures
    
    def fetch_symbol_data(item):
        try:
            ticker = yf.Ticker(item['symbol'])
            price = ticker.fast_info.last_price
            prev = ticker.fast_info.previous_close
            change = (price - prev) / prev * 100
            
            return {
                "name": item['name'],
                "symbol": item['symbol'],
                "price": round(price, 2),
                "change": round(change, 2)
            }
        except:
            return {
                "name": item['name'],
                "symbol": item['symbol'],
                "price": 0,
                "change": 0
            }
            
    stocks = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(fetch_symbol_data, trending_symbols)
        stocks = list(results)
            
    return jsonify({"currency": currency, "currency_code": currency_code, "stocks": stocks})

@market_bp.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '')
    if len(query) < 2:
        return jsonify([])
        
    try:
        import requests
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            quotes = data.get('quotes', [])
            
            # Filter for equity and ETFs, extract relevant fields
            results = []
            for q in quotes:
                if q.get('quoteType') in ['EQUITY', 'ETF']:
                    results.append({
                        'symbol': q.get('symbol', ''),
                        'name': q.get('longname') or q.get('shortname', ''),
                        'exchange': q.get('exchDisp', '')
                    })
            return jsonify(results[:10]) # Return top 10 matches
    except Exception as e:
        print(f"Search API Error: {e}")
        
    return jsonify([])

@market_bp.route('/exchange-rates', methods=['GET'])
def get_exchange_rates():
    """Fetch live exchange rates to INR using Yahoo Finance."""
    pairs = {
        'USD': 'USDINR=X',
        'GBP': 'GBPINR=X',
        'JPY': 'JPYINR=X',
        'INR': None  # INR to INR is always 1
    }
    rates = {'INR': 1.0}
    import concurrent.futures

    def fetch_rate(item):
        currency, ticker_sym = item
        if ticker_sym is None:
            return currency, 1.0
        try:
            ticker = yf.Ticker(ticker_sym)
            rate = ticker.fast_info.last_price
            return currency, round(rate, 4)
        except:
            # Fallback approximate rates if API fails
            fallbacks = {'USD': 83.5, 'GBP': 106.0, 'JPY': 0.55}
            return currency, fallbacks.get(currency, 1.0)

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = executor.map(fetch_rate, [(k, v) for k, v in pairs.items() if v])
        for currency, rate in results:
            rates[currency] = rate

    return jsonify(rates)

@market_bp.route('/history/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    """Fetch historical chart data for an asset."""
    timeframe = request.args.get('range', '1M').upper()
    
    # Map requested range to yfinance period and interval
    tf_map = {
        '1W': {'period': '5d', 'interval': '15m'},
        '1M': {'period': '1mo', 'interval': '1d'},
        '3M': {'period': '3mo', 'interval': '1d'},
        '6M': {'period': '6mo', 'interval': '1d'},
        '1Y': {'period': '1y', 'interval': '1d'},
        '5Y': {'period': '5y', 'interval': '1wk'},
    }
    
    config = tf_map.get(timeframe, tf_map['1M'])
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=config['period'], interval=config['interval'])
        
        if hist.empty:
            return jsonify([])
            
        data = []
        for timestamp, row in hist.iterrows():
            data.append({
                'date': timestamp.strftime('%Y-%m-%d %H:%M') if 'm' in config['interval'] else timestamp.strftime('%Y-%m-%d'),
                'price': round(row['Close'], 2),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'volume': int(row['Volume'])
            })
            
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return jsonify([]), 500
