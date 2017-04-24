
function GLStrokeRenderer(){
    this.brushTexture;
    this.canvasTexture;
    this.uniforms = [];
    this.vertexBuffers = [];
}
GLStrokeRenderer.prototype={
    setBrushTexture: function (t)
    {
        brushTexture = t;
    },
    setCanvasTexture: function(t)
    {
        canvasTexture = t;
    },

    drawStroke: function(pos)
    {
        renderTexture.drawTo(function() {
            gl.enable(gl.BLEND);
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.loadIdentity();
            gl.translate(0, 0, -1);
        });
    },
    bindAttribute:function (attributeName,attributeValue)
    {
        var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
        vertices.data = vertices.data.concat(attributeValue);
        vertices.compile();
        vertexBuffers[attributeName] = vertices;
    },
    bindUniform:function (uniformName,uniformValue)
    {
        uniforms[uniformName] = uniformValue;
    },
    bindTextures:function()
    {
        brushTexture.bind(0);
        canvasTexture.bind(1);
    },
    bindStrokeShader:function (pointData)
    {
        uniforms = new Object;
        vertexBuffers = new Object;
        bindTextures();

        bindUniform('texture',0);
        bindUniform('mvp',mvp);
        bindUniform('color',currentColor);
        //TODO--should interpolate as attribute
        bindUniform('velocity',[dir.x,dir.y]);

        bindAttribute('vertexPosition',pointData.positions);
        bindAttribute('force',pointData.force);

        vertexShader.drawBuffers(vertexBuffers, null, gl.POINTS);
        vertexShader.uniforms(uniforms);
    }
};