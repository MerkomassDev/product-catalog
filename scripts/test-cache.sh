#!/bin/bash

# test_cache.sh

echo "=== Cache Performance Test ==="
echo ""

# 30 requestů na stejný produkt
echo "Odesílání 30 requestů na produkt ID 1..."
for i in {1..1000}; do
    curl -s http://localhost:5000/api/products/1 > /dev/null
    echo -n "."
done

echo ""
echo ""
echo "=== Cache Statistiky ==="
curl -s http://localhost:5000/api/products/stats/cache | jq
