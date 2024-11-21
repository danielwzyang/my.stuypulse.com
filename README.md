# MyPulse
A website for StuyPulse members to track their attendance.

## Running on Local
After cloning the repo, make sure that Node.js is installed and that npm is functioning properly. Go into the repo and type the following command to install all the packages necessary for runtime:

    npm install

Then create a .env file (at the root) and contact me at danielwzyang@gmail.com or on Slack to get the file contents. If you have access to the supabase, go to the API settings and store the project url as SUPABASE_URL and the anon / public project API key as SUPABASE_ANON_KEY. The .env file's contents should look something like this:

    SUPABASE_URL=<project url>
	SUPABASE_ANON_KEY=<anon key>

To get the site running, type the following command and visit localhost:4321 on your web browser:

    npm run dev

## Uploading Data from the Scanner
In order to get data from the scanner, you can use a flashdrive. The only files that are needed are the attendance reports and the checkin reports. The meeting reports are not used in the database. Move these two files into the parsing folder where attendance.py and checkins.py are.

Create a .env file inside of the parsing folder; again contact me for the file. If you have access to the supabase, store the project url again and instead of the anon key store the service role key as SUPABASE_SERVICE_ROLE_KEY. The .env file should look something like this:

    SUPABASE_URL=<project url>
    SUPABASE_SERVICE_ROLE_KEY=<service role key>

Make sure you have python and pip installed in order to run the scripts. Run the following command to install the necessary packages.

    pip install supabase python-dotenv

In order to parse the attendance data, run the attendance.py script with the attendance report .csv file as an argument. An example command would be:

    py attendance.py attendance-report-20241120141139.csv
   
Do the same with checkins.py and the checkin report .csv file to parse the checkin data.

    py checkins.py checkins-20241120141147.csv