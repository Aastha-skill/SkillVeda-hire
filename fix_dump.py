#!/usr/bin/env python3
"""
Fix corrupted SQL dump where shell paste converted table references
into markdown links like [customers.credit](http://customers.credit)_transactions
"""
import re
import sys

path = "/tmp/skillveda_supabase_ready.sql"

with open(path) as f:
    content = f.read()

# Pattern matches: [customers.WORD](http://customers.WORD)
# Replaces with: customers.WORD
fixed = re.sub(
    r'\[(customers\.[a-z]+)\]\(http://customers\.[a-z]+\)',
    r'\1',
    content
)

with open(path, 'w') as f:
    f.write(fixed)

print("Fix applied.")

# Re-read and verify
with open(path) as f:
    content = f.read()

# Find unique table references
matches = re.findall(r'customers\.[a-z_]+', content)
unique_tables = sorted(set(matches))

print("\nUnique 'customers.X' references found:")
for t in unique_tables:
    print(f"  {t}")

# Count corruption
corruption_count = len(re.findall(r'\[customers\.|customers\..*http', content))
print(f"\nRemaining corruption (should be 0): {corruption_count}")
