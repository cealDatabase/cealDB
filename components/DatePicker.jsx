"use client";
import * as React from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const DatePickerDemos = () => {
  const [value, setValue] = React.useState(dayjs("2022-04-17"));

  const handleChange = (newValue) => {
    setValue(newValue);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label='Controlled picker'
        value={value}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
};

export default DatePickerDemos;
