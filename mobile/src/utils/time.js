export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const displayTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
      times.push({ value: timeString, label: displayTime });
    }
  }
  return times;
};

export const timeOptions = generateTimeOptions();

export const convertTo24Hour = (time, period) => {
  if (!time) return "";

  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  minutes = minutes || "00";

  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

export const convertTo12Hour = (time24) => {
  if (!time24) return { time: "", period: "AM" };

  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return {
    time: `${hour12}:${minutes}`,
    period: period,
  };
};

export const formatTimeInput = (text) => {
  let cleaned = text.replace(/[^\d:]/g, "");

  if (cleaned.length === 3 && cleaned[2] !== ":") {
    cleaned = cleaned.slice(0, 2) + ":" + cleaned.slice(2);
  }

  if (cleaned.length > 5) {
    cleaned = cleaned.slice(0, 5);
  }

  return cleaned;
};
