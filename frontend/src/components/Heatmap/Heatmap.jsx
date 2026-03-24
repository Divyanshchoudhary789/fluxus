import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    format,
    subDays,
    startOfWeek,
    addDays,
    isSameMonth
} from "date-fns";

import "./Heatmap.css";


function Heatmap({ userId }) {
    const [data, setData] = useState({});


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/user/contributions/${userId}`);
                setData(res.data);
            } catch (err) {
                console.log("Error in fetching user contributions", err.message);
            }
        };


        fetchData();
    }, [userId]);


    const today = new Date();
    const startDate = startOfWeek(subDays(today, 364));

    const weeks = [];
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
        const week = [];

        for (let i = 0; i < 7; i++) {
            const dateStr = format(currentDate, "yyyy-MM-dd");

            week.push({
                date: dateStr,
                count: data[dateStr] || 0,
                fullDate: new Date(currentDate),
            });

            currentDate = addDays(currentDate, 1);

        }


        weeks.push(week);

    }


    const getColor = (count) => {
        if (count === 0) return "#161b22";
        if (count < 2) return "#0e4429";
        if (count < 5) return "#006d32";
        if (count < 10) return "#26a641";
        return "#39d353";
    }

    const monthLabels = weeks.map((week, i) => {
        const firstDay = week[0].fullDate;

        if (i === 0) return format(firstDay, "MMM");

        const prev = weeks[i - 1][0].fullDate;

        if (!isSameMonth(firstDay, prev)) {
            return format(firstDay, "MMM");
        }

        return "";

    });



    const totalContributions = Object.values(data).reduce(
        (a, b) => a + b,
        0
    );



    return (
        <div className="heatmap-container">
            <div className="heatmap-header">
                <span>{totalContributions} contributions in the last year</span>
            </div>

            <div className="body-container">
                <div className="months">
                    {monthLabels.map((m, i) => (
                        <span key={i}>{m}</span>
                    ))}
                </div>

                <div className="heatmap-body">
                    <div className="days">
                        <span></span>
                        <span>Mon</span>
                        <span></span>
                        <span>Wed</span>
                        <span></span>
                        <span>Fri</span>
                        <span></span>
                    </div>
                    <div className="weeks">
                        {weeks.map((week, i) => (
                            <div key={i} className="week" >
                                {week.map((day, j) => (
                                    <div key={j}
                                        className="cell"
                                        style={{ backgroundColor: getColor(day.count) }}
                                        title={`${day.count} contributions on ${day.date}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


}


export default Heatmap;