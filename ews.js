'use strict';

var restService = require('./restService');

restService.get('/ews', function (req, res) {

    var EWS = require('node-ews');

    // exchange server connection info
    var ewsConfig = {
        username: 'myuser@domain.com',
        password: 'mypassword',
        host: 'https://ews.domain.com'
    };

    var options = {
        rejectUnauthorized: false,
        strictSSL: false
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // initialize node-ews
    var ews = new EWS(ewsConfig, options);

    // define ews api function
    var ewsFunction = 'CreateItem';

    // define ews api function args
    var ewsArgs = {
        "attributes": {
            "MessageDisposition": "SendAndSaveCopy"
        },
        "SavedItemFolderId": {
            "DistinguishedFolderId": {
                "attributes": {
                    "Id": "sentitems"
                }
            }
        },
        "Items": {
            "Message": {
                "ItemClass": "IPM.Note",
                "Subject": "Test EWS Email",
                "Body": {
                    "attributes": {
                        "BodyType": "Text"
                    },
                    "$value": "This is a test email"
                },
                "ToRecipients": {
                    "Mailbox": {
                        "EmailAddress": "foo@gmail.com"
                    }
                },
                "IsRead": "false"
            }
        }
    };

    // query ews, print resulting JSON to console
    ews.run(ewsFunction, ewsArgs)
        .then(result => {
            console.log(JSON.stringify(result));
        })
        .catch(err => {
            console.log(err.stack);
        });

    return res.json({});

});