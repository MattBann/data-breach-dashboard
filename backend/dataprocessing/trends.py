import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras import Input
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler
from functools import lru_cache

TIME_STEP = 4
DEFAULT_PARAMS = {"units": 50, "learning_rate": 0.01, "epochs": 10}

# Pre-trained parameters (see ../trend-prediction-testing)
OPTIMISED_PARAMS = {
    "breach_counts" : {'units': 30, 'learning_rate': 0.01, 'epochs': 11},
    "record_counts" : {'units': 30, 'learning_rate': 0.01, 'epochs': 1},
    "avg_records" : {'units': 20, 'learning_rate': 0.01, 'epochs': 1},
    "password_counts" : {'units': 30, 'learning_rate': 0.01, 'epochs': 1},
    "password_breaches" : {'units': 20, 'learning_rate': 0.01, 'epochs': 3},
    "percent_hashed" : {'units': 30, 'learning_rate': 0.01, 'epochs': 43},
    "percent_salted" : {'units': 80, 'learning_rate': 0.01, 'epochs': 4},
    "avg_data_classes": {'units': 50, 'learning_rate': 0.01, 'epochs': 27}
}


@lru_cache(16)
def predict_trend(series:tuple, n_predictions:int, id:str|None=None):
    '''
    Return a prediction n_prediction steps into the future of a specific time-series
    '''
    if id is None or OPTIMISED_PARAMS.get(id) is None:
        params = DEFAULT_PARAMS
    else:
        params = OPTIMISED_PARAMS[id]
    return list(_lstm(series, n_predictions, params))


def _lstm_prep(series):
    '''
    Prepare time-series data for the LSTM. 
    Returns features (X), labels (y), the normalised series and a scaler object for descaling results
    '''
    # Scale data
    series = np.array(series)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(series.reshape(-1, 1))

    # Create features (X) and labels (y)
    X, y = [], []
    for i in range(len(scaled) - TIME_STEP - 1):
        X.append(scaled[i:(i + TIME_STEP), 0])
        y.append(scaled[i + TIME_STEP, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    return X, y, scaled, scaler


def _lstm_get_model(units, learning_rate):
    '''
    Builds the LSTM model
    '''
    model = Sequential()
    model.add(Input((TIME_STEP, 1)))
    model.add(LSTM(units=units, return_sequences=True))
    model.add(LSTM(units=units))
    model.add(Dense(1))
    model.compile(optimizer=Adam(learning_rate=learning_rate),
                  loss='mean_squared_error')
    return model


def _lstm(series, n_predictions, params=DEFAULT_PARAMS):
    """
    Long Short-Term Memory trend prediction.

    Derived from https://www.statology.org/how-to-build-lstm-models-for-time-series-prediction-in-python/
    Also helpful: https://www.geeksforgeeks.org/deep-learning/long-short-term-memory-lstm-rnn-in-tensorflow/
    """
    # Reset tensorflow
    # tf.keras.backend.clear_session()

    X, y, scaled, scaler = _lstm_prep(series)
    model = _lstm_get_model(params["units"], params["learning_rate"])

    # Train the model
    model.fit(X, y, epochs=params["epochs"], batch_size=32)

    # Forecast future values
    x = np.array([scaled[-TIME_STEP:, 0]])
    x = x.reshape(x.shape[0], x.shape[1], 1)
    predicted = scaled[-TIME_STEP:, 0].flatten()
    for _ in range(n_predictions):
        predicted = np.append(predicted, model.predict(x)[0, 0])
        x = np.array([predicted[-TIME_STEP]])
        x = x.reshape(x.shape[0], 1, 1)

    # Inverse transform to original scale
    forecast = scaler.inverse_transform(predicted[-n_predictions:].reshape(n_predictions, 1))

    # print("Forecasted values:", forecast)
    return forecast.reshape(n_predictions)
