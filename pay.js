 // Update the reference number in the database for the corresponding payment
 const updateQuery = 'UPDATE form_data SET referenceNumber = ? WHERE emailAddress = ? AND referenceNumber = ""';
 db.query(updateQuery, [referenceNumber, emailAddress], (updateErr, updateResult) => {
     if (updateErr) {
         console.error('Error updating reference number in the database:', updateErr);
         res.status(500).send('An error occurred while verifying payment');
         return;
     }

     if (updateResult.affectedRows === 1) {
        const appVerifyMessage = `Dear ${firstName},  Your Payment for application fee of ${applicationFee} verified successfully!  continue to login with your application number as username and password and upload your credentials .`;
 res.send(`
     <!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Form Submission</title>
         <style>
             body {
                 display: flex;
                 justify-content: center;
                 align-items: center;
                 height: 100vh;
                 margin: 0;
                 text-align: center;
             }
             .message {
                 width: 80%;
                 max-width: 600px;
                 margin: auto;
             }
         </style>
     </head>
     <body>
         <div class="appVerifyMessage">
         <p>${appVerifyMessage}</p>
         <p>Click continue to proceed to payment</p>
         <form action="/login" method="GET">
             <input type="hidden" name="applicationNumber" value="${applicationNumber}">
             <button type="submit">Continue</button>
         </form>
         </div>
     </body>
     </html>
 `);

     } else {
         res.status(404).send('Payment verification failed');
     }
 });
 