import math,struct,json,zlib,random
from pathlib import Path
random.seed(29)
out=Path(__file__).resolve().parents[2]/'public/game/models/characters';out.mkdir(parents=True,exist_ok=True);blob=bytearray();views=[];access=[];meshes=[];nodes=[]
def buffer(data,target=None):
 while len(blob)%4:blob.append(0)
 v={'buffer':0,'byteOffset':len(blob),'byteLength':len(data)}
 if target:v['target']=target
 views.append(v);blob.extend(data);return len(views)-1
def attr(data,kind,count,component=5126,limits=None):
 a={'bufferView':buffer(data,34963 if component==5123 else 34962),'componentType':component,'count':count,'type':kind}
 if limits:a.update(limits)
 access.append(a);return len(access)-1
def png(pixels,w,h):
 def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
 raw=b''.join(b'\0'+pixels[y*w*3:(y+1)*w*3] for y in range(h))
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
images=[];textures=[]
def texture(name,base,normal=False):
 p=bytearray()
 for y in range(128):
  for x in range(128):
   r=random.random();grain=math.sin(x*1.7)*math.sin(y*2.1)
   c=(int(128+grain*8),int(128+math.sin(y*1.9)*7),253) if normal else tuple(max(0,min(255,int(v+(r-.5)*12+grain*3))) for v in base)
   p.extend(c)
 images.append({'name':name,'bufferView':buffer(png(p,128,128)),'mimeType':'image/png'});textures.append({'source':len(images)-1,'sampler':0});return len(textures)-1
skin=texture('Skin microtexture',(111,72,49));fabric=texture('Olive woven cotton',(93,103,61));denim=texture('Dark denim weave',(76,80,82));normal=texture('Embedded fine surface normal',(0,0,0),True)
materials=[]
def material(name,color,rough=.8,metal=0,tex=None,norm=True):
 p={'baseColorFactor':[*color,1],'metallicFactor':metal,'roughnessFactor':rough}
 if tex is not None:p['baseColorTexture']={'index':tex}
 m={'name':name,'pbrMetallicRoughness':p}
 if norm:m['normalTexture']={'index':normal,'scale':.22}
 materials.append(m);return len(materials)-1
