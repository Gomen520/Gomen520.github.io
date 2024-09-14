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
    mt+='<td align="center" width="80" bgColor="#eee0e0">'+row.slice(0,10)+'</td>'
    for (var i=0;i<m.length;i++){
      if (m[i].length>index[i]&&compareRow(m[i][index[i]].row,row)==0) mt+='<td align="center" width="80" bgColor="#e0eee0">'+m[i][index[i]++].value+'</td>'
      else mt+='<td align="center" width="80" bgColor="#e0eee0">'+''+'</td>'
    }
    mt+='</tr>'
  }
  mt+='</table>'
}
function isDimensionLimited(it,d){ // n-Y
  if (d.length==1&&it.row.length==d[0]&&(it.parent.row.length<d[0]||it.row[0]>it.parent.row[0])) return true
  return false
}
function compareRow(r1,r2){
  if (r1.length<r2.length) return -1
  if (r1.length>r2.length) return 1
  for (var k=0;k<r1.length;k++){
    if (r1[k]<r2[k]) return -1
    if (r1[k]>r2[k]) return 1
  }
  return 0
}
function rowAddition(r1,r2){
  if (r1.length<r2.length) return r2
  if (r2.length==0) return r1
  var f=r1.slice(0,r1.length-r2.length),b=r2.slice()
  b[0]+=r1[r1.length-r2.length]
  return f.concat(b)
}
function rowDifference(r1,r2){
  if (r1.length>r2.length) return r1
  if (compareRow(r1,r2)<=0) return []
  var i=0,row=[]
  while (r1[i]==r2[i]) i++
  row.push(r1[i]-r2[i])
  for (++i;i<r1.length;i++) row.push(r1[i])
  return row
}
function calcFootRow(it,d){
  var row=[1],diff=rowDifference(it.row,it.parent.row).length
  if (compareRow(d,[0])>0) while (diff--) row.push(0)
  return rowAddition(it.row,row)
}
function getParentCloumn(s,e){
  for (var i=0;i<s.length;i++) if (s[i].cloumn==e.parent.cloumn) return i
}
function drawMountain(s,d){
  var m=[]
  s.forEach(e=>{m.push([{value:e.value,row:[0],cloumn:e.cloumn,parent:e.value<=1?{row:[0],cloumn:-1}:m[getParentCloumn(s,e)][0]}])})
  for (var i=0;i<m.length;i++){
    var it=m[i][0]
    while (it.value>1){
      if (isDimensionLimited(it,d)) break
      it.foot={value:it.value-it.parent.value,row:calcFootRow(it,d),cloumn:it.cloumn,head:it}
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
function setElementRefrence(m){
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (compareRow(m[i][j].row,[0])==0&&m[i][j].value==1) continue
      if (compareRow(m[i][j].row,m[i][j].parent.row)==0) m[i][j].ref=m[i][j].parent
      else m[i][j].ref=m[i][j].head.parent
      if (m[i][j].ref.value==1) continue
      m[i][j].ref=m[i][j].ref.ref
    }
  }
}
function copyElement(op,head,max_row,d){
  while (true){
    var row=calcFootRow(head,d)
    if (compareRow(row,max_row)>0) return
    head.foot={value:head.value,row:row,cloumn:head.cloumn,no:head.no,head:head,parent:head.parent}
    if ('foot' in head.parent&&compareRow(head.parent.foot.row,head.foot.row)<=0) head.foot.parent=head.foot.parent.foot
    op.push(head.foot)
    head=head.foot
  }
}
function isEqualSequnce(s1,s2){
  if (s1.length!=s2.length) return false
  for (var i=0;i<s1.length;i++) if (s1[i].value!=s2[i].value||s1[i].parent.cloumn!=s2[i].parent.cloumn) return false
  return true
}
function setElementNo(m,b){
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (i==b.cloumn) m[i][j].no=j+1
      else if (i<b.cloumn||(m[i][j].value<=1&&j==0)) m[i][j].no=0
      else if (m[i][j].value>1&&compareRow(m[i][j].row,m[i][j].parent.row)==0) m[i][j].no=m[i][j].parent.no
      else m[i][j].no=m[i][j].head.parent.no
    }
  }
}
function getReferenceChain(it){
  var c=[]
  while (true){
    c.unshift(it)
    if (it.value<=1&&it.row[0]==0) break
    it=it.ref
  }
  return c
}
function getMainDimensionSequence(t){
  var s=[]
  t.forEach(e=>{s.push({value:e.row.length,row:[0],cloumn:e.cloumn})})
  s[s.length-1].value+=1
  for (var i=0;i<s.length;i++){
    if (s[i].value<=1) {s[i].parent={row:[0],cloumn:-1};continue}
    for (var j=i-1;j>=0;j--) if (s[j].value<s[i].value) {s[i].parent=s[j];break}
  }
  return s
}
function getBootCloumn(s,d){
  var m=drawMountain(s,d)
  setElementRefrence(m)
  var t=m[m.length-1][m[m.length-1].length-2],b=t.parent
  if (d.length==1&&t.foot.value>1){
    var o=[]
    m.forEach(e=>{o.push({value:e[e.length-1].value,row:[0],cloumn:e[0].cloumn,parent:e[e.length-1].value==1?{row:[0],cloumn:-1}:o[e[e.length-1].parent.cloumn]})})
    return getBootCloumn(o,d)
  }
  if (t.row.length==b.row.length||d.length<3) return b.cloumn
  return getBootCloumn(getMainDimensionSequence(getReferenceChain(t)),d)
}
function expandElementDimensionSequence(m,b,t,n,d){
  if (b.row.length==t.row.length||d.length<3) return
  for (var i=b.cloumn+1;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].no!=b.no||rowDifference(m[i][j].row,b.row).length<b.row.length||m[i][j].row.length==1) continue
      var c=getReferenceChain(m[i][j]).concat(getReferenceChain(t).slice(b.chain.length)).map(e=>{return {value:e.row.length}})
      if (m[i][j].row.length==b.row.length) c=getReferenceChain(t).map(e=>{return {value:e.row.length}})
      c[c.length-1].value+=1
      for (var k=0;k<c.length;k++){
        c[k].row=[0]
        c[k].cloumn=k
        if (c[k].value<=1) c[k].parent={row:[0],cloumn:-1}
        if (k==getReferenceChain(m[i][j]).length) {c[k].parent=c[b.chain.length-1];continue}
        for (var kk=k;kk>=0;kk--) if (c[kk].value<c[k].value){c[k].parent=c[kk];break}
      }
      var len=c.length-b.chain.length,ex=[]
      m[i][j].dim_seq=[]
      for (var k=0;k<mm[0].length;k++) if (isEqualSequnce(c,mm[0][k])&&mm[1][k]>=n&&compareRow(mm[2][k],d)==0){ex=mm[3][k];break}
      if (ex.length==0){
        ex=expand(c,n,d)
        mm[0].push(c)
        mm[1].push(n)
        mm[2].push(d)
        mm[3].push(ex)
      }
      var idx=getReferenceChain(m[i][j]).length
      if (m[i][j].row.length==b.row.length) idx=getReferenceChain(b).length
      for (var k=1;k<=n;k++) m[i][j].dim_seq.push(ex[idx-1+len*k])
    }
  }
}
function expand(s,n,d,f=false){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var c=getBootCloumn(s,d)
  var m=drawMountain(s,d),ex=[]
  setElementRefrence(m)
  if (f) displayMt(m)
  var t=m[m.length-1][m[m.length-1].length-2],b=t.parent
  if (c<b.cloumn&&c>=0) b=m[c][m[c].length-1]
  var len=t.cloumn-b.cloumn
  setElementNo(m,b)
  if (d.length>2) {
    b.chain=getReferenceChain(b)
    t.parent.chain=getReferenceChain(t.parent)
    expandElementDimensionSequence(m,b,t,n,d)
  }
  if (t.foot.value>1){
    var o=[]
    m.forEach(e=>{o.push({value:e[e.length-1].value,row:[0],cloumn:e[0].cloumn,parent:e[e.length-1].value==1?{row:[0],cloumn:-1}:o[e[e.length-1].parent.cloumn]})})
    for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
    ex=expand(o,n,d,true)
  }
  else {
    m[m.length-1].pop()
    delete t.foot
    for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
    t.parent=t.parent.parent
  }
  for (var i=b.no;i<m[b.cloumn].length;i++){
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,no:m[b.cloumn][i].no,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i].ref})
    m[t.cloumn][m[t.cloumn].length-2].foot=m[t.cloumn][m[t.cloumn].length-1]
  }
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      var l=m.length,op=[],max_row
      m.push(op)
      for (var k=0;k<m[j].length;k++){
        var head={row:[0],cloumn:l,no:m[j][0].no,parent:m[j][0].parent}
        if ('dim_seq' in m[j][k]){
          max_row=m[j][k].row.slice()
          max_row[0]+=t.row[0]-1
          while (max_row.length<m[j][k].dim_seq[i]) max_row.splice(1,0,0)
        }
        else if (m[j][k].no>0){
          for (var kk=m[b.cloumn+len*(i+1)].length-1;kk>=0;kk--){
            if (m[b.cloumn+len*(i+1)][kk].no>m[j][k].no) continue
            max_row=rowAddition(m[b.cloumn+len*(i+1)][kk].row,rowDifference(m[j][k].row,m[b.cloumn][m[j][k].no-1].row))
            break
          }
        }
        else max_row=m[j][k].row
        if (compareRow(d,[0])==0) max_row=m[j][k].row
        if (op.length){
          head={row:calcFootRow(op[op.length-1],d),cloumn:l,no:m[j][k].no,parent:m[j][k].parent,head:op[op.length-1]}
          op[op.length-1].foot=head
        }
        if (m[j][k].value==1&&m[j][k].row[0]>0) head.parent=m[j][k].ref
        op.push(head)
        if (head.parent.cloumn>=b.cloumn) head.parent=m[head.parent.cloumn+len*i+len][m[head.parent.cloumn+len*i+len].length-1]
        while (compareRow(head.parent.row,head.row)>0) head.parent=head.parent.head
        copyElement(op,op[op.length-1],max_row,d)
      }
      op[op.length-1].value=ex.length?ex[j+len*i+len]:m[j][m[j].length-1].value
      for (var k=m[l].length-1;k>0;k--) m[l][k-1].value=m[l][k].value+m[l][k-1].parent.value
    }
  }
  if (f) displayMt(m,false)
  return m.map(e=>{return e[0].value})
}
function toSequence(s){
  var seq=[]
  for (var i=0;i<s.length;i++){
    if (s[i]<=1) {seq.push({value:s[i],row:[0],cloumn:i,parent:{row:[0],cloumn:-1}});continue}
    for (var j=i-1;j>=0;j--) if (s[j]<s[i]) {seq.push({value:s[i],row:[0],cloumn:i,parent:seq[j]});break}
  }
  return seq
}
//Limited to n<=10
function expandmultilimited(s,nstring,dstring){
  var result=s;
  for (var i of nstring.split(",")) result=expand(toSequence(result.split(itemSeparatorRegex).map(e=>{return Number(e)})),Math.min(i,10),dstring.split(itemSeparatorRegex).map(e=>{return Number(e)}),true).toString();
  return result;
}
var input="";
var inputn="3";
var inputd="0";
var mt="";
var mm=[[],[],[],[]];
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
  setTimeout(expandall,0,true);
}
//console.log=function (s){alert(s)};
window.onerror=function (e,s,l,c,o){alert(JSON.stringify(e+"\n"+s+":"+l+":"+c+"\n"+o.stack))}