#!/usr/bin/env python3
"""Import the verified 12 V6 WebPs into PR #328 without overwriting game art."""
import argparse
import hashlib
import subprocess
import zipfile
from pathlib import Path

BRANCH = 'feature/td2-v6-tower-candidates-20261116'
BASE = 'dist/assets/style2-v6-candidates/tuerme/upgrade_stufen'
SHA256 = {
    'bogen_l1.webp': '31782f76fb1aaad1e68dbf67741c0cb64cd73cbaf80bef7d6c971736c3792257',
    'bogen_l2.webp': '8a6eb3c80b756a24a86bcc4710b8f3231b8f5d34524879513fdfcf7cf7f7a5fc',
    'bogen_l3.webp': 'fc773b30423d72ab7febbab06b4d0bab7939815f939706d812de63b52265fac5',
    'kanone_l1.webp': '445b12fe4d57fbf17f6659aca37d6a7416453d84f8efb1b265fd09a27db744f1',
    'kanone_l2.webp': '035f2df4aeac7f65edd436b1ced0351cbcd79ab075d041c6722f4c4260372144',
    'kanone_l3.webp': '3f7469dab3b95bf309b807ad3d84a845e1e2c35dfc642a62f3b0b1aefe8786ce',
    'riftlanze_l1.webp': 'f667e28cae965aa4fe280854b074737d9e648b1659e334d4cbe9c6de804782db',
    'riftlanze_l2.webp': 'c00e9c600a262eb478995028724078f8f1a773466618c463dfd07fcae4fa5265',
    'riftlanze_l3.webp': 'a19861955358c30aea812239f0581ddfc32e12caa01d6d8ff6b9d84c0a717442',
    'eis_l1.webp': '7cdf181a7d02f20c2cbf6c34375d51c411fb7eeca13d6e6732e3eca8c4d8195f',
    'eis_l2.webp': '1983f05379949837541569473e45ff4887a62955194b95349d66099219149b66',
    'eis_l3.webp': 'd7103961269c7531fb1e5ed71deaec42f99eb4a42951153928f4c3edeed0f49d',
}

def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('zip_file', type=Path, help='TD2_V6_Turmpatch_20261116.zip')
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--push', action='store_true', help='commit and push to the existing feature branch')
    args = parser.parse_args()
    repo = args.repo.resolve()
    def cmd(*a):
        return subprocess.check_output(['git', '-C', str(repo), *a], text=True).strip()
    branch = cmd('branch', '--show-current')
    if branch != BRANCH:
        raise SystemExit(f'Refusing to import onto {branch!r}; expected {BRANCH!r}')
    if not (repo / 'dist/style2-v6-towers.js').is_file():
        raise SystemExit('V6 renderer missing: check out PR #328 first')
    with zipfile.ZipFile(args.zip_file) as package:
        items = {}
        for name in package.namelist():
            if not name.endswith('.webp'):
                continue
            filename = name.rsplit('/', 1)[-1]
            if filename not in SHA256 or not name.endswith('/' + BASE + '/' + filename):
                continue
            if filename in items:
                raise SystemExit(f'Duplicate sprite: {filename}')
            content = package.read(name)
            if hashlib.sha256(content).hexdigest() != SHA256[filename]:
                raise SystemExit(f'Checksum mismatch: {filename}')
            items[filename] = content
    if set(items) != set(SHA256):
        raise SystemExit(f'Incomplete ZIP: missing {sorted(set(SHA256) - set(items))}')
    output = repo / BASE
    for name, content in items.items():
        dest = output / name
        if dest.exists() and dest.read_bytes() != content:
            raise SystemExit(f'Existing asset differs: {dest}')
    output.mkdir(parents=True, exist_ok=True)
    for name, content in items.items():
        dest = output / name
        if not dest.exists():
            dest.write_bytes(content)
    print(f'Imported all 12 verified V6 tower WebPs into {output}')
    if args.push:
        subprocess.run(['node', 'tests/v6-tower-assets.test.cjs'], cwd=repo, check=True)
        subprocess.run(['node', 'tests/v6-towers.test.cjs'], cwd=repo, check=True)
        subprocess.run(['git', 'add', '--', BASE], cwd=repo, check=True)
        changes = subprocess.run(['git', 'diff', '--cached', '--quiet', '--', BASE], cwd=repo)
        if changes.returncode == 1:
            subprocess.run(['git', 'commit', '-m', 'assets(v6): add twelve verified tower WebPs'], cwd=repo, check=True)
            subprocess.run(['git', 'push', 'origin', BRANCH], cwd=repo, check=True)
        elif changes.returncode != 0:
            raise SystemExit('Cannot inspect staged assets')
        else:
            print('Assets already committed, nothing to push')

if __name__ == '__main__':
    run()
