from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42
        )

    def train(self, data):
        self.model.fit(data)

    def predict(self, data):
        scores = self.model.decision_function(data)
        anomalies = self.model.predict(data)
        return scores, anomalies
