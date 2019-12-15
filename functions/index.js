const functions = require('firebase-functions');
const admin = require('firebase-admin');
//const storage = require('fire');

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions


exports.userCreated = functions.database.ref('SERVER_DATA/PENDING_DATA/NEW_USERS/{UID}').onCreate((snapshot, context) =>{
console.log(`A user with UID: ${context.params.UID} has been created!`);

/*
What to do:
    -Check if username is valid

*/

    const username = snapshot.child('username').val();
    const firstName = snapshot.child('firstName').val();
    var isAvailable = true;
    var db = admin.database();
    const currentUsersRef = db.ref('/SERVER_DATA/USERS');
    const userCreatedRef = db.ref(`SERVER_DATA/PENDING_DATA/NEW_USERS/${context.params.UID}`);


    currentUsersRef.once("value", (data) =>{
          data.forEach((childSnapshot) =>{
        const snap = childSnapshot.val();
            if(snap.username === username){
            isAvailable = false;
            }
      })
      if(isAvailable){
        currentUsersRef.child(context.params.UID).set({
            "username":username,
            "firstName": firstName,
            "status":"ACTIVE"
        })
    }else{
        currentUsersRef.child(context.params.UID).set({
            "username":username,
            "firstName": firstName,
            "status":"DOA"
        })
    }   
    })

    userCreatedRef.remove().then(() => {
        console.log("Remove succeeded.")
        throw new Error("ERROR")
      }).catch(() => {
        console.log("Remove failed")
      });


    });



exports.storagePendingPostCreated = functions.storage.object().onFinalize((async (object) =>{

    console.log(`A photo has been uploaded! Let's process it. UID:${object.metadata.UID}`);

    var db = admin.database();
    const currentUsersRef = db.ref();

    
}));

exports.postCreated = functions.database.ref('SERVER_DATA/PENDING_DATA/POSTS/DATA/{UID}').onWrite((snapshot, context) =>{


    var db = admin.database();

    //const UID = context.params.UID;
    //var postID;
    const TIME = admin.database.ServerValue.TIMESTAMP;
    //This is the ref for this trigger
    // const postCreatedRef = db.ref(`SERVER_DATA/PENDING_DATA/POSTS/${UID}`);
    // const currentUsersRef = db.ref(`SERVER_DATA/USERS/${UID}/STORAGE/POSTS`);
    // const postsRef = db.ref(`SERVER_DATA/POSTS/${postID}`);

//     postCreatedRef.once("value", (data) =>{


        
//         postID = data.child('postId').val;
//         console.log(postID);

//         postCreatedRef.remove();

//         currentUsersRef.set({
//                 "POST_ID":postID,
//                 "POST_PHOTO_URL":data.child("PhotoURL").val(),
//                 "TIMESTAMP":TIME
//         });

//         postsRef.set({
//                 "UID":UID,
//                 "POST_PHOTO_URL":data.child("PhotoURL").val(),
//                 "TIMESTAMP":TIME
//         });

        




//   })







        //var db = admin.database();
        

        const postID = String(snapshot.after.val().postId);
        const UID = String(context.params.UID);


        const postCreatedRef = db.ref(`SERVER_DATA/PENDING_DATA/POSTS/DATA/${UID}`);
        const currentUsersRef = db.ref();
        const postsRef = db.ref();
		

        console.log(UID);

	
            //The user created the post and not a hacker
            console.log(`A user with UID: ${UID} has created a post with ID: ${postID}`);


            //Add the post to the user's profile
            currentUsersRef.child(`SERVER_DATA/USERS/${UID}/STORAGE/POSTS`).set({
                "POST_ID":postID,
                "POST_PHOTO_URL":snapshot.after.child("PhotoURL").val(),
                "TIMESTAMP":admin.database.ServerValue.TIMESTAMP
            });



            const currentUserRed = db.ref(`SERVER_DATA/USERS/${UID}`);
            currentUserRed.once("value", (data) =>{


                let firstName = data.child("firstName").val();



            postsRef.child(`SERVER_DATA/POSTS/DATA/${postID}`).set({
                "UID":UID,
                "POST_PHOTO_URL":snapshot.after.child("PhotoURL").val(),
                "TIMESTAMP":admin.database.ServerValue.TIMESTAMP,
                "firstName":firstName
            });
        });

            //Remove the pending post
            postCreatedRef.remove();

            
        

    
});

exports.ratingCreated = functions.database.ref('SERVER_DATA/PENDING_DATA/POSTS/RATINGS/{key}').onWrite((snapshot,context) => {
    var db = admin.database();

    const TIME = admin.database.ServerValue.TIMESTAMP;

    //let createdByUID = context.auth().uid;
    let UID = snapshot.after.val().UID;
    let postID = snapshot.after.val().PostId;
    let rating = snapshot.after.val().RATING;
    var numOfYes;
    var numOfNo;

    console.log(`A rating has been created for postID: ${postID} by user with UID: ${UID}! `);


    //if(UID === createdByUID){
        let postUIDRatingsRef = db.ref(`SERVER_DATA/POSTS/RATINGS/${postID}/${UID}`);
        let postDataRef = db.ref(`SERVER_DATA/POSTS/DATA/${postID}`);
        let pendingPostRef = db.ref(`SERVER_DATA/PENDING_DATA/POSTS/RATINGS/${context.params.key}`);

        postUIDRatingsRef.set({
            "RATING": rating,
            "TIMESTAMP": TIME
        });

        postDataRef.once("value", (data) =>{
            numOfNo = data.child('numOfNo').val();
            numOfYes = data.child('numOfYes').val();

            if ((rating === "YES") || (rating === "NO")) {
                if (rating === "YES") {
                    //RATING YES

                    if(data.child('numOfYes').val() === null){
                        postDataRef.update({
                            "numOfYes": 1
                        });
                    }else{
                        postDataRef.update({
                            "numOfYes": numOfYes + 1
                        });
                    }





                } else {
                    //RATING NO

                    if(data.child('numOfNo').val() === null){
                        postDataRef.update({
                            "numOfNo": 1
                        });
                    }else{
                        postDataRef.update({
                            "numOfNo": numOfNo + 1
                        });
                    }



                }
            } else {
                console.log('Someone forced a rating! Hacker Alert!');
            }

            pendingPostRef.remove();
            
        });






    // }else{
    //     console.log('Someone forced a rating! Hacker Alert!');
    // }




});