"""Create a separately reviewable source-only patch, safe to apply in an empty folder."""
import difflib
from pathlib import Path

HERE=Path(__file__).resolve().parent

def build():
    names=['resolver.py','resolver_test.py','source-manifest.json']+[str(p.relative_to(HERE)).replace('\\','/') for p in sorted((HERE/'verified_source').iterdir()) if p.suffix in ('.py','.json')]
    chunks=[]
    for name in names:
        lines=(HERE/name).read_text(encoding='utf-8').splitlines(keepends=True)
        chunks.extend(difflib.unified_diff([],lines,fromfile='/dev/null',tofile='b/bloodmoon_v4_p2/'+name))
    path=HERE/'backend-review.patch';path.write_text(''.join(chunks),encoding='utf-8',newline='\n')
    print('Source-only backend review patch:',path)

if __name__=='__main__':build()
