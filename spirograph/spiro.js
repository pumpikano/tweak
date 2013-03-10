/*
  The idea for this demo inspired by this blog post:

    http://swizec.com/blog/sexy-animated-spirographs-in-35-sloc-of-d3-js/swizec/6052

  Read more here: http://en.wikipedia.org/wiki/Spirograph
*/

window.onload = function () {
  var ctx = document.getElementById('spiro').getContext('2d'),
      width = 800,
      height = 800;

  // Parameters of spirograph parametric function
  var spiroParams = {
    a: 80,
    b: 1,
    c: 1,
    d: 80
  };

  // Spirograph Parametric function
  function spiroParametric(t) {
    return {x: Math.cos(spiroParams.a * t) - Math.pow(Math.cos(spiroParams.b * t), 3),
            y: Math.sin(spiroParams.c * t) - Math.pow(Math.sin(spiroParams.d * t), 3)};
  }

  // Draw params
  var drawParams = {
    stepResolution: 1000,
    pointMultiplier: 100,
    periods: 1
  };
  
  function drawSpirograph() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(width/2, height/2);
    for (var i = 1; i <= drawParams.periods * 2 * Math.PI * drawParams.stepResolution; i++) {
      var t = i / drawParams.stepResolution;
      var pos = spiroParametric(t);

      var x = drawParams.pointMultiplier * pos.x + width/2;
      var y = drawParams.pointMultiplier * pos.y + height/2;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawSpirograph();

  Tweak('a').in(spiroParams).as('real').within(0, 100)
    .and.do(drawSpirograph);
  Tweak('b').in(spiroParams).as('real').within(0, 100)
    .and.do(drawSpirograph);
  Tweak('c').in(spiroParams).as('real').within(0, 100)
    .and.do(drawSpirograph);
  Tweak('d').in(spiroParams).as('real').within(70, 90)
    .and.do(drawSpirograph);

  Tweak('periods').in(drawParams).as('real').within(0, 8)
    .and.do(drawSpirograph);
  Tweak('pointMultiplier').in(drawParams).as('int').within(0, 500)
    .and.do(drawSpirograph);

};