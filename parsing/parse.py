# this will be used to parse the checkins for one day and update the supabase

import os
from supabase import create_client
from dotenv import load_dotenv
import csv
import sys

if len(sys.argv) < 2:
    print("please provide a file name")

# set up supabase client
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# opens up the csv
with open(sys.argv[1]) as file:
    rows = csv.DictReader(file)
    
    # saves all the meetings
    # the sets prevent duplicates and allow for quicker lookup
    allMeetings = supabase.table("meetings").select("meetings").eq("id", id).execute().data
    allMeetings = set(allMeetings[0]["meetings"]) if allMeetings else set()

    ids = {}

    i = 0
    for row in rows:
        print("row", i)
        i += 1

        meeting = row["date"]
        id = row["id_number"]

        # fetching user data from database if the user exists
        if id not in ids:
            userData = supabase.table("meetings").select("meetings").eq("id", id).execute().data
            # again using sets to prevent duplicates and have quicker lookup
            ids[id] = set(userData[0]["meetings"]) if userData else set()

        # adds the new meeting to the user
        ids[id].add(meeting)
        
        # adds the new meeting to all meetings
        allMeetings.add(meeting)
    
    newData = [{"id": id, "meetings": list(meetings)} for id, meetings in ids.items()]
    supabase.table("meetings").upsert(newData).execute()

    supabase.table("meetings").upsert({"id": "all", "meetings": list(allMeetings)})