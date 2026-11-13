# Jarvis Control for Echo Dot

1. Connect your Echo Dot to Wi-Fi in the Alexa app. Sign in to https://developer.amazon.com/alexa/console/ask with the same Amazon account.
2. Choose **Create Skill**, name it **Jarvis Control**, pick the English locale your Dot uses, and choose **Custom** and **Alexa-hosted (Node.js)**. Choose **Start from Scratch** if prompted.
3. In **Build → JSON Editor**, paste the contents of the locale JSON under skill-package/interactionModels/custom. Save and build the model.
4. In **Code**, replace the contents of the hosted index.js with lambda/index.js. Save and deploy.
5. In **Test**, select **Development** and try “Alexa, open Jarvis Control” in the simulator or on the Dot. “Check status” will confirm the skill is running even before you connect your server.

“Jarvis Control” is the skill's invocation name. The Dot still uses its configured Amazon wake word.

## Connect your own Mac and iPad setup

Set serverEndpoint in index.js to the full publicly reachable HTTPS URL of your command handler. Set serverToken to a private random token, keep the configured file private, and redeploy. The Alexa-hosted code runs in Amazon's cloud, so a Mac address reachable only on your Wi-Fi won't work as the endpoint.

Your server should verify the Authorization bearer token and accept a JSON POST with action (check_status or start_focus) and requestId. Return a 2xx status when the action is accepted. Use requestId to deduplicate retries before triggering an action. The iPad app can use the same service with its own credentials, while the Mac runs whatever automation you map to start_focus.

## Import from GitHub

Publish the contents of this folder at the root of a public GitHub repository. When creating a new Alexa-hosted Node.js skill, select a supported English locale and choose **Import Skill** on the template page. Paste the public repository clone URL ending in .git. For an existing skill, follow the console steps above.
