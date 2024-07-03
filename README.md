# Health Equalizer
## Created with ❤️ by Dhrumil
`Dhrumil Patel - Full Stack Developer & Software Engineer`<br>

## How we built it
Our team developed **Health Equalizer** using a combination of **Python with Flask for backend services, React.js for a reactive and dynamic frontend, and MongoDB for database management (planned but did not have enough time)**. The platform integrates the [OpenAI API](https://openai.com/api/) for processing natural language queries and [Google Maps API](https://developers.google.com/maps/apis-by-platform) for locating healthcare services. System development was managed through a series of GitHub issues, ensuring structured progress and effective collaboration among team members.

**Backend**: [Flask](hhttps://flask.palletsprojects.com/en/3.0.x/) was chosen to manage backend operations, including API routing and middleware functionalities, due to its lightweight and unopinionated structure.

**Frontend**: [React](https://react.dev/) was chosen for its efficiency in building interactive user interfaces, with [Create React App](https://create-react-app.dev/) used to optimize the development experience and [MUI](https://mui.com/) (Material-UI) to design a modern, user-friendly interface.

**AI Services**: [Azure Speech Services](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/overview) enable users to interact with the platform using their voice, improving accessibility and user experience. Speech-to-text allowed users to input requests through speech.

**Mapping Services**: The [Google Maps API](https://developers.google.com/maps/apis-by-platform) was integrated to provide users with a reliable and accurate locator for healthcare providers and emergency services, enhancing the platform's utility and user convenience.
## Export the Application
1. Clone the repo
```
https://github.com/dhrumilp12/Health-Equalizer.git
```
3. Setup the backend environment with PIP
```
cd ./server
pip install -r requirements.txt
```
3. Setup the frontend environment with NPM
```
cd ./client
npm install
```
4. Run the backend:
```
python run.py
```
5. run the frontend:
```
npm start
```
6. Build the frontend:
```
npm run build
```


