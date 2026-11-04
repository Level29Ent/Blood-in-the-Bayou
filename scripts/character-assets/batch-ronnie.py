import json,struct,math
from pathlib import Path
p=Path('/tmp/ronnie-asset/ronniebaby.glb');b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);old=b[28+n:];groups={}
def read(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];counts={'SCALAR':1,'VEC2':2,'VEC3':3};k=counts[a['type']];fmt='f' if a['componentType']==5126 else 'H';return struct.unpack_from('<'+fmt*(a['count']*k),old,v.get('byteOffset',0)+a.get('byteOffset',0))
def rot(v,q):
 x,y,z=v;qx,qy,qz,qw=q;tx=2*(qy*z-qz*y);ty=2*(qz*x-qx*z);tz=2*(qx*y-qy*x);return (x+qw*tx+qy*tz-qz*ty,y+qw*ty+qz*tx-qx*tz,z+qw*tz+qx*ty-qy*tx)
for node in g['nodes']:
 primitive=g['meshes'][node['mesh']]['primitives'][0];m=primitive['material'];d=groups.setdefault(m,{'p':[],'n':[],'uv':[]});pos=read(primitive['attributes']['POSITION']);nor=read(primitive['attributes']['NORMAL']);uv=read(primitive['attributes']['TEXCOORD_0']);ids=read(primitive['indices']);q=node.get('rotation',[0,0,0,1]);t=node['translation']
 for i in ids:
  v=rot(pos[i*3:i*3+3],q);d['p'].extend(v[j]+t[j] for j in range(3));d['n'].extend(rot(nor[i*3:i*3+3],q));d['uv'].extend(uv[i*2:i*2+2])
blob=bytearray();views=[];access=[]
def add(data):
 while len(blob)%4:blob.append(0)
 views.append({'buffer':0,'byteOffset':len(blob),'byteLength':len(data)});blob.extend(data);return len(views)-1
for image in g['images']:
 v=g['bufferViews'][image['bufferView']];image['bufferView']=add(old[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])
def attribute(vals,kind):
 count=len(vals)//{'VEC3':3,'VEC2':2}[kind];a={'bufferView':add(struct.pack('<'+'f'*len(vals),*vals)),'componentType':5126,'count':count,'type':kind}
 if kind=='VEC3':a.update({'min':[min(vals[i::3]) for i in range(3)],'max':[max(vals[i::3]) for i in range(3)]})
 access.append(a);return len(access)-1
g['meshes']=[];g['nodes']=[]
for m,d in groups.items():
 g['meshes'].append({'name':g['materials'][m]['name'],'primitives':[{'attributes':{'POSITION':attribute(d['p'],'VEC3'),'NORMAL':attribute(d['n'],'VEC3'),'TEXCOORD_0':attribute(d['uv'],'VEC2')},'material':m}]});g['nodes'].append({'name':g['materials'][m]['name'],'mesh':len(g['meshes'])-1})
g['scenes'][0]['nodes']=list(range(len(g['nodes'])));g['bufferViews']=views;g['accessors']=access;g['buffers']=[{'byteLength':len(blob)}];j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob+=b'\0'*((-len(blob))%4);size=28+len(j)+len(blob);p.write_bytes(struct.pack('<III',0x46546c67,2,size)+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob);print('Batched character:',len(g['meshes']),'material draw groups;',size,'bytes')
