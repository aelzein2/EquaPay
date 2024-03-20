// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

admin.initializeApp();

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Authentication check to ensure user is logged in
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Function must be called while authenticated.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,  // Amount is expected in cents
      currency: data.currency, // you will need to change this to update dynamically based on what currency is in the bill details
      receipt_email: data.email, // Dynamically attach the email to the payment
      description: 'EquaPay'  
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'Unable to create PaymentIntent');
  }
});
