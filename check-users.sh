#!/bin/bash
# Quick check of who has signed up to SkillVeda Hire.
# Usage: bash check-users.sh

ADMIN_KEY="skillveda-admin-2024"  # update this if you rotate the admin secret
APP_URL="https://1e94f322-c375-40fe-9e1e-3a4f117080fc-00-aihlshauk1w9.sisko.replit.dev"

curl -s "$APP_URL/api/hiring/admin/companies" \
  -H "x-admin-key: $ADMIN_KEY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Total companies: {len(data)}')
print(f'Companies with 0 credits: {sum(1 for c in data if c.get(\"credits\", 0) == 0)}')
print(f'')
print(f'{\"Date\":<12}{\"Email\":<35}{\"Name\":<25}{\"Credits\":<10}')
print('-' * 82)
for c in sorted(data, key=lambda x: x.get('createdAt', ''), reverse=True):
    date = c.get('createdAt', '')[:10]
    email = (c.get('email') or '')[:33]
    name = (c.get('contactName') or '')[:23]
    credits = c.get('credits', 0)
    print(f'{date:<12}{email:<35}{name:<25}{credits:<10}')
"
