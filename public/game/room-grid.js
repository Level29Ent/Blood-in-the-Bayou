'use strict';
(function(){
class RoomDecorator{constructor(width,depth,cellSize=5){if(!Number.isFinite(width)||!Number.isFinite(depth)||!Number.isFinite(cellSize)||width<=0||depth<=0||cellSize<=0)throw Error('Invalid room grid');this.width=width;this.depth=depth;this.cellSize=cellSize;this.cols=Math.floor(width/cellSize);this.rows=Math.floor(depth/cellSize);if(this.cols*this.rows>100000)throw Error('Room grid exceeds budget');this.grid=new Uint8Array(this.cols*this.rows);}
 isAreaFree(c,r,w,h){if(![c,r,w,h].every(Number.isInteger)||w<1||h<1||c<0||r<0||c+w>this.cols||r+h>this.rows)return false;for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)if(this.grid[y*this.cols+x])return false;return true;}
 occupyArea(c,r,w,h){if(!this.isAreaFree(c,r,w,h))return false;for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)this.grid[y*this.cols+x]=1;return true;}
 reserve(rect,b){const x=Math.max(0,Math.floor((rect.x-b.x)/this.cellSize)),y=Math.max(0,Math.floor((rect.y-b.y)/this.cellSize)),ex=Math.min(this.cols,Math.ceil((rect.x+rect.w-b.x)/this.cellSize)),ey=Math.min(this.rows,Math.ceil((rect.y+rect.h-b.y)/this.cellSize));for(let yy=y;yy<ey;yy++)for(let xx=x;xx<ex;xx++)this.grid[yy*this.cols+xx]=1;}
}
function fitsZone(r,z){return r.x>=z.x&&r.y>=z.y&&r.x+r.w<=z.x+z.w&&r.y+r.h<=z.y+z.h;}
const ZONES={sofa:'living',desk:'living',counter:'kitchen',bed:'bedroom',cabinet:'bedroom'};
if(typeof module!=='undefined')module.exports={RoomDecorator,fitsZone,ZONES};if(typeof window!=='undefined')window.level29RoomGrid={RoomDecorator,fitsZone,ZONES};
})();
