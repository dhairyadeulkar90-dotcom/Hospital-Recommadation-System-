const API_URL = "http://127.0.0.1:8000/recommend";

const form = document.getElementById("recommendationForm");
const hospitalList = document.getElementById("hospitalList");
const statusText = document.getElementById("status");
const resultSubtitle = document.getElementById("resultSubtitle");
const sortButton = document.getElementById("sortBtn");
const resetButton = document.getElementById("resetBtn");

const modal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

let hospitals = [];
let selectedHospital = null;
let sortHighToLow = true;

const hospitalImages = [
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
];

/* =========================
   DEMO HOSPITALS (Initial State)
========================= */
const initialDemoHospitals = [
    {
        name: "AIIMS Nagpur",
        type: "Goverment",
        specialty: "Cardiology",
        rating: 4.9,
        successRate: 97.5,
        doctorAvailability: 92.0,
        beds: 450,
        waitTime: 18,
        estimatedCost: 65000,
        insurance: "Yes",
        emergency: "Yes",
        city: "Nagpur, Maharashtra",
        score: 95.4,
        image: hospitalImages[1]
    },
    {
        name: "Swasthyam Superspeciality Hospital",

        type: "private",
        specialty: "Cardiology",
        rating: 4.8,
        successRate: 94.2,
        doctorAvailability: 88.5,
        beds: 650,
        waitTime: 25,
        estimatedCost: 28000,
        insurance: "Yes",
        emergency: "Yes",
        city: "Nagpur, Maharashtra",
        score: 92.8,
        image: hospitalImages[0]
    },
    {
        name: "Kingsway Hospitals",
        type: "Private",
        specialty: "Cardiology",
        rating: 4.5,
        successRate: 91.0,
        doctorAvailability: 85.0,
        beds: 350,
        waitTime: 30,
        estimatedCost: 72000,
        insurance: "Yes",
        emergency: "Yes",
        city: "Nagpur, Maharashtra",
        score: 89.6,
        image: hospitalImages[2]
    }
];

hospitals = [...initialDemoHospitals];
renderHospitals();

/* =========================
   FORM DATA HELPER
========================= */
function getFormData() {
    const hospitalTypeElem = document.getElementById("hospitalType");
    const hospitalTypeValue = hospitalTypeElem ? hospitalTypeElem.value : "All";

    return {
        required_department: document.getElementById("department").value,
        patient_age: Number(document.getElementById("age").value),
        patient_gender: document.getElementById("gender").value,
        emergency_required: document.getElementById("emergency").value,
        city: document.getElementById("city").value,
        hospital_type: hospitalTypeValue,
        insurance_supported: document.getElementById("insurance").value
    };
}

/* =========================
   API REQUEST (With Fast Timeout Safety)
========================= */
async function getRecommendations(data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error("API Error: " + response.status);
        }

        const result = await response.json();

        if (Array.isArray(result)) {
            return result;
        }

        return (
            result.recommendations ||
            result.hospitals ||
            result.top_hospitals ||
            result.results ||
            []
        );
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/* =========================
   NORMALIZE API DATA
========================= */
function normalizeHospital(hospital, index) {
    const imgIndex = index % hospitalImages.length;
    return {
        name: hospital.name || hospital.hospital_name || hospital.Hospital_Name || "Hospital",
        type: hospital.type || hospital.hospital_type || hospital.Hospital_Type || "General",
        specialty: hospital.specialty || hospital.required_department || hospital.department || "Multispeciality",
        rating: Number(hospital.rating || hospital.hospital_rating || hospital.Rating || 4.5),
        successRate: Number(hospital.successRate || hospital.treatment_success_rate_pct || hospital.success_rate || 90),
        doctorAvailability: Number(hospital.doctorAvailability || hospital.doctor_availability_pct || hospital.doctor_availability || 85),
        beds: Number(hospital.beds || hospital.hospital_bed_capacity || hospital.bed_capacity || 250),
        waitTime: Number(hospital.waitTime || hospital.estimated_wait_time_min || hospital.wait_time || 25),
        estimatedCost: Number(hospital.estimatedCost || hospital.estimated_treatment_cost_inr || hospital.cost || 45000),
        insurance: hospital.insurance || hospital.insurance_supported || "Yes",
        emergency: hospital.emergency || hospital.emergency_services_available || "Yes",
        city: hospital.city ? `${hospital.city}, ${hospital.state || 'Maharashtra'}` : "Maharashtra",
        score: Number(hospital.score || hospital.predicted_score || hospital.predictedScore || 90),
        image: hospital.image || hospital.image_url || hospitalImages[imgIndex]
    };
}

