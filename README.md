# Data Breach Dashboard

An application for tracking the history of data breaches, using the Have I Been Pwned dataset.

This project was developed as part of a University dissertation.

This repository contains 4 distinct folders:

- [backend](#backend)
- [frontend](#frontend)
- [nlp-testing](#nlp-testing)
- [trend-prediction-testing](#trend-prediction-testing)

There is also a Dev Container configuration file for convenience which installs Python and Node dependencies.

## Backend <backend>

Contains the backend Python logic for retrieving, processing and caching HIBP data and serving the processed data to the frontend.

The backend requires Python 3.10 or newer. Python dependencies are specified in [backend/requirements.txt](backend/requirements.txt). To install them (if not using the dev container):
```bash
cd backend
pip3 install -r requirements.txt
```

Run the development server (not recommended for production):
```bash
python3 dashboardbackend.py
```

For a production environment, follow the [Flask instructions](https://flask.palletsprojects.com/en/stable/tutorial/deploy/) for integrating with a web server using WSGI.

## Frontend <frontend>

Contains the source code for the dashboard user interface.

The frontend requires Node 24 or newer with NPM 11.6. Node dependencies are specified in [frontend/package.json](frontend/package.json). To install dependencies (if not using the dev container):

```bash
cd frontend
npm install
```

To serve a development (live updating) build:

```bash
npm run dev
```

To create a static build that can be served using a web server, e.g. Apache2:

```bash
npm run build
```

**Note:** the frontend assumes that the backend is reachable at the `/api` URL path, so make sure this is configured in your web server.

## NLP Testing <nlp-testing>

This folder contains the code used to test various NLP algorithms. It includes a utility script for manually generating a labelled subset of the HIBP dataset for testing different approaches. The set of 100 data points used in the report is included.

The testing code is in a Jupyter Notebook, which requires Python >3.10 with `ipykernel` installed and a suitable environment for interacting with it, e.g. VSCode. The first line of the notebook lists and installs the other Python dependencies.

## Trend Prediction Testing <trend-prediction-testing>

This folder contains the code used to test various trend prediction algorithms.

Like with the NLP testing, the testing code is in a Jupyter Notebook, which requires Python >3.10 with `ipykernel` installed and a suitable environment for interacting with it, e.g. VSCode. The first line of the notebook lists and installs the other Python dependencies.
