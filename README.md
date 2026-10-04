Hospital Recommendation System

An **AI-powered Hospital Recommendation System** that uses **Supervised Machine Learning** to analyze hospital and patient-related information and recommend the **Top 3 most suitable hospitals**.

The system considers multiple factors such as **hospital rating, treatment success rate, doctor availability, bed availability, treatment cost, waiting time, distance, patient satisfaction, and department matching** to generate a recommendation score and rank hospitals.

---
 Project Overview

Choosing the right hospital can be difficult when patients need to compare multiple factors such as distance, cost, availability, quality, and expected waiting time.

The **Hospital Recommendation System** simplifies this process by using machine learning to evaluate available hospitals and provide personalized recommendations.

### How it works

```text
Patient Requirements
        ↓
Hospital Dataset
        ↓
Data Cleaning & Preprocessing
        ↓
Feature Engineering
        ↓
Supervised ML Model
        ↓
Recommendation Score
        ↓
Hospital Ranking
        ↓
🥇 Top 1 Hospital
🥈 Top 2 Hospital
🥉 Top 3 Hospital
```

---
 Features

 Smart Hospital Recommendation

Recommends the **Top 3 hospitals** based on the provided requirements.

Distance Analysis

Considers the distance between the patient and available hospitals.

### ⭐ Hospital Rating

Uses hospital ratings as an important factor when generating recommendations.

 Doctor Availability

Considers the availability of doctors at different hospitals.

 Bed Availability

Analyzes hospital bed availability to help identify hospitals that can better accommodate patients.
 Treatment Cost

Considers the estimated treatment cost when ranking hospitals.

### ⏱️ Waiting Time

Factors in the estimated waiting time of hospitals.

### 🎯 Department Matching

Matches the patient's required medical department with the hospital's available department.

### 📊 Machine Learning Prediction

Uses a supervised machine learning model to generate a recommendation score.

### 🏆 Top 3 Ranking

Hospitals are ranked based on their predicted recommendation scores and the system displays the top three results.

---

## 🧠 Machine Learning

This project uses **Supervised Machine Learning** to predict a hospital's recommendation score.

### Important Features

The model can use features such as:

* Hospital Bed Capacity
* Patient Age
* Distance
* Hospital Rating
* Treatment Success Rate
* Doctor Availability
* Bed Availability
* Estimated Waiting Time
* Estimated Treatment Cost
* Patient Satisfaction Score
* Department Match Score

### Target

```text
recommendation_score
```

The predicted recommendation score is then used to rank hospitals.

```text
Higher Recommendation Score
            ↓
      Better Ranking
            ↓
       Top 3 Hospitals
```

---

## 📊 Dataset

The dataset contains hospital-related information used for training and evaluating the machine learning model.

Example features:

| Feature                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `hospital_name`                | Name of the hospital                             |
| `hospital_bed_capacity`        | Total number of beds                             |
| `patient_age`                  | Patient age                                      |
| `distance_km`                  | Distance from patient                            |
| `hospital_rating`              | Hospital rating                                  |
| `treatment_success_rate_pct`   | Treatment success percentage                     |
| `doctor_availability_pct`      | Doctor availability percentage                   |
| `bed_availability_pct`         | Available bed percentage                         |
| `estimated_wait_time_min`      | Estimated waiting time                           |
| `estimated_treatment_cost_inr` | Estimated treatment cost                         |
| `patient_satisfaction_score`   | Patient satisfaction score                       |
| `department_match_score`       | Match between patient requirement and department |
| `recommendation_score`         | Target recommendation score                      |

---

## 🧹 Data Preprocessing

Before training the model, the dataset goes through several preprocessing steps:

* Duplicate removal
* Missing-value handling
* Data-type validation
* Range validation
* Numerical feature processing
* Categorical feature encoding
* Feature selection
* Train-test splitting

Statistical outliers are also investigated carefully instead of automatically deleting valid hospital records.

For example, a hospital with **1,500 or 1,800 beds** may be statistically unusual but can still represent a legitimate large hospital.

---

## 🤖 Model Development

The project can evaluate multiple supervised regression algorithms, such as:

* Random Forest Regressor
* Gradient Boosting Regressor
* Decision Tree Regressor
* Linear Regression
* Other suitable regression algorithms

Model performance can be evaluated using:

### R² Score

Measures how well the model explains the variation in recommendation scores.

### MAE

Measures the average absolute prediction error.

### RMSE

Measures the square root of the average squared prediction error.

Example:

