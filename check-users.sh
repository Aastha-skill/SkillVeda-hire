#!/bin/bash
# Quick check of who has signed up to SkillVeda Hire.
ADMIN_KEY="9e7706eb94b0cf2a6ec57c6590527b774e98441da255bbaf6574cfb021d4e013"
APP_URL="https://1e94f322-c375-40fe-9e1e-3a4f117080fc-00-aihlshauk1w9.sisko.replit.dev"

curl -s "$APP_URL/api/hiring/admin/companies" \
  -H "x-admin-key: $ADMIN_KEY" | python3 -c "
import sys, json
raw = sys.stdin.read()
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print('Could not parse response. Raw output:')
    print(raw[:500])
    sys.exit(1)

if not isinstance(data, list):
    print('Unexpected response (not a list):')
    print(json.dumps(data, indent=2))
    sys.exit(1)

total = len(data)
zero_credits = sum(1 for c in data if isinstance(c, dict) and c.get('credits', 0) == 0)
print(f'Total companies: {total}')
print(f'Companies with 0 credits: {zero_credits}')
print('')
print(f'{\"Date\":<12}{\"Email\":<35}{\"Name\":<25}{\"Credits\":<10}')
print('-' * 82)

# Sort by createdAt descending
def sort_key(c):
    if isinstance(c, dict):
        return c.get('createdAt') or ''
    return ''

for c in sorted(data, key=sort_key, reverse=True):
    if not isinstance(c, dict):
        continue
    date = (c.get('createdAt') or '')[:10]
    email = (c.get('email') or '')[:33]
    name = (c.get('contactName') or '')[:23]
    credits = c.get('credits', 0)
    print(f'{date:<12}{email:<35}{name:<25}{credits:<10}')
"
