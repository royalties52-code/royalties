import re
from collections import Counter
from pathlib import Path

text = Path("supabase/spinora-full-schema.sql").read_text(encoding="utf-8")

patterns = [
    (r'CREATE POLICY "([^"]+)"', "POLICY"),
    (r'CREATE TRIGGER (\w+)', "TRIGGER"),
    (r'ADD TABLE public\.(\w+)', "REALTIME TABLE"),
]

for pat, label in patterns:
    names = re.findall(pat, text)
    dups = [(n, c) for n, c in Counter(names).items() if c > 1]
    if dups:
        print(f"--- {label} ---")
        for name, count in sorted(dups):
            print(f"  {count}x {name}")
