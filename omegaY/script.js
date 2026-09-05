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
function drawMountain(s,d){
  var m=[]
  s.forEach(e=>{m.push([{value:e.value,row:[1],cloumn:e.cloumn,idx:0,ref_idx:0,parent:e.parent.cloumn<0?{row:[1],cloumn:-1}:m[e.parent.cloumn][0],ref:e.ref.cloumn<0?{row:[1],cloumn:-1}:m[e.ref.cloumn][0]}])})
  for (var i=0;i<m.length;i++){
    var it=m[i][0]
    while (it.value>1){
      it.foot={value:it.value-it.parent.value,row:getFootRow(it,d),cloumn:i,idx:it.idx+1,ref_idx:it.idx+1,head:it}
      m[i].push(it.foot)
      var p=it.ref
      if ('foot' in p&&compareRow(p.foot.row,it.foot.row)<=0) p=p.foot
      while (p.value>it.foot.value) p=p.ref
      it.foot.ref=p
      while (p.value>=it.foot.value) p=p.parent
      it.foot.parent=p
      it=it.foot
    }
  }
  return m
}
function copyElement(m,b,t,it,op,i,d){
  var min_row=it.row.length>1?getFootRow(op[op.length-1],d):[1],max_row=it.row
  var c=it.ref.cloumn<b.cloumn?it.ref.cloumn:it.ref.cloumn+(t.cloumn-b.cloumn)*(i+1)
  var r=m[c][0]
  while ('foot' in r&&r.foot.ref_idx<=it.ref.idx) r=r.foot
  max_row=rowAddition(r.row,rowDifference(it.row,it.ref.row))
  var row=min_row
  while (compareRow(row,max_row)<=0){
    op.push({value:it.value,row:row,cloumn:m.length-1,idx:op.length,ref_idx:it.ref_idx})
    if (op.length>1){
      op[op.length-1].head=op[op.length-2]
      op[op.length-2].foot=op[op.length-1]
    }
    var pc=it.parent.cloumn
    if (it.parent.cloumn>=b.cloumn) pc=it.parent.cloumn+(t.cloumn-b.cloumn)*(i+1)
    else if (it.ref.cloumn>=b.cloumn&&it.cloumn<t.cloumn&&it.ref.value<=it.value) pc=it.cloumn+(t.cloumn-b.cloumn)*i
    var p=pc>=0?m[pc][m[pc].length-1]:{row:[1],cloumn:-1}
    while (compareRow(p.row,row)>0) p=p.head
    op[op.length-1].parent=p
    row=getFootRow(op[op.length-1],d)
  }
}
function copyCloumn(m,b,t,c,i,d){
  var it=m[c][0]
  m.push([])
  while (true){
    copyElement(m,b,t,it,m[m.length-1],i,d)
    if ('foot' in it) it=it.foot
    else break
  }
  m[m.length-1][m[m.length-1].length-1].value=it.value
  it=m[m.length-1][m[m.length-1].length-1]
  while ('head' in it){
    it.head.value=it.value+it.head.parent.value
    it=it.head
  }
}
function expand(s,n,d){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=drawMountain(s,d),t=m[m.length-1][m[m.length-1].length-2],b=t.parent
  displayMt(m)
  if ('foot' in t){
    m[m.length-1].pop()
    delete t.foot
    t.parent=b.parent
  }
  for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
  for (var i=b.idx+1;i<m[b.cloumn].length;i++){
    var idx=t.idx
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,idx:++idx,ref_idx:m[b.cloumn][i].idx,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i].ref})
    m[t.cloumn][m[t.cloumn].length-2].foot=m[t.cloumn][m[t.cloumn].length-1]
  }
  for (var i=0;i<m[m.length-1].length;i++){
    for (var j=0;j<m[b.cloumn].length;j++){
      if (compareRow(m[b.cloumn][j].row,m[t.cloumn][i].row)>0) break
      m[t.cloumn][i].ref_idx=m[b.cloumn][j].idx
    }
  }
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      copyCloumn(m,b,t,j,i,d)
    }
  }
  displayMt(m)
  return m.map(e=>{return e[0].value})
}
function toSequence(s){
  var seq=[]
  for (var i=0;i<s.length;i++){
    if (s[i]<=1) {seq.push({value:s[i],cloumn:i,parent:{row:[1],cloumn:-1},ref:{row:[1],cloumn:-1}});continue}
    for (var j=i-1;j>=0;j--) if (s[j]<s[i]) {seq.push({value:s[i],cloumn:i,parent:seq[j],ref:seq[j]});break}
  }
  return seq
}
//Limited to n<=10
function expandmultilimited(s,nstring,d){
  var result=s;
  for (var i of nstring.split(",")) result=expand(toSequence(result.split(itemSeparatorRegex).map(e=>{return Number(e)})),Math.min(i,10),d,true).toString();
  return result;
}
var input="";
var inputn="3";
var inputd="1,2,4"
var mt=""
function expandall(){
  if (input==dg("input").value&&inputn==dg("inputn").value) return;
  input=dg("input").value;
  inputn=dg("inputn").value;
  mt=""
  dg("output").value=input.split(lineBreakRegex).map(e=>expandmultilimited(e,inputn,inputd)).join("\n");
  dg("mt").innerHTML=mt
}
window.onpopstate=function (e){
  load();
  expandall();
}
function load(){
}
var handlekey=function(e){
  setTimeout(expandall,0,true);
}
window.onerror=function (e,s,l,c,o){alert(JSON.stringify(e+"\n"+s+":"+l+":"+c+"\n"+o.stack))}