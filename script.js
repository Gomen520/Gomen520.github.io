var lineBreakRegex=/\r?\n/g;
var itemSeparatorRegex=/[\t ,]/g;
window.onload=function (){
  console.clear();
  dg('input').onkeydown=handlekey;
  dg('input').onfocus=handlekey;
  dg('input').onmousedown=handlekey;
  load();
  expandall();
}
function dg(s){
  return document.getElementById(s);
}
function displayMt(m){
  var index=[]
  for (var i=0;i<m.length;i++) index.push(0)
  mt+='<p></p><table>'
  while (true){
    var row=[]
    for (var i=0;i<m.length;i++) if (m[i].length>index[i]&&(row.length==0||compareRow(m[i][index[i]].row,row)<0)) row=m[i][index[i]].row
    if (row.length==0) break
    mt+='<tr>'
    mt+='<td align="center" width="80" bgColor="#eee0e0">'+row+'</td>'
    for (var i=0;i<m.length;i++){
      if (m[i].length>index[i]&&compareRow(m[i][index[i]].row,row)==0) mt+='<td align="center" width="80" bgColor="#e0eee0">'+m[i][index[i]++].value+'</td>'
      else mt+='<td align="center" width="80" bgColor="#e0eee0">'+''+'</td>'
    }
    mt+='</tr>'
  }
  mt+='</table>'
}
function isDimensionLimited(it,d){
  if (proc(d).length==1&&proc(d)[0]&&getFootRow(it,d)[1]>proc(d)[0]||d.length==2&&d[0]==0&&d[1]>0&&getFootRow(it,d).length>d[1]) return true
  return false
}
function proc(d){
  if (d.length>2&&d[0]==0&&d[1]>0&&divide(d).length>1) return [divide(d)[0].length-1]
  if (d.length>2&&d[0]==0&&d[1]>0&&divide(d).length==1&&divide(d)[0].length>2) return [divide(d)[0].length-2]
  return d
}
function rowGenerator(n){
  var row=[1]
  for (var i=1;i<n;i++) row.push(0)
  return row
}
function divide(d){
  var dd=d.slice(1),ret=[]
  for (var i=0;i<dd.length-1;i++) while (dd[i]-->0) ret.push(rowGenerator(dd.length-i))
  if (dd[dd.length-1]) ret.push([dd[dd.length-1]])
  return ret
}
function merge(d){
  var ret=rowGenerator(d[0].length)
  ret[0]-=1
  for (var i=0;i<d.length-1;i++) ret[ret.length-d[i].length]++
  ret[ret.length-d[d.length-1].length]+=d[d.length-1][0]
  ret.unshift(0)
  return ret
}
function compareRow(r1,r2){
  var i=0
  for (;i<r1.length&&i<r2.length;i++){
    if (r1[i]>r2[i]) return 1
    if (r1[i]<r2[i]) return -1
  }
  if (r1.length>i) return 1
  if (r2.length>i) return -1
  return 0
}
function compareDimension(r1,r2){
  return (r1.length<=1?1:r1[1])-(r2.length<=1?1:r2[1])
}
function rowAddition(r1,r2){
  if (r2.length<=1||r2[1]==1) return r1.concat(r2)
  if (r1.length<=1||r1[1]<r2[1]) return r2
  var i=1
  while (i++<r1.length) if (r1[i]<r2[1]) break
  return r1.slice(0,i).concat(r2.slice(1))
}
function rowDifference(r1,r2){
  if (compareRow(r1,r2)<=0) return []
  if (r1[1]==1) return r1.slice(0,r1.length-r2.length)
  var i=0
  for (;i<r1.length&&i<r2.length;i++) if (r1[i]>r2[i]) break
  if (r1[i]==1) return r1.slice(i)
  return [1].concat(r1.slice(i))
}
function getFootRow(it,d){
  var row=rowDifference(it.row,it.parent.row)
  if (row.length==0||d.length==0||d.length==1&&d[0]==0||d.length==2&&d[0]==0||d.length==3&&d[0]==0&&d[1]==1&&d[2]==0) return rowAddition(it.row,[1])
  if (row.length==1) return rowAddition(it.row,[1,2])
  return rowAddition(it.row,[1,row[1]+1])
}
function setElementRefrence(m){
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].row.length<=1&&m[i][j].value<=1) continue
      if (compareRow(m[i][j].row,m[i][j].parent.row)==0) m[i][j].ref=m[i][j].parent
      else if ('foot' in m[i][j].head.parent&&compareRow(m[i][j].head.parent.foot.row,m[i][j].row)<=0){
        m[i][j].ref=m[i][j].head.parent.foot
        while (compareRow(m[i][j].ref.row,m[i][j].row)==0) m[i][j].ref=m[i][j].ref.ref
      }
      else m[i][j].ref=m[i][j].head.parent
    }
  }
}
function setElementNo(m,b){
  var id=0
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (i==b.cloumn) m[i][j].no=j+1
      else if (i<b.cloumn||(m[i][j].value<=1&&j==0)) m[i][j].no=0
      else m[i][j].no=m[i][j].ref.no
      if (i>b.cloumn) m[i][j].id=id++
      if (i==b.cloumn||i==m.length-1) m[i][j].id=m[i][j].no
    }
  }
}
function getReferenceChain(it){
  var c=[]
  while (true){
    c.unshift(it)
    if (it.value<=1&&it.row.length==1) break
    it=it.ref
  }
  return c
}
function drawMountain(s,d){
  var m=[]
  s.forEach(e=>{m.push([{value:e.value,row:[1],cloumn:e.cloumn,idx:0,parent:e.parent.cloumn<0?{row:[1],cloumn:-1}:m[e.parent.cloumn][0]}])})
  for (var i=0;i<m.length;i++){
    var it=m[i][0]
    while (it.value>1){
      if (isDimensionLimited(it,d)) break
      it.foot={value:it.value-it.parent.value,row:getFootRow(it,d),cloumn:i,idx:it.idx+1,head:it}
      m[i].push(it.foot)
      var p=it.parent
      if ('foot' in p&&compareRow(p.foot.row,it.foot.row)<=0) p=p.foot
      while (p.value>=it.foot.value) p=p.parent
      it.foot.parent=p
      it=it.foot
    }
  }
  return m
}
function getOds(m){
  var o=[]
  m.forEach(e=>{o.push({value:e[e.length-1].value,cloumn:e[0].cloumn,parent:e[e.length-1].value<=1?{row:[1],cloumn:-1}:o[e[e.length-1].parent.cloumn]})})
  return o
}
function getMds(m){
  var seq=getReferenceChain(m[m.length-1][m[m.length-1].length-1]).map(e=>{return e.row.length<=1?1:e.row[1]})
  return toSequence(seq)
}
function getBootIndex(s,d){
  var m=drawMountain(s,d)
  setElementRefrence(m)
  var t=m[m.length-1][m[m.length-1].length-1]
  if (t.value==1) t=t.head
  var b=t.parent
  if (t.value-b.value>1&&proc(d).length==1){
    var o=getOds(m)
    var c=getBootIndex(o,d.length==1||divide(d).length==1?d:merge(divide(d).slice(1)))[0]
    return [c,m[c].length-1]
  }
  if (compareDimension(b.row,t.row)<0){
    var ch=getReferenceChain(t),dd=[0,1]
    if (d.length>2&&d[0]==0&&d[1]==0) dd=d.slice(2)
    if (d.length==3&&d[0]==1&&d[1]==0&&d[2]==1) dd=d
    var c=ch[getBootIndex(getMds(m),dd)[0]].cloumn
    return [c,m[c][m[c].length-1].idx]
  }
  return [b.cloumn,b.idx]
}
function copyElement(m,b,t,it,op,i,d){
  if (it.value<=1&&it.row.length>1){
    var p=it.head.parent
    if ('foot' in p&&compareRow(p.foot.row,it.row)<=0) p=p.foot
    while (p.value>1) p=p.parent
    it.parent=p
  }
  var min_row=it.row.length>1?getFootRow(op[op.length-1],d):[1],max_row=it.row
  if (it.no>0){
    var c=it.ref.cloumn+(t.cloumn-b.cloumn)*(i+1)
    var r=m[c][0]
    while ('foot' in r&&r.foot.id<=it.ref.id) r=r.foot
    if ('offset' in it) max_row=rowAddition(r.row,it.offset[i])
    else max_row=rowAddition(r.row,rowDifference(it.row,it.ref.row))
  }
  if (d.length==0||d.length==1&&d[0]==0||d.length==2&&d[0]==0||d.length==3&&d[0]==0&&d[1]==1&&d[2]==0) max_row=it.row
  if (compareRow(min_row,max_row)>0) alert('collapsed!')
  var row=min_row
  while (compareRow(row,max_row)<=0){
    op.push({value:it.value,row:row,cloumn:m.length-1,idx:op.length,no:it.no,id:it.id})
    if (op.length>1){
      op[op.length-1].head=op[op.length-2]
      op[op.length-2].foot=op[op.length-1]
    }
    var pc=it.parent.cloumn>=b.cloumn?m.length-1+it.parent.cloumn-it.cloumn:it.parent.cloumn
    var p=pc>=0?m[pc][m[pc].length-1]:{row:[1],cloumn:-1}
    while (compareRow(p.row,row)>0) p=p.head
    op[op.length-1].parent=p
    row=getFootRow(op[op.length-1],d)
  }
}
function copyCloumn(m,b,t,c,i,ex,d){
  var it=m[c][0]
  m.push([])
  while (true){
    copyElement(m,b,t,it,m[m.length-1],i,d)
    if ('foot' in it) it=it.foot
    else break
  }
  m[m.length-1][m[m.length-1].length-1].value=ex.length?ex[m.length-1]:it.value
  it=m[m.length-1][m[m.length-1].length-1]
  while ('head' in it){
    it.head.value=it.value+it.head.parent.value
    it=it.head
  }
}
function expandDimensionSequnece(m,b,t,n,d){
  if (compareDimension(b.row,t.row)>=0) return
  var dd=[0,1]
  if (d.length>2&&d[0]==0&&d[1]==0) dd=d.slice(2)
  if (d.length==3&&d[0]==1&&d[1]==0&&d[2]==1) dd=d
  var s=getMds(m),c=getBootIndex(s,dd)[0]
  for (var i=b.cloumn+1;i<=t.cloumn;i++){
    for (var j=0;j<m[i].length;j++){
      if (i==t.cloumn&&j==m[t.cloumn].length-1) return
      var it=m[i][j],ds=s.slice(),pos=1
      if (it.no!=b.no||compareDimension(rowDifference(it.row,it.ref.row),b.row)<=0) continue
      ds.splice(c+1,0,{value:rowDifference(it.row,it.ref.row).length<2?1:rowDifference(it.row,it.ref.row)[1],parent:ds[c]})
      while (it.ref.cloumn>b.cloumn){
        it=it.ref
        if (compareDimension(rowDifference(it.row,it.ref.row),b.row)<=0) break
        ds.splice(c+1,0,{value:rowDifference(it.row,it.ref.row).length<2?1:rowDifference(it.row,it.ref.row)[1],parent:ds[c]})
        ds[c+2].parent=ds[c+1]
        pos++
      }
      for (var k=0;k<ds.length;k++){
        ds[k].cloumn=k
        while (ds[k].value<=ds[k].parent.value) ds[k].parent=ds[k].parent.parent
      }
      var len=ds.length-1-c
      var ex=expand(ds,n,dd,inputm)
      it=m[i][j]
      it.offset=[]
      for (var ii=0;ii<n;ii++){
        it.offset.push([1,ex[c+len*(ii+1)+pos]])
      }
    }
  }
}
function expand(s,n,d,f=true){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var idx=getBootIndex(s,d),m=drawMountain(s,d),b=m[idx[0]][idx[1]],t=m[m.length-1][m[m.length-1].length-1],ex=[]
  if (t.value==1) t=t.head
  if (f) displayMt(m)
  setElementRefrence(m)
  setElementNo(m,b)
  expandDimensionSequnece(m,b,t,n,d)
  if (t.value-b.value>1&&proc(d).length==1){
    var o=getOds(m)
    ex=expand(o,n,d.length==1||divide(d).length==1?d:merge(divide(d).slice(1)),f)
  }
  else if ('foot' in t){
    m[m.length-1].pop()
    delete t.foot
    t.parent=t.parent.parent
  }
  for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
  for (var i=b.no;i<m[b.cloumn].length;i++){
    var idx=t.idx
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,idx:idx++,no:m[b.cloumn][i].no,id:m[b.cloumn][i].no,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i]})
    m[t.cloumn][m[t.cloumn].length-2].foot=m[t.cloumn][m[t.cloumn].length-1]
  }
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      copyCloumn(m,b,t,j,i,ex,d)
    }
  }
  if (f) displayMt(m)
  return m.map(e=>{return e[0].value})
}
function toSequence(s){
  var seq=[]
  for (var i=0;i<s.length;i++){
    if (s[i]<=1) {seq.push({value:s[i],cloumn:i,parent:{row:[1],cloumn:-1}});continue}
    for (var j=i-1;j>=0;j--) if (s[j]<s[i]) {seq.push({value:s[i],cloumn:i,parent:seq[j]});break}
  }
  return seq
}
//Limited to n<=10
function expandmultilimited(s,nstring,dstring,){
  var result=s;
  for (var i of nstring.split(",")) result=expand(toSequence(result.split(itemSeparatorRegex).map(e=>{return Number(e)})),Math.min(i,10),dstring.split(itemSeparatorRegex).map(e=>{return Number(e)})).toString();
  return result;
}
var input="";
var inputn="3";
var inputd="0";
var inputm="true";
var mt="";
function expandall(){
  if (input==dg("input").value&&inputn==dg("inputn").value&&inputd==dg("inputd").value&&inputm==dg("inputm").checked) return;
  input=dg("input").value;
  inputn=dg("inputn").value;
  inputd=dg("inputd").value;
  inputm=dg("inputm").checked;
  mt="";
  dg("output").value=input.split(lineBreakRegex).map(e=>expandmultilimited(e,inputn,inputd)).join("\n");
  dg("mt").innerHTML=mt
}
window.onpopstate=function (e){
  load();
  expandall();
}
function load(){}
var handlekey=function(e){
  //setTimeout(expandall,0,true);
}
//console.log=function (s){alert(s)};
window.onerror=function (e,s,l,c,o){alert(JSON.stringify(e+"\n"+s+":"+l+":"+c+"\n"+o.stack))}