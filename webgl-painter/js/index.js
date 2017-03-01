(function() {
  var ColorCanvas, GLBase, MainCanvas, Pencil,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Pencil = (function() {
    function Pencil() {
      this.radius = 0.025;
      this.expoent = 1;
    }

    return Pencil;

  })();

  GLBase = (function() {
    function GLBase(_canvas) {
      var err;
      this._canvas = _canvas;
      try {
        this.gl = this._canvas.getContext("experimental-webgl") || this._canvas.getContext("webgl");
      } catch (error) {
        err = error;
        console.log(err.message);
        alert(err.message);
      }
      this.mvMatrix = mat4.create();
      this.pMatrix = mat4.create();
      this.data = {};
    }

    GLBase.prototype.initShaders = function(fs, vs) {
      var fragmentShader, vertexShader;
      fragmentShader = this.getShader(fs);
      vertexShader = this.getShader(vs);
      this.shaderProgram = this.gl.createProgram();
      this.gl.attachShader(this.shaderProgram, vertexShader);
      this.gl.attachShader(this.shaderProgram, fragmentShader);
      this.gl.linkProgram(this.shaderProgram);
      if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
        console.log('Não pode inicializar shaders!');
      }
      this.gl.useProgram(this.shaderProgram);
      this.data.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
      this.gl.enableVertexAttribArray(this.data.vertexPositionAttribute);
      this.data.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
      this.gl.enableVertexAttribArray(this.data.textureCoordAttribute);
      this.data.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
      this.data.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
      return this.data.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
    };

    GLBase.prototype.setMatrixUniforms = function() {
      var normalMatrix;
      this.gl.uniformMatrix4fv(this.data.pMatrixUniform, false, this.pMatrix);
      this.gl.uniformMatrix4fv(this.data.mvMatrixUniform, false, this.mvMatrix);
      normalMatrix = mat3.create();
      mat4.toInverseMat3(this.mvMatrix, normalMatrix);
      mat3.transpose(normalMatrix);
      return this.gl.uniformMatrix3fv(this.data.nMatrixUniform, false, normalMatrix);
    };

    GLBase.prototype.getShader = function(id) {
      var k, shader, shaderScript, str;
      shaderScript = document.getElementById(id);
      if (shaderScript === null) {
        return false;
      }
      str = '';
      k = shaderScript.firstChild;
      while (k) {
        if (k.nodeType === 3) {
          str += k.textContent;
        }
        k = k.nextSibling;
      }
      if (shaderScript.type === "x-shader/x-fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      } else {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
      }
      this.gl.shaderSource(shader, str);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(shader));
        return false;
      }
      return shader;
    };

    GLBase.prototype.initBuffers = function() {
      return this.bufferPlane();
    };

    GLBase.prototype.bufferPlane = function() {
      var buffer, colors, indices, normais, uv, vertices;
      vertices = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
      buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      buffer.itemSize = 3;
      buffer.numItems = 4;
      this.data.vertexPositionBuffer = buffer;
      normais = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
      buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normais), this.gl.STATIC_DRAW);
      buffer.itemSize = 3;
      buffer.numItems = 4;
      this.data.vertexNormalsBuffer = buffer;
      colors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
      buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
      buffer.itemSize = 4;
      buffer.numItems = 4;
      this.data.vertexColorBuffer = buffer;
      uv = [0, 0, 1, 0, 0, 1, 1, 1];
      buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);
      buffer.itemSize = 2;
      buffer.numItems = 4;
      this.data.vertexTextureCoordBuffer = buffer;
      indices = [0, 1, 2, 2, 3, 1];
      buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
      buffer.itemSize = 1;
      buffer.numItems = 6;
      return this.data.vertexIndexBuffer = buffer;
    };

    GLBase.prototype.handleTexture = function(texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.scaled = Math.max(this.WIDTH / this.image.width(), this.HEIGHT / this.image.height());
      return this.scaled /= 2;
    };

    GLBase.prototype.initImage = function() {
      this.data.texture0 = this.gl.createTexture();
      this.data.texture0.image = this.image[0];
      this.data.texture0.image.crossOrigin = '';
      if (!this.image[0].complete || this.image[0].naturalWidth === void 0 || this.image[0].naturalWidth === 0) {
        return this.data.texture0.image.onload = (function(_this) {
          return function(e) {
            return _this.handleTexture(_this.data.texture0);
          };
        })(this);
      } else {
        return this.handleTexture(this.data.texture0);
      }
    };

    return GLBase;

  })();

  ColorCanvas = (function(superClass) {
    extend(ColorCanvas, superClass);

    function ColorCanvas(canvas) {
      this.color = document.createElement('canvas');
      this.colorBuffer = document.createElement('canvas');
      this.colorBuffer.width = this.color.width = canvas.width;
      this.colorBuffer.height = this.color.height = canvas.height;
      this.resetTextures();
      this.gl.clearColor(0.8, 0.8, 0.8, 0.0);
    }

    return ColorCanvas;

  })(GLBase);

  MainCanvas = (function(superClass) {
    extend(MainCanvas, superClass);

    function MainCanvas() {
      this.mouseout = bind(this.mouseout, this);
      this.mouseover = bind(this.mouseover, this);
      this.mousemove = bind(this.mousemove, this);
      this.mouseup = bind(this.mouseup, this);
      this.mousedown = bind(this.mousedown, this);
      this.render = bind(this.render, this);
      this.canvas = $('#screen');
      MainCanvas.__super__.constructor.call(this, this.canvas[0]);
      this.med = [0.5, 0.5];
      this.scaled = 1;
      this.pencil = new Pencil();
      this.relief = document.createElement('canvas');
      this.color = document.createElement('canvas');
      this.colorBuffer = document.createElement('canvas');
      this.normalBuffer = document.createElement('canvas');
      this.colorBuffer.width = this.normalBuffer.width = this.relief.width = this.color.width = this.canvas[0].width;
      this.colorBuffer.height = this.normalBuffer.height = this.relief.height = this.color.height = this.canvas[0].height;
      this.resetTextures();
      this.gl.clearColor(0.8, 0.8, 0.8, 0.0);
      this.mouse = {
        x: .5,
        y: .5
      };
      this.uAmbientColor = [0.5, 0.5, 0.5, 1.0];
      this.uLightingDirection = [0.5, 0.5, -1.0];
      this.uDirectionalColor = [1, 1, 1, 1.0];
      this.initShaders('shader-fs', 'shader-vs');
      this.customData();
      this.initBuffers();
      this.initTextures();
      this.render();
      this.canvas.mousedown(this.mousedown);
    }

    MainCanvas.prototype.customData = function() {
      this.data.colorBuffer = this.gl.getUniformLocation(this.shaderProgram, "colorBuffer");
      this.data.reliefBuffer = this.gl.getUniformLocation(this.shaderProgram, "reliefBuffer");
      this.data.medUniform = this.gl.getUniformLocation(this.shaderProgram, "med");
      this.data.scaledUniform = this.gl.getUniformLocation(this.shaderProgram, "scaled");
      this.data.radiusUniform = this.gl.getUniformLocation(this.shaderProgram, "radius");
      this.data.expoentUniform = this.gl.getUniformLocation(this.shaderProgram, "expoent");
      this.data.mouse = this.gl.getUniformLocation(this.shaderProgram, "mouse");
      return this.data.tick = this.gl.getUniformLocation(this.shaderProgram, "tick");
    };

    MainCanvas.prototype.initTextures = function() {
      this.data.texture0 = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture0);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.data.texture1 = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture1);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      return this.updateTextures();
    };

    MainCanvas.prototype.updateTextures = function() {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture0);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.color);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture1);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.relief);
      return this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    };

    MainCanvas.prototype.paintTextures = function() {
      //??
      var c0, c1;
      c0 = this.color.getContext('2d');
      c1 = this.canvas[0].getContext('2d');
      c0.clearRect(0, 0, this.color.width, this.color.height);
      c0.drawImage(this.canvas[0], 0, 0);
      return this.updateTextures();
    };

    MainCanvas.prototype.resetTextures = function() {
      var cx;
      cx = this.color.getContext('2d');
      cx.clearRect(0, 0, this.color.width, this.color.height);
      cx = this.relief.getContext('2d');
      cx.fillStyle = "#8080ff";
      return cx.fillRect(0, 0, this.color.width, this.color.height);
    };

    MainCanvas.prototype.render = function(t) {
      var tk;
      this.gl.viewport(0, 0, this.canvas[0].width, this.canvas[0].height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      mat4.identity(this.pMatrix);
      mat4.identity(this.mvMatrix);
      tk = t % 1000 * .001;
      this.gl.uniform1f(this.data.tick, tk);
      this.gl.uniform2f(this.data.mouse, parseFloat(this.mouse.x), parseFloat(this.mouse.y));
      this.gl.uniform1f(this.data.scaledUniform, this.scaled);
      this.gl.uniform2f(this.data.medUniform, parseFloat(this.med[0]), parseFloat(this.med[1]));
      this.gl.uniform1f(this.data.radiusUniform, this.pencil.radius);
      this.gl.uniform1f(this.data.expoentUniform, this.pencil.expoent);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.data.vertexPositionBuffer);
      this.gl.vertexAttribPointer(this.data.vertexPositionAttribute, this.data.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.data.vertexTextureCoordBuffer);
      this.gl.vertexAttribPointer(this.data.textureCoordAttribute, this.data.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture0);
      this.gl.uniform1i(this.data.colorBuffer, 0);
      this.gl.activeTexture(this.gl.TEXTURE0 + 1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture1);
      this.gl.uniform1i(this.data.reliefBuffer, 1);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.data.vertexIndexBuffer);
      this.setMatrixUniforms();
      return this.gl.drawElements(this.gl.TRIANGLES, this.data.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
    };
