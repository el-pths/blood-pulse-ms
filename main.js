var n = 3;
var chg = 0.07;
var norm = 70;

var kh = 0, kv = 0;

function parsePoints() {
  var s = $('#input').val().split(/\n/);
  for (var i = 0; i < s.length; i++) {
    s[i] = parseFloat(s[i].replace(/\s.*/, ''));
  }
  i = s.length - 1;
  while (i > 0 && s[i] > s[i - 1]) {
    i -= 1;
  }
  s = s.slice(i);
  $('#input').val(s.join('\n'));
  return s;
}

function extractGood(pts) {
  var flags = [false, false];
  for (var i = 2; i < pts.length; i++) {
    var d0 = pts[i] - pts[i - 1];
    var d1 = pts[i - 1] - pts[i - 2];
    flags[i] = Math.abs(1 - d0 / d1) < chg;
  }
  var res = [];
  var prev = 0;
  for (var j = 1; j < pts.length; j++) {
    if (flags[j]) {
      if (j - prev >= n) {
        var pulse = 60 / ((pts[j] - pts[prev]) / n);
        res.push([pts[j], pulse]);
        prev = j;
      }
    } else {
      prev = j;
    }
  }
  return res;
}

function draw(data, norm) {
  var ctx = $('#chart').get(0).getContext("2d");
  var w = $('#chart').width();
  var h = $('#chart').height();
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  var top = 0;
  for (var i in data) {
    top = Math.max(top, data[i][1]);
  }
  kh = w / data[data.length - 1][0];
  kv = h / (top - norm);
  console.log('drawing');
  for (var j in data) {
    var x = Math.round(data[j][0] * kh);
    var y = h - Math.round((data[j][1] - norm) * kv);
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x, y - 5);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 5);
    ctx.lineTo(x - 5, y);
    ctx.stroke();
    console.log(x + ' ' + y);
  }
}

function updateVars() {
  n = parseInt($('#steps').val());
  chg = parseInt($('#dev').val()) / 100;
  norm = parseInt($('#norm').val());
}

function perform() {
  try {
    updateVars();
    var points = parsePoints();
    if (points.length < 10) {
      alert('Less than 10 points???');
      return;
    }
    var data = extractGood(points);
    if (data.length < 2) {
      alert('Nothing to draw after filtering :(')
      return;
    }
    draw(data, norm);
  } catch (e) {
    alert(e);
  }
}

function coords(e) {
  var r = $('#chart').get(0).getBoundingClientRect();
  var s = Math.round((e.clientX - r.left) / kh);
  var p = Math.round((r.bottom - e.clientY) / kv + norm);
  $('#coords').val(s + ': ' + p);
}

$(function() {
  $('#plot').click(perform);
  $('#chart').mousemove(coords);
});
