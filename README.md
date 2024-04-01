## Ride Request System
The Ride Request System is a web application that allows users to request rides and complete them for a fair. It consists of both frontend and backend components.

#### Features
- User authentication: Users can sign up, log in, and manage their profiles.
- Requesting rides: Users can request rides by providing pickup and drop-off locations.
- Viewing rides: Users can view their ride history and details of completed rides.
- Admin panel: Administrators can manage user accounts and view ride requests.
#### Technologies Used
- Backend: Django REST Framework (Python)
- Frontend: Angular (TypeScript)
- Database: PostgreSQL
- Authentication: JWT tokens
- Maps Integration: leaflet, Geopy for distance calculations
***Getting Started***
#### Prerequisites
- Python (3.x)
- Angular CLI
#### Installation
Clone the repository:\
git clone https://github.com/varshamohan08/ride_booking_system.git

Backend setup:
Copy code
```
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Frontend setup:
```
cd frontend
npm install
ng serve
```
***Access the application:***
Open your web browser and navigate to http://localhost:4200/.

