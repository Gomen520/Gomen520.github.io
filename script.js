var lineBreakRegex=/\r?\n/g;
var itemSeparatorRegex=/[\t ,]/g;
window.onload=function (){
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
  mt+='<p></p><table border="0">'
  for (var i=0;i<m.length;i++){
    mt+='<tr>'
    mt+='<td align="center" width="80" bgColor="#e9e0e0">'+m[i][0].row+'</td>'
    for (var j=0;j<m[0].length;j++){
      var v=m[i].length>j&&m[i][j].value?m[i][j].value:''
      mt+='<td align="center" width="80" bgColor="#e0eee0">'+v+'</td>'
    }
    mt+='</tr>'
  }
  mt+='</table>'
  //dg("mt").innerHTML=mt
}
function getRowIndex(m,row){
  for (var i=0;;i++) if (compareRow(m[i][0].row,row)==0) return i
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
function isRowLimit(it,r){
  if (r<=0) return false
  if (it.row.length==r&&it.parent.row.length<r||it.row.length==r&&it.row[0]>it.parent.row[0]) return true
  return false
}
function insertItem(m,it){
  for (var i=m.length-1;i>=0;i--){
    if (compareRow(it.row,m[i][0].row)<0) continue
    if (compareRow(it.row,m[i][0].row)>0) m.splice(++i,0,[])
    while (m[i].length<=it.cloumn) m[i].push({value:0,row:it.row,cloumn:m[i].length})
    m[i][it.cloumn]=it
    break
  }
}
function calcFootRow(hr,pr){
  var row=[]
  if (hr.length>pr.length||hr[0]>pr[0]){
    row.push(1)
    var k=hr.length
    while (k--) row.push(0)
  }
  else{
    row=hr.slice()
    for (var k=0;k<hr.length;k++){
      if (hr[k]>pr[k]){
        row[k-1]+=1
        while (k<=hr.length-1) row[k++]=0
        break
      }
      if (k==row.length-1) row[row.length-1]+=1
    }
  }
  return row
}
function calcFoot(it){
  var foot={value:it.value-it.parent.value,row:calcFootRow(it.row,it.parent.row),cloumn:it.cloumn,head:it}
  it.foot=foot
  var p=it.parent
  if ('foot' in p&&compareRow(p.foot.row,foot.row)<=0) p=p.foot
  while (foot.value<=p.value) p=p.parent
  foot.parent=p
  return foot
}
function calcHeadRow(fr,pr){
  var row=pr.slice()
  if (fr.length>pr.length){
    row[0]+=1
    for (var k=1;k<pr.length;k++) row[k]=0
  }
  else{
    for (var k=0;k<pr.length-1;k++){
      if (fr[k]>pr[k]){
        row[k+1]+=1
        for (var k2=k+2;k2<pr.length;k2++) row[k2]=0
        break
      }
    }
  }
  return row
}
function calcHead(m,b,c,it){
  var parity={}
  if (compareRow(it.row,c.row)>0) parity=m[getRowIndex(m,rowAddition(b.row,rowDifference(it.row,c.row)))][it.cloumn-c.cloumn+b.cloumn]
  else if (compareRow(it.row,b.row)>=0) parity=m[getRowIndex(m,b.row)][it.cloumn-c.cloumn+b.cloumn]
  else{
    for (var i=getRowIndex(m,it.row);;i--){
      if (m[i].length>it.cloumn-c.cloumn+b.cloumn&&m[i][it.cloumn-c.cloumn+b.cloumn].value>0) break
    }
    parity=m[i][it.cloumn-c.cloumn+b.cloumn]
  }
  //console.log(parity)
  var parent_cloumn
  if ('head' in parity) parent_cloumn=parity.head.parent.cloumn<b.cloumn?parity.head.parent.cloumn:parity.head.parent.cloumn+c.cloumn-b.cloumn
  else parent_cloumn=parity.parent.cloumn<b.cloumn?parity.parent.cloumn:parity.parent.cloumn+c.cloumn-b.cloumn
  for (var i=getRowIndex(m,it.row)-1;;i--){
    if (parent_cloumn<0||m[i].length>parent_cloumn&&m[i][parent_cloumn].value>0) break
  }
  var row=[]
  if ('head' in parity&&parity.head.parent.cloumn<b.cloumn){
    var diff=rowDifference(b.row,parity.head.row)
    var d=[]
    if (diff.length-1==0) d.push(0)
    else{
      d.push(1)
      var x=diff.length-2
      while (x--) d.push(0)
    }
    row=rowAddition(parity.head.row,d)
    console.log(parity.head.row,row)
  }
  else if (compareRow(it.row,c.row)>0||compareRow(it.row,b.row)<=0&&it.row[it.row.length-1]==0) row=rowAddition(m[i][parent_cloumn].row,rowDifference(parity.head.row,parity.head.parent.row))
  else row=calcHeadRow(it.row,parent_cloumn>=0?m[i][parent_cloumn].row:[0])
  //console.log(parent_cloumn)
  //console.log(m[i][parent_cloumn].value)
  var head={value:parent_cloumn>=0?it.value+m[i][parent_cloumn].value:it.value,row:row,cloumn:it.cloumn,parent:parent_cloumn>=0?m[i][parent_cloumn]:{cloumn:-1},foot:it}
  //if ('head' in parity) head.row=rowAddition(m[i][parent_cloumn].row,rowDifference(parity.head.row,parity.head.parent.row))
  it.head=head
  return head
}
function calcOds(m,n,r){
  var o=[]
  m[0].forEach(e=>{o.push(e)})
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].value<=1||isRowLimit(m[i][j],r)) continue
      insertItem(m,calcFoot(m[i][j]))
      o[j]=m[i][j].foot
    }
  }
  if (o[o.length-1].value==1){
    o[o.length-1]=o[o.length-1].head
    delete o[o.length-1].foot
    for (var i=0;i<o.length-1;i++){
      while (compareRow(o[i].row,o[o.length-1].row)>0){
        o[i]=o[i].head
        delete o[i].foot
      }
    }
    m=m.splice(getRowIndex(m,o[o.length-1].row)+1)
  }
  else{
    var idx=o[o.length-1].cloumn
    while (o[idx].parent.cloumn>=0){
      o[o[idx].parent.cloumn]=o[idx].parent
      idx=o[idx].parent.cloumn
    }
  }
  //o[o[o.length-1].parent.cloumn]=o[o.length-1].parent
  return o
}
function rowAddition(r1,r2){
  var diff=r1.length-r2.length,row=r1.slice()
  if (diff<0) return r2.slice()
  if (diff>0){
    row[diff]+=r2[0]
    for (var k=1;k<r2.length;k++){
      row[k+diff]=r2[k]
    }
    return row
  }
  row=r2.slice()
  row[0]+=r1[0]
  return row
}
function rowSubtraction(r1,r2){
  var diff=r1.length-r2.length,row=r1.slice()
  if (diff<0||diff==0&&r1[0]<r2[0]) return [0]
  for (var k=0;k<r2.length;k++){
    row[k+diff]-=r2[k]
    if (row[k+diff]<0){
      row[k+diff]=0
      for (var k2=k+diff+1;k2<r1.length;k2++){
        row[k2]=0
      }
      break
    }
  }
  while (row.length>1&&row[0]==0) row.shift()
  return row
}
function rowDifference(r1,r2){
  var row=r1.slice()
  if (r1.length>r2.length) return row
  for (var k=0;k<r1.length;k++){
    if (r1[k]>r2[k]){
      row=r1.slice(k,r1.length)
      row[0]=r1[k]-r2[k]
      return row
    }
  }
  return [0]
}
function expandY(s,n,r,f){
  if (s[s.length-1].value-s[s.length-1].parent.value==1){
    if (f) displayMt([s])
    var rep=s.slice(s[s.length-1].parent.cloumn,s.length-1)
    s.pop()
    for (var i=0;i<n;i++) s=s.concat(rep)
    if (f) displayMt([s])
    return s
  }
  var m=[s],o=calcOds(m,n,r),c=o[o.length-1],ex=[]
  displayMt(m)
  o.forEach(e=>{ex.push({value:e.value,row:[0],cloumn:e.cloumn,parent:e.parent.cloumn>=0?ex[e.parent.cloumn]:{cloumn:-1}})})
  ex=expandY(ex,n,r,false)
  var len=(ex.length-c.cloumn)/n,b=o[c.cloumn-len]
  while (o.length<ex.length) o.push({})
  for (var it=c;;it=it.head){
    it.value-=1
    if (compareRow(it.row,[0])==0) break
  }
  for (var j=c.cloumn+1;j<ex.length;j++){
    if ('head' in o[j-len]&&o[j-len].head.parent.cloumn<b.cloumn||compareRow(o[j-len].row,[0])==0&&o[j-len].value==1) o[j]={value:ex[j].value,row:o[j-len].row,cloumn:j}
    else if(compareRow(o[j-len].row,b.row)>=0) o[j]={value:ex[j].value,row:rowAddition(c.row,rowDifference(o[j-len].row,b.row)),cloumn:j}
    else{
      var diff=rowDifference(b.row,o[j-len].row)
      var d=[]
      if (diff.length-1==0) d.push(0)
      else{
        d.push(1)
        var i=diff.length-2
        while (i--) d.push(0)
      }
      o[j]={value:ex[j].value,row:rowAddition(o[j-len].row,d),cloumn:j}
    }
    insertItem(m,o[j])
    //displayMt(m)
    for (var it=o[j];compareRow(it.row,[0])>0;it=it.head) {insertItem(m,calcHead(m,b,c,it));}
  }
  displayMt(m)
  return m[0]
}
function calcParent(seq){
  var s=[]
  for (var i=0;i<seq.length;i++){
    if (seq[i]==1){s.push({value:1,row:[0],cloumn:i,parent:{cloumn:-1}});continue}
    for (var j=i-1;j>=0;j--) if (seq[i]>seq[j]){s.push({value:seq[i],row:[0],cloumn:i,parent:s[j]});break}
  }
  return s
}
function expand(seq,n,r,stringify){
	var s=seq.split(itemSeparatorRegex).map(e=>{return Number(e)})
	if (s[s.length-1]<=1) return s.slice(0,s.length-1)
  return expandY(calcParent(s),n,r,true).map(e=>{return e.value})
}
//Limited to n<=10
function expandmultilimited(s,nstring,r){
  var result=s;
  for (var i of nstring.split(",")) result=expand(result,Math.min(i,10),r,true);
  return result;
}
var input="";
var inputn="3";
var mt=''
function expandall(){
  if (input==dg("input").value&&inputn==dg("inputn").value&&inputr==dg("inputr").value) return;
  input=dg("input").value;
  inputn=dg("inputn").value;
  inputr=dg("inputr").value
  mt=''
  dg("mt").innerHTML=mt
  dg("output").value=input.split(lineBreakRegex).map(e=>expandmultilimited(e,inputn,Number(inputr))).join("\n");
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