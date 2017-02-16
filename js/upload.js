// Create a root reference
var storageRef = firebase.storage().ref();
// Create a reference to 'images/mountains.jpg'
var imgRef;

function uploadFirebase(data_url,callback)
{
	// Base64 formatted string
	var id = ID();
	imgRef = storageRef.child('images/'+id+'.gif');
	imgRef.putString(data_url, 'base64').then(function(snapshot) {
	  
	  
	  getFileURL(callback)
	});
}

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  var d = new Date();
  var n = d.getTime();
  return n;

  //var id = '_' + Math.random().toString(36).substr(2, 9);
  //return id;
};

function getFileURL(callback)
{
	var result = imgRef.getDownloadURL().then(function(url) {
			uploadToGiphy(url,callback);
        }).catch(function(error) {
          
        });; 
}

function uploadToGiphy(url,callback)
{
 
    $.ajax({
      type: 'POST',
      url: 'https://upload.giphy.com/v1/gifs',
      data: {
          username: 'chvwdte0mtzaewfob28uy29tlnr3',
          api_key: 'dc6zaTOxFJmzC',
          source_image_url: url,
          tags: "trash_dove"
      },
      success: function(e)
      {
      	
      	getShareLink(e.data.id,callback);
      },
      error: function(e)
      {
        
      }
  });  
}
	//getShareLink('l0HegeFKCoSfOaKsg');
  
function getShareLink(giphy_id,callback)
{
  	var request = "https://api.giphy.com/v1/gifs/"+giphy_id+"?api_key=dc6zaTOxFJmzC";
  	$.get(request, function( data ) {
        writeGameData(game_ch,game_place,game_verb,giphy_id)
    		callback(data.data.bitly_url);
    });
}

function writeGameData(ch,place,verb,giphy_id) {
  if(ch!=null&&place!=null&&verb!=null)
  {
    firebase.database().ref('slotgame/' + giphy_id).set({
    ch: ch,
    place: place,
    verb : verb
    });  
  }
}

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
