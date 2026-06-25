from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Portfolio
import concurrent.futures

stock_intel_bp = Blueprint('stock_intel', __name__)


def _analyze_stock(symbol: str) -> dict:
    """Run a full quantitative + qualitative analysis on a single stock."""
    import yfinance as yf
    import datetime

    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}
        hist = ticker.history(period="3mo", interval="1d")
        news_raw = ticker.news or []

        # ── Price momentum ────────────────────────────────────────────────────
        current_price = ticker.fast_info.last_price or info.get("currentPrice", 0)
        prev_close    = ticker.fast_info.previous_close or info.get("previousClose", current_price)
        wk52_high     = info.get("fiftyTwoWeekHigh", current_price)
        wk52_low      = info.get("fiftyTwoWeekLow",  current_price)
        pct_from_high = ((current_price - wk52_high) / wk52_high * 100) if wk52_high else 0
        pct_from_low  = ((current_price - wk52_low)  / wk52_low  * 100) if wk52_low  else 0
        day_change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0

        # ── 3-month trend (simple linear regression slope) ───────────────────
        trend_slope = 0
        if not hist.empty and len(hist) >= 10:
            import numpy as np
            closes = hist["Close"].dropna().values
            x = range(len(closes))
            if len(closes) > 1:
                slope = (closes[-1] - closes[0]) / len(closes)
                trend_slope = round(float(slope) / closes[0] * 100, 2)   # % per candle

        # ── Fundamental metrics ───────────────────────────────────────────────
        pe_ratio       = info.get("trailingPE")  or info.get("forwardPE")
        ps_ratio       = info.get("priceToSalesTrailing12Months")
        pb_ratio       = info.get("priceToBook")
        eps_growth     = info.get("earningsGrowth")          # decimal e.g. 0.23
        rev_growth     = info.get("revenueGrowth")
        profit_margin  = info.get("profitMargins")
        beta           = info.get("beta")
        market_cap     = info.get("marketCap")
        debt_to_equity = info.get("debtToEquity")
        roe            = info.get("returnOnEquity")
        analyst_target = info.get("targetMeanPrice")
        reco_key       = info.get("recommendationKey", "").upper()  # STRONG_BUY, BUY, HOLD, SELL, etc.

        # ── Analyst upside ────────────────────────────────────────────────────
        analyst_upside = None
        if analyst_target and current_price:
            analyst_upside = round((analyst_target - current_price) / current_price * 100, 1)

        # ── AI Scoring (0-100) ────────────────────────────────────────────────
        score = 50  # neutral baseline

        # Momentum signals
        if day_change_pct > 2:   score += 5
        elif day_change_pct < -2: score -= 5
        if trend_slope > 1:  score += 8
        elif trend_slope < -1: score -= 8
        if pct_from_low > 20:    score += 5   # well off lows
        if pct_from_high < -20:  score -= 5   # far from highs

        # Fundamental signals
        if pe_ratio:
            if   pe_ratio < 15:  score += 10
            elif pe_ratio < 25:  score += 5
            elif pe_ratio > 50:  score -= 8
            elif pe_ratio > 30:  score -= 3

        if eps_growth:
            if   eps_growth > 0.25:  score += 12
            elif eps_growth > 0.10:  score += 6
            elif eps_growth < 0:     score -= 10

        if rev_growth:
            if   rev_growth > 0.20:  score += 8
            elif rev_growth > 0.08:  score += 4
            elif rev_growth < 0:     score -= 6

        if profit_margin:
            if   profit_margin > 0.20:  score += 5
            elif profit_margin < 0.05:  score -= 5

        if roe:
            if   roe > 0.20:  score += 5
            elif roe < 0.05:  score -= 3

        if debt_to_equity and debt_to_equity > 200:
            score -= 7

        # Analyst signals
        if analyst_upside:
            if   analyst_upside > 20:  score += 10
            elif analyst_upside > 10:  score += 5
            elif analyst_upside < -10: score -= 8
        if "STRONG_BUY" in reco_key:  score += 10
        elif "BUY" in reco_key:       score += 5
        elif "SELL" in reco_key:      score -= 8

        score = max(0, min(100, score))

        # ── Verdict ───────────────────────────────────────────────────────────
        if score >= 72:
            verdict, verdict_color, horizon = "STRONG BUY", "#39FF14", "Long Term"
        elif score >= 58:
            verdict, verdict_color, horizon = "BUY",         "#4CC9F0", "Medium Term"
        elif score >= 42:
            verdict, verdict_color, horizon = "HOLD",        "#E8FF5A", "Monitor"
        elif score >= 28:
            verdict, verdict_color, horizon = "REDUCE",      "#FF9933", "Short Term"
        else:
            verdict, verdict_color, horizon = "SELL",        "#FF3366", "Exit"

        # ── Reason bullets ────────────────────────────────────────────────────
        reasons = []
        if eps_growth and eps_growth > 0.15:
            reasons.append(f"EPS growing at {eps_growth*100:.0f}% YoY — strong earnings momentum")
        if rev_growth and rev_growth > 0.10:
            reasons.append(f"Revenue growth {rev_growth*100:.0f}% YoY — business scaling well")
        if analyst_upside and analyst_upside > 10:
            reasons.append(f"Analyst consensus target implies {analyst_upside}% upside")
        if trend_slope > 1:
            reasons.append(f"3-month price trend is bullish (+{trend_slope}% avg per session)")
        if pe_ratio and pe_ratio < 20:
            reasons.append(f"P/E ratio of {pe_ratio:.1f}x is attractively valued")
        if pe_ratio and pe_ratio > 45:
            reasons.append(f"P/E ratio of {pe_ratio:.1f}x is expensive — priced for perfection")
        if trend_slope < -1:
            reasons.append(f"3-month trend is bearish ({trend_slope}% avg per session)")
        if not reasons:
            reasons.append("Balanced risk/reward at current price levels")

        # ── News (top 5) ──────────────────────────────────────────────────────
        news = []
        for n in news_raw[:5]:
            content = n.get("content", {})
            title   = content.get("title") or n.get("title", "")
            link    = content.get("canonicalUrl", {}).get("url") or n.get("link", "#")
            pub_date = content.get("pubDate", "") or n.get("providerPublishTime", "")
            pub_str = ""
            if isinstance(pub_date, int):
                pub_str = datetime.datetime.fromtimestamp(pub_date).strftime("%b %d")
            elif isinstance(pub_date, str) and pub_date:
                pub_str = pub_date[:10]
            provider = content.get("provider", {}).get("displayName") or n.get("publisher", "")
            if title:
                news.append({"title": title, "link": link, "date": pub_str, "source": provider})

        return {
            "symbol":         symbol,
            "score":          round(score),
            "verdict":        verdict,
            "verdict_color":  verdict_color,
            "horizon":        horizon,
            "reasons":        reasons[:3],
            "current_price":  round(current_price, 2),
            "day_change_pct": round(day_change_pct, 2),
            "wk52_high":      round(wk52_high, 2) if wk52_high else None,
            "wk52_low":       round(wk52_low, 2)  if wk52_low  else None,
            "pe_ratio":       round(pe_ratio, 1)   if pe_ratio  else None,
            "eps_growth":     round(eps_growth * 100, 1) if eps_growth else None,
            "rev_growth":     round(rev_growth * 100, 1) if rev_growth else None,
            "market_cap":     market_cap,
            "analyst_target": round(analyst_target, 2) if analyst_target else None,
            "analyst_upside": analyst_upside,
            "trend_slope":    trend_slope,
            "news":           news,
        }

    except Exception as e:
        return {"symbol": symbol, "error": str(e), "score": 50, "verdict": "N/A", "verdict_color": "#888", "reasons": [], "news": []}


@stock_intel_bp.route('/analyze', methods=['GET'])
@jwt_required()
def analyze_portfolio():
    """Analyze every stock in the user's portfolio concurrently."""
    current_user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(user_id=current_user_id).all()

    if not portfolio:
        return jsonify([])

    symbols = list({p.symbol for p in portfolio})

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(symbols)) as executor:
        results = list(executor.map(_analyze_stock, symbols))

    return jsonify(results)


@stock_intel_bp.route('/analyze/<symbol>', methods=['GET'])
@jwt_required()
def analyze_single(symbol):
    """Analyze a single stock on demand (used when user clicks a card)."""
    result = _analyze_stock(symbol.upper())
    return jsonify(result)
