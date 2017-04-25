/// <reference path="lightgl.js" />
/// <reference path="render/GLStrokeRenderer.js" />
var gl = GL.create({preserveDrawingBuffer: true,premultipledAlpha:true});
$('#document').ready(function(){
      // document.body.style.zoom="100%";
      
      //'alpha':true, 
      document.body.appendChild(gl.canvas);
      document.body.style.overflow = 'hidden';
      
      var palatteColor  = [1.0,0.0,0.0,1.0];
      var currentColor;
      $('#color-picker').change(function()
      {
          var r = parseInt($(this).val().substring(1,3), 16);
          var g = parseInt($(this).val().substring(3,5), 16);
          var b = parseInt($(this).val().substring(5,7), 16);
          palatteColor = [r/255,g/255,b/255,1];
      });
      
      var width = gl.canvas.width;
      var height = gl.canvas.height;
      var mesh = GL.Mesh.plane({ coords: true });
      var mvp = GL.Matrix.ortho(0, width, 0, height, -1,1).m;

      mesh.verteices = [[0, 0, 0], [width, 0, 0], [0, height, 0], [width, height, 0]];
      var renderTexture = new GL.Texture(width, height);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      var texture = GL.Texture.fromURL('img/brush/flat.png',{format:gl.RGBA});
      var bgTexture = GL.Texture.fromURL('paper_sketch.png');
      
      
      var vertBrush = document.getElementById("vertex-brush");
      var fragBrush = document.getElementById("fragment-brush");
      
      var vertRenderTexture = document.getElementById("vertex-renderTexture");
      var fragRenderTexture = document.getElementById("fragment-renderTexture");
      var vertexShader = new GL.Shader(vertBrush.text,fragBrush.text);
      var shader = new GL.Shader(vertRenderTexture.text,fragRenderTexture.text);
      var strokeRenderer = new GLStrokeRenderer(texture,renderTexture,mvp,vertexShader);

      //var mvp = GL.Matrix.translate(0,0,-2);
      //changeBrush();
      /*
      function PaintPoint(pos){
        this.position = pos;//Vector
        this.force = 1;//float
        this.altitude = 0;//float
        this.azimuth = GL.Vector(0,0);
        this.velocity = 0;
      }*/

      var angle;
      gl.onupdate = function(seconds) {
        angle += 45 * seconds;
      };

      gl.scale(2,2,2);
      
      var startPos;
      var force = 0;
      //gl.fullscreen({ fov: 45, near: 0.1, far: 1000 });
      
      function drawStroke(pos)
      {
        texture.bind(0);
        renderTexture.bind(1);
        renderTexture.drawTo(function() {
          //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          //gl.clearColor(1,1,1,1);
          gl.enable(gl.BLEND);
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          gl.loadIdentity();
          gl.translate(0, 0, -1);
          var pts = interpolatePoints(lastPos,pos);
          if(pts ==null)
          return;
          lastPos = pos;

          var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
          vertices.data = vertices.data.concat(pts);
          vertices.compile();
          
          var vertexBuffers = {'vertexPosition':vertices};
          vertexShader.drawBuffers(vertexBuffers, null, gl.POINTS);
          vertexShader.uniforms({'canvas':1,'texture': 0,'mvp':mvp,'color':currentColor,'velocity':[dir.x,dir.y],'force':force});

        });
        texture.unbind(0);
        //gl.ondraw();
        renderScene();
      }
      function interpolatePoints(sp, ep)
      {
        //var returnObj = new Object;
        var points = [];
        var size = 1;
        var kBrushPixelStep = size*3;
        var dis = ep.subtract(sp).length();
        //console.log(dis);
        var pnum = Math.ceil(dis / kBrushPixelStep);
        //console.log(pnum);
        if(pnum<kBrushPixelStep)
        return null;
        var count = pnum;
        //console.log(count);
        
        for(var i =0;i<=count;i+=0.1)
        {
          var v = GL.Vector.lerp(sp,ep,i/count);
          points.push([v.x,v.y,v.z,1]);
          
        }

        //returnObj.positions = points;
        //returnObj.velocities = 
        return points;
      }
      var clearCanvas = function()
      {
          renderTexture.drawTo(function() {
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              gl.clearColor(1,1,1,1);
          });
          renderScene();
      }
      var renderScene = function()
      {
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);          
          gl.enable(gl.BLEND);
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

          drawBG();
          drawRenderTexture();
          //drawTest();
      }
      
      var drawTest = function()
      {
          texture.bind(0);
          shader.uniforms({
            'renderTexture':0,'mvp':mvp
          }).draw(mesh);
          texture.unbind(0);
      }
      var drawRenderTexture = function()
      {
          renderTexture.bind(0);
          shader.uniforms({
            'renderTexture':0,'mvp':mvp
          }).draw(mesh);
          renderTexture.unbind(0);
      }
      function readPixel(x,y)
      {
          renderTexture.bind(0);
          renderTexture.canDrawTo();
          var framebuffer = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture.id, 0);
          var pixels = new Uint8Array(4);
          gl.readPixels(x, y, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          var f = new Float32Array(4);
          for(var i=0;i<4;i++)
          {
            f[i] = pixels[i]/255;
          }
          renderTexture.unbind(0);
          //console.log(pixels); // Uint8Array
          //pixels/=255;
          return f;
      }
      function readPixels()
      {
        var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        console.log(pixels); // Uint8Array
      }
      function blendColorAlpha(c1,c2,weight)
      {
        var a1 = c1[3];
        var a2 = c2[3];
        var af = a1+a2*(1-a1);
        var cf = new Array(4);
        for(var i=0;i<4;i++)
        {
          cf[i] = (c1[i]*a1+c2[i]*a2*(1-a1))/af;
        }
        cf[3] = af;
        return cf;
      }
      function blendColor(ori,current,canvas)
      {
        var oriWeight = 0.01;
        var currentWeight = 0.9;
        var canvasWeight = 0.09;

        var cf = new Array(4);
        //var alphaTotal = weight*(c1[3]+c2[3]);
        /*
        for(var i=0;i<4;i++)
        {
          cf[i] = ori[i]*oriWeight;
          cf[i] += current[i]*currentWeight;
          cf[i] += canvas[i]*canvasWeight;
          //cf[i]/=alphaTotal;
        }*/
        
        for(var i=0;i<3;i++)
        {
          //255 - SQRT(((255-Color1.R)^2 + (255-Color2.R)^2)/2)
         
          
          
            var op2 = (1-ori[i]/ori[3]);
            var cp2 = (1-canvas[i]/canvas[3]);
            var up2 = (1-current[i]/current[3]);
            if(canvas[3]==0)
            {
              cp2 = 0;
              oriWeight = 0.1;
            }
            cf[i] = 1-Math.sqrt((op2*op2*oriWeight+cp2*cp2*canvasWeight+up2*up2*currentWeight));
            //cf[i] = ori[i]/ori[3]*canvas[i]/canvas[3];
          
        }
        cf[3] = 1;

        return cf;
      }
      function drawBG()
      {
          bgTexture.bind(0);
          shader.uniforms({
              'renderTexture': 0,'mvp':mvp
          }).draw(mesh);
          bgTexture.unbind(0);
      }
      var x = 0;
      var y = 0;
      
      gl.ondraw = function() {
        x+=0.1;

        pos[0].x = x;
        //drawStroke(lastPos,pos);
        //renderScene();
        lastPos = pos;
      };
      //clearCanvas();
      var pos; 
      var lastPos; 
      var dir;

      var isMouseDown = false;
      var isPen = false;
      var plugin = document.getElementById('wtPlugin');
      $(window).bind('mousedown',function(e){
        isMouseDown = true;
        x = e.offsetX;
        y = height-e.offsetY;
        lastPos = new GL.Vector(x,y);
        lastPoint = new PaintPoint(lastPos,0,null);
       currentColor = palatteColor;
       if(plugin.penAPI!=undefined)
        {
          var api = plugin.penAPI;
            force = api.pressure;
          if(force==0)
            isPen = false
          else
            isPen = true;
        }
       //draw single dot

      });
      $(window).bind('mouseup',function(e){
        isMouseDown = false;
        lastPoint = null;
         dir = null;
         currentColor = null;
      });
      var lastPoint;
      $(window).bind('mousemove', mousemove);
      function mousemove(e){
        if(!isMouseDown)
          return;
        
           
        
      
        if(isPen)
        {
          if(plugin.penAPI!=undefined)
          {
              var api = plugin.penAPI;
              force = api.pressure;
            
          }
        }
        
        else
          force = 1;
        
          
        var x, y;
        x = e.offsetX;
        y = height-e.offsetY;
        var pos = new GL.Vector(x,y);
      
        var canvasColor = readPixel(x,y);
        //color = palatteColor;
        
        if(currentColor==null)
        {
          currentColor = palatteColor;
        }
        else
        {
          currentColor = blendColor(palatteColor,currentColor,canvasColor,0.5);
          //console.log(color);
        }
        if(lastPoint!=null)
        {
          var newDir = pos.subtract(lastPos);
          
            dir = newDir;
         
          //drawStroke(pos);
          var point = new PaintPoint(pos,currentColor,force,dir);
          //var lastPoint = new PaintPoint(lastPos,force,dir);
          if(strokeRenderer.drawStroke(lastPoint,point))
          {
            renderScene();
            lastPos = pos;
            lastPoint = point;
          }
        }
      }
      
        /*
        var glcanvas;
        $('#document').ready(function()
        {
          glcanvas = new GLCanvas();
          
          glcanvas.renderScene();

        })*/
        //gl.animate();
      });
  