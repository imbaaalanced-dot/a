#!/usr/bin/env python3
"""Build deterministic layered Style 2 map art from approved painterly source materials."""
from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

WORLD = 3072
CENTER = (1536, 1536)
ROOT = Path(__file__).resolve().parents[1]
MAP_ROOT = ROOT / "dist" / "assets" / "maps"
SOURCE_ROOT = ROOT / "docs" / "art" / "source-material"

LEVEL_PATHS = {
    1: [[(1536, 936), CENTER], [(2136, 1536), CENTER], [(1536, 2136), CENTER], [(936, 1536), CENTER]],
    2: [[(1096, 1096), (1976, 1096), (1976, 1976), (1096, 1976), (1096, 1376),
         (1716, 1376), (1716, 1716), (1536, 1716), CENTER]],
    3: [[(1196,916),(1196,1276),(1286,1446),CENTER],
        [(836,2016),(1196,2016),(1196,1726),(1286,1446),CENTER],
        [(2236,2016),(1696,2016),(1696,1746),(1626,1626),CENTER],
        [(1556,2276),(1556,2016),(1556,1716),CENTER]],
    4: [[(806,1166),(981,1171),(1101,1341),(1361,1411),CENTER],
        [(801,1876),(1116,1881),(1286,1726),(1446,1606),CENTER],
        [(2171,2236),(1906,2056),(1816,1806),(1661,1636),CENTER],
        [(846,746),(921,1001),(1006,1276),(1336,1381),CENTER]],
}


def distance_to_segment(point, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    scale = max(0.0, min(1.0, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy or 1)))
    return math.hypot(point[0] - a[0] - scale * dx, point[1] - a[1] - scale * dy)


def path_distance(point, paths):
    return min(distance_to_segment(point, route[index], route[index + 1]) for route in paths for index in range(len(route) - 1))


def slots_for(level):
    if level == 1:
        gates = [route[0] for route in LEVEL_PATHS[1]]
        slots = []
        for gate in gates:
            dx, dy = CENTER[0] - gate[0], CENTER[1] - gate[1]
            length = math.hypot(dx, dy)
            nx, ny = -dy / length, dx / length
            for along in (165, 325, 485):
                for side in (-1, 1):
                    point = (gate[0] + dx * along / length + nx * 104 * side,
                             gate[1] + dy * along / length + ny * 104 * side)
                    if path_distance(point, LEVEL_PATHS[1]) >= 96 and math.dist(point, CENTER) > 145 and all(math.dist(point, old) > 94 for old in slots):
                        slots.append(point)
        return slots
    if level == 2:
        route = LEVEL_PATHS[2][0]
        slots = []
        for index in range(1, len(route)):
            a, b = route[index - 1], route[index]
            dx, dy, length = b[0] - a[0], b[1] - a[1], math.dist(a, b)
            nx, ny = -dy / length, dx / length
            along = 90
            while along < length - 50:
                for side in (-1, 1):
                    point = (a[0] + dx * along / length + nx * 88 * side,
                             a[1] + dy * along / length + ny * 88 * side)
                    if path_distance(point, LEVEL_PATHS[2]) >= 70 and math.dist(point, CENTER) > 100 and all(math.dist(point, old) > 100 for old in slots):
                        slots.append(point)
                along += 160
        return slots
    if level == 3:
        candidates=[(-450,-380),(-210,-360),(-470,-100),(-420,90),(-190,170),(-200,340),(270,310),(290,100),(190,-150),(20,-250),(430,320),(450,-150)]
        return [(CENTER[0]+x,CENTER[1]+y) for x,y in candidates if path_distance((CENTER[0]+x,CENTER[1]+y),LEVEL_PATHS[3])>=64]
    candidates=[(-760,-590),(-470,-810),(-240,-830),(100,-820),(320,-680),(340,-345),(310,-210),(510,-210),(-740,-50),(-550,-65),(-380,20),(-220,-250),(-160,380),(100,330),(230,390),(440,340),(560,190),(380,60),(70,-205),(520,520)]
    church=(1121,1771,836,1246)
    slots=[]
    for x,y in candidates:
        point=(CENTER[0]+x,CENTER[1]+y)
        outside=point[0]<church[0]-40 or point[0]>church[1]+40 or point[1]<church[2]-40 or point[1]>church[3]+40
        if path_distance(point,LEVEL_PATHS[4])>=84 and math.dist(point,CENTER)>=165 and outside and all(math.dist(point,old)>95 for old in slots):slots.append(point)
    return slots


