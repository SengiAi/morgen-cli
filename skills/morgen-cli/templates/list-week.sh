#!/bin/bash
# List events across multiple calendars for this week
# Usage: ./list-week.sh <calendar_ids_file>
#
# Calendar IDs file format (one per line):
# cal_id1,acc_id1
# cal_id2,acc_id2

# Calculate this week's date range
START=$(date -v-$(date +%u)d +%Y-%m-%dT00:00:00 2>/dev/null || date -d "last monday" +%Y-%m-%dT00:00:00)
END=$(date -v+$((7-$(date +%u)))d +%Y-%m-%dT23:59:59 2>/dev/null || date -d "next sunday" +%Y-%m-%dT23:59:59)

echo "Events from $START to $END"
echo "================================"

# If file provided, read from it
if [ -n "$1" ] && [ -f "$1" ]; then
    while IFS=, read -r cal_id acc_id; do
        echo ""
        echo "--- Calendar: $cal_id ---"
        morgen-calendar list-events \
            --calendar-id "$cal_id" \
            --account-id "$acc_id" \
            --start "$START" \
            --end "$END"
    done < "$1"
else
    echo "Usage: $0 <calendar_ids_file>"
    echo ""
    echo "Create a file with calendar IDs (one per line):"
    echo "cal_id1,acc_id1"
    echo "cal_id2,acc_id2"
fi