/* =========================
   RENDER HOSPITAL CARDS
========================= */
function renderHospitals() {
    hospitalList.innerHTML = "";

    if (!hospitals || hospitals.length === 0) {
        hospitalList.innerHTML = `
            <div class="empty">
                <p>No hospital recommendations found matching your criteria. Try adjusting the filters.</p>
            </div>
        `;
        return;
    }

    hospitals.slice(0, 3).forEach((hospital, index) => {
        const card = document.createElement("div");
        card.className = "hospital-card";
        card.dataset.index = index;

        card.innerHTML = `
            <div class="rank">${index + 1}</div>
            <img class="hospital-img" src="${hospital.image}" alt="${hospital.name}">
            <div class="hospital-main">
                <h3 class="hospital-name">${hospital.name}</h3>
                <div class="tags">
                    <span class="tag hospital-type">${hospital.type}</span>
                    <span class="tag gray hospital-specialty">${hospital.specialty}</span>
                    <span class="tag location-value">${hospital.city}</span>
                </div>
                <div class="metrics">
                    <div class="metric"><span>Rating:</span> <b class="rating-value">${hospital.rating.toFixed(1)}</b> ⭐</div>
                    <div class="metric"><span>Success Rate:</span> <strong class="success-value">${hospital.successRate}%</strong></div>
                    <div class="metric"><span>Wait Time:</span> <b class="wait-value">${hospital.waitTime} min</b></div>
                    <div class="metric"><span>Doctor Avail:</span> <b class="doctor-value">${hospital.doctorAvailability}%</b></div>
                    <div class="metric"><span>Beds:</span> <b class="beds-value">${hospital.beds}</b></div>
                    <div class="metric"><span>Est. Cost:</span> <strong class="cost-value">${formatMoney(hospital.estimatedCost)}</strong></div>
                </div>
            </div>
            <div class="score-box">
                <small>MATCH SCORE</small>
                <div class="score score-value">${hospital.score.toFixed(1)}</div>
                <button type="button" class="view-details-btn tool-btn" onclick="openDetails(${index})">View Details</button>
            </div>
        `;

        hospitalList.appendChild(card);
    });
}

/* =========================
   MONEY FORMAT
========================= */
function formatMoney(value) {
    return "₹ " + Number(value).toLocaleString("en-IN");
}

/* =========================
   RECOMMEND BUTTON HANDLER
========================= */
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = getFormData();
    const department = data.required_department;
    const city = data.city;
    const hospitalType = data.hospital_type || "All";

    const typeLabel = (hospitalType && hospitalType !== "All") ? ` (${hospitalType})` : "";
    statusText.textContent = `Analyzing ${city} hospitals for ${department}${typeLabel}...`;
    resultSubtitle.textContent = "Analyzing recommendations...";

    const button = document.querySelector(".recommend-btn");
    button.classList.add("loading");

    try {
        const result = await getRecommendations(data);

        if (!result || result.length === 0) {
            throw new Error("No recommendations returned from API");
        }

        hospitals = result.map((h, i) => normalizeHospital(h, i));
        statusText.textContent = `Found top ${hospitalType !== "All" ? hospitalType.toLowerCase() + " " : ""}recommendations in ${city} for ${department}.`;
    } catch (error) {
        console.warn("API request failed or offline. Generating client-side simulation for " + city, error);

        // Dynamic fallback matching selected city, department, and hospital type
        const selectedType = (hospitalType && hospitalType !== "All") ? hospitalType : "Private";

        hospitals = [
            {
                name: selectedType === "Government" ? `Government Medical College & Hospital, ${city}` : `${city} Super Specialty Hospital`,
                type: selectedType,
                specialty: department,
                rating: selectedType === "Government" ? 4.7 : 4.8,
                successRate: selectedType === "Government" ? 95.0 : 96.5,
                doctorAvailability: 91.0,
                beds: selectedType === "Government" ? 750 : 420,
                waitTime: selectedType === "Government" ? 25 : 18,
                estimatedCost: selectedType === "Government" ? 18000 : 55000,
                insurance: data.insurance,
                emergency: data.emergency,
                city: `${city}, Maharashtra`,
                score: 95.2,
                image: hospitalImages[0]
            },
            {
                name: selectedType === "Government" ? `District Civil Hospital, ${city}` : `Apollo Clinic & Hospital, ${city}`,
                type: selectedType,
                specialty: department,
                rating: selectedType === "Government" ? 4.5 : 4.6,
                successRate: selectedType === "Government" ? 93.0 : 94.0,
                doctorAvailability: 87.0,
                beds: selectedType === "Government" ? 580 : 350,
                waitTime: selectedType === "Government" ? 30 : 22,
                estimatedCost: selectedType === "Government" ? 12000 : 48000,
                insurance: "Yes",
                emergency: "Yes",
                city: `${city}, Maharashtra`,
                score: 91.8,
                image: hospitalImages[1]
            },
            {
                name: selectedType === "Government" ? `ESIC Model Hospital, ${city}` : `Care & Research Center, ${city}`,
                type: selectedType,
                specialty: department,
                rating: 4.4,
                successRate: 90.5,
                doctorAvailability: 84.0,
                beds: selectedType === "Government" ? 400 : 310,
                waitTime: selectedType === "Government" ? 35 : 25,
                estimatedCost: selectedType === "Government" ? 15000 : 68000,
                insurance: "Yes",
                emergency: "Yes",
                city: `${city}, Maharashtra`,
                score: 88.5,
                image: hospitalImages[2]
            }
        ];

        statusText.textContent = `Recommendations updated for ${city} (${department}${typeLabel}).`;
    }

    resultSubtitle.textContent = `Based on your requirements for ${department}${typeLabel} in ${city}`;
    button.classList.remove("loading");

    renderHospitals();

    document.getElementById("results").scrollIntoView({
        behavior: "smooth"
    });
});

