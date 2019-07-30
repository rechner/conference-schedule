#!/usr/bin/env python3
#vim: sts=4 ts=4 sw=4 expandtab autoindent

import sys
import csv
import json
import dateutil.parser


def main(csv_path, json_path):
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        output = []

        ID = 1000
        for row in reader:
            start = dateutil.parser.parse(row['Start'])
            end = dateutil.parser.parse(row['End'])
            panelists = row['Panelists'].split(';')

            speakers = []
            for s in panelists:
                if s == "":
                    s = "Convention"
                speakers.append({
                    "Name" : s,
                    "Bio" : "No bio available",
                    "Photo" : "/img/person.png"
                })

            panel_tags = row['Tags'].split(';')
            tags = [{ "Name" : t } for t in panel_tags]

            session = {
                "Id"    : ID,
                "Title" : row['Title'],
                "DescriptionHtml" : row['Description'],
                "Tags" : tags,
                "Level" : "",
                "StartTime" : start.isoformat(),
                "EndTime"   : end.isoformat(),
                "Room" : row['Room'],
                "Speakers" : speakers,
            }

            output.append(session)
            ID += 100


    with open(json_path, 'w') as json_file:
        json.dump({
            "ScheduledSessions" : output
        }, json_file, indent=2)



if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: {0} <import.csv> <output.json>".format(sys.argv[0]))
        sys.exit(1)

    csv_path = sys.argv[1]
    out_path = sys.argv[2]
    main(csv_path, out_path)
