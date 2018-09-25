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
            "name": "populate.list.variable",
            "properties": {
                "variableName": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {

        const _variable = conversation.properties().variableName;

        //lets pretend the data was queried from a REST service and has been returned in a JSON format

        conversation.logger().info('listdatasample: Variable name: ' + _variable);
        var options = {
            method: 'GET',
            url: 'https://gse00014769.us.storage.oraclecloud.com/v1/Storage-gse00014769',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic Y2xvdWQuYWRtaW46c0lsTFlANUF1ZEl0T3I=',
                //'Oracle-Mobile-Backend-Id': '25c71e79-77de-44e5-a379-4ebd64732d4d'
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
                var containers = body.split("\n");
                containers = containers.reverse();
                var data = [];
                for (var i = 0; i < 4; i++) {
                    data.push(
                        { "label": containers[i], "value": containers[i] }
                    );
                }
                conversation.logger().info('listdatasample: data array size: ' + data.length);
                conversation.logger().info('listdatasample: set data to variable');
                conversation.variable(_variable, data);
            } else {
                console.log("body: " + JSON.stringify(body));
                console.log("response: " + JSON.stringify(response));
                conversation.reply("There was issue fetching storage containers, please try later...." + JSON.stringify(response) );
            }
            conversation.transition();
            done();
        });
    }
};
