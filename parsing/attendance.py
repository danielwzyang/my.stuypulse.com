# this will be used to parse the attendance report for one day and update the supabase

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
    
    data = []

    i = 1
    for row in rows:
        print(f"{i}/{size}")
        i += 1

        id_number = row["id_number"]
        num_checkins = row["num_checkins"]
        attendance_rate_percent = row["attendance_rate_percent"]
        num_checkouts = row["num_checkouts"]
        checkout_rate_percent = row["checkout_rate_percent"]
        total_hours = row["total_hours"]
        average_hours = row["average_hours"]

        data.append({
            "id_number": id_number,
            "num_checkins": num_checkins,
            "attendance_rate_percent": attendance_rate_percent,
            "num_checkouts": num_checkouts,
            "checkout_rate_percent": checkout_rate_percent,
            "total_hours": total_hours,
            "average_hours": average_hours
        })
    
    supabase.table("total_attendance").upsert(data).execute()
    print("attendance added to supabase")