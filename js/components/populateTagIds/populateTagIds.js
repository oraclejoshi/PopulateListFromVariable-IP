"use strict";

/*
  Sample that creates a JS array object from either JS objects or a JSON string
  (both are simulated in the code). The array is then set to a variable in BotML
  for the CRC component to leverage
*/
var request = require('request');

module.exports = {

    metadata: () => (
        {
            "name": "populate.tag.ids",
            "properties": {
                "variableName": { "type": "string", "required": true },
                "containerName": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {

        let containerName = conversation.properties().containerName ? conversation.properties().containerName : '';

        const _variable = conversation.properties().variableName;

        var query = "serviceName=" + containerName;
        //lets pretend the data was queried from a REST service and has been returned in a JSON format

        conversation.logger().info('listdatasample: Variable name: ' + _variable);
        var options = {
            method: 'GET',
            url: 'https://E042F03AF7044CC2827DF8D88284E12C.mobile.ocp.oraclecloud.com:443/mobile/custom/DBCSRest/backups?' + query,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic RTA0MkYwM0FGNzA0NENDMjgyN0RGOEQ4ODI4NEUxMkNfTW9iaWxlQW5vbnltb3VzX0FQUElEOjc4NmUyNzNhLTVlNDgtNDE0OS1iZTk2LTU2YmI2ZjcyMDcwYQ==',
                'Oracle-Mobile-Backend-Id': '0d5dc20f-9996-41e8-8c35-fef1900acf94',
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                console.log("error: " + JSON.stringify(error));
                conversation.reply("There was issue fetching storage containers, please try later, " + error.message);
            }

            if (response.statusCode == 200) {
                //var text = "DB Create Request accepted, please check after 10-15 minutes for the status."; 
                //"DBaaS\nMobileMetadata\nOMCeDev\nOMCeDev2\nOMCeDev3\n_apaas\nbackupiot\ncontentstorageiot\ndev2\njourneyC\njourneyIOT\nprodomceprodRRfZ5\nsample"    
                var k = JSON.parse(body);
                console.log((k.backupList).length);

                if (k.backupList.length === 0) {
                    conversation.variable(_variable, null);
                    //conversation.reply("There are no restore points found. first create a backup for restore");
                } else {
                    var data = [];
                    for (var i = 0; i < (k.backupList).length; i++) {
                        if (k.backupList[i].status == 'FAILED') {
                            console.log(k.backupList[i], i);
                        }
                        else {
                            data.push(
                                { "label": k.backupList[i].dbTag, "date": k.backupList[i].backupCompleteDate }
                            );
                        }
                    }
                    conversation.logger().info('listdatasample: data array size: ' + data.length);
                    conversation.logger().info('listdatasample: set data to variable');
                    conversation.variable(_variable, data.slice(0, 3));
                }
            } else {
                console.log("body: " + JSON.stringify(body));
                console.log("response: " + JSON.stringify(response));
                conversation.reply("There was issue fetching storage containers, please try later");
            }
            conversation.transition();
            done();
        });
    }
};
