/** VNext topology benchmark: pure geometry, no legacy or production mutations. */
export type GridSize = Readonly<{cols:number;rows:number}>;
export type Point = Readonly<{c:number;r:number}>;
export const CANDIDATE_GRIDS = [{cols:8,rows:5},{cols:10,rows:7},{cols:12,rows:8}] as const;
export function validGrid(g:GridSize):boolean{return Number.isInteger(g.cols)&&Number.isInteger(g.rows)&&g.cols>=3&&g.rows>=3&&g.cols<=24&&g.rows<=16;}
export function inside(g:GridSize,p:Point):boolean{return p.c>=0&&p.c<g.cols&&p.r>=0&&p.r<g.rows&&Number.isInteger(p.c)&&Number.isInteger(p.r);}
export function scaleCell(p:Point,from:GridSize,to:GridSize):Point{
 if(!validGrid(from)||!validGrid(to)||!inside(from,p))throw Error("invalid topology or source point");
 return {c:Math.round(p.c*(to.cols-1)/(from.cols-1)),r:Math.round(p.r*(to.rows-1)/(from.rows-1))};
}
export function manhattan(a:Point,b:Point):number{return Math.abs(a.c-b.c)+Math.abs(a.r-b.r);}
export function chebyshev(a:Point,b:Point):number{return Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r));}
export function reachable(g:GridSize,start:Point,range:number,blocked:ReadonlyArray<Point>=[]):Point[]{
 if(!validGrid(g)||!inside(g,start)||!Number.isInteger(range)||range<0)throw Error("invalid movement input");
 const forbidden=new Set(blocked.map(p=>p.c+","+p.r));
 const visited=new Set([start.c+","+start.r]),queue:[Point,number][]=[[start,0]],out:Point[]=[];
 for(let i=0;i<queue.length;i++){
  const [p,d]=queue[i];if(d>=range)continue;
  for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const n={c:p.c+dc,r:p.r+dr},k=n.c+","+n.r;
   if(!inside(g,n)||visited.has(k)||forbidden.has(k))continue;
   visited.add(k);out.push(n);queue.push([n,d+1]);
  }
 }
 return out;
}
export function shortestPath(g:GridSize,start:Point,end:Point,blocked:ReadonlyArray<Point>=[]):number|null{
 if(!validGrid(g)||!inside(g,start)||!inside(g,end))throw Error("invalid path");
 if(start.c===end.c&&start.r===end.r)return 0;
 const forbidden=new Set(blocked.map(p=>p.c+","+p.r)),visited=new Set([start.c+","+start.r]),queue:[Point,number][]=[[start,0]];
 for(let i=0;i<queue.length;i++){
  const [p,d]=queue[i];
  for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const n={c:p.c+dc,r:p.r+dr},k=n.c+","+n.r;
   if(!inside(g,n)||forbidden.has(k)||visited.has(k))continue;
   if(n.c===end.c&&n.r===end.r)return d+1;
   visited.add(k);queue.push([n,d+1]);
  }
 }
 return null;
}
/** Orthogonal movement + Chebyshev attacks, matching legacy tactical rules. */
export function earliestAttackAction(g:GridSize,ally:Point,enemy:Point,moveRange:number,attackRange:number,blocked:ReadonlyArray<Point>=[]):number|null{
 if(chebyshev(ally,enemy)<=attackRange)return 0;
 const candidates=[ally,...reachable(g,ally,g.cols*g.rows,blocked.concat([enemy]))].filter(p=>chebyshev(p,enemy)<=attackRange);
 const distances=candidates.map(p=>shortestPath(g,ally,p,blocked.concat([enemy]))).filter((x):x is number=>x!==null);
 if(!distances.length||moveRange<=0)return null;
 return Math.min(...distances.map(d=>Math.ceil(d/moveRange)));
}
