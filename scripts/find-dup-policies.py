import re
from collections import Counter
from pathlib import Path

text = Path("supabase/spinora-full-schema.sql").read_text(encoding="utf-8")
names = re.findall(r'CREATE POLICY "([^"]+)"', text)
for name, count in sorted(Counter(names).items()):
    if count > 1:
        print(f"{count}x {name}")
