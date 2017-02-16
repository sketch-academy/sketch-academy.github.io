fabric.Sprite = fabric.util.createClass(fabric.Image, {

  type: 'sprite',

  spriteWidth: 288,
  spriteHeight: 288,
  spriteIndex: 0,

  initialize: function(element, options) {
    options || (options = { });
    options.width = this.spriteWidth;
    options.height = this.spriteHeight;

    this.callSuper('initialize', element, options);
    this.createTmpCanvas();
    this.createSpriteImages();
  },

  createTmpCanvas: function() {
    this.tmpCanvasEl = fabric.util.createCanvasElement();
    this.tmpCanvasEl.width = this.spriteWidth || this.width;
    this.tmpCanvasEl.height = this.spriteHeight || this.height;
  },

  createSpriteImages: function() {
    this.spriteImages = [ ];

    //var steps = this._element.width / this.spriteWidth;
    var xsteps = this._element.width / this.spriteWidth;
    var ysteps = this._element.height / this.spriteHeight;
    if(ysteps>2)
      ysteps = 2;

     
      for (var j = 0; j< ysteps; j++)
        for (var i = 0; i < xsteps; i++)
        {
          this.createSpriteImage(i,j);
        }
    
  },
  createSpriteImage: function(i,j)
  {
     var tmpCtx = this.tmpCanvasEl.getContext('2d');
    tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
    tmpCtx.drawImage(this._element, -i * this.spriteWidth, -j*this.spriteHeight);

    var dataURL = this.tmpCanvasEl.toDataURL('image/png');
    var tmpImg = fabric.util.createImage();
    tmpImg.src = dataURL;

    this.spriteImages.push(tmpImg);
  },
  /*
  createSpriteImage: function(i) {
    var tmpCtx = this.tmpCanvasEl.getContext('2d');
    tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
    tmpCtx.drawImage(this._element, -i * this.spriteWidth, 0);

    var dataURL = this.tmpCanvasEl.toDataURL('image/png');
    var tmpImg = fabric.util.createImage();

    tmpImg.src = dataURL;

    this.spriteImages.push(tmpImg);
  },*/

  _render: function(ctx) {
    ctx.drawImage(
      this.spriteImages[this.spriteIndex],
      -this.width / 2,
      -this.height / 2
    );
  },

  play: function() {
    var _this = this;
    this.animInterval = setInterval(function() {
      _this.onPlay && _this.onPlay();
      _this.spriteIndex++;
      if (_this.spriteIndex === _this.spriteImages.length) {
        _this.spriteIndex = 0;
      }
    }, 100);
  },

  stop: function() {
    clearInterval(this.animInterval);
  }
});

fabric.Sprite.fromURL = function(url, callback, imgOptions) {
  fabric.util.loadImage(url, function(img) {
    callback(new fabric.Sprite(img, imgOptions));
  });
};

fabric.Sprite.async = true;