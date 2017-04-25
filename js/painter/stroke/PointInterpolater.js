var PointUtility = function()
{

}
//sp, ep:Vector
PointUtility.prototype.interpolate = function(sp,ep)
{
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
    var returnObj = new Object();
    returnObj.positions = points;
    returnObj.force = 1;
    //returnObj.velocities = 
    return points;
};