//input functions
    MainCanvas.prototype.mousedown = function(e) {
      var o2;
      $(window).bind('mousemove', this.mousemove).bind('mouseup', this.mouseup);
      o2 = this.canvas.offset();
      this.mouse.x = e.offsetX / this.canvas[0].width;
      this.mouse.y = 1.0 - (e.offsetY / this.canvas[0].height);
      this.render();
      return this.paintTextures();
    };

    MainCanvas.prototype.mouseup = function(e) {
      var o2;
      $(window).unbind('mousemove', this.mousemove).unbind('mouseup', this.mouseup);
      o2 = this.canvas.offset();
      this.mouse.x = e.offsetX / this.canvas[0].width;
      this.mouse.y = 1.0 - (e.offsetY / this.canvas[0].height);
      this.render();
      return this.paintTextures();
    };

    MainCanvas.prototype.mousemove = function(e) {
      var o2, x, y;
      o2 = this.canvas.offset();
      x = e.offsetX + o2.left;
      y = e.offsetY + o2.top;
      this.med[0] = e.offsetX / this.canvas[0].width;
      this.med[1] = 1.0 - (e.offsetY / this.canvas[0].height);
      this.mouse.x = e.offsetX / this.canvas[0].width;
      this.mouse.y = 1.0 - (e.offsetY / this.canvas[0].height);
      this.render();
      return this.paintTextures();
    };

    MainCanvas.prototype.mouseover = function(e) {};

    MainCanvas.prototype.mouseout = function(e) {};

    return MainCanvas;

  })(GLBase);

  window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(callback, 40);
  };

  window.onload = function(e) {
    var mainCanvas;
    console.clear();
    return mainCanvas = new MainCanvas();
  };

}).call(this);