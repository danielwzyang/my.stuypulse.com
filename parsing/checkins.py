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
    rows = list(csv.DictReader(file))
    size = len(rows)
    
    # saves all the meetings
    # the sets prevent duplicates and allow for quicker lookup
    allMeetings = supabase.table("meetings").select("meetings").eq("id", "all").execute().data
    allMeetings = set(allMeetings[0]["meetings"]) if allMeetings else set()

    # intializes the data with meetings already in the database
    # this prevents overwrites if the csv starts at a more recent time and doesn't contain meetings that the database does
    userMeetings = supabase.table("meetings").select("*").execute().data
    data = {item["id"]: set(item["meetings"]) for item in userMeetings}

    i = 1
    for row in rows:
        print(f"{i}/{size}")
        i += 1

        meeting = row["date"]
        id = row["id_number"]

        if id not in data:
            # again using sets to prevent duplicates and have quicker lookup
            data[id] = set()

        # adds the new meeting to the user
        data[id].add(meeting)
        
        # adds the new meeting to all meetings
        allMeetings.add(meeting)
    
    newData = [{"id": id, "meetings": list(meetings)} for id, meetings in data.items()]
    supabase.table("meetings").upsert(newData).execute()

    supabase.table("meetings").upsert({"id": "all", "meetings": list(allMeetings)}).execute()
    print("checkins added to supabase")