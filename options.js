// Saves options to chrome.storage
function saveOptions() {
  var username = document.getElementById('username').value;
  chrome.storage.sync.set({
    username: username
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    username: ''
  }, function(items) {
    document.getElementById('username').value = items.username;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);