```text
R² Score : 0.75+
MAE      : Model dependent
RMSE     : Model dependent
```

The final model should be selected based on performance on unseen data rather than simply choosing the model with the highest training score.

---

# 🌐 Web Application

The project includes a web interface where users can provide their requirements and receive hospital recommendations.

### User Flow

```text
Open Website
     ↓
Enter Patient Requirements
     ↓
Submit Information
     ↓
FastAPI Backend
     ↓
Machine Learning Model
     ↓
Calculate Predictions
     ↓
Rank Hospitals
     ↓
Display Top 3 Hospitals
```

---

# ⚙️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn

### Machine Learning

* Pandas
* NumPy
* Scikit-learn
* Joblib

### Development

* Jupyter Notebook
* VS Code
* Git
* GitHub

---

# 📁 Project Structure

```text
Hospital-Recommendation-System/
│
├── data/
│   └── hospital_dataset.csv
│
├── model/
│   └── hospital_recommendation_model.pkl
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── main.py
├── requirements.txt
├── README.md
└── .gitignore
```

> The exact structure may vary depending on the final project implementation.

---

# 🔧 Installation

## 1. Clone the repository

```bash
git clone https://github.com/your-username/Hospital-Recommendation-System.git
```

Move into the project directory:

```bash
cd Hospital-Recommendation-System
```

---

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv hospital_env
```

Activate it:

```bash
hospital_env\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv hospital_env
```

```bash
source hospital_env/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If you don't have a `requirements.txt` file yet:

```bash
pip install pandas numpy scikit-learn fastapi uvicorn joblib
```

---

# ▶️ Run the FastAPI Backend

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 🔌 API

## GET `/`

Checks whether the backend is running.

Example response:

```json
{
    "message": "Hospital Recommendation System API is running"
}
```

---

## POST `/predict`

Accepts patient requirements and returns hospital recommendations.

Example response:

```json
{
    "recommendations": [
        {
            "rank": 1,
            "hospital": "Example Hospital",
            "recommendation_score": 94.52
        },
        {
            "rank": 2,
            "hospital": "Example Hospital 2",
            "recommendation_score": 92.84
        },
        {
            "rank": 3,
            "hospital": "Example Hospital 3",
            "recommendation_score": 91.73
        }
    ]
}
```

---

# 🖥️ Frontend

The frontend provides a clean and simple interface for interacting with the recommendation system.

Users can enter/select relevant information and submit the request.

The JavaScript frontend communicates with the FastAPI backend using HTTP requests.

```text
Frontend
   │
   │ POST Request
   ↓
FastAPI
   │
   ↓
ML Model
   │
   ↓
Predictions
   │
   ↓
Top 3 Hospitals
   │
   ↓
Frontend
```

---

# 📈 Model Evaluation

The model should be evaluated using a separate testing dataset.

Example:

```python
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5

print("R2 Score:", r2)
print("MAE:", mae)
print("RMSE:", rmse)
```

### Evaluation Metrics

| Metric   | Purpose                            |
| -------- | ---------------------------------- |
| R² Score | Measures explained variance        |
| MAE      | Average absolute prediction error  |
| RMSE     | Penalizes larger prediction errors |

---

# 🔐 Data & Privacy

This project is intended as an **educational and machine-learning demonstration system**.

The dataset used for development should not contain personally identifiable patient information.

The recommendations should **not be considered medical advice or a substitute for consultation with qualified healthcare professionals**.

---

# 🔮 Future Improvements

Future versions can include:

* 📍 Real-time hospital location using Maps API
* 🏥 Real-time bed availability
* 🚑 Emergency hospital recommendations
* 💬 AI-powered healthcare assistant
* 📱 Mobile application
* 🔐 User authentication
* ⭐ Real patient review integration
* 🗺️ Interactive hospital map
* 💳 Insurance compatibility
* 🩺 Doctor availability
* 📅 Appointment booking
* 🚨 Emergency response mode
* 🌐 Multi-city and nationwide hospital coverage

---

# 🎯 Project Goals

The main goals of this project are:

1. Make hospital comparison easier.
2. Provide data-driven hospital recommendations.
3. Reduce the time required to compare hospitals.
4. Use machine learning for intelligent ranking.
5. Provide the user with the **Top 3 suitable hospitals**.
6. Create a practical end-to-end ML project using FastAPI and a web frontend.

---

# 👨‍💻 Author

**Dhairya Deulkar**

AI & Machine Learning | Java | Full Stack Development

GitHub: `https://github.com/your-username`

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is created for educational and development purposes.
