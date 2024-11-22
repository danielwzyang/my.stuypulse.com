# MyPulse
A website for StuyPulse members to track their attendance.

## Running on Local
After cloning the repo, make sure that Node.js is installed and that npm is functioning properly. Go into the repo and type the following command to install all the packages necessary for runtime:

    npm install

Then create a .env file (at the root) and contact me at danielwzyang@gmail.com or on Slack to get the file contents. If you have access to the supabase, go to the API settings and store the project url as SUPABASE_URL, the anon / public project API key as SUPABASE_ANON_KEY, and the service role API key as SUPABASE_SERVICE_ROLE_KEY. The .env also needs to have the key if you're planning to make post requests to your localhost to upload the data, but this probably isn't necessary since you can just make the request to my.stuypulse.com. However, if this is really needed store the key as KIOSK_KEY. The .env file's contents should look something like this:

    SUPABASE_URL=<project url>
    SUPABASE_ANON_KEY=<anon key>
    SUPABASE_SERVICE_ROLE_KEY=<service role key>

To get the site running, type the following command and visit localhost:4321 on your web browser:

    npm run dev

## Uploading Data from the Scanner
In order to update the supabase using the .csv files from the scanner, you can create a post request to https://my.stuypulse.com/api/post/scanner. Make sure to have the headers containing the kiosk key stored with the tag "key", and attach the checkins file as with the tag "checkins" and the attendance file with the tag "attendance". As mentioned earlier, you can also do this by making a post request to your localhost but again this is unnecessary.
