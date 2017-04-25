
var PaintPoint = function(position,color,force,velocity)
{
    this.position = position;
    this.force = force;
    this.color = color;
    this.velocity = velocity;
}

//return null if p1 and p2 too close
PaintPoint.interpolate = function(p1,p2)
{
    var positions = [];
    var forces = [];
    var velocities = [];
    var colors = [];
    var size = 1;
    var kBrushPixelStep = size*3;
    var dis = p1.position.subtract(p2.position).length();
    var pnum = Math.ceil(dis / kBrushPixelStep);
    if(pnum<kBrushPixelStep)
    return null;
    var count = pnum;
    if(p1.velocity==null)
    {
        p1.velocity = p2.velocity;
    }
    for(var i =0;i<=count;i+=0.1)
    {   

        var t = i/count;
        var arc = 0.5-Math.abs(t-0.5);

        var pos = GL.Vector.lerp(p1.position,p2.position,t);
        var vel = GL.Vector.lerp(p1.velocity,p2.velocity,t);
        //pos.x+=arc*vel.x;
        //pos.y+=arc*vel.y;
        forces.push(p1.force +  t * (p2.force-p1.force));        
        
        positions.push([pos.x,pos.y,pos.z,1]);
        var color = new Array(4);
        for(var j=0;j<4;j++)
        {
            color[j] = p1.color[j]+t*(p2.color[j]-p1.color[j]);
        }
        
        colors.push(color);
        velocities.push([vel.x,vel.y]);
        
    }
    var points = new Object();
    points.positions = positions;
    points.forces = forces;
    points.velocities = velocities;
    points.colors = colors;
    //returnObj.positions = points;
    //returnObj.velocities = 
    return points;

}
/*
PaintPoint.prototype.add = function(p)
{
    return new PaintPoint(this.position.add(p.position).divide(2),(this.force+p.force)/2,);
}*/