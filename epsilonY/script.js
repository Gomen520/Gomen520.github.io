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
  var i=0,j=0
  while (true){
    if (i>=r1.length||r1[i]<r2[j]) return r1.slice(0,i).concat(r2.slice(j,r2.length))
    if (r1[i]==r2[j]&&j<r2.length-1&&r2[j+1]>r2[j]){i++;j++;continue}
    i++
  }
}
function rowDifference(r1,r2){
  var i=0,j=0
  while (true){
    if (j>=r2.length||r1[i]>r2[j]){
      var row=r1.slice(i,r1.length)
      var k=i
      while (k-->=0) if (r1[k]<row[0]) row.unshift(r1[k])
      return row
    }
    i++
    j++
  }
}
function rowStandardization(r,d){
  if (r.length<=2||r[r.length-1]<=r[r.length-2]) return r
  var s=r.slice(0,-1)
  s[s.length-1]++
  var rr=expand(toSequence(s),2,d,false)
  if (rr[r.length-1]<=r[r.length-1]-1) return rowStandardization(s,d)
  return r
}
function getFootRow(it,d){
  if (compareRow(it.row,it.parent.row)==0||d.length==0||d.length==1&&d[0]==0||d.length==2&&d[0]==0||d.length==3&&d[0]==0&&d[1]==1&&d[2]==0) return it.row.concat([1])
  var i=0,row=[1]
  while (true){
    i++
    row.push(it.row[i])
    if (it.parent.row.length<=i||it.parent.row[i]<it.row[i]) break
  }
  row[row.length-1]++
  return rowStandardization(row,[0])
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
  return toSequence(getReferenceChain(m[m.length-1][m[m.length-1].length-1]).map(e=>{return e.row.length<=1?1:e.row[1]}))
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
function copyElement(m,b,t,it,op,i,d,f=true){
  if (it.value<=1&&it.row.length>1){
    it.parent=it.ref
    while (it.parent.value>1) it.parent=it.parent.ref
  }
  var min_row=it.row.length>1?getFootRow(op[op.length-1],d):[1],max_row=it.row
  if (true){
    if (f) var c=it.ref.cloumn+(t.cloumn-b.cloumn)*(i+1)
    else var c=t.cloumn+i
    var r=m[c][0]
    while ('foot' in r&&r.foot.id<=it.ref.id) r=r.foot
    var fr
    if (it.foot==undefined) fr=getFootRow(it,d)
    else fr=it.foot.row
    if (compareRow(rowDifference(it.row,it.ref.row),[1,2])<0) max_row=rowAddition(r.row,rowDifference(it.row,it.ref.row))
    else max_row=rowAddition(r.row,rowDifference(expand(toSequence(rowDifference(fr,it.ref.row)),it.ref.row.length+i+1,[0],false),it.ref.row))
  }
  if (it.cloumn==t.cloumn&&it.idx==t.idx&&compareRow(rowDifference(it.row,it.ref.row),[1,2])>=0){
    var p=t.parent
    t.parent=b
    max_row=rowAddition(r.row,rowDifference(expand(toSequence(rowDifference(getFootRow(t,d),t.ref.row)),it.ref.row.length+i+1,[0],false),t.ref.row))
    t.parent=p
    //console.log(rowDifference(a=getFootRow(t,d),t.ref.row),max_row,min_row)
  }
  if (d.length==0||d.length==1&&d[0]==0||d.length==2&&d[0]==0||d.length==3&&d[0]==0&&d[1]==1&&d[2]==0) max_row=it.row
  if (compareRow(min_row,max_row)>0) console.log('collapsed!',min_row,max_row,it)
  var row=min_row
  while (compareRow(row,max_row)<=0){
    op.push({value:it.value,row:row,cloumn:m.length-1,idx:op.length,no:it.no,id:it.id})
    if (op.length>1){
      op[op.length-1].head=op[op.length-2]
      op[op.length-2].foot=op[op.length-1]
    }
    if (f) var pc=it.parent.cloumn>=b.cloumn?m.length-1+it.parent.cloumn-it.cloumn:it.parent.cloumn
    else var pc=pc=it.parent.cloumn>=b.cloumn?m.length-2:it.parent.cloumn
    var p=pc>=0?m[pc][m[pc].length-1]:{row:[1],cloumn:-1}
    while (compareRow(p.row,row)>0) p=p.head
    op[op.length-1].parent=p
    row=getFootRow(op[op.length-1],d)
  }
}
function copyCloumn(m,b,t,c,i,ex,d,f=true){
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
function expandDimensionSequnece(m,b,t,n,d){
  for (var i=b.cloumn+1;i<=t.cloumn;i++){
    for (var j=0;j<m[i].length;j++){
      var it=m[i][j]
      if (it.foot==undefined) it.offset=rowDifference(it.row,it.ref.row)
      else it.offset=rowDifference(expand(toSequence(rowDifference(it.foot.row,it.ref.row)),n+1,d,false),it.ref.row)
    }
  }
  //if (compareRow(t.row,b.row)>0) t.offset=rowDifference(expand(toSequence(rowDifference(t.foot.row,t.ref.row)),n,d,false),t.ref.row)
  return
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
        if (compareDimension(rowDifference(it.row,it.ref.row),b.row)<=0) continue
        ds.splice(c+1,0,{value:rowDifference(it.row,it.ref.row).length<2?1:rowDifference(it.row,it.ref.row)[1],parent:ds[c]})
        ds[c+2].parent=ds[c+1]
        pos++
      }
      for (var k=0;k<ds.length;k++){
        ds[k].cloumn=k
        while (ds[k].value<=ds[k].parent.value) ds[k].parent=ds[k].parent.parent
      }
      it=m[i][j]
      it.offset=[]
      if (d.length==2&&d[0]==2){
        var lift=ds[ds.length-1].value-1-ds[ds.length-1].parent.value
        if (d[1]>0&&lift>d[1]) lift=d[1]
        for (var ii=0;ii<n;ii++){
          it.offset.push([1,rowDifference(it.row,it.ref.row)[1]+(1+ii)*lift])
        }
        continue
      }
      var len=ds.length-1-c
      var ex=expand(ds,n,dd,inputm)
      for (var ii=0;ii<n;ii++){
        it.offset.push([1,ex[c+len*(ii+1)+pos]])
      }
    }
  }
}
function expand(s,n,d,f=true){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=drawMountain(s,d),t=m[m.length-1][m[m.length-1].length-1],ex=[]
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
    t.parent=t.parent.parent
  }
  for (var i=0;i<m[m.length-1].length;i++) m[m.length-1][i].value--
  for (var i=b.no;i<m[b.cloumn].length;i++){
    var idx=t.idx
    m[t.cloumn].push({value:m[b.cloumn][i].value,row:m[b.cloumn][i].row,cloumn:t.cloumn,idx:++idx,no:m[b.cloumn][i].no,id:m[b.cloumn][i].no,parent:m[b.cloumn][i].parent,head:m[t.cloumn][m[t.cloumn].length-1],ref:m[b.cloumn][i]})
    m[t.cloumn][m[t.cloumn].length-2].foot=m[t.cloumn][m[t.cloumn].length-1]
  }
  for (var i=0;i<n;i++){
    if (f)
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      copyCloumn(m,b,t,j,i,ex,d)
    }
    else copyCloumn(m,b,t,t.cloumn,i,ex,d,false)
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
var tips="Fill different sequence or number in the third input box will choose different type of Y to expand:\n";
tips+="1. '1,0,1' is X-Y, '1,0' is ω-Y, '0,0' is 0-Y;\n";
tips+="2. '0' is 0-Y, '1' is 1-Y, '2' is 2-Y, '3' is 3-Y etc.;\n";
tips+="3. '0,1' is 1~Y(n~Y means n row Y), '0,2' is 2~Y, '0,3' is 3~Y etc.;\n";
tips+="4. '0,1,0' is ω~Y(0-Y), '0,1,1' is ω+1~Y, '0,2,0' is ω2~Y, '0,1,0,0' is ω^2~Y(1-Y), '0,2,3,1' is ω^2*2+ω*3+1~Y etc.;\n";
tips+="5. '0,1' is 1~Y, then '0,0,0,1' is 1~Y-Y, it meas the dimension sequence of 1~Y-Y expand as 1~Y, actually 1~Y-Y is ω-Y;\n";
tips+="6. '0,2' is 2~Y, then '0,0,0,2' is 2~Y-Y, '0,0,0,0,0,2' is 2~Y-Y-Y etc. '1' is 1-Y, then '0,0,1' is 1-Y-Y, '0,0,0,0,1' is 1-Y-Y-Y etc.;\n";
tips+="7. '1,0,1' is X-Y, '0,0,1,0,1' is X-Y-Y, it\'s still X-Y;\n";
tips+="8. '2,0' is LPrSS-Y, '0,0,2,0' is LPrSS-Y-Y etc..\n";
function match(d){
  if (d=="NaN") return "ω-"
  if (d.length==1) return d[0]+"~"
  var x="~"
  for (var i=d.length-1;;i--){
    if (d[i]==0) continue
    var j=d.length-1-i
    if (i==d.length-1) x=d[i]+x
    if (i==d.length-2&&d[i]==1) x="ω"+x
    if (i==d.length-2&&d[i]>1) x="ω*"+d[i]+x
    if (i<d.length-2&&d[i]==1) x="ω^"+j+x
    if (i<d.length-2&&d[i]>1) x="ω^"+j+"*"+d[i]+x
    if (i==0) break
    x="+"+x
  }
  return x
}
function check(d){
  if (d=="NaN") return "ω-"
  if (d.length==1) return d[0]+"-"
  if (d.length==3&&d[0]==1&&d[1]==0&&d[2]==1) return "X-"
  if (d.length>3&&d.length%2==1&&d[d.length-3]==1&&d[d.length-2]==0&&d[d.length-1]==1){
    var sign=true
    for (var i=0;i<d.length-3;i++) if (d[i]>0) sign=false
    if (sign) return "X-"
  }
  if (d.length==2&&d[0]==0&&d[1]==0) return "0-"
  if (d.length>2&&d[0]==0&&d[1]==0) return check(d.slice(2))+"Y-"
  if (d.length==2&&d[0]==2&&d[1]==0) return "LPrSS-"
  if (d.length==2&&d[0]==2&&d[1]>0) return "LPrSS(limit"+d[1]+")-"
  if (d.length>1&&d[0]==0&&d[1]>0) return match(d.slice(1))
  return "ω-"
}
function showTips(){
  alert(tips)
}
function expandall(){
  if (input==dg("input").value&&inputn==dg("inputn").value&&inputd==dg("inputd").value&&inputm==dg("inputm").checked) return;
  input=dg("input").value;
  inputn=dg("inputn").value;
  inputd=dg("inputd").value;
  inputm=dg("inputm").checked;
  mt="";
  dg("output").value=input.split(lineBreakRegex).map(e=>expandmultilimited(e,inputn,inputd)).join("\n");
  dg("mt").innerHTML=mt
  //dg("h1").innerHTML=check(inputd.split(itemSeparatorRegex).map(e=>{return Number(e)}))+"Y Sequence"
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