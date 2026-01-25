import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, Building2, ExternalLink } from 'lucide-react';
import './BloodCampBulletin.css';

// Dummy data for blood donation camps
const CAMPS_DATA = [
    {
        id: 1,
        title: "City General Mega Donation Drive",
        date: "2026-02-15",
        time: "9:00 AM - 4:00 PM",
        location: "City General Hospital, Mumbai",
        organizer: "Rotary Club Mumbai",
        type: "Public"
    },
    {
        id: 2,
        title: "Corporate Life Saver Camp",
        date: "2026-02-18",
        time: "10:00 AM - 5:00 PM",
        location: "Tech Park Plaza, Bangalore",
        organizer: "TechCorp Foundation",
        type: "Corporate"
    },
    {
        id: 3,
        title: "University Red Cross Week",
        date: "2026-02-20",
        time: "8:30 AM - 3:30 PM",
        location: "Delhi University Campus, Delhi",
        organizer: "Youth Red Cross",
        type: "Student"
    }
];

function BloodCampBulletin() {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' })
        };
    };

    return (
        <div className="bulletin-section">
            <div className="bulletin-header">
                <span className="bulletin-badge">Live Bulletin</span>
                <h3 className="text-xl font-bold text-white">Upcoming Donation Camps</h3>
            </div>

            <div className="bulletin-grid">
                {CAMPS_DATA.map((camp, i) => {
                    const { day, month } = formatDate(camp.date);
                    return (
                        <motion.div
                            key={camp.id}
                            className="camp-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="camp-date-badge">
                                <span className="camp-day">{day}</span>
                                <span className="camp-month">{month}</span>
                            </div>

                            <h4 className="camp-title">{camp.title}</h4>

                            <div className="camp-details">
                                <div className="camp-detail-row">
                                    <Clock size={16} className="camp-detail-icon" />
                                    <span>{camp.time}</span>
                                </div>
                                <div className="camp-detail-row">
                                    <MapPin size={16} className="camp-detail-icon" />
                                    <span>{camp.location}</span>
                                </div>
                            </div>

                            <div className="organizer-info">
                                <div className="organizer-avatar">
                                    {camp.organizer.charAt(0)}
                                </div>
                                <span>Organized by {camp.organizer}</span>
                            </div>
                        </motion.div>
                    );
                })}

                {CAMPS_DATA.length === 0 && (
                    <div className="empty-camps">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No upcoming camps scheduled at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BloodCampBulletin;
