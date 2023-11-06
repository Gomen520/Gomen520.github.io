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
    mt+='<td align="center" width="80" bgColor="#e9e0e0">'+row.slice(0,10)+'</td>'
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
function preprocess(m,b){
  for (var i=0;i<m[b.cloumn].length;) m[b.cloumn][i].no=++i
  for (var i=b.cloumn+1;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].parent.cloumn<b.cloumn) m[i][j].no=0
      else if (compareRow(m[i][j].parent.row,m[i][j].row)==0) m[i][j].no=m[i][j].parent.no
      else m[i][j].no=m[i][j].head.parent.no
    }
  }
}
function fetchDimensionSequence(m,it){
  var seq=[it.parent.row.length,it.row.length+1]
  for (it=it.parent;it.row.length>1;it=it.head.parent) if (it.head.parent.row.length<seq[0]) seq.unshift(it.head.parent.row.length)
  return seq
}
function drawMountain(m,d){
  var o=[]
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
    o.push(it)
  }
  return o
}
function expandDimensionSequence(s,n,d){
  if (s[s.length-1]-s[s.length-2]==1){
    var p=--s[s.length-1]
    while (n--) s.push(p)
    return s
  }
  if (d.length==2&&d[0]==0){ // [0,a] mean ω^a-Y, [0,0] mean ω^ω-Y
    var p=--s[s.length-1],b=p-s[s.length-2]
    if (d[1]) b=Math.min(b,d[1]-1)
    while (n--){
      p+=b
      s.push(p)
    }
    return s
  }
  if (compareRow(d,[1,0,1])==0) return expand(toSequence(s),n,d,false) // X-Y
  if (compareRow(d,[1,0,2])==0) return expand(toSequence(s),n,[1],false) // dimension sequence expands as 1-Y
  if (d.length>2&&d[0]==0&&d[1]==0) return expand(toSequence(s),n,d.slice(2),false)
  // default expand as ω-Y
  var p=--s[s.length-1]
  while (n--) s.push(p)
  return s
}
function calcMaxCopyrow(m,b,t,it,dim_seq,index,i,d){
  if (compareRow(d,[0])==0||it.no==0) return it.row
  var diff=rowDifference(it.row,m[b.cloumn][it.no-1].row).slice()
  if (it.no==b.no&&diff.length>=t.row.length){
    var l=dim_seq[index+i+1]-t.row.length
    while (l-->0) diff.splice(1,0,0)
  }
  var p=m[t.cloumn+(t.cloumn-b.cloumn)*i][m[t.cloumn+(t.cloumn-b.cloumn)*i].length-1]
  while (p.no>it.no) p=p.head
  return rowAddition(p.row,diff)
}
function copyItem(op,head,max_row,d){
  if (head.parent.cloumn<0) return
  while (true){
    var row=calcFootRow(head,d)
    if (compareRow(row,max_row)>0) return
    head.foot={value:head.value,row:row,cloumn:head.cloumn,no:head.no,head:head,parent:head.parent}
    if ('foot' in head.parent&&compareRow(head.parent.foot.row,head.foot.row)<=0) head.foot.parent=head.foot.parent.foot
    op.push(head.foot)
    head=head.foot
  }
}
function expand(s,n,d,f=false){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=[],ex=[]
  s.forEach(e=>{m.push([e])})
  var o=drawMountain(m,d)
  if (f) displayMt(m)
  var t=m[m.length-1][m[m.length-1].length-2],b=t.parent,len=t.cloumn-b.cloumn
  var dim_seq=fetchDimensionSequence(m,t),index=dim_seq.length-1
  dim_seq=expandDimensionSequence(dim_seq,n,d)
  if (o[o.length-1].value>1&&n>0){
    o.forEach(e=>{ex.push({value:e.value,row:[0],cloumn:e.cloumn,parent:e.parent.cloumn==-1?{row:[0],cloumn:-1,no:0}:ex[e.parent.cloumn]})})
    ex=expand(ex,n,d,f)
    len=(ex.length-o.length)/n
    b=o[t.cloumn-len]
  }
  else {
    delete t.foot
    m[t.cloumn].pop()
  }
  preprocess(m,b)
  for (var i=0;i<m[t.cloumn].length;i++) m[t.cloumn][i].value--
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      var l=m.length,head={value:m[j][0].value,row:[0],cloumn:l,no:m[j][0].no,parent:m[j][0].parent},op=[head]
      m.push(op)
      if (head.parent.cloumn>=b.cloumn) head.parent=m[head.parent.cloumn+len*i+len][0]
      for (var k=0;k<m[j].length;k++){
        var max_row=calcMaxCopyrow(m,b,t,m[j][k],dim_seq,index,i,d)
        copyItem(op,op[op.length-1],max_row,d)
        if (k<m[j].length-1){
          head={value:m[j][k+1].value,row:calcFootRow(op[op.length-1],d),cloumn:l,no:m[j][k+1].no,parent:m[j][k+1].parent,head:op[op.length-1]}
          op[op.length-1].foot=head
          op.push(head)
          if (head.parent.cloumn>=b.cloumn) head.parent=m[head.parent.cloumn+len*i+len][m[head.parent.cloumn+len*i+len].length-1]
          while (compareRow(head.parent.row,head.row)>0) head.parent=head.parent.head
        }
      }
      op[op.length-1].value=ex.length?ex[j+len*i+len]:m[j][m[j].length-1].value
      for (var k=m[l].length-1;k>0;k--) m[l][k-1].value=m[l][k].value+m[l][k-1].parent.value
    }
  }
  if (f) displayMt(m)
  var ret=[]
  for (var i=0;i<m.length;i++) ret.push(m[i][0].value)
  return ret
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