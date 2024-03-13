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
      currency: 'cad',
      type: 'Card'  // Use the currency you want
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'Unable to create PaymentIntent');
  }
});
