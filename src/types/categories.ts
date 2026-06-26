export const CATEGORIES: Record<string, string[]> = {
  'No Status': ['No Status'],
  'Water Intake': ['No Status', 'Pre Water Intake', 'Water Intake', 'Post Water Intake'],
  'Food Intake': ['No Status'],
  'Toilet Visit': ['No Status', 'Pre Pee', 'Pee', 'Post Pee', 'Pre Pee & Poo', 'Pee & Poo', 'Post Pee & Poo', 'Instagram Use'],
  'Sleep': ['No Status', 'Lying on Bed', 'Seated on Bed', 'Out of Bed', 'Back to Sleep', 'Trying to Sleep', 'Went to Sleep', 'Woke Up - Final', 'Woke Up - Mid Sleep'],
  'Wake Up': ['No Status', 'Woke Up', 'Lying in Bed', 'Sitting in Bed', 'Out of Bed', 'Instagram', 'AC Turned Off', 'Fan Turned Off'],
  'Room Tidying': ['No Status'],
  'Device Interaction': ['No Status'],
  'Urinal Visit': ['No Status'],
}

export const ACTIVITY_DONE_AT = [
  'No Status', 'Not Recorded', 'Home', 'Work', 'Outside', 'Commute'
]

export const ACTIVITY_LOGGED_FROM = [
  'No Status', 'Not Recorded', 'HP Z440 Workstation', 'iPad Air (5th Generation)', 'Samsung Galaxy A05', 'Samsung Galaxy A12'
]

export const ACTIVITY_LOGGED_VIA = [
  'No Status', 'Not Recorded', 'Google Sheets (Web)', 'Google Sheets App (iOS)', 'Google Sheets App (Android)', 'Timestamper Log App (Android)', 'Activity Timestamp Manager (Android)', 'Call Timestamps App (Android)', 'Daily Activity Log Web App (PWA)'
]

export const ACTIVITY_TYPES = ['Main', 'Parallel']