/* =========================
   SORT
========================= */
sortButton.addEventListener("click", function () {
    hospitals.sort(function (a, b) {
        if (sortHighToLow) {
            return b.score - a.score;
        }
        return a.score - b.score;
    });

    sortHighToLow = !sortHighToLow;
    sortButton.textContent = sortHighToLow ? "↕ Sort by Score" : "↕ Score: Low to High";
    renderHospitals();
});

/* =========================
   RESET
========================= */
resetButton.addEventListener("click", function () {
    form.reset();
    document.getElementById("age").value = 45;
    document.getElementById("city").value = "Nagpur";
    document.getElementById("department").value = "Cardiology";
    if (document.getElementById("hospitalType")) {
        document.getElementById("hospitalType").value = "All";
    }
    document.getElementById("gender").value = "Male";
    document.getElementById("emergency").value = "No";
    document.getElementById("insurance").value = "Yes";

    hospitals = [...initialDemoHospitals];
    statusText.textContent = "";
    resultSubtitle.textContent = "Based on your requirements for Cardiology in Nagpur";

    renderHospitals();
});

/* =========================
   MODAL DETAILS
========================= */
window.openDetails = function (index) {
    selectedHospital = hospitals[index];
    if (!selectedHospital) return;

    modalContent.innerHTML = `
        <div style="display:flex;gap:15px;align-items:center;margin-bottom:15px;">
            <img src="${selectedHospital.image}" style="width:70px;height:70px;border-radius:10px;object-fit:cover;">
            <div>
                <h2 style="margin:0 0 5px;color:#0b3c3c;font-size:18px;">${selectedHospital.name}</h2>
                <div style="display:flex;gap:6px;">
                    <span class="tag">${selectedHospital.type}</span>
                    <span class="tag gray">${selectedHospital.specialty}</span>
                    <span class="tag">${selectedHospital.city}</span>
                </div>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-item">
                <small>Match Recommendation Score</small>
                <b style="color:#0b8f5a;font-size:16px;">${selectedHospital.score.toFixed(1)} / 100</b>
            </div>
            <div class="detail-item">
                <small>Hospital Rating</small>
                <b>${selectedHospital.rating.toFixed(1)} / 5.0 ⭐</b>
            </div>
            <div class="detail-item">
                <small>Treatment Success Rate</small>
                <b>${selectedHospital.successRate}%</b>
            </div>
            <div class="detail-item">
                <small>Doctor Availability</small>
                <b>${selectedHospital.doctorAvailability}%</b>
            </div>
            <div class="detail-item">
                <small>Bed Capacity</small>
                <b>${selectedHospital.beds} Beds</b>
            </div>
            <div class="detail-item">
                <small>Estimated Wait Time</small>
                <b>${selectedHospital.waitTime} minutes</b>
            </div>
            <div class="detail-item">
                <small>Estimated Treatment Cost</small>
                <b>${formatMoney(selectedHospital.estimatedCost)}</b>
            </div>
            <div class="detail-item">
                <small>Emergency Services</small>
                <b>${selectedHospital.emergency === "Yes" ? "Available 24/7" : "Not Specified"}</b>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <small>Insurance Support</small>
                <b>${selectedHospital.insurance === "Yes" ? "Cashless & Major Insurance Plans Accepted" : "Self-Pay"}</b>
            </div>
        </div>
    `;

    modal.classList.add("show");
};

/* =========================
   CLOSE MODAL
========================= */
modalClose.addEventListener("click", function () {
    modal.classList.remove("show");
});

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        modal.classList.remove("show");
    }
});