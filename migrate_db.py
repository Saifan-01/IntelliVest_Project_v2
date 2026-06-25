import sqlite3
conn = sqlite3.connect('finance_v2.db')
c = conn.cursor()

existing = [row[1] for row in c.execute('PRAGMA table_info(portfolio)').fetchall()]
print('Existing columns:', existing)

if 'purchase_price_inr' not in existing:
    c.execute('ALTER TABLE portfolio ADD COLUMN purchase_price_inr FLOAT DEFAULT 0.0')
    print('Added purchase_price_inr')

if 'currency' not in existing:
    c.execute("ALTER TABLE portfolio ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'")
    print('Added currency')

if 'exchange_rate' not in existing:
    c.execute('ALTER TABLE portfolio ADD COLUMN exchange_rate FLOAT DEFAULT 1.0')
    print('Added exchange_rate')

# Backfill: set INR price = native price for old rows
c.execute("UPDATE portfolio SET purchase_price_inr=purchase_price, currency='INR', exchange_rate=1.0 WHERE purchase_price_inr IS NULL OR purchase_price_inr=0")
conn.commit()
conn.close()
print('Migration complete')
