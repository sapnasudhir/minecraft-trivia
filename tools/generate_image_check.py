"""
Generates a local, self-contained HTML page listing every block's name and
texture image, for manually/visually confirming all image URLs render.
Preliminary local test tool only -- not part of the app.

Run from the tools/ directory: python generate_image_check.py
Then open image_check.html directly in a browser.
"""
import json
import os

CORPUS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "src", "data", "minecraft_block_trivia_corpus_100.json"
)
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "image_check.html")


def main():
    with open(CORPUS_PATH, encoding="utf-8") as f:
        data = json.load(f)
    blocks = data["corpus"]["blocks"]

    tiles = []
    for b in blocks:
        tiles.append(
            f"""
      <div class="tile" data-name="{b['id']}">
        <img src="{b['textureUrl']}" alt="{b['name']}"
             onload="this.closest('.tile').classList.add('ok'); updateCount()"
             onerror="this.closest('.tile').classList.add('broken'); updateCount()">
        <div class="name">{b['name']}</div>
      </div>"""
        )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Block Image Check ({len(blocks)} blocks)</title>
<style>
  body {{ font-family: system-ui, sans-serif; background: #1e1e1e; color: #eee; margin: 0; padding: 20px; }}
  h1 {{ font-size: 18px; }}
  #summary {{ position: sticky; top: 0; background: #1e1e1e; padding: 10px 0; font-size: 16px; z-index: 10; border-bottom: 1px solid #444; }}
  #summary .ok-count {{ color: #4caf50; font-weight: bold; }}
  #summary .broken-count {{ color: #f44336; font-weight: bold; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 16px; }}
  .tile {{ background: #2a2a2a; border: 2px solid #444; border-radius: 6px; padding: 8px; text-align: center; }}
  .tile img {{ width: 64px; height: 64px; object-fit: contain; image-rendering: pixelated; background: #111; }}
  .tile .name {{ font-size: 11px; margin-top: 6px; word-break: break-word; }}
  .tile.ok {{ border-color: #4caf50; }}
  .tile.broken {{ border-color: #f44336; background: #3a1f1f; }}
  .tile.broken::after {{ content: "BROKEN"; display: block; color: #f44336; font-size: 10px; font-weight: bold; margin-top: 4px; }}
</style>
</head>
<body>
  <div id="summary">
    <h1>Block Image Check -- {len(blocks)} blocks</h1>
    <span id="counts">Loaded: <span class="ok-count">0</span> &nbsp; Broken: <span class="broken-count">0</span> &nbsp; Pending: {len(blocks)}</span>
  </div>
  <div class="grid">{"".join(tiles)}
  </div>
  <script>
    let ok = 0, broken = 0;
    const total = {len(blocks)};
    function updateCount() {{
      ok = document.querySelectorAll('.tile.ok').length;
      broken = document.querySelectorAll('.tile.broken').length;
      const pending = total - ok - broken;
      document.querySelector('.ok-count').textContent = ok;
      document.querySelector('.broken-count').textContent = broken;
      document.getElementById('counts').innerHTML =
        `Loaded: <span class="ok-count">${{ok}}</span> &nbsp; Broken: <span class="broken-count">${{broken}}</span> &nbsp; Pending: ${{pending}}`;
    }}
  </script>
</body>
</html>
"""

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrote {OUTPUT_PATH} with {len(blocks)} blocks")


if __name__ == "__main__":
    main()