S=material('Warm skin with embedded albedo',[1,1,1],.78,tex=skin);C=material('Olive shirt / woven texture',[1,1,1],.93,tex=fabric);P=material('Gray utility trousers',[1,1,1],.96,tex=denim);H=material('Dark brown modeled locs',[.028,.018,.012],.9);E=material('Eye whites',[.64,.58,.48],.45,norm=False);I=material('Brown irises',[.075,.035,.012],.36,norm=False);B=material('Pupil',[.012,.016,.019],.67,norm=False);L=material('Lip tone',[.20,.095,.065],.8);G=material('Brushed brass jewelry',[.55,.37,.13],.35,.75);F=material('Canvas strap',[.16,.18,.13],.9); BOOT=material('Weathered brown boots',[.16,.12,.075],.9); PACK=material('Olive tactical canvas',[.29,.32,.19],.94)
def ell(name,center,scale,mat,seg=12,rings=8):
 pos=[];nor=[];uv=[];ind=[]
 for j in range(rings+1):
  a=math.pi*j/rings
  for i in range(seg+1):
   b=2*math.pi*i/seg;v=(math.sin(a)*math.cos(b),math.cos(a),math.sin(a)*math.sin(b));pos.extend([v[k]*scale[k] for k in range(3)]);n=[v[k]/scale[k] for k in range(3)];d=math.sqrt(sum(x*x for x in n));nor.extend([x/d for x in n]);uv.extend((i/seg,1-j/rings))
 for j in range(rings):
  for i in range(seg):
   a=j*(seg+1)+i;b=a+seg+1;ind.extend((a,a+1,b,b,a+1,b+1))
 pack=lambda a:struct.pack('<'+'f'*len(a),*a)
 pa=attr(pack(pos),'VEC3',len(pos)//3,limits={'min':[-s for s in scale],'max':list(scale)});na=attr(pack(nor),'VEC3',len(nor)//3);ua=attr(pack(uv),'VEC2',len(uv)//2);ia=attr(struct.pack('<'+'H'*len(ind),*ind),'SCALAR',len(ind),5123)
 meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':pa,'NORMAL':na,'TEXCOORD_0':ua},'indices':ia,'material':mat}]});nodes.append({'name':name,'mesh':len(meshes)-1,'translation':list(center)});return len(nodes)-1
def limb(name,a,b,r,mat):
 mid=[(a[k]+b[k])/2 for k in range(3)];d=[b[k]-a[k] for k in range(3)];length=math.sqrt(sum(x*x for x in d));idx=ell(name,mid,(r,length/2+r*.2,r),mat,8,5);n=[x/length for x in d];q=[n[2],0,-n[0],1+n[1]];mag=math.sqrt(sum(x*x for x in q));nodes[idx]['rotation']=[x/mag for x in q] if mag>1e-8 else [1,0,0,0];return idx
# Feet planted at Y0, forward +Z. Height ~1.86m.
ell('Shirt torso',(0,1.19,0),(.245,.315,.14),C,16,10);ell('Trouser hips',(0,.89,0),(.20,.14,.135),P)
for s in [-1,1]:
 limb('Denim thigh',(s*.11,.9,0),(s*.12,.52,0),.102,P);limb('Denim calf',(s*.12,.5,0),(s*.12,.12,.015),.078,P);ell('Boot',(s*.12,.07,.058),(.088,.07,.16),BOOT)
 ell('Sleeve',(s*.25,1.37,0),(.108,.14,.105),C);limb('Upper arm',(s*.28,1.31,0),(s*.32,1.08,.012),.072,S);limb('Forearm',(s*.32,1.08,.012),(s*.33,.86,.04),.059,S);ell('Palm',(s*.33,.81,.045),(.055,.075,.032),S)
 for f in range(4):limb('Individual finger',(s*.33+(f-1.5)*.022,.79,.054),(s*.33+(f-1.5)*.022,.70+abs(f-1.5)*.012,.065),.012,S)
 limb('Thumb',(s*.30,.83,.055),(s*.275,.765,.085),.018,S)
 ell('Ear',(s*.118,1.655,.005),(.027,.048,.021),S);ell('Ear inner',(s*.134,1.655,.019),(.008,.028,.009),L)
 # eyelids, inset eyes, iris and pupil
 ell('Eye socket',(s*.047,1.693,.100),(.040,.021,.025),S);ell('Eye',(s*.047,1.693,.116),(.026,.012,.012),E);ell('Iris',(s*.047,1.693,.127),(.010,.010,.003),I,12,8);ell('Pupil',(s*.047,1.693,.13),(.005,.006,.002),B,10,6)
 ell('Brow',(s*.048,1.722,.108),(.036,.008,.012),H,12,8);ell('Cheekbone',(s*.066,1.65,.084),(.047,.035,.032),S)
 ell('Gold ear stud',(s*.132,1.629,.019),(.009,.01,.009),G,10,6)
ell('Neck',(0,1.49,0),(.073,.10,.068),S);ell('Head',(0,1.666,0),(.116,.158,.104),S,20,14);ell('Jaw',(0,1.578,.025),(.085,.065,.077),S);ell('Nose bridge',(0,1.675,.112),(.019,.045,.023),S);ell('Nose tip',(0,1.65,.139),(.026,.019,.024),S);ell('Upper lip',(0,1.61,.112),(.040,.009,.012),L);ell('Lower lip',(0,1.597,.115),(.036,.010,.013),L);ell('Beard chin',(0,1.552,.051),(.066,.028,.057),H)
for s in [-1,1]:limb('Beard jawline',(s*.085,1.59,.053),(s*.037,1.55,.10),.012,H)
ell('Hair scalp',(0,1.76,-.016),(.12,.085,.107),H,16,10)
# Individual segmented, gently irregular loc strands. Avoid front eyes/mouth.
for i in range(30):
 a=2*math.pi*i/30;back=math.cos(a);x=math.sin(a)*.108;z=math.cos(a)*.09-.015;start=1.79;length=.25+(i%6)*.035
 if z>.035:length=.13+(i%3)*.015
 prev=(x,start,z)
 for j in range(4):
  p=(x+math.sin(i*1.3+j)*.012,start-length*(j+1)/4,z+.013*math.sin(j+i))
  limb('Loc %02d segment %d'%(i,j),prev,p,.013,H);prev=p
# Clothing construction details, straps and jewelry
for side in [-1,1]:
 limb('Shirt hem seam',(side*.19,.99,.08),(side*.20,1.30,.09),.003,F)
# Pack sits behind torso (-Z), dual padded shoulder harness, pouches/radio.
ell('Tactical backpack',(0,1.18,-.21),(.20,.27,.115),PACK)
ell('Backpack lower pouch',(0,1.05,-.31),(.155,.10,.035),PACK)
ell('Backpack upper pouch',(0,1.31,-.30),(.14,.075,.035),PACK)
for side in [-1,1]:
 limb('Padded shoulder harness',(side*.16,1.46,.10),(side*.14,1.02,.135),.025,PACK)
 ell('Cargo side pocket',(side*.19,.68,.015),(.035,.095,.085),P)
 limb('Boot lace',(side*.12-.04,.10,.14),(side*.12+.04,.10,.14),.004,F)
 ell('Backpack side pouch',(side*.20,1.12,-.20),(.045,.115,.06),PACK)
ell('Radio body',(.17,1.34,.13),(.025,.06,.018),B)
limb('Radio antenna',(.17,1.38,.13),(.17,1.53,.13),.004,B)

for i in range(18):
 a=math.pi*(.12+i*.76/17);ell('Necklace link',(.095*math.cos(a),1.43-.067*math.sin(a),.134),(.006,.009,.005),G,8,6)
ell('Pendant',(0,1.346,.145),(.017,.025,.004),G,12,8)
# Head appears after eye meshes; depth test resolves the overlap.
gltf={'asset':{'version':'2.0','generator':'Original reference-inspired procedural character; stylized not photorealistic'},'scene':0,'scenes':[{'name':'Ronniebaby stylized original','nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':materials,'textures':textures,'images':images,'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access,'extras':{'license':'Original asset created for Level 29 owner. Not a photoreal scan.','orientation':'Y up, +Z forward, feet Y0','animations':'None. Static standing pose; not rigged.','textureInfo':'Embedded generated skin/cotton/denim albedo and fine normal texture','units':'meters'}}
j=json.dumps(gltf,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob+=b'\0'*((-len(blob))%4);total=12+8+len(j)+8+len(blob);result=struct.pack('<III',0x46546c67,2,total)+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob;(out/'ronniebaby.glb').write_bytes(result)
print(json.dumps({'bytes':len(result),'meshCount':len(meshes),'triangles':sum(a['count'] for a in access if a['componentType']==5123)//3,'embeddedImages':len(images)}))
