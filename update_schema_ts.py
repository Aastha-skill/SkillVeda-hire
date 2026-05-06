#!/usr/bin/env python3
"""
Updates shared/schema.ts to point hiring_* tables to the customers schema.

Changes:
  pgTable("hiring_companies", ...) -> customersSchema.table("companies", ...)
  pgTable("hiring_search_history", ...) -> customersSchema.table("search_history", ...)
  ... (6 tables total)

Adds:
  - pgSchema import
  - export const customersSchema = pgSchema("customers");

Preserves variable names (hiringCompanies, etc.) so hiring-routes.tsx
needs no changes.
"""

import re

path = "shared/schema.ts"

with open(path) as f:
    content = f.read()

# Backup original
with open(path + ".bak", "w") as f:
    f.write(content)
print(f"Backup saved: {path}.bak")

# 1. Add pgSchema to the import line
old_import = 'import { pgTable, text, serial, integer, boolean, timestamp, decimal, numeric, jsonb } from "drizzle-orm/pg-core";'
new_import = 'import { pgTable, pgSchema, text, serial, integer, boolean, timestamp, decimal, numeric, jsonb } from "drizzle-orm/pg-core";'

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added pgSchema to imports")
else:
    print("Import line not found exactly. Manual check needed.")

# 2. Add the customersSchema definition right after imports
# Insert after the z import line, before "export const users"
schema_def = '\n\n// Schemas — separates customer data (B2B) from candidate pool data\nexport const customersSchema = pgSchema("customers");\nexport const candidatesSchema = pgSchema("candidates");\n'

old_anchor = 'import { z } from "zod";'
if old_anchor in content:
    content = content.replace(old_anchor, old_anchor + schema_def)
    print("Added customersSchema and candidatesSchema definitions")

# 3. Rename the 6 hiring tables to use customersSchema
renames = [
    ('pgTable("hiring_companies"',           'customersSchema.table("companies"'),
    ('pgTable("hiring_credit_transactions"', 'customersSchema.table("credit_transactions"'),
    ('pgTable("hiring_saved_candidates"',    'customersSchema.table("saved_candidates"'),
    ('pgTable("hiring_search_history"',      'customersSchema.table("search_history"'),
    ('pgTable("hiring_email_settings"',      'customersSchema.table("email_settings"'),
    ('pgTable("hiring_email_logs"',          'customersSchema.table("email_logs"'),
]

for old, new in renames:
    if old in content:
        content = content.replace(old, new)
        # Print short version (first 50 chars)
        print(f"Renamed: {old[:50]}...")
    else:
        print(f"NOT FOUND: {old[:50]}...")

# Save
with open(path, "w") as f:
    f.write(content)

print(f"\nUpdated: {path}")

# Verify
with open(path) as f:
    new_content = f.read()

print("\n=== Verification ===")
print(f"pgSchema imported: {'pgSchema' in new_content}")
print(f"customersSchema defined: {'export const customersSchema = pgSchema' in new_content}")
old_count = len(re.findall('pgTable..hiring_', new_content))
print(f"Old pgTable(hiring_*) refs remaining: {old_count}")
new_count = len(re.findall('customersSchema.table..', new_content))
print(f"New customersSchema.table refs: {new_count}")
