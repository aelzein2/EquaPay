# EquaPay
SE 4450 Capstone by Group 12

Members:
Amer Al Rawashdeh, Ahmad El-Zein, Abdulrahman Alhalbouni, Khanh Dang

EquaPay is a bill-splitting application native to iOS that aims to help roommates split their bills in regards to shared expenses.

How to run:
-'cd' into project's repository after cloning the project.
-Run 'npm install' to configure and initialize all required dependencies.
-Once above command is entered, run 'npx expo start' to start up the application. Scan QR code to open the application on iOS device or use iOS simulator via XCode on macOS.

*NOTE: May need to run 'sudo' before any install commands.

Testing:
-To test the forgot password functionality, have access to an actual accessible gmail/email account that does not contain sensitive data. Sign up using that account. Once done, rearrange the stack in App.js to have login as the first screen. Start up the simulator and select 'Forgot your password?'. Enter the email you used to sign up and once the reset email has been sent, go to your email and press the reset password link to reset. Once the password has been reset, the database will update the password, and this new password can be used to log in and redirect you to the homepage.

-To test the sign up functionality, make sure to have the signup screen first in the stack in App.js. Once this is done, start up the simulator and sign up using your full name, email, and password. It'll then redirect you to the homepage.

-To test login functionality, enter a valid email and password that has been registered to the system. Invalid credentials will not allow access to the homepage.

*NOTE: As previously mentioned, as of right now, the screens need to be rearranged in App.js (not Homepage, just Signup and Login) to test each feature. ExpoGo will need to be restarted or closed after rearranging the screens in App.js. This is just how the application is set up right now as there is no startup page with proper navigation implemented.

Below are some test credentials to test implemented features:

    Test Details:
    - Email: testequapay@gmail.com, password: hello98765 --> can use this for resetting password (log into gmail with these credentials and reset password with this email on the app)

    - Email: mikeross5@gmail.com, password: abc123 --> can use this to log into the app

    - Email: any, password: any --> can use any email and password to sign up (preferably Gmail)
