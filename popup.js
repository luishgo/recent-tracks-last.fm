chrome.storage.sync.get({  
	username: ''
}, function(items) {	
	var a = document.createElement('a');
	a.href = 'http://www.last.fm/user/' + items.username;
	a.textContent = 'Recent Tracks';
	a.target = '_blank';

	var h2 = document.getElementsByTagName('h2')[0];
	h2.appendChild(a);
});

var tracks = JSON.parse(localStorage.tracks);
var tbody = document.getElementsByTagName('tbody')[0];

tracks.forEach(function(track) {
	var img = document.createElement('img');
	img.src = track.image[1]['#text'];
	img.width = 35;
	img.height = 35;

	var tdImg = document.createElement('td');
	tdImg.appendChild(img);

	var td = document.createElement('td');
	td.textContent = track.artist['#text'] + ' - ' + track.name + ' ';

	if (track['@attr'] && track['@attr'].nowplaying == 'true') {
		var nowplaying = document.createElement('img');
		nowplaying.src = 'http://www.last.fm/static/images/icons/eq_icon.gif';
		nowplaying.width = 10;
		nowplaying.height = 10;
		td.appendChild(nowplaying);
	}

	var tr = document.createElement('tr');
	tr.appendChild(tdImg);
	tr.appendChild(td);
	
	tbody.appendChild(tr);
});