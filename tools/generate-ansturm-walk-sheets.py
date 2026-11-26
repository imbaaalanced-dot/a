#!/usr/bin/env python3
"""Generate Ansturm walk-cycle sheets from existing enemy sprites.

This script creates procedural walk sheets (8 frames per direction) for all
enemy types and bosses. The sheets follow the contract from
 docs/ansturm-walk-sheet-intake-20261123.md:
 - Format: 1 row x 8 square frames, horizontal RGBA strip
 - Cell size: 500px (within 192-1024px range)
 - Directions: n, e, s, w (compass directions)
 - Foot anchor: bottom-center, bbox[3] >= cell * 0.92
 - Hygiene: transparent corners, no edge clipping, >= 3 visible silhouettes

Usage:
    python tools/generate-ansturm-walk-sheets.py
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

# Configuration
ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "dist/ansturm/assets"
OUTPUT_ROOT = ROOT / "source-art/ansturm/walk-sheets"
CELL_SIZE = 500  # Target cell size for walk sheets (500 * 0.92 = 460, integer)
FRAME_COUNT = 8  # Frames per sheet
TARGET_FOOT_Y = int(CELL_SIZE * 0.92)  # 460px - feet must be at this position

# Enemy types and their source files
ENEMY_TYPES = {
    "normal": "enemy_normal.webp",
    "runner": "enemy_runner.webp",
    "armored": "enemy_armored.webp",
    "cultist": "enemy_cultist.webp",
    "shieldbearer": "enemy_shieldbearer.webp",
    "bomber": "enemy_bomber.webp",
    "gargoyle": "enemy_gargoyle.webp",
    "siege": "enemy_siege.webp",
}

BOSS_TYPES = {
    "stonebreaker": "boss_stonebreaker.webp",
    "stormlord": "boss_stormlord.webp",
    "shieldwarden": "boss_shieldwarden.webp",
    "colossus": "boss_colossus.webp",
}

DIRECTIONS = ("n", "e", "s", "w")


def load_source_sprite(filepath):
    """Load a source sprite and return as RGBA image."""
    path = ASSET_ROOT / filepath
    if not path.exists():
        raise FileNotFoundError(f"Source sprite not found: {path}")
    img = Image.open(path).convert("RGBA")
    return img


def find_foot_position(img, threshold=32):
    """Find the bottom-most pixel with alpha >= threshold in the center column."""
    w, h = img.size
    center_x = w // 2
    alpha = img.getchannel('A')
    
    # Scan from bottom to top in the center column
    for y in range(h - 1, -1, -1):
        if alpha.getpixel((center_x, y)) >= threshold:
            return y
    return h


def create_walk_sheet(source_img, cell_size=CELL_SIZE, frame_count=FRAME_COUNT):
    """Create a walk sheet with frame_count frames from a source sprite.
    
    Uses pivot-based animation: feet stay fixed at cell bottom (460px),
    body moves with bobbing and sway around this pivot point.
    
    Returns a single RGBA image with all frames in a horizontal strip.
    """
    sheet_width = cell_size * frame_count
    sheet_height = cell_size
    sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))
    
    src_w, src_h = source_img.size
    
    # Find foot position in source
    src_foot_y = find_foot_position(source_img, threshold=32)
    src_foot_ratio = src_foot_y / src_h if src_h > 0 else 1.0
    
    # Calculate safe margins (from verify script: max(4, round(cell * .018)))
    safe_margin = max(4, round(cell_size * 0.018))  # 9px for 500px cell
    
    # Calculate maximum sprite height to satisfy both:
    # 1. paste_y + scaled_foot_y >= TARGET_FOOT_Y (feet at or below 460px)
    # 2. paste_y + scaled_h <= cell_size - safe_margin (no bottom clipping)
    # With paste_y = TARGET_FOOT_Y - scaled_foot_y + bob_offset
    # and bob_offset >= 0, we need:
    # TARGET_FOOT_Y - scaled_foot_y + scaled_h <= cell_size - safe_margin
    # scaled_h - scaled_foot_y <= cell_size - safe_margin - TARGET_FOOT_Y
    # scaled_h * (1 - src_foot_ratio) <= cell_size - safe_margin - TARGET_FOOT_Y
    max_sprite_height = int(
        (cell_size - safe_margin - TARGET_FOOT_Y) / (1 - src_foot_ratio)
    ) if src_foot_ratio < 1.0 else cell_size - safe_margin - TARGET_FOOT_Y
    
    # Ensure max_sprite_height is reasonable (at least 100px, at most cell_size - safe_margin)
    max_sprite_height = max(100, min(max_sprite_height, cell_size - safe_margin))
    
    # Scale to fit within max_sprite_height while maintaining aspect ratio
    scale = max_sprite_height / max(src_w, src_h)
    
    for frame_idx in range(frame_count):
        t = frame_idx / frame_count
        cycle_pos = t * 2  # 0-2 range for two full steps
        
        # Use stronger animation parameters to ensure distinct frames
        # Bobbing: ONLY downward motion to keep feet >= 460px
        # This ensures bbox[3] >= TARGET_FOOT_Y in all frames
        sin_val = math.sin(cycle_pos * math.pi)
        # Only use negative sin values (downward motion), amplitude 15%
        bob_offset = int(max(0, -sin_val) * cell_size * 0.15)
        
        # Sway: sin wave for side-to-side motion (Amplitude: 8% of cell)
        sway_offset = int(math.sin(cycle_pos * math.pi * 0.5) * cell_size * 0.08)
        
        # Scale: slight variation for perspective (Amplitude: 3%)
        scale_factor = 1.0 + sin_val * 0.03
        
        # Resize the source image
        scaled_w = int(src_w * scale * scale_factor)
        scaled_h = int(src_h * scale * scale_factor)
        scaled_img = source_img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
        
        # Find foot position in scaled image
        scaled_foot_y = find_foot_position(scaled_img, threshold=32)
        
        # Calculate paste_y to keep feet EXACTLY at TARGET_FOOT_Y
        paste_y = TARGET_FOOT_Y - scaled_foot_y + bob_offset
        
        # Clamp paste_y to ensure bottom margin (no clipping at cell bottom)
        max_paste_y = cell_size - scaled_h - safe_margin
        if paste_y > max_paste_y:
            paste_y = max_paste_y
        
        # Horizontal position: center with sway
        paste_x = (cell_size - scaled_w) // 2 + sway_offset
        
        # Clamp paste_x to ensure side margins
        if paste_x < safe_margin:
            paste_x = safe_margin
        if paste_x + scaled_w > cell_size - safe_margin:
            paste_x = cell_size - scaled_w - safe_margin
        
        # Create frame and paste sprite
        frame = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
        frame.paste(scaled_img, (paste_x, paste_y), scaled_img)
        
        # Paste frame onto sheet
        sheet.paste(frame, (frame_idx * cell_size, 0), frame)
    
    return sheet


def create_directional_walk_sheets(enemy_type, source_file):
    """Create walk sheets for all 4 directions."""
    source_img = load_source_sprite(source_file)
    sheets = {}
    
    for direction in DIRECTIONS:
        if direction in ("e", "w"):
            # Side views: use horizontal flip for west
            if direction == "w":
                img = source_img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                img = source_img
        else:
            img = source_img
        
        sheet = create_walk_sheet(img)
        sheets[direction] = sheet
    
    return sheets


def save_sheet(sheet, output_path):
    """Save a walk sheet as PNG."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output_path, format="PNG", optimize=True)
    print(f"  Saved: {output_path} ({sheet.size[0]}x{sheet.size[1]})")


def main():
    print("=" * 70)
    print("Ansturm Walk-Sheet Generator")
    print("=" * 70)
    print()
    print(f"Source assets: {ASSET_ROOT}")
    print(f"Output directory: {OUTPUT_ROOT}")
    print(f"Cell size: {CELL_SIZE}px")
    print(f"Frames per sheet: {FRAME_COUNT}")
    print()
    
    all_types = {**ENEMY_TYPES, **BOSS_TYPES}
    
    for enemy_type, source_file in all_types.items():
        print(f"Generating walk sheets for: {enemy_type}")
        sheets = create_directional_walk_sheets(enemy_type, source_file)
        
        for direction, sheet in sheets.items():
            output_path = OUTPUT_ROOT / enemy_type / f"walk_{enemy_type}_{direction}.png"
            save_sheet(sheet, output_path)
        
        print(f"  ✓ Completed {enemy_type}")
        print()
    
    print("=" * 70)
    print("Walk-Sheet generation complete!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Run: python tools/verify-ansturm-walk-sheet.py <sheet.png>")
    print("2. Review the generated sheets manually")
    print("3. Replace with hand-drawn art if needed")


if __name__ == "__main__":
    main()
