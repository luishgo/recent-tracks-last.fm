var canvas = document.getElementById('canvas');
var loggedInImage = document.getElementById('logged_in');
var canvasContext = canvas.getContext('2d');
var requestTimeout = 1000 * 2;  // 2 seconds

// ajax stuff
function startRequest() {
  chrome.storage.sync.get({  
    username: ''
  }, function(items) {
    getRecentTracks(
      'http://ws.audioscrobbler.com/2.0/?api_key=37bdac3246aca8cdde93dfabad064452&method=user.getRecentTracks&user='+items.username+'&limit=5&format=json',
      function(track) {
        updateIcon(track, null);
      },
      function() {
        updateIcon();
      },
      function(errorResponse) {
        updateIcon(null, errorResponse);
      }
    );

  });
}

function getRecentTracks(url, onSuccess, onErrorXHR, onErrorAPI) {
  var xhr = new XMLHttpRequest();
  var abortTimerId = window.setTimeout(function() {
    xhr.abort();  // synchronously calls onreadystatechange
  }, requestTimeout);

  function handleSuccess(track) {
    window.clearTimeout(abortTimerId);
    if (onSuccess) onSuccess(track);
  }

  var invokedErrorCallback = false;
  function handleErrorXHR() {  
    window.clearTimeout(abortTimerId);
    if (onErrorXHR && !invokedErrorCallback)
      onErrorXHR();
    invokedErrorCallback = true;
  }

  function handleErrorAPI(errorResponse) {  
    window.clearTimeout(abortTimerId);
    if (onErrorAPI) onErrorAPI(errorResponse);
  }

  try {
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      if (xhr.response) {
        if (xhr.response.recenttracks) {
          var firstResult = xhr.response.recenttracks.track[0];
          handleSuccess({
            artist: firstResult.artist['#text'],
            name: firstResult.name,
            playing: firstResult['@attr'] && firstResult['@attr'].nowplaying == 'true'
          });
        } else {
          handleErrorAPI(xhr.response);
        }
        return;
      }

      handleErrorXHR();
    };

    xhr.onerror = function(error) {
      handleErrorXHR();
    };

    xhr.open("GET", url, true);
    xhr.responseType = 'json';
    xhr.send(null);
  } catch(e) {
    console.error(chrome.i18n.getMessage("exception", e));
    handleErrorXHR();
  }
}

function updateIcon(track, errorResponse) {
  if (track && track.playing) {
    chrome.browserAction.setIcon({path: "last.fm.on.png"});
    chrome.browserAction.setBadgeText({text: ""});
    chrome.browserAction.setTitle({title: track.artist + ' - ' + track.name});
  } else if (errorResponse) {
    chrome.browserAction.setIcon({path:"last.fm.off.png"});
    chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
    chrome.browserAction.setBadgeText({text: "!"});
    chrome.browserAction.setTitle({title: errorResponse.message});
  } else {
    chrome.browserAction.setIcon({path:"last.fm.off.png"});
    chrome.browserAction.setBadgeText({text: ""});
    chrome.browserAction.setTitle({title: "No currently scrobbling"});
  }
}

function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  startRequest({scheduleRequest:true, showLoadingAnimation:false});
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.alarms.create('request', {when: Date.now(), periodInMinutes:1});