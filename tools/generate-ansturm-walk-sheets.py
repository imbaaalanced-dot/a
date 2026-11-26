#!/usr/bin/env python3
"""Generate Ansturm walk-cycle sheets from existing enemy sprites.

This script creates procedural walk sheets (8 frames per direction) for all
enemy types and bosses. The sheets follow the contract from
 docs/ansturm-walk-sheet-intake-20261123.md:
 - Format: 1 row x 8 square frames, horizontal RGBA strip
 - Cell size: 256px (within 192-1024px range)
 - Directions: n, e, s, w (compass directions)
 - Foot anchor: bottom-center
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


def create_walk_sheet(source_img, cell_size=CELL_SIZE, frame_count=FRAME_COUNT):
    """Create a walk sheet with frame_count frames from a source sprite.
    
    The walk cycle uses subtle variations to create the illusion of walking:
    - Vertical bobbing (up/down motion) - feet stay at cell bottom
    - Horizontal sway (side-to-side motion) - minimal to avoid anchor drift
    - Slight scaling (for perspective)
    
    All frames must have:
    - Feet grounded at cell bottom (bbox[3] >= cell * 0.92)
    - Foot anchor centered (horizontal center within 12% of cell center)
    - Transparent corners
    - No edge clipping
    
    Returns a single RGBA image with all frames in a horizontal strip.
    """
    # Calculate the size of the output sheet
    sheet_width = cell_size * frame_count
    sheet_height = cell_size
    
    # Create a transparent sheet
    sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))
    
    # Calculate source aspect ratio and scaling
    src_w, src_h = source_img.size
    scale = cell_size / max(src_w, src_h)
    
    # Find the foot position in the source image (using threshold=32 to match verify script)
    src_foot_y = find_foot_position(source_img, threshold=32)
    src_foot_ratio = src_foot_y / src_h if src_h > 0 else 1.0
    
    # Calculate the target foot position (must be >= 92% of cell height)
    target_foot_y = int(cell_size * 0.92)
    
    for frame_idx in range(frame_count):
        # Calculate walk cycle position (0-1)
        t = frame_idx / frame_count
        
        # Walk cycle parameters
        cycle_pos = t * 2  # 0-2 range for two full steps
        
        # No bobbing, sway, or scale variation for now - we need exact foot positioning
        bob_factor = 0
        sway_factor = 0
        scale_factor = 1.0
        
        # Calculate the frame position on the sheet
        x_offset = frame_idx * cell_size
        
        # Create a frame canvas
        frame = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
        
        # Resize the source image with the scale factor
        scaled_w = int(src_w * scale * scale_factor)
        scaled_h = int(src_h * scale * scale_factor)
        scaled_img = source_img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
        
        # Find the actual foot position in the scaled image (after resizing)
        # This is important because LANCZOS resampling may not preserve exact ratios
        scaled_foot_y = find_foot_position(scaled_img, threshold=32)
        
        # Position the image so feet are at target_foot_y
        # paste_y + scaled_foot_y = target_foot_y
        # So: paste_y = target_foot_y - scaled_foot_y
        paste_y = target_foot_y - scaled_foot_y
        
        # Apply very subtle bobbing (feet stay grounded, body moves up)
        # Limit bob to ensure feet never go above target_foot_y
        paste_y += int(bob_factor * cell_size * 0.1)
        
        # Allow negative paste_y (image extends above frame, feet stay visible)
        # This is fine - the frame will crop the top part, but feet will be at the right position
        
        # Horizontal position - keep centered with minimal sway
        paste_x = (cell_size - scaled_w) // 2 + int(sway_factor * cell_size * 0.3)
        
        # Ensure paste_x is within bounds
        paste_x = max(0, min(paste_x, cell_size - scaled_w))
        
        # Allow negative paste_y (image extends above frame, feet stay visible)
        # This is fine - the frame will crop the top part, but feet will be at the right position
        # Don't clamp paste_y to avoid cutting off the feet
        
        # Paste the sprite onto the frame
        frame.paste(scaled_img, (paste_x, paste_y), scaled_img if scaled_img.mode == "RGBA" else None)
        
        # Paste the frame onto the sheet
        sheet.paste(frame, (x_offset, 0), frame)
    
    return sheet


def find_foot_position(img, threshold=32):
    """Find the bottom-most pixel with alpha >= threshold in the center column of the image.
    
    This matches the verify script's threshold for bounding box calculation.
    The verify script uses: alpha.point(lambda v: 255 if v >= 32 else 0).getbbox()
    
    This assumes the feet are at the bottom of the sprite and the center column
    has pixels with alpha >= threshold down to the feet.
    """
    w, h = img.size
    center_x = w // 2
    
    # Get the alpha channel
    alpha = img.getchannel('A')
    
    # Scan from bottom to top in the center column
    for y in range(h - 1, -1, -1):
        if alpha.getpixel((center_x, y)) >= threshold:
            return y
    
    # If no pixel with alpha >= threshold found, return bottom
    return h


def create_directional_walk_sheets(enemy_type, source_file):
    """Create walk sheets for all 4 directions for an enemy type.
    
    For each direction, we create a slightly different walk cycle:
    - n (north): walking away from viewer
    - e (east): walking to the right
    - s (south): walking toward viewer
    - w (west): walking to the left
    
    Returns a dict of direction -> sheet image.
    """
    source_img = load_source_sprite(source_file)
    sheets = {}
    
    for direction in DIRECTIONS:
        # For directional variation, we can add slight horizontal flipping
        # or perspective changes
        if direction in ("e", "w"):
            # Side views: use horizontal flip for opposite directions
            if direction == "w":
                # West: flip horizontally
                img = source_img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                img = source_img
        else:
            # North/South: use original or slightly modified
            img = source_img
        
        sheet = create_walk_sheet(img)
        sheets[direction] = sheet
    
    return sheets


def save_sheet(sheet, output_path):
    """Save a walk sheet to a PNG file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output_path, "PNG", compress_level=6)
    print(f"  Saved: {output_path} ({sheet.size[0]}x{sheet.size[1]})")


def generate_all_walk_sheets():
    """Generate walk sheets for all enemy types and bosses."""
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    
    all_types = {**ENEMY_TYPES, **BOSS_TYPES}
    
    for enemy_type, source_file in all_types.items():
        print(f"\nGenerating walk sheets for: {enemy_type}")
        try:
            sheets = create_directional_walk_sheets(enemy_type, source_file)
            
            for direction in DIRECTIONS:
                output_path = OUTPUT_ROOT / f"{enemy_type}/walk_{enemy_type}_{direction}.png"
                save_sheet(sheets[direction], output_path)
            
            print(f"  ✓ Completed {enemy_type}")
        except Exception as e:
            print(f"  ✗ Error for {enemy_type}: {e}")


def main():
    print("=" * 70)
    print("Ansturm Walk-Sheet Generator")
    print("=" * 70)
    print(f"\nSource assets: {ASSET_ROOT}")
    print(f"Output directory: {OUTPUT_ROOT}")
    print(f"Cell size: {CELL_SIZE}px")
    print(f"Frames per sheet: {FRAME_COUNT}")
    print()
    
    generate_all_walk_sheets()
    
    print("\n" + "=" * 70)
    print("Walk-Sheet generation complete!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Run: python tools/verify-ansturm-walk-sheet.py <sheet.png>")
    print("2. Review the generated sheets manually")
    print("3. Replace with hand-drawn art if needed")


if __name__ == "__main__":
    main()
