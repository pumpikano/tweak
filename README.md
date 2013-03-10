tweak
=====

Declarative, ad hoc parameter tweaking for JavaScript. After loading the library, a single line
of Javascript, e.g.

```javascript
Tweak('step').in(animationParameters).as('int').within(0, 100);
```

will bind the value of the `'step'` property of the `animationParameters` object to a slider widget
whose range is [0, 100] that is rendered on a control page at `http://localhost:8888`. Manipulations of
the slider update the value of the property in real time on the client page.

Tweak consists of a Tornado server and a JavaScript client library that together create and maintain
widget/parameter bindings via WebSockets. Tweak has an extensible type system, allowing new widgets
to be written and rendered when specified in the `.as()` method.

Installation
------------

Tweak server requires Tornado:

`pip install tornado`

Usage
-----

Suppose you are working on a (pretty boring) animation of a small red block on a web page.
You might have html, with the Tweak client included, like

```html
<html>
  <head>
    <title>Very simple example</title>
    <script type="text/javascript" src="tweak.js"></script>
  </head>
  <body>
    <div id="mover" style="position:absolute; width:20px; height:20px; background-color:red;"></div>
  </body>
</html>
```

and a simple animation script to move the red block back and forth

```javascript
window.onload = function () {
  var mover = document.getElementById('mover');

  var animationParameters = {
    step: 10,
    minX: 0,
    maxX: 400
  };

  var positionX = animationParameters.minX,
      direction = 1;

  function animate() {
    positionX += direction * animationParameters.step;
    mover.style.left = positionX + 'px';

    if (positionX >= animationParameters.maxX || positionX <= animationParameters.minX) {
      direction = -direction;
    }
    animationFrame = window.requestAnimationFrame(animate);
  }
  var animationFrame = window.requestAnimationFrame(animate);
};
```

To tweak the `step` parameter, just say you want to by putting

```javascript
Tweak('step').in(animationParameters).as('int').within(0, 100);
```

after the `animationParameters` declaration. After starting the server, `python tweak.py`,
and loading the client page, a slider will be bound to the value of `step` on `http://localhost:8888`:


