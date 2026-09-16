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
  dg("mt").innerHTML=mt
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
function rowAddition(r1,r2){
  if (r2.length<=1||r2[1]==1) return r1.concat(r2)
  var row=r1.slice()
  while (row[row.length-1]==1) row.pop()
  return row.concat(r2)
}
function rowDifference(r1,r2){
  var i=0
  for (;i<r1.length;i++) if (r1[i]<r2[i]) break
  return r2.slice(i)
}
function getFootRow(it,d){
  if (compareRow(it.row,it.parent.row)==0) return it.row.concat(1)
  var row=[1,it.row[1]+1],i=1
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
      if (m[i][j].row.length<=1&&m[i][j].value<=1){m[i][j].ref={row:[1],cloumn:-1};continue}
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
function drawMountain(s,d){
  var m=[]
  s.forEach(e=>{m.push([{value:e.value,row:[1],cloumn:e.cloumn,idx:0,parent:e.parent.cloumn<0?{row:[1],cloumn:-1}:m[e.parent.cloumn][0]}])})
  for (var i=0;i<m.length;i++){
    var it=m[i][0]
    while (it.value>1){
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
function copyElement(m,b,t,it,op,i,d,f){
  var pt=it.parent
  if (it.ref.value==it.value) it.parent=it.ref
  var min_row=it.row.length>1?getFootRow(op[op.length-1],d):[1],max_row=it.row
  var tp=getTpElement(m,t,it.no)
  if (tp.no>it.no) tp=tp.head
  if ('max_row' in it) max_row=it.max_row
  else if ('offset' in it||tp.br.cloumn==t.cloumn||it.bs>0){
    var c=it.ref.cloumn+(t.cloumn-b.cloumn)*(i+1)
    var r=m[c][0]
    while ('foot' in r&&r.foot.id<=it.ref.id) r=r.foot
    if ('offset' in it) max_row=rowAddition(r.row,it.offset)
    else max_row=r.row.concat(it.offsets[i])
  }
  else {
    if (compareRow(it.offsets[0],rowDifference(tp.br.row,tp.row))<=0) {var c=t.cloumn+(t.cloumn-b.cloumn)*i;var rid=tp.id}
    else {var c=tp.br.cloumn+(t.cloumn-b.cloumn)*(i+1);var rid=tp.br.id}
    var r=m[c][0]
    while ('foot' in r&&r.foot.id<=rid) r=r.foot
    max_row=r.row.concat(it.offsets[i])
  }
  if (compareRow(min_row,max_row)>0) console.log(it.cloumn,it.idx,it.value,min_row,max_row)
  var row=min_row
  while (compareRow(row,max_row)<=0){
    if (compareRow(row,max_row,row.length-1)==0) it.parent=pt
    op.push({value:it.value,row:row,cloumn:m.length-1,idx:op.length,no:it.no,id:it.id})
    //if (f) displayMt(m)
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
function copyCloumn(m,b,t,c,i,ex,d,f){
  var it=m[c][0]
  m.push([])
  while (true){
    copyElement(m,b,t,it,m[m.length-1],i,d,f)
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
function getTpElement(m,t,no){
  var tp=m[t.cloumn][0]
  while (tp.no<=no&&'foot' in tp) tp=tp.foot
  return tp
}
function getBootIndex(s,d){
  var m=drawMountain(s,d)
  if (m[m.length-1].length<2) return -1
  return m[m.length-1][m[m.length-1].length-2].parent.cloumn
}
function expandDimensionSequnece(m,b,t,n,d){
  if (n<=0) return
  for (var i=0;i<=b.idx;i++) {m[b.cloumn][i].bs=0;m[b.cloumn][i].br=m[b.cloumn][i]}
  for (var i=b.cloumn+1;i<=t.cloumn;i++){
    for (var j=0;j<m[i].length;j++){
      var it=m[i][j],tp=getTpElement(m,t,it.no)
      if (it.no<0) {it.bs=0;it.br=it;continue}
      if (tp.ex==undefined){
        tp.ex=expand(toSequence(tp.row),n,d,false)
        tp.n=n
      }
      while (compareRow(tp.row,it.row)>0&&tp.row[tp.row.length-1]>1&&compareRow(tp.ex,it.row)<0) tp.ex=expand(toSequence(tp.row),++tp.n,d,false)
      var idx=getBootIndex(toSequence(tp.row),d)
      if (compareRow(it.row,tp.ex,it.row.length-1)==0&&(tp.ex.length-1-it.row.length)%(tp.row.length-1-idx)==0) {it.bs=it.ref.bs+1;it.br=it}
      else if ('ref' in it){it.bs=it.ref.bs;it.br=it.ref.br}
      else {it.bs=0;it.br=it}
    }
  }
  for (var i=b.cloumn+1;i<=t.cloumn;i++){
    for (var j=0;j<m[i].length;j++){
      var it=m[i][j]
      if (it.no<=0) {it.max_row=it.row;continue}
      if (compareRow(rowDifference(it.ref.row,it.row),[2])<0) {it.offset=rowDifference(it.ref.row,it.row);continue}
      var tp=getTpElement(m,t,it.no)
      if (compareRow(it.row,tp.row)>=0) {it.max_row=it.row;continue}
      if (tp.n<it.bs+tp.head.bs*n) {tp.n=it.bs+tp.head.bs*n;tp.ex=expand(toSequence(tp.row),tp.n,d,false)}
      if (compareRow(it.row,tp.ex,it.row.length-1)==0&&compareRow(it.row,it.ref.row)>0) {it.max_row=tp.ex;continue}
      var is=toSequence(it.row),ts=toSequence(tp.row),idx=getBootIndex(ts,d)
      if (compareRow(it.row,tp.row.slice(0,idx+1))<=0) {it.offset=rowDifference(it.ref.row,it.row);continue}
      ts[idx+1].parent=is[idx]
      ts[idx+1].ref=is[idx]
      var seq=is.concat(ts.slice(idx+1))
      for (var k=0;k<seq.length;k++) seq[k].cloumn=k

      var ex=expand(seq,n*(tp.head.bs)+it.bs,d,false)
      it.offsets=[]
      var si=it.bs>0||tp.head.br.cloumn==t.cloumn?it.ref.row.length:b.row.length
      for (var k=1;k<=n;k++){
        it.offsets.push(ex.slice(si+k*(seq.length-1-idx),is.length+k*(seq.length-1-idx)))
      }
    }
  }
  return
}
function expand(s,n,d,f=true){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=drawMountain(s,d),t=m[m.length-1][m[m.length-1].length-1],ex=[]
  if (t.value==1) t=t.head
  var b=t.parent
  if (f) displayMt(m)
  setElementRefrence(m)
  setElementNo(m,b)
  expandDimensionSequnece(m,b,t,n,d)
  if ('foot' in t){
    m[m.length-1].pop()
    delete t.foot
    t.parent=t.parent.parent
  }
  for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
  for (var i=b.no;i<m[b.cloumn].length;i++){
    var idx=t.idx
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,max_row:m[b.cloumn][i].row,idx:++idx,no:m[b.cloumn][i].no,id:m[b.cloumn][i].no,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i]})
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