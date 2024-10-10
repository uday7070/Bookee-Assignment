import React from "react";
import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";

const MainShift = ({ shifts, cancelShift, shiftStarted, loading }) => {
  let [noOfShift, setNoOfShift] = useState(0);

  const calculateTotalTime = (shifts) => {
    const totalMilliseconds = shifts.reduce((acc, shift) => {
      const duration = shift.endTime - shift.startTime;
      return acc + duration;
    }, 0);

    const totalMinutes = Math.floor(totalMilliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { hours, minutes };
  };

  const [groupedShifts, setGroupedShifts] = useState({});

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    const groupByDate = shifts
      .filter((item) => item.booked == true)
      .reduce((acc, shift) => {
        const dateKey = formatDate(shift.startTime);
        if (!acc[dateKey]) {
          setNoOfShift((noOfShift += 1));
          acc[dateKey] = [];
        }
        acc[dateKey].push(shift);
        return acc;
      }, {});

    Object.keys(groupByDate).forEach((dateKey) => {
      groupByDate[dateKey] = groupByDate[dateKey].sort(
        (a, b) => a.startTime - b.startTime
      );
    });

    setGroupedShifts(groupByDate);
  }, [shifts]);

  return (
    <div className="avail_container">
      {Object.keys(groupedShifts).map((date) => (
        <div className="shift_day_hour">
          <div className="shift_date" key={date}>
            <div className="shift_date_para">{date}</div>
            <div className="total_shifts">
              {groupedShifts[date].length} shifts,
            </div>
            {calculateTotalTime(groupedShifts[date]).minutes > 0 ? (
              <div className="total_time">
                {calculateTotalTime(groupedShifts[date]).hours} h{" "}
                {calculateTotalTime(groupedShifts[date]).minutes} min{" "}
              </div>
            ) : (
              <div className="total_time">
                {calculateTotalTime(groupedShifts[date]).hours} h
              </div>
            )}
          </div>

          {groupedShifts[date].map((shift) => (
            <div className="shift_time_container" key={shift.id}>
              <div className="shift_time main_shift_time">
                {" "}
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                <div className="shift_area">{shift.area}</div>
              </div>

              <div className="cancel_btn_container">
                {shiftStarted(shift) ? (
                  <div className="cancel_btn cancelled">
                    <button>Cancel</button>
                  </div>
                ) : (
                  <div className="cancel_btn">
                    <button onClick={() => cancelShift(shift.id)}>
                      {loading === shift.id ? (
                        <Oval
                          visible={true}
                          height="20"
                          width="40"
                          color="#e2006a"
                          ariaLabel="oval-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      ) : (
                        <div>Cancel</div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MainShift;
