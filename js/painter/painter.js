/// <reference path="lightgl.js" />
/// <reference path="render/GLStrokeRenderer.js" />
var gl = GL.create({preserveDrawingBuffer: true,premultipledAlpha:true});
$('#document').ready(function(){
      // document.body.style.zoom="100%";
      console.log($('#eraser-btn'));
      $('#eraser-btn').click(function(){
        console.log("clicked");
        brushType = "eraser";
      });
      $('#layer').click(function()
      {
        //$(this).find(":selected").text();

        //  取得被選擇項目的值
        var value = $(this).find(":selected").val();
        if(value == "+")
        {
          layers.push(new GL.Texture(width,height));
          $(this).append($("<option></option>").attr("value", layers.length-1).text("Layer:"+(layers.length-1)));
        }
      });
      $('#brush-btn').click(function()
      {
        brushType = "brush";
      })
      var zoomScale= 1;
      $('#zoomin-btn').click(function()
      {
        zoom.to({
          x: 500,
          y: 500,
          scale: zoomScale+=0.1
        });
      })
      $('#zoomout-btn').click(function()
      {
        zoom.to({
          x: 500,
          y: 500,
          scale: zoomScale-=0.1,
          pan:false
        });
      })


      //'alpha':true, 
      $('#canvas-area').append(gl.canvas);
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
      
      var width = gl.canvas.width = 1280;
      var height = gl.canvas.height = 800;
      var mesh = GL.Mesh.plane({ coords: true });
      var pMatrix = GL.Matrix.ortho(0, width, 0, height, -1,1);
      var renderMVP = GL.Matrix.identity();

      mesh.verteices = [[0, 0, 0], [width, 0, 0], [0, height, 0], [width, height, 0]];
      var layers = new Array();
      layers.push(new GL.Texture(width, height));
      var currentLayer = layers[0];

      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      var texture = GL.Texture.fromURL('img/brush/flat.png',{format:gl.RGBA});
      var practiceTexture = GL.Texture.fromURL('img/practice/boldhead.jpg',{format:gl.RGBA});
      var bgTexture = GL.Texture.fromURL('paper_sketch.png');
      
      
      var vertBrush = document.getElementById("vertex-brush");
      var fragBrush = document.getElementById("fragment-brush");
      
      var vertRenderTexture = document.getElementById("vertex-renderTexture");
      var fragRenderTexture = document.getElementById("fragment-renderTexture");
      var vertexShader = new GL.Shader(vertBrush.text,fragBrush.text);
      var shader = new GL.Shader(vertRenderTexture.text,fragRenderTexture.text);
      var strokeRenderer = new GLStrokeRenderer(texture,currentLayer,pMatrix,vertexShader);

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

      //var angle;
      gl.onupdate = function(seconds) {
        
      };

      //gl.scale(2,2,2);
      
      var startPos;
      var force = 0;
      //gl.fullscreen({ fov: 45, near: 0.1, far: 1000 });
      
      
      
      var clearCanvas = function()
      {
          currentLayer.drawTo(function() {
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              gl.clearColor(1,1,1,1);
          });
          renderScene();
      }
      var canvasScale = 1;
      var disx=0,disy = 0;
      var pivotx = 0,pivoty = 0;
      var newScale = 1;

      //calculateTest();
      function calculateTest()
      {
          pivotx = 2;
          pivoty = 2;
          canvasPos = new GL.Vector(1,1);
          disx = -(canvasPos.x-pivotx);
          disy = -(canvasPos.y-pivoty);

          var awayMatrix = GL.Matrix.translate(-disx,-disy,0);
          var scaleMatrix = GL.Matrix.scale(2,2,2);
          var backMatrix = GL.Matrix.translate(disx,disy,0);
          //var trans2Matrix = GL.Matrix.translate(-canvasPos.x,-canvasPos.y,0);
          renderMVP = GL.Matrix.identity();
          renderMVP = GL.Matrix.multiply(awayMatrix,renderMVP);
          
          renderMVP = GL.Matrix.multiply(scaleMatrix,renderMVP);
          
          renderMVP = GL.Matrix.multiply(backMatrix,renderMVP); 
          
      }
      var renderScene = function()
      {
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);          
          gl.enable(gl.BLEND);
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          
          var divideScale = newScale/canvasScale;
         // pivotx = 1;
          //pivoty = 1;
          console.log(canvasPos);
          disx = pivotx;
          disy = pivoty;

          var pos = renderMVP.inverse().transformPoint(new GL.Vector(pivotx,pivoty));
        
          if(pos.x > 1)
          {
            disx = 0.8;
          }
          else if(pos.x<-1)
          {
            disx = -0.8;
          }
          if(pos.y>1)
          {
            disy = 0.8;
          }
          else if(pos.y<-1)
          {
            disy = -0.8;
          }

          var awayMatrix = GL.Matrix.translate(-disx,-disy,0);
          var scaleMatrix = GL.Matrix.scale(divideScale,divideScale,divideScale);
          var backMatrix = GL.Matrix.translate(disx,disy,0);
          //var trans2Matrix = GL.Matrix.translate(-canvasPos.x,-canvasPos.y,0);
          //renderMVP = GL.Matrix.identity();
          renderMVP = GL.Matrix.multiply(awayMatrix,renderMVP);
          //console.log(renderMVP.transformPoint(vec));
          renderMVP = GL.Matrix.multiply(scaleMatrix,renderMVP);
          //console.log(renderMVP.transformPoint(vec));
          renderMVP = GL.Matrix.multiply(backMatrix,renderMVP);
          //console.log(renderMVP.transformPoint(vec));
          
          //var transMatrix = GL.Matrix.translate(canvasPos.x,canvasPos.y,0);
          //renderMVP = GL.Matrix.multiply(transMatrix,renderMVP);
          
          
          //console.log(renderMVP.transformPoint(vec));
          
          
          canvasScale = newScale;
          //gl.translate(disx,disy, 0);//移到pivot
          //gl.scale(canvasScale,canvasScale,canvasScale);//scale, 放大pivot的移動
          //gl.translate(-disx,-disy,0);//修正
          
          drawBG();
          for(var i = 0 ;i<layers.length;i++)
          {
            drawRenderTexture(layers[i]);
          }
          
          //drawTest();
      }
      function drawRenderTexture(texture)
      {
          texture.bind(0);
          shader.uniforms({
            'renderTexture':0,'mvp':renderMVP
          }).draw(mesh);
          texture.unbind(0);
      }
      /*
      var drawRenderTexture = function()
      {
          renderTexture.bind(0);
          shader.uniforms({
            'renderTexture':0,'mvp':renderMVP
          }).draw(mesh);
          renderTexture.unbind(0);
      }*/
      function readPixel(x,y)
      {
          currentLayer.bind(0);
          currentLayer.canDrawTo();
          var framebuffer = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentLayer.id, 0);
          var pixels = new Uint8Array(4);
          gl.readPixels(x, y, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          var f = new Float32Array(4);
          for(var i=0;i<4;i++)
          {
            f[i] = pixels[i]/255;
          }
          currentLayer.unbind(0);
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
        }
        cf[3] = 1;

        return cf;
      }
      function drawBG()
      {
          //bgTexture.bind(0);
          practiceTexture.bind(0);
          shader.uniforms({
              'renderTexture': 0,'mvp':renderMVP
          }).draw(mesh);
          practiceTexture.bind(0);
          //bgTexture.unbind(0);
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
      var brushType = "brush";
      var isMouseDown = false;
      var isPen = false;
      var plugin = document.getElementById('wtPlugin');

      $(gl.canvas).bind('mousedown',function(e){
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
      
      var lastPoint;
      var scroll = 3;
      var canZoom = true;
      var lastPivotX = 0;
      var lastPivotY = 0;
      var oldCanvasPosX = 0;
      var oldCanvasPosY = 0;
      var canvasPos = new GL.Vector(0,0,0);
      var scaleTable = [0.2,0.333,0.5,1,2,4,5,6,8];
      var macScroll = 0;
      $(gl.canvas).mousewheel(function(e)
      {
        if(isMouseDown)
        return;

        if (e.ctrlKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          macScroll-=e.deltaY;
          scroll = macScroll/10;
        }
        else
        {
                  scroll-=e.deltaY;
        }
        if(scroll<=0)
          scroll = 0;
        //console.log(e.clientX);
          
          if(scroll>=scaleTable.length)
            scroll = scaleTable.length-1;
          newScale = scaleTable[scroll];
          pivotx = e.offsetX*2/width-1;
          pivoty = -(e.offsetY*2/height-1);
          
          
          console.log(newScale);
          renderScene();
        
        
      });
      $(gl.canvas).bind('mouseup',function(e){
        isMouseDown = false;
        lastPoint = null;
         dir = null;
         currentColor = null;
      });
      $(gl.canvas).bind('mousemove', mousemove);
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
        
        
        //var pos = new GL.Vector((x-width/2*(1+disx))/canvasScale+width/2,(y-height/2*(1+disy))/canvasScale+height/2);
        var pos = new GL.Vector(e.offsetX*2/width-1,-(e.offsetY*2/height-1));
        pos = renderMVP.inverse().transformPoint(pos);
        
        //pos = r.transformPoint(pos);
        //pos = renderMVP.transformPoint(pos);
        
        pos.x = (pos.x+1)*width/2;
        pos.y = (pos.y+1)*height/2;
        
      
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
          
          for(var i=0;i<4;i++)
          {
            currentColor[i]*=0.1;  
          }
          
          var point = new PaintPoint(pos,currentColor,force,dir);
          //var lastPoint = new PaintPoint(lastPos,force,dir);
          if(strokeRenderer.drawStroke(lastPoint,point,brushType))
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
  