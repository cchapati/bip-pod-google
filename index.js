/**
 *
 * The Bipio Google Pod.  Google Actions and Content Emitters
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
gapi = require('googleapis'),
https = require('https'),
Google = new Pod({
  name : 'google',
  title : 'Google',
  description : '<a href="https://developers.google.com/apis-explorer">Google APIs</a> is a set of APIs developed by Google that allows interaction with Google Services and integration of rich, multimedia, search or feed-based Internet content into web applications',
  authType : 'oauth', // @todo hybrid api keys/oauth tokens
  passportStrategy : require('passport-google-oauth').OAuth2Strategy,
  config : {
    // oauth application keys
    "oauth": {
      "clientID" : "",
      "clientSecret" : "",
      "callbackURL" : "",
      "scopes" : [
        "https://www.googleapis.com/auth/calendar",
        "https://www.google.com/m8/feeds",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive.file"
      ],
      "extras" : {
        "accessType" : "offline",
        "approvalPrompt" : "force"
      }
    },
    // google api key
    "api_key" : ""
  },
  oAuthRefresh : function(refreshToken, next) {
    var c = this._config;

    // @see https://developers.google.com/accounts/docs/OAuth2WebServer#refresh
    var options = {
        hostname : 'accounts.google.com',
        method : 'POST',
        path : '/o/oauth2/token',
        headers : {
          'Content-Type' : 'application/x-www-form-urlencoded'
        }
      },
      postBody = 'grant_type=refresh_token'
          + '&client_id=' + c.oauth.clientID
          + '&client_secret=' + c.oauth.clientSecret
          + '&refresh_token=' + refreshToken;

    // @todo migrate into pod/request
    var req = https.request(options, function(res) {
      var bodyTxt = '';

      res.on('data', function(d) {
        bodyTxt += d.toString();
      });

      res.on('end', function(d) {
        if (200 === res.statusCode) {
          next(false, JSON.parse(bodyTxt));
        } else {
          next(res.statusCode + ':' + d);
        }
      })
    });

    req.write(postBody);
    req.end();

    req.on('error', function(e) {
      next(e);
    });
  }
});

Google.getOAuthClient = function(sysImports) {
  var OAuth2 = gapi.auth.OAuth2Client ? gapi.auth.OAuth2Client : gapi.auth.OAuth2,
    podConfig = this.getConfig(),
    oauth2Client = new OAuth2(
      podConfig.oauth.clientID,
      podConfig.oauth.clientSecret,
      podConfig.oauth.callbackURL
    );

  oauth2Client.credentials = {
    access_token : sysImports.auth.oauth.token
  };
  return oauth2Client;
}

Google.getAPIKey = function() {
  return this.getConfig().api_key;
}

Google.add(require('./lengthen_url.js'));
Google.add(require('./shorten_url.js'));
//Google.add(require('./gcm_chrome.js'));
Google.add(require('./calendar_ev_insert.js'));
Google.add(require('./calendar_ev_quickadd.js'));
Google.add(require('./create_drive_file.js'));

// -----------------------------------------------------------------------------
module.exports = Google;