def prepare_ground(source):
    image = Image.open(source).convert("RGB").resize((WORLD, WORLD), Image.Resampling.LANCZOS)
    image = ImageEnhance.Color(image).enhance(.76)
    image = ImageEnhance.Contrast(image).enhance(1.06)
    image = ImageEnhance.Brightness(image).enhance(.74)
    vignette = Image.new("L", (768, 768), 0)
    pixels = vignette.load()
    for y in range(768):
        for x in range(768):
            distance = math.hypot(x - 384, y - 384) / 543
            pixels[x, y] = int(max(0, min(118, (distance ** 1.7) * 118)))
    vignette = vignette.resize((WORLD, WORLD), Image.Resampling.BICUBIC)
    shade = Image.new("RGB", image.size, (4, 9, 11))
    return Image.composite(shade, image, vignette)


def draw_paths(level):
    layer = Image.new("RGBA", (WORLD, WORLD))
    draw = ImageDraw.Draw(layer, "RGBA")
    rng = random.Random(4000 + level)
    for route_index,route in enumerate(LEVEL_PATHS[level]):
        if level==3 and route_index<3:edge,stone,light=(69,57,43,238),(137,117,83,252),(190,156,102,105)
        elif level==4 or level==3:edge,stone,light=(66,65,58,238),(151,142,121,252),(210,187,139,110)
        else:edge,stone,light=(67,59,48,238),(142,125,95,252),(181,155,111,118)
        draw.line(route, fill=(2, 7, 9, 150), width=132, joint="curve")
        draw.line(route, fill=edge, width=112, joint="curve")
        draw.line(route, fill=stone, width=88, joint="curve")
        draw.line(route, fill=light, width=62, joint="curve")
        for a, b in zip(route, route[1:]):
            length = math.dist(a, b)
            steps = max(1, int(length / 48))
            nx, ny = -(b[1] - a[1]) / length, (b[0] - a[0]) / length
            for step in range(1, steps):
                ratio = step / steps
                x = a[0] + (b[0] - a[0]) * ratio + rng.uniform(-18, 18)
                y = a[1] + (b[1] - a[1]) * ratio + rng.uniform(-18, 18)
                half = rng.uniform(8, 18)
                draw.line((x - nx * half, y - ny * half, x + nx * half, y + ny * half), fill=(59, 52, 45, 105), width=3)
                if step % 3 == 0:
                    r = rng.randint(2, 5)
                    draw.ellipse((x-r, y-r, x+r, y+r), fill=(214, 183, 126, 90))
    glow = layer.filter(ImageFilter.GaussianBlur(18))
    return Image.alpha_composite(glow, layer)


def clear_mask(mask, points, radius):
    draw = ImageDraw.Draw(mask)
    for x, y in points:
        draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=0)


def tree(layer, x, y, radius, rng, autumn=False):
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.ellipse((x-radius*.85+22, y-radius*.22+30, x+radius*.9+38, y+radius*.45+48), fill=(0, 0, 0, 92))
    draw.rectangle((x-8, y-radius*.20, x+10, y+radius*.30), fill=(65, 46, 32, 230))
    colors = [(20, 48, 38, 255), (30, 67, 47, 255), (48, 78, 49, 250)]
    if autumn: colors += [(105, 52, 31, 245), (127, 71, 34, 235)]
    for index in range(52):
        angle = rng.random() * math.tau
        spread = radius * math.sqrt(rng.random()) * .66
        cx = x + math.cos(angle) * spread
        cy = y - radius*.34 + math.sin(angle) * spread * .62
        rx = rng.uniform(radius*.10, radius*.24)
        ry = rx * rng.uniform(.48, .72)
        draw.ellipse((cx-rx, cy-ry, cx+rx, cy+ry), fill=rng.choice(colors), outline=(93, 102, 62, 80), width=2)
    draw.arc((x-radius*.62, y-radius*.75, x+radius*.35, y+radius*.05), 195, 325, fill=(168, 148, 92, 90), width=5)


