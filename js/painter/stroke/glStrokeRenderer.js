/// <reference path="PaintPoint.js" />
var GLStrokeRenderer = function(brushTexture,canvasTexture,mvp,shader){
    //MVP Matrix
    this.mvp = mvp;
    this.vertexShader = shader;

    //brush texture:Texture
    this.brushTexture = brushTexture;
    this.canvasTexture = canvasTexture;
    this.uniforms = new Object();
    this.vertexBuffers = new Object();
    
    
    this.bindUniform = function (uniformName,uniformValue)
    {
        this.uniforms[uniformName] = uniformValue;
    };
    this.bindTextures = function()
    {
        this.brushTexture.bind(0);
        this.canvasTexture.bind(1);
    };
    this.bindAttribute = function (attributeName,attributeValue)
    {
        var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
        vertices.data = vertices.data.concat(attributeValue);
        vertices.compile();
        this.vertexBuffers[attributeName] = vertices;
    };
    this.bindStrokeShader =function (pointData)
    {
        this.uniforms = new Object;
        this.vertexBuffers = new Object;
        this.bindTextures();
        this.bindUniform('texture',0);
        this.bindUniform('mvp',this.mvp);
        
        this.bindAttribute('vertexPosition',pointData.positions);
        this.bindAttribute('velocity',pointData.velocities);
        console.log(pointData.velocities);
        this.bindAttribute('force',pointData.forces);
        this.bindAttribute('color',pointData.colors);

        this.vertexShader.drawBuffers(this.vertexBuffers, null, gl.POINTS);
        this.vertexShader.uniforms(this.uniforms);
    };
}
GLStrokeRenderer.prototype.setBrushTexture = function (t)
{
    this.brushTexture = t;
};
GLStrokeRenderer.prototype.setCanvasTexture = function(t)
{
    this.canvasTexture = t;
};

GLStrokeRenderer.prototype.drawStroke = function(lastPoint,point)
{
    var renderer = this;
    var pointData = PaintPoint.interpolate(lastPoint,point);
    if(pointData==null)
    {
        return false;
    }
    this.canvasTexture.drawTo(function() {
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.loadIdentity();
        gl.translate(0, 0, -1);
        renderer.bindStrokeShader(pointData);
    });
    this.brushTexture.unbind(0);
    return true;
};





