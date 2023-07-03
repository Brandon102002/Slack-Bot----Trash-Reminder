const urlopen = "https://slack.com/api/conversations.open";
const urlschedMsg = "https://slack.com/api/chat.postMessage";
//const token = ;
const date = Utilities.formatDate(new Date(), "PST", "MM-dd");

function todayStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("cleanings");
  var range = sheet.getRange(92, 1, 62, 3);
  var data = range.getValues();

  for (i in data) {
    var check = Utilities.formatDate(new Date(data[i][0]), "GMT+1", "MM-dd");
    if (date == check) {
      var recipients = [data[i][1], data[i][2]];
      var ids = getIds(recipients);

      return sendSlackGroupMessage(ids);
    }
  }
  return false;
}

function getIds(recipients) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("brotherStatus");

  var range = sheet.getRange(4, 2, 31, 5);
  var data = range.getValues();
  const houseManagerId = "U030X11DCG4";

  var ids = [];
  for (r in recipients){
    for (i in data) {
      if (recipients[r] == data[i][0]) {
        ids = ids.concat([data[i][4]]);
      }
    }
  }

  if (!ids.includes(houseManagerId)) {
    ids = ids.concat(houseManagerId);
  }

  return ids;
}

function sendSlackGroupMessage(recipients) {
  // Open dm with recipients

  const channelName = "trash-group-"+date;

  const openParams = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify({
      "name": channelName,
      "return_im": true,
      "users": recipients.join(",")
    })
  };

  const openResponse = UrlFetchApp.fetch(urlopen, openParams);
  const openData = JSON.parse(openResponse.getContentText());

  if (!openData.ok) {
    Logger.log("failed to create group channel on " + date);
    Logger.log(openData);
    return false;
  }

  // Send Message
  const channelID = openData.channel.id;
  text = "You are on trash today! This is a test.";

  const messageParams = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify({
      "channel": channelID,
      "text": text
    })
  };

  const messageResponse = UrlFetchApp.fetch(urlschedMsg, messageParams);
  const messageData = JSON.parse(messageResponse.getContentText());

  if (!messageData.ok) {
    Logger.log("Failed to send message on " + date);
    Logger.log(messageData);
    return false;
  }
  
  return true;
}
