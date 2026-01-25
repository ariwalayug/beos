import BloodRequest from '../models/BloodRequest.js';
import db from '../database/db.js';

const test = () => {
    try {
        console.log("Testing creation...");
        const req = BloodRequest.create({
            hospital_id: 1,
            patient_name: "Test Patient",
            age: 30,
            gender: "Male",
            blood_type: "A+",
            diagnosis: "Test Diagnosis",
            is_critical: 1,
            component_type: "Platelets"
        });
        console.log("Created successfully. New ID:", req.id);
        console.log("Gender:", req.gender);
        console.log("Component:", req.component_type);
    } catch (err) {
        console.error("Failed create:", err);
    }
};
test();
