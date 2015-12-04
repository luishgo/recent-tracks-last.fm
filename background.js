var canvas = document.getElementById('canvas');
var loggedInImage = document.getElementById('logged_in');
var canvasContext = canvas.getContext('2d');
var requestTimeout = 1000 * 2;  // 2 seconds

// ajax stuff
function startRequest(params) {
  getRecentTracks(
    function(track) {
      localStorage.track = JSON.stringify(track);
      updateIcon();
    },
    function() {
      delete localStorage.track;
      updateIcon();
    }
  );
}

function getRecentTracks(onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  var abortTimerId = window.setTimeout(function() {
    xhr.abort();  // synchronously calls onreadystatechange
  }, requestTimeout);

  function handleSuccess(track) {
    window.clearTimeout(abortTimerId);
    if (onSuccess) onSuccess(track);
  }

  var invokedErrorCallback = false;
  function handleError() {  
    window.clearTimeout(abortTimerId);
    if (onError && !invokedErrorCallback)
      onError();
    invokedErrorCallback = true;
  }

  try {
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      if (xhr.response) {
        var firstResult = xhr.response.recenttracks.track[0];
        handleSuccess({
          artist: firstResult.artist['#text'],
          name: firstResult.name,
          playing: firstResult['@attr'] && firstResult['@attr'].nowplaying == 'true'
        });
        return;
      }

      handleError();
    };

    xhr.onerror = function(error) {
      handleError();
    };

    xhr.open("GET", getLastFmUrl(), true);
    xhr.responseType = 'json';
    xhr.send(null);
  } catch(e) {
    console.error(chrome.i18n.getMessage("exception", e));
    handleError();
  }
}

function getLastFmUrl() {
  var user = 'luishgo';
  return 'http://ws.audioscrobbler.com/2.0/?api_key=37bdac3246aca8cdde93dfabad064452&method=user.getRecentTracks&user='+user+'&limit=5&format=json';
}

function updateIcon() {
  var track = localStorage.hasOwnProperty('track') ? JSON.parse(localStorage.track) : null;

  if (track && track.playing) {
    chrome.browserAction.setIcon({path: "last.fm.on.png"});
    chrome.browserAction.setTitle({title: track.artist + ' - ' + track.name});
  } else {
    chrome.browserAction.setIcon({path:"last.fm.off.png"});
    chrome.browserAction.setTitle({title: ""});
  }

}

function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  startRequest({scheduleRequest:true, showLoadingAnimation:false});
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.alarms.create('request', {when: Date.now(), periodInMinutes:1});