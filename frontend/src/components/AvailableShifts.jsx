import React from "react";

import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";

const AvailableShifts = ({
  shifts,
  cancelShift,
  shiftStarted,
  setData,
  loading,
}) => {
  const [groupedShifts, setGroupedShifts] = useState({});
  const [loadingShiftId, setLoaderForShift] = useState(null);

  const [activeArea, setActiveArea] = useState("Helsinki");

  const [totalShifts, setTotalShifts] = useState({
    Helsinki: "",
    Tampere: "",
    Turku: "",
  });

  const [colorToArea, setColorToArea] = useState({
    Helsinki: true,
    Tampere: false,
    Turku: false,
  });

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
  const filteredByCity = (item, area) => {
    return item.area == area;
  };

  const shiftingBookingTable = (area = activeArea) => {
    const updatedColor = {
      Helsinki: false,
      Tampere: false,
      Turku: false,
      [area]: true,
    };
    setActiveArea(area);
    setColorToArea(updatedColor);

    let dataFilteredByCity = shifts.filter((item) =>
      filteredByCity(item, area)
    );

    const groupByDate = dataFilteredByCity.reduce((acc, shift) => {
      const dateKey = formatDate(shift.startTime);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(shift);
      return acc;
    }, {});

    Object.keys(groupByDate).forEach((dateKey) => {
      groupByDate[dateKey] = groupByDate[dateKey].sort(
        (a, b) => a.startTime - b.startTime
      );
    });

    setGroupedShifts(groupByDate);
  };

  const bookShift = async (id) => {
    setLoaderForShift(id);
    try {
      const response = await fetch(`http://127.0.0.1:8080/shifts/${id}/book`, {
        method: "POST",
        headers: {},
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoaderForShift(null);
    }
  };

  const isOverlap = (shift) => {
    const overlappingShiftExists = shifts
      .filter((s) => s.booked)
      .find((s) => s.startTime < shift.endTime && s.endTime > shift.startTime);
    return overlappingShiftExists;
  };

  const availableShiftByCity = () => {
    const shiftCount = { Helsinki: 0, Tampere: 0, Turku: 0 };
    shifts.map((item) => shiftCount[item.area]++);

    setTotalShifts(shiftCount);
  };

  useEffect(() => {
    availableShiftByCity();
    shiftingBookingTable();
  }, [shifts]);

  return (
    <div className="avail_container">
      <div className="avail_area">
        <div className="helsinki_btn">
          <div
            onClick={() => shiftingBookingTable("Helsinki")}
            className="area_link"
            style={{ color: colorToArea.Helsinki ? "#004FB4" : "#A4B8D3" }}
          >
            {`Helsinki (${totalShifts.Helsinki}  )`}
          </div>
        </div>
        <div className="tampere_btn">
          <div
            onClick={() => shiftingBookingTable("Tampere")}
            className="area_link"
            style={{ color: colorToArea.Tampere ? "#004FB4" : "#A4B8D3" }}
          >
            {`Tampere (${totalShifts.Tampere}   )`}
          </div>
        </div>
        <div className="turku_btn">
          <div
            onClick={() => shiftingBookingTable("Turku")}
            className="area_link"
            style={{ color: colorToArea.Turku ? "#004FB4" : "#A4B8D3" }}
          >
            {`Turku (${totalShifts.Turku}   )`}
          </div>
        </div>
      </div>

      {Object.keys(groupedShifts).map((date) => (
        <div className="shift_day_hour">
          <div className="shift_date" key={date}>
            <div className="shift_date_para">{date}</div>
          </div>
          {groupedShifts[date].map((shift) => (
            <div className="shift_time_container" key={shift.id}>
              <div className="shift_time">
                {" "}
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </div>
              <div className="cancel_btn_container">
                {shift.booked ? (
                  <div className="cancel_subcontainer">
                    {shiftStarted(shift) ? (
                      <div className="cancel_btn cancelled">
                        <button>Cancel</button>
                      </div>
                    ) : (
                      <div className="cancel_subcontainer">
                        <div className="msg"> Booked </div>

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
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {isOverlap(shift) || shiftStarted(shift) ? (
                      <div>
                        {!isOverlap(shift) ? (
                          <div className="book_btn booked">
                            <button>
                              <div>Book</div>
                            </button>
                          </div>
                        ) : (
                          <div className="overlap_container">
                            <div className="overlap_msg">Overlapping</div>
                            <div className="book_btn booked">
                              <button>
                                <div>Book</div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="book_btn">
                        <button onClick={() => bookShift(shift.id)}>
                          {loadingShiftId === shift.id ? (
                            <Oval
                              visible={true}
                              height="20"
                              width="40"
                              color="#4fa94d"
                              ariaLabel="oval-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          ) : (
                            <div>Book</div>
                          )}
                        </button>
                      </div>
                    )}
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

export default AvailableShifts;
