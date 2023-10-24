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
  mt+='<p></p><table border="0">'
  for (var i=0;i<m.length;i++){
    mt+='<tr>'
    mt+='<td align="center" width="80" bgColor="#e9e0e0">'+m[i][0].row.slice(0,10)+'</td>'
    for (var j=0;j<m[0].length;j++){
      var v=m[i].length>j&&m[i][j].value?m[i][j].value:''
      mt+='<td align="center" width="80" bgColor="#e0eee0">'+v+'</td>'
    }
    mt+='</tr>'
  }
  mt+='</table>'
  dg("mt").innerHTML=mt
}
function getRowIndex(m,row){
  for (var i=0;i<m.length;i++) if (compareRow(m[i][0].row,row)==0) return i
  return -1
}
function isDimensionLimited(it,d){
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
  if (b.length==0) b.push(0)
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
function insertItem(m,it){
  for (var i=m.length-1;i>=0;i--){
    if (compareRow(it.row,m[i][0].row)<0) continue
    if (compareRow(it.row,m[i][0].row)>0) m.splice(++i,0,[])
    while (m[i].length<=it.cloumn) m[i].push({value:0,row:it.row,cloumn:m[i].length})
    m[i][it.cloumn]=it
    break
  }
}
function calcFootRow(it){
  var row=[1],d=rowDifference(it.row,it.parent.row).length
  while (d--) row.push(0)
  return rowAddition(it.row,row)
}
function calcFoot(it){
  var foot={value:it.value-it.parent.value,row:calcFootRow(it),cloumn:it.cloumn,head:it}
  it.foot=foot
  var p=it.parent
  if ('foot' in p&&compareRow(p.foot.row,foot.row)<=0) p=p.foot
  while (foot.value<=p.value) p=p.parent
  foot.parent=p
  return foot
}
function preprocess(m,o){
  var t=o[o.length-1]
  if (t.value==1){
    t=t.head
    o[o.length-1]=t
  }
  if (t.value-t.parent.value==1){
    m.length=getRowIndex(m,t.row)+1
    for (var i=0;i<o.length;i++){
      while(compareRow(o[i].row,t.row)>0) o[i]=o[i].head
      delete o[i].foot
    }
  }
  var b=t.parent,no=1
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].value<=0) continue
      if (m[i][j].cloumn<b.cloumn) m[i][j].no=0
      else if (m[i][j].cloumn==b.cloumn) m[i][j].no=no++
      else if (compareRow(m[i][j].row,m[i][j].parent.row)==0) m[i][j].no=m[i][j].parent.no
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
  var o=m[0].slice()
  for (var i=0;i<m.length;i++){
    for (var j=0;j<m[i].length;j++){
      if (m[i][j].value<=1||isDimensionLimited(m[i][j],d)) continue
      insertItem(m,calcFoot(m[i][j]))
      o[j]=m[i][j].foot
    }
  }
  preprocess(m,o)
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
    if (d[1]) b=Math.min(b,d[1])
    while (n--){
      p+=b
      s.push(p)
    }
    return s
  }
  if (compareRow(d,[1,0,1])==0) return expand(toSequence(s),n,d,false) // X-Y
  if (compareRow(d,[1,0,2])==0) return expand(toSequence(s),n,[1],false) // dimension sequence expands as 1-Y
  // default expand as ω-Y
  var p=--s[s.length-1]
  while (n--) s.push(p)
  return s
}
function calcMaxCopyrow(m,b,t,o,it,dim_seq,index,i){
  if (it.no==0) return it.row
  var p=b,len=t.cloumn-b.cloumn
  while (p.no>it.no) p=p.head
  var diff=rowDifference(it.row,p.row).slice()
  if (p.no==b.no&&diff.length==t.row.length) while (diff.length<dim_seq[index+i+1]) diff.splice(1,0,0)
  else if (false&&p.no==b.no&&diff.length>=b.row.length){
    var n=diff.length-b.row.length
    while (diff.length<dim_seq[index+i]+n) diff.splice(1,0,0)
  }
  if (diff.length==0) diff.push(0)
  p=o[t.cloumn+len*i]
  while (p.no>it.no) p=p.head
  return rowAddition(p.row,diff)
}
function copyItem(m,it,head,max_row){
  var row={}
  while (true){
    row=calcFootRow(head)
    if (compareRow(row,max_row)>0) return head
    head.foot={value:1,row:row,cloumn:head.cloumn,no:head.no,head:head,parent:head.parent}
    if ('foot' in head.parent&&compareRow(head.parent.foot.row,head.foot.row)<=0) head.foot.parent=head.foot.parent.foot
    insertItem(m,head.foot)
    //displayMt(m)
    head=head.foot
  }
}
function expand(s,n,d,f){
  if (s[s.length-1].value<=1) return s.slice(0,-1).map(e=>{return e.value})
  var m=[s],o=drawMountain(m,d),t=o[o.length-1],b=t.parent,len=t.cloumn-b.cloumn
  var dim_seq=fetchDimensionSequence(m,t),index=dim_seq.length-1
  //console.log(dim_seq)
  dim_seq=expandDimensionSequence(dim_seq,n,d)
  //console.log(dim_seq)
  if (f) displayMt(m)
  var it=t,ex=[]
  if (t.value-b.value>1){
    o.forEach(e=>{ex.push({value:e.value,row:[1],cloumn:e.cloumn,parent:e.parent.cloumn==-1?{row:[1],cloumn:-1,no:0}:ex[e.parent.cloumn]})})
    ex=expand(ex,n,d,f)
    len=(ex.length-o.length)/n
    b=o[t.cloumn-len]
  }
  for (it.value--;'head' in it;it=it.head) it.head.value--
  for (var i=0;i<n;i++){
    for (var j=b.cloumn+1;j<=t.cloumn;j++){
      var it=m[0][j],head={row:[1],cloumn:j+len*i+len,no:it.no,parent:it.parent}
      var max_row=calcMaxCopyrow(m,b,t,o,it,dim_seq,index,i)
      if (head.parent.cloumn>=b.cloumn) head.parent=m[0][head.parent.cloumn+len*i+len]
      insertItem(m,head)
      //displayMt(m)
      while (true){
        head=copyItem(m,it,head,max_row)
        if ('foot' in it){
          it=it.foot
          head.foot={value:ex.length?ex[j+len*i+len]:it.value,row:calcFootRow(head),cloumn:head.cloumn,no:it.no,parent:it.parent,head:head}
          head=head.foot
          max_row=calcMaxCopyrow(m,b,t,o,it,dim_seq,index,i)
          insertItem(m,head)
          //displayMt(m)
          if (head.parent.cloumn<0){
            o.push(head)
            while ('head' in head){
              head.head.value=head.value+head.head.parent.value
              head=head.head
            }
            break
          }
          else if (head.parent.cloumn>=b.cloumn) head.parent=m[0][head.parent.cloumn+len*i+len]
          while ('foot' in head.parent&&compareRow(head.parent.foot.row,head.row)<=0) head.parent=head.parent.foot
        }
        else {
          o.push(head)
          head.value=ex.length?ex[j+len*i+len]:it.value
          while ('head' in head){
            head.head.value=head.value+head.head.parent.value
            //displayMt(m)
            head=head.head
          }
          break
        }
      }
    }
  }
  if (f) displayMt(m)
  return m[0].map(e=>{return e.value})
}
function toSequence(s){
  var seq=[]
  for (var i=0;i<s.length;i++){
    if (s[i]<=1) {seq.push({value:s[i],row:[1],cloumn:i,parent:{row:[1],cloumn:-1}});continue}
    for (var j=i-1;j>=0;j--) if (s[j]<s[i]) {seq.push({value:s[i],row:[1],cloumn:i,parent:seq[j]});break}
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