def lantern(layer, x, y):
    glow = Image.new("RGBA", layer.size)
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((x-78, y-105, x+78, y+50), fill=(255, 151, 38, 54))
    glow = glow.filter(ImageFilter.GaussianBlur(32))
    layer.alpha_composite(glow)
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.line((x, y+24, x, y-35), fill=(35, 31, 28, 255), width=9)
    draw.polygon(((x-13, y-50), (x+13, y-50), (x+10, y-23), (x-10, y-23)), fill=(255, 169, 55, 245), outline=(71, 48, 29, 255))
    draw.line((x-17, y-53, x+17, y-53), fill=(25, 24, 23, 255), width=5)


def grave(layer,x,y,rng):
    draw=ImageDraw.Draw(layer,"RGBA")
    width=rng.randint(22,34);height=rng.randint(42,66)
    draw.ellipse((x-width*.8+12,y+9,x+width*.9+24,y+30),fill=(0,0,0,90))
    draw.rectangle((x-width//2-5,y+2,x+width//2+5,y+13),fill=(63,62,56,235))
    draw.rectangle((x-width//2,y-height,x+width//2,y+5),fill=rng.choice(((111,107,94,245),(126,116,98,245),(91,99,91,245))))
    draw.arc((x-width//2,y-height-9,x+width//2,y-height+14),180,360,fill=(180,165,132,135),width=3)
    if rng.random()<.6:draw.line((x,y-height+8,x,y-8),fill=(55,58,54,125),width=3)


def boundary_wall(layer,segments):
    draw=ImageDraw.Draw(layer,"RGBA")
    for start,end in segments:
        draw.line((start,end),fill=(25,29,29,205),width=40)
        draw.line((start[0]-7,start[1]-10,end[0]-7,end[1]-10),fill=(101,99,88,235),width=27)
        draw.line((start[0]-10,start[1]-14,end[0]-10,end[1]-14),fill=(172,153,118,80),width=4)


def level_one_decor():
    back = Image.new("RGBA", (WORLD, WORLD))
    front = Image.new("RGBA", (WORLD, WORLD))
    rng = random.Random(8101)
    slots = slots_for(1)
    candidates = []
    for edge in range(120, WORLD-120, 150):
        candidates += [(edge, rng.randint(100, 360)), (edge, rng.randint(WORLD-360, WORLD-100)),
                       (rng.randint(100, 360), edge), (rng.randint(WORLD-360, WORLD-100), edge)]
    for x, y in candidates:
        if path_distance((x, y), LEVEL_PATHS[1]) > 145 and all(math.dist((x, y), slot) > 120 for slot in slots):
            tree(back, x, y, rng.randint(70, 118), rng, autumn=rng.random()<.34)
    draw = ImageDraw.Draw(back, "RGBA")
    # Broken perimeter walls leave all four approaches open.
    for start, end in [((610,610),(1350,610)),((1722,610),(2462,610)),((2462,610),(2462,1350)),((2462,1722),(2462,2462)),
                       ((1722,2462),(2462,2462)),((610,2462),(1350,2462)),((610,1722),(610,2462)),((610,610),(610,1350))]:
        draw.line((start,end),fill=(33,35,34,210),width=42)
        draw.line((start[0]-8,start[1]-10,end[0]-8,end[1]-10),fill=(108,103,86,245),width=30)
        draw.line((start[0]-12,start[1]-15,end[0]-12,end[1]-15),fill=(158,143,109,95),width=5)
    for route in LEVEL_PATHS[1]:
        x=(route[0][0]+CENTER[0])//2;y=(route[0][1]+CENTER[1])//2
        if route[0][0]==CENTER[0]: lantern(back,x-95,y)
        else: lantern(back,x,y-95)
    # Sparse lower crowns are the actor-aware foreground pass.
    for x in (180,500,2600,2890):tree(front,x,2920,rng.randint(130,180),rng,autumn=True)
    return back, front


def level_two_decor():
    back = Image.new("RGBA", (WORLD, WORLD))
    front = Image.new("RGBA", (WORLD, WORLD))
    rng = random.Random(8202)
    route = LEVEL_PATHS[2][0]
    hedge_mask = Image.new("L", (WORLD, WORLD))
    hedge_draw = ImageDraw.Draw(hedge_mask)
    for a,b in zip(route,route[1:]):
        dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);nx,ny=-dy/length,dx/length
        for side in (-1,1):
            offset=142*side
            start=(a[0]+nx*offset,a[1]+ny*offset);end=(b[0]+nx*offset,b[1]+ny*offset)
            hedge_draw.line((start,end),fill=255,width=104)
            for x,y in (start,end):hedge_draw.ellipse((x-52,y-52,x+52,y+52),fill=255)
    path_clear=Image.new("L",(WORLD,WORLD))
    ImageDraw.Draw(path_clear).line(route,fill=255,width=156,joint="curve")
    hedge_mask=ImageChops.subtract(hedge_mask,path_clear)
    clear_mask(hedge_mask, slots_for(2), 94)
    clear_mask(hedge_mask, [route[0], CENTER], 150)
    hedge = Image.new("RGBA", (WORLD, WORLD), (15, 45, 31, 0))
    hedge.putalpha(hedge_mask.point(lambda value: int(value*.88)))
    shadow = Image.new("RGBA", (WORLD, WORLD), (0, 0, 0, 0))
    shadow.putalpha(hedge_mask.filter(ImageFilter.GaussianBlur(20)).point(lambda value: int(value*.38)))
    back.alpha_composite(shadow, (24, 34))
    back.alpha_composite(hedge)
    draw = ImageDraw.Draw(back, "RGBA")
    for _ in range(12000):
        x,y=rng.randrange(720,2350),rng.randrange(720,2350)
        if hedge_mask.getpixel((x,y))>90:
            r=rng.randint(4,11);color=rng.choice(((51,92,54,210),(75,106,57,190),(21,66,46,230),(92,66,49,120)))
            draw.ellipse((x-r,y-r*.55,x+r,y+r*.55),fill=color)
    # Low broken stone edging emphasizes turns without becoming collision geometry.
    for segment,(a,b) in enumerate(zip(route,route[1:])):
        if segment%2:continue
        dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);nx,ny=-dy/length,dx/length
        for side in (-1,1):
            offset=205*side
            start=(a[0]+nx*offset,a[1]+ny*offset);end=(b[0]+nx*offset,b[1]+ny*offset)
            draw.line((start,end),fill=(99,94,78,175),width=18)
            draw.line((start[0]-6,start[1]-8,end[0]-6,end[1]-8),fill=(150,137,103,100),width=4)
    for index,point in enumerate(route[1:-1],1):
        if index%2:lantern(back,point[0]+105,point[1]-105)
    for x in (120,420,2700,2960):tree(front,x,2940,rng.randint(135,185),rng,autumn=x>2500)
    return back, front


def level_three_decor():
    back=Image.new("RGBA",(WORLD,WORLD));front=Image.new("RGBA",(WORLD,WORLD));rng=random.Random(8303)
    slots=slots_for(3)
    segments=[((690,720),(1080,720)),((1320,720),(2380,720)),((2380,720),(2380,1810)),((2380,2080),(2380,2380)),
              ((1780,2380),(2380,2380)),((690,2380),(1350,2380)),((690,1510),(690,2380)),((690,720),(690,1220))]
    boundary_wall(back,segments)
    for _ in range(54):
        point=(rng.randint(760,2290),rng.randint(790,2290))
        if path_distance(point,LEVEL_PATHS[3])>125 and math.dist(point,CENTER)>250 and all(math.dist(point,slot)>100 for slot in slots):grave(back,*point,rng)
    for edge in range(150,2920,175):
        for point in ((edge,rng.randint(100,380)),(edge,rng.randint(2680,2970)),(rng.randint(100,380),edge),(rng.randint(2680,2970),edge)):
            if path_distance(point,LEVEL_PATHS[3])>150:tree(back,*point,rng.randint(72,120),rng,autumn=rng.random()<.4)
    for route in LEVEL_PATHS[3]:
        for x,y in route[1:-1:2]:lantern(back,x+88,y-84)
    for x in (130,470,2570,2910):tree(front,x,2940,rng.randint(135,185),rng,autumn=True)
    return back,front


def level_four_decor():
    back=Image.new("RGBA",(WORLD,WORLD));front=Image.new("RGBA",(WORLD,WORLD));rng=random.Random(8404)
    slots=slots_for(4);church=(1121,1771,836,1246)
    segments=[((620,620),(810,620)),((1020,620),(2350,620)),((2350,620),(2350,1600)),((2350,1880),(2350,2450)),
              ((1740,2450),(2350,2450)),((620,2450),(1450,2450)),((620,1960),(620,2450)),((620,620),(620,1570))]
    boundary_wall(back,segments)
    for _ in range(70):
        point=(rng.randint(700,2260),rng.randint(690,2350))
        outside=point[0]<church[0]-95 or point[0]>church[1]+95 or point[1]<church[2]-95 or point[1]>church[3]+95
        historic_zone=point[0]<1350 or point[1]<1150
        if outside and historic_zone and path_distance(point,LEVEL_PATHS[4])>128 and math.dist(point,CENTER)>260 and all(math.dist(point,slot)>105 for slot in slots):grave(back,*point,rng)
    for edge in range(130,2950,180):
        for point in ((edge,rng.randint(90,350)),(edge,rng.randint(2720,2990)),(rng.randint(90,350),edge),(rng.randint(2720,2990),edge)):
            if path_distance(point,LEVEL_PATHS[4])>155:tree(back,*point,rng.randint(75,124),rng,autumn=rng.random()<.3)
    for route in LEVEL_PATHS[4]:
        for x,y in route[1:-1:2]:lantern(back,x+82,y-86)
    for x in (110,430,2630,2940):tree(front,x,2940,rng.randint(140,190),rng,autumn=x>2400)
    return back,front


def save_webp(image, path, quality):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6, exact=True)


def export_level(level, source, output_root=MAP_ROOT):
    ground = prepare_ground(source)
    paths = draw_paths(level)
    decor={1:level_one_decor,2:level_two_decor,3:level_three_decor,4:level_four_decor}
    back, front = decor[level]()
    folder = output_root / f"level-{level}"
    layers = {"ground":ground,"paths":paths,"decor-back":back,"decor-front":front}
    for variant,size in (("desktop",WORLD),("mobile",2048)):
        for name,image in layers.items():
            output=image if size==WORLD else image.resize((size,size),Image.Resampling.LANCZOS)
            save_webp(output,folder/f"{name}-{variant}.webp",48 if name=="ground" else 72)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--level1-source",type=Path,default=SOURCE_ROOT/"level-1-ground-source.webp")
    parser.add_argument("--level2-source",type=Path,default=SOURCE_ROOT/"level-2-ground-source.webp")
    parser.add_argument("--level3-source",type=Path,default=SOURCE_ROOT/"level-3-ground-source.webp")
    parser.add_argument("--level4-source",type=Path,default=SOURCE_ROOT/"level-4-ground-source.webp")
    parser.add_argument("--levels",nargs="+",type=int,default=[1,2])
    parser.add_argument("--output-root",type=Path,default=MAP_ROOT)
    args=parser.parse_args()
    sources={1:args.level1_source,2:args.level2_source,3:args.level3_source,4:args.level4_source}
    for level in args.levels:
        if level not in sources:raise SystemExit(f"unsupported generated level {level}")
        export_level(level,sources[level],args.output_root)
        print(f"Built Style 2 layers for level {level}")


if __name__ == "__main__":
    main()
