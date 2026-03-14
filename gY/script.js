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
function compareRow(r1,r2,idx=-1){
  var i=0
  for (;i<r1.length&&i<r2.length;i++){
    if (i==idx&&r1[i]==r2[i]) return 0
    if (r1[i]>r2[i]) return 1
    if (r1[i]<r2[i]) return -1
  }
  if (r1.length>i) return 1
  if (r2.length>i) return -1
  return 0
}
function rowConcat2(r1,r2){
  var rows=[[1]]
  for (var i=1;i<r1.length;i++){
    if (r1[i]<=r1[i-1]) rows.push([])
    rows[rows.length-1].push(r1[i])
  }
  for (var i=1;i<rows.length;i++) if (compareRow(rows[i],r2)<0&&rows[i][0]<=rows[i-1][0]) break
  rows=rows.slice(0,i).concat(r2)
  var row=[]
  for (var i=0;i<rows.length;i++){
    row=row.concat(rows[i])
  }
  return row
}
function rowOffset(r1,r2){
  var row1=[[1]],row2=[[1]]
  for (var i=1;i<r1.length;i++){
    if (r1[i]<=r1[i-1]) row1.push([])
    row1[row1.length-1].push(r1[i])
  }
  for (var i=1;i<r2.length;i++){
    if (r2[i]<=r2[i-1]) row2.push([])
    row2[row2.length-1].push(r2[i])
  }
  var i=0
  for (;i<row2.length;i++){
    if (compareRow(row1[i],row2[i])>0) break
  }
  row1=row1.slice(i,row1.length)
  var ii=0
  if (i==0) {for (;ii<r2.length;ii++) if (r1[ii]>r2[ii]) break
  return r1.slice(ii)}
  var row=[]
  for (var i=0;i<row1.length;i++){
    row=row.concat(row1[i])
  }
  return row
}
function getFootRow(it,d){
  if (compareRow(it.row,it.parent.row)==0) return it.row.concat(1)
  var row=[1,it.row[1]+1],i=1,len=it.row.length-rowOffset(it.row,it.parent).length+1
  while (true){
    var ex=expand(toSequence(row),i,d,false).slice(0,-1)
    var c=compareRow(ex,it.row)
    if (c==0||c<0&&compareRow(it.parent.row,ex)<0) return row
    if (c<0) i++
    else {
      if (compareRow(ex,it.row,it.row.length-1)==0) return ex.slice(0,it.row.length+1)
      for (var j=1;j<ex.length&&j<it.row.length;j++) if (ex[j]>it.row[j]) break
      row=ex.slice(0,j).concat(it.row[j]+1)
      i=1
    }
  }
}
function setElementRefrence(m){
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].row.length<=1&&m[i][j].value<=1) continue
      if (compareRow(m[i][j].row,m[i][j].parent.row)==0) m[i][j].ref=m[i][j].parent
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
function copyElement(m,b,t,it,op,i,d){
  if (it.value<=1&&it.row.length>1){
    it.parent=it.ref
    while (it.parent.value>1) it.parent=it.parent.ref
  }
  var min_row=it.row.length>1?getFootRow(op[op.length-1],d):[1],max_row=it.row
  if (it.no>0){
    var c=it.ref.cloumn+(t.cloumn-b.cloumn)*(i+1)
    var r=m[c][0]
    while ('foot' in r&&r.foot.id<=it.ref.id) r=r.foot
    if ('offsets' in it) max_row=rowConcat(r.row,it.offsets)
    if ('offset' in it) max_row=rowConcat(r.row,it.offset[i])
  }
  if (compareRow(it.row,irow)==0) console.log(r.row,it.offsets,it.offset,max_row)
  if (d.length==0||d.length==1&&d[0]==0||d.length==2&&d[0]==0||d.length==3&&d[0]==0&&d[1]==1&&d[2]==0) max_row=it.row
  if (compareRow(min_row,max_row)>0) console.log(it.cloumn,it.idx,it.value,min_row,max_row)
  var row=min_row
  while (compareRow(row,max_row)<=0){
    op.push({value:it.value,row:row,cloumn:m.length-1,idx:op.length,no:it.no,id:it.id})
    if (op.length>1){
      op[op.length-1].head=op[op.length-2]
      op[op.length-2].foot=op[op.length-1]
    }
    var ppc=t.parent.cloumn>=b.cloumn?t.parent.cloumn+(t.cloumn-b.cloumn)*(i+1):t.parent.cloumn
    var pc=it.parent.cloumn>=b.cloumn?m.length-1+it.parent.cloumn-it.cloumn:it.parent.cloumn
    if (it.parent.cloumn>=t.parent.cloumn&&it.parent.cloumn<b.cloumn) pc=ppc+it.parent.cloumn-t.parent.cloumn
    var p=pc>=0?m[pc][m[pc].length-1]:{row:[1],cloumn:-1}
    while (compareRow(p.row,row)>0) p=p.head
    op[op.length-1].parent=p
    row=getFootRow(op[op.length-1],d)
  }
}
function copyCloumn(m,b,t,c,i,ex,d,f){
  var it=m[c][0]
  m.push([])
  while (true){
    copyElement(m,b,t,it,m[m.length-1],i,d)
    if ('foot' in it) it=it.foot
    else break
  }
  //if (f) displayMt(m)
  m[m.length-1][m[m.length-1].length-1].value=ex.length?ex[m.length-1]:it.value
  it=m[m.length-1][m[m.length-1].length-1]
  while ('head' in it){
    it.head.value=it.value+it.head.parent.value
    it=it.head
  }
}
function getTopElement(m,b,t,it){
  var top=m[t.cloumn][m[t.cloumn].length-1]
  while (top.no>it.no) top=top.head
  return top
}
function expandDimensionSequnece(m,b,t,n,d){
  if (n<=0) return
  for (var i=b.cloumn+1;i<=t.cloumn;i++){
    for (var j=0;j<m[i].length;j++){
      var it=m[i][j]
      if (it.no<=0) continue
      var offset=rowOffset(it.row,it.ref.row)
      if (offset.length==0||offset[0]==0) {it.offsets=offset;continue}

      var top=getTopElement(m,b,t,it),fr=top.foot==undefined?getFootRow(top,d):top.foot.row
      var seq=toSequence(it.row),ss=toSequence(fr)
      var p=it.parent
      it.parent=it.head.parent
      var ifr=it.foot==undefined?getFootRow(it,d):it.foot.row
      it.parent=p
      if (compareRow(ifr,fr)>0) continue
      if (compareRow(it.row,fr,ss[ss.length-1].parent.cloumn)<0){it.offsets=offset;continue}

      it.offset=[]
      seq.push({value:fr[fr.length-1],cloumn:seq.length,parent:seq[ss[ss.length-1].parent.cloumn]})
      var ex=expand(seq,n,d,false),len=(ex.length-seq.length)/n,ie=it.row.length,is=ie-offset.length

      for (var k=1;k<=n;k++){
        it.offset.push(ex.slice(is+len*k,ie+len*k))
      }
      if (compareRow(it.row,irow)==0) console.log(seq.map(e=>{return e.value}),ex,it.offset)
    }
  }
  return
}
function rowConcat(r1,r2){
  var row=[],rows=[[r1[0]]]
  var i=1
  for (;i<r1.length;i++){
    if (r1[i]>r1[i-1]||r1[i]>r2[0]) rows[0].push(r1[i])
    else break
  }
  //console.log(rows)
  if (i<r1.length) rows.push([r1[i++]])
  for (;i<r1.length;i++){
    if (r1[i]<=r1[i-1]&&r1[i]<=r2[0]) rows.push([])
    rows[rows.length-1].push(r1[i])
  }
  var rr=[r2[0]]
  for (var i=1;i<r2.length;i++){
    if (r2[i]<=r2[0]) break
    rr.push(r2[i])
  }
  //console.log(rows,rr)
  i=1
  if (r2[0]==1) i=0
  for (;i<rows.length;i++){
    if ((i==0||rows[i][0]<=rows[i-1][0]||rows[i][0]==rows[i-1][rows[i-1].length-1])&&compareRow(rows[i],rr)<0) break
  }
  var rr2=r2.slice(),ro2=rows.slice(0,i)
  if (i>0&&ro2[ro2.length-1][ro2[ro2.length-1].length-1]==rr[0]&&rr.length>1) rr2.shift()
  rows=rows.slice(0,i).concat([rr2])
  for (i=0;i<rows.length;i++){
    row=row.concat(rows[i])
  }
  //console.log(row)
  return row
}
function test(){
  log([1,2,2,1,2,2,1,2,2],[2])
  log([1,2,2,1,2,2,1,2,2,1],[2])
  log([1,2,1],[1,2])
  return
  log([1,2,2,2,2],[2,3])
  log([1,2,1],[1])
  log([1,2,1],[1,1])
  log([1,2,1],[1,2])
  log([1,2,1],[1,2,1])
  log([1,2,1],[1,2,1,2])
  log([1,2,1],[1,2,2])
  log([1,2,3,4,4],[5])
  log([1,3,2,5,4,9],[8,17])
  log([1,2,4,3,5],[4,6])
  log([1,2,2,1],[1,2])
  log([1,2,2],[1,2])
  log([1,3,2],[2])
  log([1,3,2],[2,2])
  log([1,3,2],[2,4])
  log([1,3,2],[4])
  log([1,2,1,2],[2])
}
function log(r1,r2){
  console.log(r1,r2,rowConcat(r1,r2))
}
function expand(s,n,d,f=true){
  //if (f) console.log(rowConcat([1,3,2],[4]))
  //if (f) console.log(rowOffset([1,2,2],[1,2]))
  //if (f) test();return [1,2]
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=drawMountain(s,d),t=m[m.length-1][m[m.length-1].length-1],ex=[]
  //if (f) console.log(m)
  if (t.value==1) t=t.head
  var b=t.parent
  if (f) displayMt(m)
  setElementRefrence(m)
  setElementNo(m,b)
  //expandDimensionSequnece(m,b,t,n,d)
  if (t.value-b.value>1&&proc(d).length==1){
    var o=getOds(m)
    ex=expand(o,n,d.length==1||divide(d).length==1?d:merge(divide(d).slice(1)),f)
  }
  else if ('foot' in t){
    m[m.length-1].pop()
    delete t.foot
    expandDimensionSequnece(m,b,t,n,d)
    t.parent=t.parent.parent
  }
  for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
  for (var i=b.no;i<m[b.cloumn].length;i++){
    var idx=t.idx
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,idx:++idx,no:m[b.cloumn][i].no,id:m[b.cloumn][i].no,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i].ref})
    m[t.cloumn][m[t.cloumn].length-2].foot=m[t.cloumn][m[t.cloumn].length-1]
  }
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      copyCloumn(m,b,t,j,i,ex,d,f)
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
var mt="";
var irow=[1,9];
function expandall(){
  if (input==dg("input").value&&inputn==dg("inputn").value&&inputd==dg("inputd").value) return;
  input=dg("input").value;
  inputn=dg("inputn").value;
  inputd=dg("inputd").value;
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