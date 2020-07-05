import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest(
  async (request, response) => {
    //console.log(request);
    try {
      //   const payload = {
      //     data: {
      //       temp: "test temp",
      //       conditions: "test conditions",
      //     },
      //     notification: {
      //       title: "my test title",
      //       subtitle: "my subtitle",
      //       body: "my body",
      //       id: "123",
      //     },
      //   };
      //   const res = await admin
      //     .messaging()
      //     .sendToDevice(
      //       "dRGYzbFURquhOB2C0caLwh:APA91bHGypXGr4EXYXOfCFzxrq8xbDiWqaciVG1Ausf_wfEL2fpQkV3p4CM5Z0uYP5V9jclPY6UJCovc7_ZGXU01WQDLTYgNujsHA_Qd7x67FgztbLUH6srZFyC6hb2wEJzU-NH4QaQ0",
      //       payload
      //     );
      //   console.log(res);

      let message = {
        notification: {
          title: "$Title up 1.43% on the day",
          body:
            "$Body gained 11.80 points to close at 835.67, up 1.43% on the day.",
        },
        data: {
          channel_id: "my channel_id",
        },
        android: {
          ttl: 3600 * 1000,
          notification: {
            icon: "stock_ticker_update",
            color: "#f45342",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 42,
            },
          },
        },
        token:
          "dRGYzbFURquhOB2C0caLwh:APA91bHGypXGr4EXYXOfCFzxrq8xbDiWqaciVG1Ausf_wfEL2fpQkV3p4CM5Z0uYP5V9jclPY6UJCovc7_ZGXU01WQDLTYgNujsHA_Qd7x67FgztbLUH6srZFyC6hb2wEJzU-NH4QaQ0",
      };

      admin
        .messaging()
        .send(message)
        .then((res) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", res);
          response.send("Notification sent!  => " + JSON.stringify(res));
        })
        .catch((error) => {
          console.log("Error sending message:", error);
          response.send("Error occured! => " + JSON.stringify(error));
        });
    } catch (err) {
      console.log(err);
      response.send("Error occured! => " + JSON.stringify(err));
    }
  }
);
